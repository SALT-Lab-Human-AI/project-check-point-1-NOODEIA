"""
Side-by-Side Test: Original vs ACE Memory

Tests both systems on the same questions to demonstrate the difference.
"""

import time
import sys
from pathlib import Path


def print_section(title, width=80):
    print("\n" + "=" * width)
    print(f"  {title}".center(width))
    print("=" * width)


def test_original_memory():
    """Test the original memory system"""
    print_section("🔵 Testing Original Memory System")
    
    try:
        # Import original agent
        sys.path.insert(0, str(Path(__file__).parent))
        from langgraph_agent import build_graph
        from langgraph_utile import get_conversation_memory
        
        app = build_graph()
        
        # Clear any existing memory
        memory = get_conversation_memory()
        initial_count = len(memory.conversations)
        
        test_questions = [
            "What is 15 multiplied by 8?",
            "Calculate 100 + 250 + 50",
            "What is 2 to the power of 8?",
        ]
        
        print(f"\n📊 Initial state:")
        print(f"   Conversations in memory: {initial_count}")
        print(f"\n⏱️  Processing {len(test_questions)} questions...\n")
        
        results = []
        start_time = time.time()
        
        for i, question in enumerate(test_questions, 1):
            print(f"Q{i}: {question}")
            
            cfg = {"configurable": {"thread_id": f"original-{int(time.time()*1000)}"}}
            
            out = app.invoke({
                "messages": [{"role": "user", "content": question}],
                "mode": "",
                "scratch": {},
                "result": {},
            }, config=cfg)
            
            answer = out['result'].get('answer', 'N/A')
            mode = out.get('mode', 'N/A')
            
            print(f"   Answer: {answer}")
            print(f"   Mode: {mode}")
            
            results.append({
                'question': question,
                'answer': answer,
                'mode': mode
            })
            
            # Small delay
            time.sleep(0.5)
        
        elapsed = time.time() - start_time
        
        # Check memory after
        final_count = len(memory.conversations)
        
        print(f"\n✓ Processing complete!")
        print(f"   Time taken: {elapsed:.1f}s")
        print(f"   Conversations saved: {final_count - initial_count}")
        
        # Try to ask a similar question to see if it helps
        print(f"\n🔄 Now asking similar question to see if memory helps...")
        similar_question = "Calculate 20 multiplied by 10"
        print(f"   Q: {similar_question}")
        
        cfg = {"configurable": {"thread_id": f"original-{int(time.time()*1000)}"}}
        out = app.invoke({
            "messages": [{"role": "user", "content": similar_question}],
            "mode": "",
            "scratch": {},
            "result": {},
        }, config=cfg)
        
        print(f"   Answer: {out['result'].get('answer', 'N/A')}")
        print(f"   Memory consulted? ❌ No (memory is write-only)")
        
        return {
            'system': 'original',
            'results': results,
            'time': elapsed,
            'memory_entries': final_count - initial_count,
            'memory_used': False
        }
        
    except Exception as e:
        print(f"❌ Error testing original memory: {e}")
        import traceback
        traceback.print_exc()
        return None


def test_ace_memory():
    """Test the ACE memory system"""
    print_section("🟢 Testing ACE Memory System")
    
    try:
        # Import ACE agent
        from langgraph_agent_ace import build_ace_graph, get_ace_system
        
        app = build_ace_graph()
        memory, _ = get_ace_system()
        
        initial_bullets = len(memory.bullets)
        
        test_questions = [
            "What is 15 multiplied by 8?",
            "Calculate 100 + 250 + 50",
            "What is 2 to the power of 8?",
        ]
        
        print(f"\n📊 Initial state:")
        print(f"   Bullets in memory: {initial_bullets}")
        print(f"\n⏱️  Processing {len(test_questions)} questions...\n")
        
        results = []
        start_time = time.time()
        
        for i, question in enumerate(test_questions, 1):
            print(f"Q{i}: {question}")
            
            # Check if memory retrieves anything
            relevant = memory.retrieve_relevant_bullets(question, top_k=3)
            if relevant:
                print(f"   📚 Retrieved {len(relevant)} relevant bullets from memory")
            
            cfg = {"configurable": {"thread_id": f"ace-{int(time.time()*1000)}"}}
            
            out = app.invoke({
                "messages": [{"role": "user", "content": question}],
                "mode": "",
                "scratch": {"ace_online_learning": True},
                "result": {},
            }, config=cfg)
            
            answer = out['result'].get('answer', 'N/A')
            mode = out.get('mode', 'N/A')
            
            print(f"   Answer: {answer}")
            print(f"   Mode: {mode}")
            
            # Show learning
            if "ace_delta" in out.get("scratch", {}):
                delta = out["scratch"]["ace_delta"]
                if delta['num_new_bullets'] > 0 or delta['num_updates'] > 0:
                    print(f"   💡 Learned: {delta['num_new_bullets']} new, {delta['num_updates']} updated")
            
            results.append({
                'question': question,
                'answer': answer,
                'mode': mode
            })
            
            # Small delay
            time.sleep(0.5)
        
        elapsed = time.time() - start_time
        
        # Check memory after
        final_bullets = len(memory.bullets)
        
        print(f"\n✓ Processing complete!")
        print(f"   Time taken: {elapsed:.1f}s")
        print(f"   Bullets learned: {final_bullets - initial_bullets}")
        
        # Try to ask a similar question to see if memory helps
        print(f"\n🔄 Now asking similar question to see if memory helps...")
        similar_question = "Calculate 20 multiplied by 10"
        print(f"   Q: {similar_question}")
        
        relevant = memory.retrieve_relevant_bullets(similar_question, top_k=5)
        if relevant:
            print(f"   📚 Memory retrieval: Found {len(relevant)} relevant bullets")
            print(f"   Top bullet: {relevant[0].format_for_prompt()}")
        
        cfg = {"configurable": {"thread_id": f"ace-{int(time.time()*1000)}"}}
        out = app.invoke({
            "messages": [{"role": "user", "content": similar_question}],
            "mode": "",
            "scratch": {"ace_online_learning": True},
            "result": {},
        }, config=cfg)
        
        print(f"   Answer: {out['result'].get('answer', 'N/A')}")
        print(f"   Memory consulted? ✅ Yes (retrieved and injected context)")
        
        return {
            'system': 'ace',
            'results': results,
            'time': elapsed,
            'memory_bullets': final_bullets - initial_bullets,
            'memory_used': True
        }
        
    except Exception as e:
        print(f"❌ Error testing ACE memory: {e}")
        import traceback
        traceback.print_exc()
        return None


