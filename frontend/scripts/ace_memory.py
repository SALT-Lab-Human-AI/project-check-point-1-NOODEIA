"""
ACE (Agentic Context Engineering) Memory System

Implements the core memory system from the ACE paper:
- Structured bullets with metadata (ID, counters, content)
- Incremental delta updates (not monolithic rewrites)
- Grow-and-refine mechanism to prevent context collapse
- Semantic deduplication
"""

from typing import Any, Dict, List, Optional, Set, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import json
import hashlib
from pathlib import Path
from collections import defaultdict
import numpy as np


@dataclass
class Bullet:
    """
    A single memory bullet with metadata and content.
    Represents a reusable strategy, lesson, or domain concept.
    """
    id: str  # Unique identifier (hash of normalized content)
    content: str  # The actual strategy/lesson/concept
    helpful_count: int = 0  # Times marked as helpful
    harmful_count: int = 0  # Times marked as harmful
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    last_used: Optional[str] = None
    tags: List[str] = field(default_factory=list)  # For categorization
    embedding: Optional[List[float]] = None  # For semantic similarity
    
    def __post_init__(self):
        """Generate ID from content if not provided"""
        if not self.id:
            self.id = self._generate_id(self.content)
    
    @staticmethod
    def _generate_id(content: str) -> str:
        """Generate unique ID from content"""
        normalized = content.lower().strip()
        return hashlib.md5(normalized.encode()).hexdigest()[:12]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "id": self.id,
            "content": self.content,
            "helpful_count": self.helpful_count,
            "harmful_count": self.harmful_count,
            "created_at": self.created_at,
            "last_used": self.last_used,
            "tags": self.tags,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Bullet':
        """Create from dictionary"""
        return cls(
            id=data.get("id", ""),
            content=data["content"],
            helpful_count=data.get("helpful_count", 0),
            harmful_count=data.get("harmful_count", 0),
            created_at=data.get("created_at", datetime.now().isoformat()),
            last_used=data.get("last_used"),
            tags=data.get("tags", []),
        )
    
    def score(self) -> float:
        """Calculate utility score for ranking"""
        total = self.helpful_count + self.harmful_count
        if total == 0:
            return 0.5  # Neutral for unused bullets
        return self.helpful_count / total
    
    def format_for_prompt(self) -> str:
        """Format bullet for inclusion in prompts"""
        score_str = f"[+{self.helpful_count}/-{self.harmful_count}]"
        return f"{score_str} {self.content}"


@dataclass
class DeltaUpdate:
    """
    Represents a delta update to the context.
    Contains new bullets or modifications to existing ones.
    """
    new_bullets: List[Bullet] = field(default_factory=list)
    update_bullets: Dict[str, Dict[str, int]] = field(default_factory=dict)  # id -> {helpful: +1, harmful: 0}
    remove_bullets: Set[str] = field(default_factory=set)  # IDs to remove
    metadata: Dict[str, Any] = field(default_factory=dict)


