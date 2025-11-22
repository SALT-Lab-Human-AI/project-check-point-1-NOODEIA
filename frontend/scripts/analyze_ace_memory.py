"""
ACE Memory Analysis Tool (Neo4j-backed)

Inspect, search, and export ACE memory for a specific learner. The script
expects Neo4j credentials (NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD) and a
learner identifier provided either via `--learner <uuid>` or the
`ACE_ANALYZE_LEARNER_ID` environment variable.
"""

from __future__ import annotations

import argparse
import os
from collections import defaultdict
from typing import Any, Dict, List

from pathlib import Path
try:
    from dotenv import load_dotenv
    # Load .env.local from the frontend directory
    env_path = Path(__file__).parent.parent / '.env.local'
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass 

from ace_memory import ACEMemory, Bullet
from ace_memory_store import Neo4jMemoryStore


def _load_memory(learner_id: str) -> ACEMemory:
    if not learner_id:
        raise ValueError(
            "Learner ID is required. Use --learner or set ACE_ANALYZE_LEARNER_ID."
        )
    store = Neo4jMemoryStore(learner_id)
    return ACEMemory(storage=store)


def _print_section(title: str) -> None:
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def analyze_memory(learner_id: str) -> None:
    memory = _load_memory(learner_id)

    if not memory.bullets:
        print("📭 Memory is empty. Run the agent to accumulate strategies.")
        return

    _print_section("📊 Memory Statistics")
    stats = memory.get_statistics()
    print(f"Total bullets: {stats['total_bullets']}")
    print(f"Average score: {stats['avg_score']:.3f}")
    print(f"Average helpful count: {stats['avg_helpful']:.1f}")
    print(f"Average harmful count: {stats['avg_harmful']:.1f}")

    if stats.get("categories"):
        print("\nCategories:")
        for tag, count in sorted(stats["categories"].items(), key=lambda x: x[1], reverse=True):
            print(f"  - {tag}: {count} bullets")

    _print_section("🏆 Top 10 Performing Bullets")
    bullets_list = sorted(
        memory.bullets.values(),
        key=lambda b: (b.score(), b.helpful_count),
        reverse=True,
    )

    for i, bullet in enumerate(bullets_list[:10], 1):
        score = bullet.score()
        print(f"\n{i}. {bullet.format_for_prompt()}")
        print(f"   ID: {bullet.id}")
        print(f"   Score: {score:.3f} ({bullet.helpful_count} helpful, {bullet.harmful_count} harmful)")
        if bullet.tags:
            print(f"   Tags: {', '.join(bullet.tags)}")
        print(f"   Created: {bullet.created_at[:10]}")

    _print_section("🆕 10 Most Recently Added Bullets")
    recent_bullets = sorted(
        memory.bullets.values(), key=lambda b: b.created_at, reverse=True
    )
    for i, bullet in enumerate(recent_bullets[:10], 1):
        print(f"\n{i}. {bullet.format_for_prompt()}")
        print(f"   ID: {bullet.id}")
        if bullet.tags:
            print(f"   Tags: {', '.join(bullet.tags)}")

    _print_section("⚠️  Low Performing Bullets (Candidates for Pruning)")
    low_bullets = [b for b in bullets_list if b.helpful_count + b.harmful_count >= 3]
    low_bullets = sorted(low_bullets, key=lambda b: b.score())[:10]

    if low_bullets:
        for i, bullet in enumerate(low_bullets, 1):
            score = bullet.score()
            print(f"\n{i}. {bullet.format_for_prompt()}")
            print(f"   ID: {bullet.id}")
            print(f"   Score: {score:.3f} ({bullet.helpful_count} helpful, {bullet.harmful_count} harmful)")
    else:
        print("No low-performing bullets found.")

    if stats.get("categories"):
        _print_section("📚 Bullets by Category")
        for tag in sorted(stats["categories"].keys()):
            print(f"\n[{tag.upper()}]")
            tagged_bullets = [b for b in memory.bullets.values() if tag in b.tags]
            tagged_bullets = sorted(
                tagged_bullets,
                key=lambda b: b.score(),
                reverse=True,
            )[:5]
            for bullet in tagged_bullets:
                print(f"  • {bullet.format_for_prompt()}")


def search_memory(query: str, learner_id: str, top_k: int = 10) -> None:
    memory = _load_memory(learner_id)

    if not memory.bullets:
        print("📭 Memory is empty.")
        return

    _print_section(f"🔍 Search Results for: '{query}'")
    bullets = memory.retrieve_relevant_bullets(query, top_k=top_k)

    if not bullets:
        print("No relevant bullets found.")
        return

    print(f"Found {len(bullets)} relevant bullets:\n")

    for i, bullet in enumerate(bullets, 1):
        print(f"{i}. {bullet.format_for_prompt()}")
        print(f"   ID: {bullet.id}")
        if bullet.tags:
            print(f"   Tags: {', '.join(bullet.tags)}")
        print()


def export_memory(learner_id: str, output_file: str = "ace_memory_export.txt") -> None:
    memory = _load_memory(learner_id)

    if not memory.bullets:
        print("📭 Memory is empty.")
        return

    with open(output_file, "w", encoding="utf-8") as f:
        f.write("=" * 80 + "\n")
        f.write("ACE MEMORY EXPORT\n")
        f.write("=" * 80 + "\n\n")

        stats = memory.get_statistics()
        f.write(f"Total Bullets: {stats['total_bullets']}\n")
        f.write(f"Average Score: {stats['avg_score']:.3f}\n\n")

        bullets_list = sorted(
            memory.bullets.values(),
            key=lambda b: (b.score(), b.helpful_count),
            reverse=True,
        )

        f.write("=" * 80 + "\n")
        f.write("ALL BULLETS (SORTED BY SCORE)\n")
        f.write("=" * 80 + "\n\n")

        for i, bullet in enumerate(bullets_list, 1):
            f.write(f"{i}. {bullet.format_for_prompt()}\n")
            f.write(f"   ID: {bullet.id}\n")
            f.write(f"   Score: {bullet.score():.3f}\n")
            if bullet.tags:
                f.write(f"   Tags: {', '.join(bullet.tags)}\n")
            f.write(f"   Created: {bullet.created_at}\n\n")

    print(f"✓ Memory exported to: {output_file}")