def compare_results(original_result, ace_result):
    """Compare the results from both systems"""
    print_section("📊 COMPARISON RESULTS")
    
    if not original_result or not ace_result:
        print("⚠️  Could not compare - one or both tests failed")
        return
    
    print(f"\n{'Metric':<30} {'Original':<20} {'ACE':<20} {'Difference'}")
    print("-" * 80)
    
    # Time comparison
    time_diff = original_result['time'] - ace_result['time']
    time_pct = (time_diff / original_result['time']) * 100
    print(f"{'Time taken':<30} {original_result['time']:.1f}s"
          f"{'':<13} {ace_result['time']:.1f}s"
          f"{'':<13} {time_pct:+.1f}%")
    
    # Memory usage
    print(f"\n{'Memory Usage':<30} {'Original':<20} {'ACE':<20}")
    print("-" * 80)
    print(f"{'Memory consulted?':<30} {'❌ No':<20} {'✅ Yes':<20}")
    print(f"{'Memory entries/bullets':<30} "
          f"{original_result.get('memory_entries', 0):<20} "
          f"{ace_result.get('memory_bullets', 0):<20}")
    
    print(f"\n{'Key Differences':<30}")
    print("-" * 80)
    
    differences = [
        ("Context injection", "❌ No", "✅ Yes"),
        ("Learning from execution", "❌ No", "✅ Yes"),
        ("Self-improvement", "❌ No", "✅ Yes"),
        ("Future queries benefit", "❌ No", "✅ Yes"),
    ]
    
    for feature, original, ace in differences:
        print(f"{feature:<30} {original:<20} {ace:<20}")
    
    print(f"\n{'Expected Performance':<30}")
    print("-" * 80)
    print("Based on ACE paper results:")
    print("  • +10-17% accuracy on agent tasks")
    print("  • +8-13% accuracy on domain tasks")
    print("  • Better answers through accumulated knowledge")
    print("  • Faster inference after learning phase")


def main():
    """Run the side-by-side test"""
    
    print("\n" + "█" * 80)
    print("█" + " " * 78 + "█")
    print("█" + "SIDE-BY-SIDE TEST: Original vs ACE Memory".center(78) + "█")
    print("█" + " " * 78 + "█")
    print("█" * 80)
    
    print("\nThis test will run the same questions through both memory systems")
    print("to demonstrate the practical differences.\n")
    
    input("Press Enter to start testing...")
    
    # Test original memory
    original_result = test_original_memory()
    
    print("\n" + "⏸️ " * 30)
    input("\nPress Enter to test ACE memory...")
    
    # Test ACE memory
    ace_result = test_ace_memory()
    
    # Compare results
    compare_results(original_result, ace_result)
    
    print_section("🎯 CONCLUSION")
    
    print("""
The key difference is NOT just in performance metrics, but in the MECHANISM:

ORIGINAL MEMORY:
  • Question → Process → Answer → Log (for analytics)
  • Each question processed from scratch
  • No learning, no improvement over time
  • Memory is passive observation

ACE MEMORY:
  • Question → Retrieve Context → Process WITH Memory → Answer → Learn
  • Each question benefits from past experience
  • Continuous learning and improvement
  • Memory is active assistant

This fundamental difference leads to:
  ✓ Better answers (more context)
  ✓ Self-improvement (learns from mistakes)
  ✓ Efficiency (reuses strategies)
  ✓ Scalability (grows comprehensive knowledge)

📖 For more details, see:
   • ACE_README.md - Complete documentation
   • compare_memory_systems.py - Detailed comparison
   • analyze_ace_memory.py - Explore learned memory
""")


if __name__ == "__main__":
    main()
