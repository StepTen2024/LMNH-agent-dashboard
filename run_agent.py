#!/usr/bin/env python3
"""
Start a coding agent

Usage:
    python run_agent.py lmnh
"""

import sys
from agent_core.agent import CodingAgent

def main():
    if len(sys.argv) < 2:
        print("Usage: python run_agent.py <agent_config>")
        print("Example: python run_agent.py lmnh")
        sys.exit(1)
    
    agent_name = sys.argv[1].lower()
    config_file = f"configs/{agent_name}.json"
    
    print(f"🚀 Starting agent: {agent_name}")
    print(f"📝 Config: {config_file}")
    print("=" * 50)
    
    try:
        agent = CodingAgent(config_file)
        agent.run()
    except KeyboardInterrupt:
        print("\n\n👋 Agent stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting agent: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()