class ACEMemory:
    """
    ACE Memory System - Evolving playbook with structured bullets.
    
    Key features:
    - Incremental delta updates (not monolithic rewrites)
    - Grow-and-refine to prevent context collapse
    - Semantic deduplication
    - Bullet scoring and retrieval
    """
    
    def __init__(
        self,
        memory_file: str = "ace_memory.json",
        max_bullets: int = 100,
        dedup_threshold: float = 0.85,
        prune_threshold: float = 0.3,
    ):
        self.memory_file = Path(memory_file)
        self.max_bullets = max_bullets
        self.dedup_threshold = dedup_threshold  # Cosine similarity threshold for deduplication
        self.prune_threshold = prune_threshold  # Score threshold for pruning low-quality bullets
        
        self.bullets: Dict[str, Bullet] = {}  # id -> Bullet
        self.categories: Dict[str, List[str]] = defaultdict(list)  # tag -> [bullet_ids]
        
        self._load_memory()
    
    def _load_memory(self):
        """Load memory from disk"""
        if self.memory_file.exists():
            try:
                with open(self.memory_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for bullet_data in data.get("bullets", []):
                        bullet = Bullet.from_dict(bullet_data)
                        self.bullets[bullet.id] = bullet
                        for tag in bullet.tags:
                            self.categories[tag].append(bullet.id)
                print(f"[ACE Memory] Loaded {len(self.bullets)} bullets from {self.memory_file}")
            except Exception as e:
                print(f"[ACE Memory] Warning: Could not load memory: {e}")
    
    def _save_memory(self):
        """Save memory to disk"""
        try:
            data = {
                "bullets": [bullet.to_dict() for bullet in self.bullets.values()],
                "version": "1.0",
                "last_updated": datetime.now().isoformat(),
            }
            with open(self.memory_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[ACE Memory] Warning: Could not save memory: {e}")
    
    def apply_delta(self, delta: DeltaUpdate):
        """
        Apply a delta update to the memory.
        This is the core of incremental adaptation.
        """
        # Add new bullets
        for bullet in delta.new_bullets:
            if bullet.id not in self.bullets:
                self.bullets[bullet.id] = bullet
                for tag in bullet.tags:
                    self.categories[tag].append(bullet.id)
            else:
                # Bullet already exists, merge with existing
                existing = self.bullets[bullet.id]
                existing.helpful_count += bullet.helpful_count
                existing.harmful_count += bullet.harmful_count
                existing.last_used = datetime.now().isoformat()
        
        # Update existing bullets
        for bullet_id, updates in delta.update_bullets.items():
            if bullet_id in self.bullets:
                bullet = self.bullets[bullet_id]
                bullet.helpful_count += updates.get("helpful", 0)
                bullet.harmful_count += updates.get("harmful", 0)
                bullet.last_used = datetime.now().isoformat()
        
        # Remove bullets
        for bullet_id in delta.remove_bullets:
            if bullet_id in self.bullets:
                bullet = self.bullets.pop(bullet_id)
                for tag in bullet.tags:
                    if bullet_id in self.categories[tag]:
                        self.categories[tag].remove(bullet_id)
        
        # Grow-and-refine: deduplicate and prune if needed
        self._refine()
        
        # Save to disk
        self._save_memory()
    
    def _refine(self):
        """
        Grow-and-refine mechanism:
        - Deduplicate similar bullets
        - Prune low-quality bullets if over max_bullets
        """
        # Deduplication (semantic similarity)
        self._deduplicate_bullets()
        
        # Pruning (if over max_bullets)
        if len(self.bullets) > self.max_bullets:
            self._prune_bullets()
    
    def _deduplicate_bullets(self):
        """
        Remove duplicate bullets based on semantic similarity.
        Uses simple text similarity (can be enhanced with embeddings).
        """
        bullets_list = list(self.bullets.values())
        to_remove = set()
        
        for i in range(len(bullets_list)):
            if bullets_list[i].id in to_remove:
                continue
            
            for j in range(i + 1, len(bullets_list)):
                if bullets_list[j].id in to_remove:
                    continue
                
                # Simple text similarity (can use embeddings for better results)
                similarity = self._text_similarity(
                    bullets_list[i].content,
                    bullets_list[j].content
                )
                
                if similarity > self.dedup_threshold:
                    # Merge into the one with better score
                    if bullets_list[i].score() >= bullets_list[j].score():
                        # Merge j into i
                        bullets_list[i].helpful_count += bullets_list[j].helpful_count
                        bullets_list[i].harmful_count += bullets_list[j].harmful_count
                        to_remove.add(bullets_list[j].id)
                    else:
                        # Merge i into j
                        bullets_list[j].helpful_count += bullets_list[i].helpful_count
                        bullets_list[j].harmful_count += bullets_list[i].harmful_count
                        to_remove.add(bullets_list[i].id)
                        break
        
        # Remove duplicates
        for bullet_id in to_remove:
            if bullet_id in self.bullets:
                bullet = self.bullets.pop(bullet_id)
                for tag in bullet.tags:
                    if bullet_id in self.categories[tag]:
                        self.categories[tag].remove(bullet_id)
        
        if to_remove:
            print(f"[ACE Memory] Deduplicated {len(to_remove)} bullets")
    
    def _text_similarity(self, text1: str, text2: str) -> float:
        """
        Calculate text similarity (simple Jaccard similarity).
        Can be enhanced with embeddings for better semantic matching.
        """
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union)
    
    def _prune_bullets(self):
        """
        Trim the playbook down to ``max_bullets`` entries.

        Bullets are ordered by a two-part key:
        1. ``Bullet.score()`` – helpful ratio with a neutral 0.5 default.
        2. ``helpful_count`` – acts as a tiebreaker that favours strategies
           that have been reinforced more often.

        Any bullet that falls outside the retention window is removed from the
        main dictionary *and* every tag index so future retrieval calls stay
        consistent.
        """
        # Rank bullets from most to least valuable using the score + frequency key.
        bullets_list = sorted(
            self.bullets.values(),
            key=lambda b: (b.score(), b.helpful_count),
            reverse=True
        )
        
        # IDs of the bullets we want to keep (highest-ranked window).
        to_keep = set(b.id for b in bullets_list[:self.max_bullets])
        
        # Everything else falls outside the retention window and is pruned.
        to_remove = set(self.bullets.keys()) - to_keep
        for bullet_id in to_remove:
            bullet = self.bullets.pop(bullet_id)
            for tag in bullet.tags:
                if bullet_id in self.categories[tag]:
                    self.categories[tag].remove(bullet_id)
        
        if to_remove:
            print(f"[ACE Memory] Pruned {len(to_remove)} low-quality bullets")
    
    def retrieve_relevant_bullets(
        self,
        query: str,
        top_k: int = 10,
        tags: Optional[List[str]] = None,
        min_score: float = 0.0,
    ) -> List[Bullet]:
        """
        Retrieve relevant bullets for a query.
        
        Args:
            query: The user query or context
            top_k: Number of bullets to retrieve
            tags: Optional filter by tags
            min_score: Minimum bullet score threshold
        
        Returns:
            List of relevant bullets, ranked by relevance
        """
        # Filter by tags if provided
        if tags:
            candidate_ids = set()
            for tag in tags:
                candidate_ids.update(self.categories.get(tag, []))
            candidates = [self.bullets[bid] for bid in candidate_ids if bid in self.bullets]
        else:
            candidates = list(self.bullets.values())
        
        # Filter by score
        candidates = [b for b in candidates if b.score() >= min_score]
        
        if not candidates:
            return []
        
        # Rank by relevance to query (simple text similarity)
        scored_bullets = []
        for bullet in candidates:
            relevance = self._text_similarity(query, bullet.content)
            # Combine relevance with bullet score
            combined_score = 0.7 * relevance + 0.3 * bullet.score()
            scored_bullets.append((combined_score, bullet))
        
        # Sort by combined score
        scored_bullets.sort(key=lambda x: x[0], reverse=True)
        
        return [bullet for _, bullet in scored_bullets[:top_k]]
    
    def format_context(
        self,
        query: str,
        top_k: int = 10,
        tags: Optional[List[str]] = None,
    ) -> str:
        """
        Format relevant bullets into a context string for the LLM.
        
        This is what gets injected into the prompt to help the model.
        """
        bullets = self.retrieve_relevant_bullets(query, top_k=top_k, tags=tags)
        
        if not bullets:
            return ""
        
        context_parts = ["=== Relevant Strategies and Lessons ==="]
        
        for i, bullet in enumerate(bullets, 1):
            context_parts.append(f"{i}. {bullet.format_for_prompt()}")
        
        context_parts.append("=" * 50)
        
        return "\n".join(context_parts)
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get memory statistics"""
        if not self.bullets:
            return {
                "total_bullets": 0,
                "avg_score": 0.0,
                "categories": {},
            }
        
        scores = [b.score() for b in self.bullets.values()]
        
        return {
            "total_bullets": len(self.bullets),
            "avg_score": sum(scores) / len(scores),
            "avg_helpful": sum(b.helpful_count for b in self.bullets.values()) / len(self.bullets),
            "avg_harmful": sum(b.harmful_count for b in self.bullets.values()) / len(self.bullets),
            "categories": {tag: len(ids) for tag, ids in self.categories.items()},
        }
    
    def clear(self):
        """Clear all memory (use with caution!)"""
        self.bullets.clear()
        self.categories.clear()
        self._save_memory()
