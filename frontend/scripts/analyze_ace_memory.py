"""
ACE Memory Analysis Tool

Provides insights into the learned ACE memory:
- View all bullets with scores
- Search for specific topics
- Analyze learning patterns
- Export bullets for inspection
"""

import json
from pathlib import Path
from collections import defaultdict
from typing import List, Dict, Any
from ace_memory import ACEMemory, Bullet


def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def analyze_memory(memory_file: str = "ace_memory.json"):
    """Analyze and display ACE memory contents"""
    
    if not Path(memory_file).exists():
        print(f"❌ Memory file not found: {memory_file}")
        print("Run the ACE agent first to build up memory.")
        return
    
    memory = ACEMemory(memory_file=memory_file)
    
    if not memory.bullets:
        print("📭 Memory is empty. Run the agent to accumulate strategies.")
        return
    
    # Overall statistics
    print_section("📊 Memory Statistics")
    stats = memory.get_statistics()
    print(f"Total bullets: {stats['total_bullets']}")
    print(f"Average score: {stats['avg_score']:.3f}")
    print(f"Average helpful count: {stats['avg_helpful']:.1f}")
    print(f"Average harmful count: {stats['avg_harmful']:.1f}")
    
    if stats.get('categories'):
        print(f"\nCategories:")
        for tag, count in sorted(stats['categories'].items(), key=lambda x: x[1], reverse=True):
            print(f"  - {tag}: {count} bullets")
    
    # Top performing bullets
    print_section("🏆 Top 10 Performing Bullets")
    bullets_list = sorted(
        memory.bullets.values(),
        key=lambda b: (b.score(), b.helpful_count),
        reverse=True
    )
    
    for i, bullet in enumerate(bullets_list[:10], 1):
        score = bullet.score()
        print(f"\n{i}. {bullet.format_for_prompt()}")
        print(f"   ID: {bullet.id}")
        print(f"   Score: {score:.3f} ({bullet.helpful_count} helpful, {bullet.harmful_count} harmful)")
        if bullet.tags:
            print(f"   Tags: {', '.join(bullet.tags)}")
        print(f"   Created: {bullet.created_at[:10]}")
    
    # Recently added bullets
    print_section("🆕 10 Most Recently Added Bullets")
    recent_bullets = sorted(
        memory.bullets.values(),
        key=lambda b: b.created_at,
        reverse=True
    )
    
    for i, bullet in enumerate(recent_bullets[:10], 1):
        print(f"\n{i}. {bullet.format_for_prompt()}")
        print(f"   ID: {bullet.id}")
        if bullet.tags:
            print(f"   Tags: {', '.join(bullet.tags)}")
    
    # Low performing bullets (candidates for pruning)
    print_section("⚠️  Low Performing Bullets (Candidates for Pruning)")
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
    
    # Category analysis
    if stats.get('categories'):
        print_section("📚 Bullets by Category")
        for tag in sorted(stats['categories'].keys()):
            print(f"\n[{tag.upper()}]")
            tagged_bullets = [
                b for b in memory.bullets.values()
                if tag in b.tags
            ]
            tagged_bullets = sorted(
                tagged_bullets,
                key=lambda b: b.score(),
                reverse=True
            )[:5]  # Top 5 per category
            
            for bullet in tagged_bullets:
                print(f"  • {bullet.format_for_prompt()}")


def search_memory(query: str, memory_file: str = "ace_memory.json", top_k: int = 10):
    """Search memory for relevant bullets"""
    
    if not Path(memory_file).exists():
        print(f"❌ Memory file not found: {memory_file}")
        return
    
    memory = ACEMemory(memory_file=memory_file)
    
    if not memory.bullets:
        print("📭 Memory is empty.")
        return
    
    print_section(f"🔍 Search Results for: '{query}'")
    
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


def export_memory(memory_file: str = "ace_memory.json", output_file: str = "ace_memory_export.txt"):
    """Export memory to a readable text file"""
    
    if not Path(memory_file).exists():
        print(f"❌ Memory file not found: {memory_file}")
        return
    
    memory = ACEMemory(memory_file=memory_file)
    
    if not memory.bullets:
        print("📭 Memory is empty.")
        return
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("=" * 80 + "\n")
        f.write("ACE MEMORY EXPORT\n")
        f.write("=" * 80 + "\n\n")
        
        # Statistics
        stats = memory.get_statistics()
        f.write(f"Total Bullets: {stats['total_bullets']}\n")
        f.write(f"Average Score: {stats['avg_score']:.3f}\n\n")
        
        # All bullets sorted by score
        bullets_list = sorted(
            memory.bullets.values(),
            key=lambda b: (b.score(), b.helpful_count),
            reverse=True
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
            f.write(f"   Created: {bullet.created_at}\n")
            f.write("\n")
    
    print(f"✓ Memory exported to: {output_file}")


def interactive_mode():
    """Interactive mode for exploring memory"""
    memory_file = "ace_memory.json"
    
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
    print("  quit     - Exit")
    print()
    
    while True:
        try:
            command = input("\n> ").strip()
            
            if not command:
                continue
            
            if command == "quit" or command == "exit":
                break
            
            elif command == "stats":
                memory = ACEMemory(memory_file=memory_file)
                stats = memory.get_statistics()
                print(f"\nTotal bullets: {stats['total_bullets']}")
                print(f"Average score: {stats['avg_score']:.3f}")
                if stats.get('categories'):
                    print("\nCategories:")
                    for tag, count in sorted(stats['categories'].items(), key=lambda x: x[1], reverse=True):
                        print(f"  - {tag}: {count} bullets")
            
            elif command == "top":
                memory = ACEMemory(memory_file=memory_file)
                bullets_list = sorted(
                    memory.bullets.values(),
                    key=lambda b: (b.score(), b.helpful_count),
                    reverse=True
                )[:10]
                
                print("\nTop 10 bullets:")
                for i, bullet in enumerate(bullets_list, 1):
                    print(f"\n{i}. {bullet.format_for_prompt()}")
                    print(f"   Score: {bullet.score():.3f}")
            
            elif command == "recent":
                memory = ACEMemory(memory_file=memory_file)
                recent = sorted(
                    memory.bullets.values(),
                    key=lambda b: b.created_at,
                    reverse=True
                )[:10]
                
                print("\n10 most recent bullets:")
                for i, bullet in enumerate(recent, 1):
                    print(f"\n{i}. {bullet.format_for_prompt()}")
            
            elif command.startswith("search "):
                query = command[7:].strip()
                search_memory(query, memory_file=memory_file)
            
            elif command == "export":
                export_memory(memory_file=memory_file)
            
            else:
                print("Unknown command. Type 'quit' to exit.")
        
        except KeyboardInterrupt:
            print("\n\nExiting...")
            break
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "search" and len(sys.argv) > 2:
            query = " ".join(sys.argv[2:])
            search_memory(query)
        elif command == "export":
            export_memory()
        elif command == "interactive":
            interactive_mode()
        else:
            print("Usage:")
            print("  python analyze_ace_memory.py                  # Full analysis")
            print("  python analyze_ace_memory.py search <query>   # Search memory")
            print("  python analyze_ace_memory.py export           # Export to text")
            print("  python analyze_ace_memory.py interactive      # Interactive mode")
    else:
        analyze_memory()
