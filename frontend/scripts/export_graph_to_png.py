#!/usr/bin/env python3
"""
Export LangGraph agent workflow as PNG image
Generates visual diagram of the multi-agent system
"""

import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

try:
    from frontend.scripts.langgraph_agent_ace import build_ace_graph
    from IPython.display import Image, display
    import os

    print("🎨 Generating LangGraph workflow visualization...")

    # Build the graph
    graph = build_ace_graph()

    # Output directory
    output_dir = PROJECT_ROOT / "docs" / "architecture"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Generate PNG
    output_file = output_dir / "langgraph_ace_workflow.png"

    try:
        # Try using get_graph() method with Mermaid rendering
        graph_image = graph.get_graph().draw_mermaid_png()

        with open(output_file, "wb") as f:
            f.write(graph_image)

        print(f"✅ Graph visualization saved to: {output_file}")
        print(f"📊 File size: {len(graph_image)} bytes")

    except Exception as e:
        print(f"⚠️  Mermaid PNG generation failed: {e}")
        print("\nTrying alternative ASCII visualization...")

        # Fallback: Print ASCII representation
        try:
            graph_repr = graph.get_graph().draw_ascii()
            ascii_file = output_dir / "langgraph_ace_workflow.txt"
            with open(ascii_file, "w") as f:
                f.write(graph_repr)
            print(f"✅ ASCII visualization saved to: {ascii_file}")
        except Exception as e2:
            print(f"❌ ASCII visualization also failed: {e2}")

            # Last resort: Print graph structure
            print("\n📋 Graph Structure:")
            print(graph.get_graph())

except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