def interactive_mode(learner_id: str) -> None:
    memory = _load_memory(learner_id)

    print("=" * 80)
    print("  ACE Memory Analysis - Interactive Mode")
    print("=" * 80)
    print()
    print("Commands:")
    print("  stats    - Show memory statistics")
    print("  top      - Show top performing bullets")
    print("  recent   - Show recently added bullets")
    print("  search <query>  - Search for bullets")
    print("  export   - Export memory to text file")
    print("  cleanup [--dry-run] - Merge near-duplicate bullets")
    print("  quit     - Exit")
    print()

    while True:
        try:
            command = input("\n> ").strip()

            if not command:
                continue

            if command in {"quit", "exit"}:
                break

            if command == "stats":
                memory = _load_memory(learner_id)
                stats = memory.get_statistics()
                print(f"\nTotal bullets: {stats['total_bullets']}")
                print(f"Average score: {stats['avg_score']:.3f}")
                if stats.get("categories"):
                    print("\nCategories:")
                    for tag, count in sorted(stats["categories"].items(), key=lambda x: x[1], reverse=True):
                        print(f"  - {tag}: {count} bullets")

            elif command == "top":
                memory = _load_memory(learner_id)
                bullets_list = sorted(
                    memory.bullets.values(),
                    key=lambda b: (b.score(), b.helpful_count),
                    reverse=True,
                )[:10]

                print("\nTop 10 bullets:")
                for i, bullet in enumerate(bullets_list, 1):
                    print(f"\n{i}. {bullet.format_for_prompt()}")
                    print(f"   Score: {bullet.score():.3f}")

            elif command == "recent":
                memory = _load_memory(learner_id)
                recent = sorted(
                    memory.bullets.values(),
                    key=lambda b: b.created_at,
                    reverse=True,
                )[:10]

                print("\n10 most recent bullets:")
                for i, bullet in enumerate(recent, 1):
                    print(f"\n{i}. {bullet.format_for_prompt()}")

            elif command.startswith("search "):
                query = command[7:].strip()
                search_memory(query, learner_id)

            elif command == "export":
                export_memory(learner_id)

            elif command.startswith("cleanup"):
                parts = command.split()
                dry_run = "--dry-run" in parts
                cleanup_memory(learner_id, dry_run=dry_run)

            else:
                print("Unknown command. Type 'quit' to exit.")

        except KeyboardInterrupt:
            print("\n\nExiting...")
            break
        except Exception as exc:
            print(f"Error: {exc}")


def cleanup_memory(learner_id: str, similarity: float = 0.9, dry_run: bool = False) -> None:
    memory = _load_memory(learner_id)
    bullets = list(memory.bullets.values())
    if not bullets:
        print("📭 Memory is empty.")
        return

    bullets_sorted = sorted(
        bullets,
        key=lambda b: memory._parse_created_at(b),
        reverse=True,
    )

    visited = set()
    merges = 0
    for idx, keep in enumerate(bullets_sorted):
        if keep.id in visited:
            continue
        cluster = [keep]
        for other in bullets_sorted[idx + 1 :]:
            if other.id in visited:
                continue
            score = memory._text_similarity(keep.content, other.content)
            if score >= similarity:
                cluster.append(other)
                visited.add(other.id)
        if len(cluster) <= 1:
            continue
        print(f"[Cleanup] Cluster size={len(cluster)} keep={keep.id}")
        if dry_run:
            for dup in cluster[1:]:
                print(f"  - would merge {dup.id} into {keep.id}")
            continue
        for dup in cluster[1:]:
            memory._merge_bullet_into(keep, dup)
            memory._touch_bullet(keep)
            for tag in dup.tags:
                if dup.id in memory.categories.get(tag, []):
                    memory.categories[tag].remove(dup.id)
            memory._unregister_bullet(dup.id)
            memory.bullets.pop(dup.id, None)
            merges += 1
    if dry_run:
        print("✅ Dry run complete.")
        return
    if merges:
        memory._save_memory()
    print(f"✅ Cleanup complete. Merged {merges} bullets.")


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Inspect ACE memory stored in Neo4j")
    parser.add_argument(
        "command",
        nargs="?",
        default="analyze",
        choices=["analyze", "search", "export", "interactive", "cleanup"],
    )
    parser.add_argument("query", nargs="*", help="Query text for the search command")
    parser.add_argument("--learner",default ="893c1bbd-d91d-4ad2-add8-2d504e703835" ,  dest="learner_id", help="Learner ID (Supabase user id)")
    parser.add_argument("--dry-run", action="store_true", help="Preview cleanup merges without saving")
    return parser.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    learner_id = args.learner_id or os.getenv("ACE_ANALYZE_LEARNER_ID")

    if args.command == "analyze":
        analyze_memory(learner_id)
    elif args.command == "search":
        if not args.query:
            print("Usage: analyze_ace_memory.py search <query> --learner <id>")
        else:
            search_memory(" ".join(args.query), learner_id)
    elif args.command == "export":
        export_memory(learner_id)
    elif args.command == "interactive":
        interactive_mode(learner_id)
    elif args.command == "cleanup":
        cleanup_memory(learner_id, dry_run=args.dry_run)
