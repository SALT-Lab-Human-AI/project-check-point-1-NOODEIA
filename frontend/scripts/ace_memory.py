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
import re
from pathlib import Path
from collections import defaultdict
import numpy as np
import math


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
    semantic_strength: float = 0.0  # Base weight for semantic memory component
    episodic_strength: float = 0.0  # Base weight for episodic memory component
    procedural_strength: float = 0.0  # Base weight for procedural memory component
    semantic_last_access: Optional[str] = None  # Legacy timestamp support
    episodic_last_access: Optional[str] = None
    procedural_last_access: Optional[str] = None
    semantic_access_index: Optional[int] = None  # Access counter snapshot
    episodic_access_index: Optional[int] = None
    procedural_access_index: Optional[int] = None
    learner_id: Optional[str] = None
    topic: Optional[str] = None
    concept: Optional[str] = None
    memory_type: Optional[str] = None  # semantic, episodic, procedural
    ttl_days: Optional[int] = None
    content_hash: Optional[str] = None
    
    def __post_init__(self):
        """Generate ID from content if not provided"""
        if not self.id:
            self.id = self._generate_id(self.content)
        # Initialize strengths if none provided
        if (
            self.semantic_strength == 0.0
            and self.episodic_strength == 0.0
            and self.procedural_strength == 0.0
        ):
            # Default to semantic memory with unit strength
            self.semantic_strength = max(1.0, float(self.helpful_count or 1))
        # Ensure access timestamps exist for active components
        now_iso = datetime.now().isoformat()
        if self.semantic_strength > 0 and not self.semantic_last_access:
            self.semantic_last_access = self.last_used or now_iso
        if self.episodic_strength > 0 and not self.episodic_last_access:
            self.episodic_last_access = self.last_used or now_iso
        if self.procedural_strength > 0 and not self.procedural_last_access:
            self.procedural_last_access = self.last_used or now_iso
        if not self.memory_type:
            self.memory_type = "semantic"
        else:
            self.memory_type = self.memory_type.lower()
        self.content_hash = self.content_hash or self._compute_hash(self.content)
    
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
            "semantic_strength": self.semantic_strength,
            "episodic_strength": self.episodic_strength,
            "procedural_strength": self.procedural_strength,
            "semantic_last_access": self.semantic_last_access,
            "episodic_last_access": self.episodic_last_access,
            "procedural_last_access": self.procedural_last_access,
            "semantic_access_index": self.semantic_access_index,
            "episodic_access_index": self.episodic_access_index,
            "procedural_access_index": self.procedural_access_index,
            "learner_id": self.learner_id,
            "topic": self.topic,
            "concept": self.concept,
            "memory_type": self.memory_type,
            "ttl_days": self.ttl_days,
            "content_hash": self.content_hash,
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
            semantic_strength=float(data.get("semantic_strength", 0.0)),
            episodic_strength=float(data.get("episodic_strength", 0.0)),
            procedural_strength=float(data.get("procedural_strength", 0.0)),
            semantic_last_access=data.get("semantic_last_access"),
            episodic_last_access=data.get("episodic_last_access"),
            procedural_last_access=data.get("procedural_last_access"),
            semantic_access_index=data.get("semantic_access_index"),
            episodic_access_index=data.get("episodic_access_index"),
            procedural_access_index=data.get("procedural_access_index"),
            learner_id=data.get("learner_id"),
            topic=data.get("topic"),
            concept=data.get("concept"),
            memory_type=data.get("memory_type"),
            ttl_days=data.get("ttl_days"),
            content_hash=data.get("content_hash"),
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
        decay_rates: Optional[Dict[str, float]] = None,
    ):
        self.memory_file = Path(memory_file)
        self.max_bullets = max_bullets
        self.dedup_threshold = dedup_threshold  # Cosine similarity threshold for deduplication
        self.prune_threshold = prune_threshold  # Score threshold for pruning low-quality bullets
        default_decay = {
            "semantic": 0.01,
            "episodic": 0.05,
            "procedural": 0.002,
        }
        if decay_rates:
            default_decay.update(decay_rates)
        self.decay_rates = {k: max(0.0, min(1.0, v)) for k, v in default_decay.items()}
        self.access_clock = 0
        
        self.bullets: Dict[str, Bullet] = {}  # id -> Bullet
        self.categories: Dict[str, List[str]] = defaultdict(list)  # tag -> [bullet_ids]
        self.hash_index: Dict[str, Set[str]] = defaultdict(set)  # normalized content hash -> bullet ids
        
        self._load_memory()

    @staticmethod
    def _normalized_hash(text: str) -> str:
        normalized = re.sub(r"\s+", " ", text.strip().lower())
        return hashlib.sha256(normalized.encode()).hexdigest()

    def _register_bullet(self, bullet: Bullet):
        bullet.content_hash = bullet.content_hash or self._normalized_hash(bullet.content)
        self.hash_index[bullet.content_hash].add(bullet.id)

    def _unregister_bullet(self, bullet_id: str):
        for hash_val, ids in list(self.hash_index.items()):
            if bullet_id in ids:
                ids.remove(bullet_id)
                if not ids:
                    self.hash_index.pop(hash_val, None)

    def _is_duplicate(self, bullet: Bullet) -> Optional[str]:
        candidate_hash = bullet.content_hash or self._normalized_hash(bullet.content)
        ids = self.hash_index.get(candidate_hash)
        if not ids:
            return None
        for existing_id in ids:
            existing = self.bullets.get(existing_id)
            if not existing:
                continue
            if (
                existing.memory_type == (bullet.memory_type or existing.memory_type)
                and existing.learner_id == bullet.learner_id
                and existing.topic == bullet.topic
            ):
                return existing_id
        return None
    
    def _component_score(
        self,
        strength: float,
        last_index: Optional[int],
        decay_key: str,
    ) -> float:
        if strength <= 0:
            return 0.0
        decay_rate = self.decay_rates.get(decay_key, 0.0)
        base = max(0.0, min(1.0, 1.0 - decay_rate))
        last_index = last_index if last_index is not None else self.access_clock
        t = max(self.access_clock - last_index, 0)
        return strength * math.pow(base, t)

    def _compute_score(self, bullet: Bullet, now: Optional[datetime] = None) -> float:
        # 'now' retained for backward compatibility but unused in access-count mode.
        semantic = self._component_score(
            bullet.semantic_strength,
            bullet.semantic_access_index,
            "semantic",
        )
        episodic = self._component_score(
            bullet.episodic_strength,
            bullet.episodic_access_index,
            "episodic",
        )
        procedural = self._component_score(
            bullet.procedural_strength,
            bullet.procedural_access_index,
            "procedural",
        )
        return semantic + episodic + procedural

    def _touch_bullet(self, bullet: Bullet, timestamp: Optional[datetime] = None):
        """Mark a bullet as accessed and bump component access indices."""
        self.access_clock += 1
        idx = self.access_clock
        ts = timestamp or datetime.now()
        iso_ts = ts.isoformat()
        bullet.last_used = iso_ts
        if bullet.semantic_strength > 0:
            bullet.semantic_last_access = iso_ts
            bullet.semantic_access_index = idx
        if bullet.episodic_strength > 0:
            bullet.episodic_last_access = iso_ts
            bullet.episodic_access_index = idx
        if bullet.procedural_strength > 0:
            bullet.procedural_last_access = iso_ts
            bullet.procedural_access_index = idx

    @staticmethod
    def _ensure_memory_tags(bullet: Bullet):
        """Guarantee that memory-type strengths are reflected in the bullet tags."""
        tag_set = {tag.lower() for tag in bullet.tags}
        changed = False
        if bullet.semantic_strength > 0 and "semantic" not in tag_set:
            bullet.tags.append("semantic")
            changed = True
        if bullet.episodic_strength > 0 and "episodic" not in tag_set:
            bullet.tags.append("episodic")
            changed = True
        if bullet.procedural_strength > 0 and "procedural" not in tag_set:
            bullet.tags.append("procedural")
            changed = True
        if bullet.memory_type and bullet.memory_type.lower() not in tag_set:
            bullet.tags.append(bullet.memory_type.lower())
            changed = True
        if changed:
            # Keep tags unique while preserving order
            seen = set()
            bullet.tags = [t for t in bullet.tags if not (t.lower() in seen or seen.add(t.lower()))]

    def _sync_categories(self, bullet: Bullet):
        """Ensure category index contains the bullet for every tag."""
        for tag in bullet.tags:
            if bullet.id not in self.categories[tag]:
                self.categories[tag].append(bullet.id)

    def _normalise_bullet(self, bullet: Bullet):
        """Ensure strengths and timestamps are initialised according to tags."""
        # Tag-driven defaults for memory strengths.
        tag_set = {tag.lower() for tag in bullet.tags}
        if "procedural" in tag_set and bullet.procedural_strength <= 0:
            bullet.procedural_strength = max(1.0, float(bullet.helpful_count or 1))
            bullet.semantic_strength = bullet.semantic_strength or 0.0
        if "episodic" in tag_set and bullet.episodic_strength <= 0:
            bullet.episodic_strength = max(1.0, float(bullet.helpful_count or 1))
        if "semantic" in tag_set and bullet.semantic_strength <= 0:
            bullet.semantic_strength = max(1.0, float(bullet.helpful_count or 1))
        # If still no strengths, fall back to semantic default.
        if (
            bullet.semantic_strength == 0.0
            and bullet.episodic_strength == 0.0
            and bullet.procedural_strength == 0.0
        ):
            bullet.semantic_strength = max(1.0, float(bullet.helpful_count or 1))
        if not bullet.memory_type or bullet.memory_type.lower() not in {"semantic", "episodic", "procedural"}:
            if bullet.procedural_strength > 0:
                bullet.memory_type = "procedural"
            elif bullet.episodic_strength > 0:
                bullet.memory_type = "episodic"
            else:
                bullet.memory_type = "semantic"
        else:
            bullet.memory_type = bullet.memory_type.lower()
        self._ensure_memory_tags(bullet)
        self._touch_bullet(bullet)
        bullet.content_hash = bullet.content_hash or self._normalized_hash(bullet.content)
    
    def _load_memory(self):
        """Load memory from disk"""
        if self.memory_file.exists():
            try:
                with open(self.memory_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for bullet_data in data.get("bullets", []):
                        bullet = Bullet.from_dict(bullet_data)
                        if bullet.semantic_strength > 0 and bullet.semantic_access_index is None:
                            bullet.semantic_access_index = 0
                        if bullet.episodic_strength > 0 and bullet.episodic_access_index is None:
                            bullet.episodic_access_index = 0
                        if bullet.procedural_strength > 0 and bullet.procedural_access_index is None:
                            bullet.procedural_access_index = 0
                        self._ensure_memory_tags(bullet)
                        self.bullets[bullet.id] = bullet
                        for tag in bullet.tags:
                            self.categories[tag].append(bullet.id)
                        self._register_bullet(bullet)
                    self.access_clock = int(data.get("access_clock", len(self.bullets)))
                    for bullet in self.bullets.values():
                        if bullet.semantic_strength > 0 and (bullet.semantic_access_index is None or bullet.semantic_access_index == 0):
                            bullet.semantic_access_index = self.access_clock
                        if bullet.episodic_strength > 0 and (bullet.episodic_access_index is None or bullet.episodic_access_index == 0):
                            bullet.episodic_access_index = self.access_clock
                        if bullet.procedural_strength > 0 and (bullet.procedural_access_index is None or bullet.procedural_access_index == 0):
                            bullet.procedural_access_index = self.access_clock
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
                "access_clock": self.access_clock,
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
            duplicate_id = self._is_duplicate(bullet)
            if duplicate_id:
                print(
                    f"[ACE Memory][Delta Dedup] Skipping duplicate matching id={duplicate_id} "
                    f"content={bullet.content}",
                    flush=True,
                )
                continue

            if bullet.id not in self.bullets:
                self._normalise_bullet(bullet)
                self.bullets[bullet.id] = bullet
                self._sync_categories(bullet)
                self._register_bullet(bullet)
                print(
                    f"[ACE Memory][Delta Add] id={bullet.id} helpful={bullet.helpful_count} "
                    f"harmful={bullet.harmful_count} tags={bullet.tags} content={bullet.content}",
                    flush=True,
                )
            else:
                # Bullet already exists, merge with existing
                existing = self.bullets[bullet.id]
                existing.helpful_count += bullet.helpful_count
                existing.harmful_count += bullet.harmful_count
                existing.semantic_strength = max(existing.semantic_strength, bullet.semantic_strength)
                existing.episodic_strength = max(existing.episodic_strength, bullet.episodic_strength)
                existing.procedural_strength = max(existing.procedural_strength, bullet.procedural_strength)
                if bullet.learner_id and not existing.learner_id:
                    existing.learner_id = bullet.learner_id
                if bullet.topic and not existing.topic:
                    existing.topic = bullet.topic
                if bullet.concept and not existing.concept:
                    existing.concept = bullet.concept
                if bullet.memory_type:
                    existing.memory_type = bullet.memory_type
                existing.tags = list(dict.fromkeys(existing.tags + bullet.tags))
                self._ensure_memory_tags(existing)
                self._sync_categories(existing)
                self._touch_bullet(existing)
                self._register_bullet(existing)
                print(
                    f"[ACE Memory][Delta Merge] id={existing.id} helpful={existing.helpful_count} "
                    f"harmful={existing.harmful_count} tags={existing.tags}",
                    flush=True,
                )
        
        # Update existing bullets
        for bullet_id, updates in delta.update_bullets.items():
            if bullet_id in self.bullets:
                bullet = self.bullets[bullet_id]
                bullet.helpful_count += updates.get("helpful", 0)
                bullet.harmful_count += updates.get("harmful", 0)
                self._touch_bullet(bullet)
                self._register_bullet(bullet)
                print(
                    f"[ACE Memory][Delta Update] id={bullet_id} applied={updates} "
                    f"new_helpful={bullet.helpful_count} new_harmful={bullet.harmful_count}",
                    flush=True,
                )
        
        # Remove bullets
        for bullet_id in delta.remove_bullets:
            if bullet_id in self.bullets:
                bullet = self.bullets.pop(bullet_id)
                for tag in bullet.tags:
                    if bullet_id in self.categories[tag]:
                        self.categories[tag].remove(bullet_id)
                self._unregister_bullet(bullet_id)
                print(
                    f"[ACE Memory][Delta Remove] id={bullet_id} tags={bullet.tags} content={bullet.content}",
                    flush=True,
                )
        
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
        now = datetime.now()
        
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
                    if self._compute_score(bullets_list[i], now) >= self._compute_score(bullets_list[j], now):
                        # Merge j into i
                        bullets_list[i].helpful_count += bullets_list[j].helpful_count
                        bullets_list[i].harmful_count += bullets_list[j].harmful_count
                        bullets_list[i].semantic_strength = max(
                            bullets_list[i].semantic_strength,
                            bullets_list[j].semantic_strength,
                        )
                        bullets_list[i].episodic_strength = max(
                            bullets_list[i].episodic_strength,
                            bullets_list[j].episodic_strength,
                        )
                        bullets_list[i].procedural_strength = max(
                            bullets_list[i].procedural_strength,
                            bullets_list[j].procedural_strength,
                        )
                        if not bullets_list[i].learner_id:
                            bullets_list[i].learner_id = bullets_list[j].learner_id
                        if not bullets_list[i].topic:
                            bullets_list[i].topic = bullets_list[j].topic
                        if not bullets_list[i].concept:
                            bullets_list[i].concept = bullets_list[j].concept
                        bullets_list[i].tags = list(
                            dict.fromkeys(bullets_list[i].tags + bullets_list[j].tags)
                        )
                        access_candidates = [
                            idx
                            for idx in [
                                bullets_list[i].semantic_access_index,
                                bullets_list[j].semantic_access_index,
                            ]
                            if idx is not None
                        ]
                        bullets_list[i].semantic_access_index = max(access_candidates) if access_candidates else None
                        access_candidates = [
                            idx
                            for idx in [
                                bullets_list[i].episodic_access_index,
                                bullets_list[j].episodic_access_index,
                            ]
                            if idx is not None
                        ]
                        bullets_list[i].episodic_access_index = max(access_candidates) if access_candidates else None
                        access_candidates = [
                            idx
                            for idx in [
                                bullets_list[i].procedural_access_index,
                                bullets_list[j].procedural_access_index,
                            ]
                            if idx is not None
                        ]
                        bullets_list[i].procedural_access_index = max(access_candidates) if access_candidates else None
                        self._ensure_memory_tags(bullets_list[i])
                        self._sync_categories(bullets_list[i])
                        to_remove.add(bullets_list[j].id)
                    else:
                        # Merge i into j
                        bullets_list[j].helpful_count += bullets_list[i].helpful_count
                        bullets_list[j].harmful_count += bullets_list[i].harmful_count
                        bullets_list[j].semantic_strength = max(
                            bullets_list[i].semantic_strength,
                            bullets_list[j].semantic_strength,
                        )
                        bullets_list[j].episodic_strength = max(
                            bullets_list[i].episodic_strength,
                            bullets_list[j].episodic_strength,
                        )
                        bullets_list[j].procedural_strength = max(
                            bullets_list[i].procedural_strength,
                            bullets_list[j].procedural_strength,
                        )
                        if not bullets_list[j].learner_id:
                            bullets_list[j].learner_id = bullets_list[i].learner_id
                        if not bullets_list[j].topic:
                            bullets_list[j].topic = bullets_list[i].topic
                        if not bullets_list[j].concept:
                            bullets_list[j].concept = bullets_list[i].concept
                        bullets_list[j].tags = list(
                            dict.fromkeys(bullets_list[j].tags + bullets_list[i].tags)
                        )
                        access_candidates = [
                            idx
                            for idx in [
                                bullets_list[i].semantic_access_index,
                                bullets_list[j].semantic_access_index,
                            ]
                            if idx is not None
                        ]
                        bullets_list[j].semantic_access_index = max(access_candidates) if access_candidates else None
                        access_candidates = [
                            idx
                            for idx in [
                                bullets_list[i].episodic_access_index,
                                bullets_list[j].episodic_access_index,
                            ]
                            if idx is not None
                        ]
                        bullets_list[j].episodic_access_index = max(access_candidates) if access_candidates else None
                        access_candidates = [
                            idx
                            for idx in [
                                bullets_list[i].procedural_access_index,
                                bullets_list[j].procedural_access_index,
                            ]
                            if idx is not None
                        ]
                        bullets_list[j].procedural_access_index = max(access_candidates) if access_candidates else None
                        self._ensure_memory_tags(bullets_list[j])
                        self._sync_categories(bullets_list[j])
                        to_remove.add(bullets_list[i].id)
                        break
        
        # Remove duplicates
        for bullet_id in to_remove:
            if bullet_id in self.bullets:
                bullet = self.bullets.pop(bullet_id)
                for tag in bullet.tags:
                    if bullet_id in self.categories[tag]:
                        self.categories[tag].remove(bullet_id)
                self._unregister_bullet(bullet_id)
        
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

        Bullets are ordered by the exponential decay score and then by
        ``helpful_count`` as a tiebreaker so frequently reinforced strategies
        edge out equally scored peers.

        Any bullet that falls outside the retention window is removed from the
        main dictionary *and* every tag index so future retrieval calls stay
        consistent.
        """
        # Rank bullets from most to least valuable using the score + frequency key.
        now = datetime.now()
        bullets_list = sorted(
            self.bullets.values(),
            key=lambda b: (self._compute_score(b, now), b.helpful_count),
            reverse=True
        )
        
        # IDs of the bullets we want to keep (highest-ranked window).
        to_keep = set(b.id for b in bullets_list[:self.max_bullets])
        
        # Everything else falls outside the retention window and is pruned.
        to_remove = set(self.bullets.keys()) - to_keep
        for bullet_id in to_remove:
            bullet = self.bullets.pop(bullet_id)
            try:
                score = self._compute_score(bullet, now)
            except Exception:
                score = bullet.score()
            print(
                f"[ACE Memory][Prune] Removing id={bullet_id} score={score:.3f} "
                f"helpful={bullet.helpful_count} harmful={bullet.harmful_count} "
                f"tags={bullet.tags} content={bullet.content}",
                flush=True,
            )
            for tag in bullet.tags:
                if bullet_id in self.categories[tag]:
                    self.categories[tag].remove(bullet_id)
            self._unregister_bullet(bullet_id)

        if to_remove:
            print(f"[ACE Memory] Pruned {len(to_remove)} low-quality bullets")
    
    def retrieve_relevant_bullets(
        self,
        query: str,
        top_k: int = 10,
        tags: Optional[List[str]] = None,
        min_score: float = 0.0,
        learner_id: Optional[str] = None,
        topic: Optional[str] = None,
        memory_types: Optional[List[str]] = None,
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

        if memory_types:
            allowed = {mt.lower() for mt in memory_types}
            candidates = [b for b in candidates if (b.memory_type or "semantic") in allowed]

        score_cache = {b.id: self._compute_score(b) for b in candidates}
        # Filter by score
        candidates = [b for b in candidates if score_cache.get(b.id, 0.0) >= min_score]

        if not candidates:
            return []
        
        # Rank by relevance to query (simple text similarity)
        scored_bullets = []
        memory_weight = {"procedural": 0.6, "episodic": 0.4, "semantic": 0.1}
        for bullet in candidates:
            relevance = self._text_similarity(query, bullet.content)
            combined_score = 0.6 * relevance + 0.4 * score_cache.get(bullet.id, 0.0)
            if learner_id:
                if bullet.learner_id == learner_id:
                    combined_score += 0.6
                elif bullet.learner_id:
                    combined_score -= 0.2
            if topic:
                if bullet.topic == topic:
                    combined_score += 0.3
            mt = (bullet.memory_type or "semantic").lower()
            combined_score += memory_weight.get(mt, 0.0)
            scored_bullets.append((combined_score, bullet))

        # Sort by combined score
        scored_bullets.sort(key=lambda x: x[0], reverse=True)
        top_bullets = [bullet for _, bullet in scored_bullets[:top_k]]
        # Update access counters for retrieved bullets
        for bullet in top_bullets:
            self._touch_bullet(bullet)
        return top_bullets
    
    def format_context(
        self,
        query: str,
        top_k: int = 10,
        tags: Optional[List[str]] = None,
        learner_id: Optional[str] = None,
        topic: Optional[str] = None,
        memory_types: Optional[List[str]] = None,
    ) -> str:
        """
        Format relevant bullets into a context string for the LLM.
        
        This is what gets injected into the prompt to help the model.
        """
        bullets = self.retrieve_relevant_bullets(
            query,
            top_k=top_k,
            tags=tags,
            learner_id=learner_id,
            topic=topic,
            memory_types=memory_types,
        )
        
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
        
        now = datetime.now()
        scores = [self._compute_score(b, now) for b in self.bullets.values()]
        
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
