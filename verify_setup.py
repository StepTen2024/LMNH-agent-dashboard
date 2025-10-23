#!/usr/bin/env python3
"""
Verify LMNH setup and configuration

Usage:
    python verify_setup.py
"""

import sys
import json
from pathlib import Path

def check_file(path, description):
    """Check if a file exists"""
    if Path(path).exists():
        print(f"✅ {description}: Found")
        return True
    else:
        print(f"❌ {description}: Missing")
        return False

def check_dependencies():
    """Check if required packages are installed"""
    required = ["anthropic", "slack_sdk", "git", "requests"]
    missing = []
    
    for pkg in required:
        try:
            __import__(pkg)
            print(f"✅ Package '{pkg}': Installed")
        except ImportError:
            print(f"❌ Package '{pkg}': Not installed")
            missing.append(pkg)
    
    return len(missing) == 0

def check_config():
    """Check if config is properly set up"""
    config_path = "configs/lmnh.json"
    
    if not Path(config_path).exists():
        print(f"❌ Config file: Not found at {config_path}")
        return False
    
    print(f"✅ Config file: Found")
    
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        # Check for placeholder values
        placeholders = {
            "slack_bot_token": "PASTE_YOUR_SLACK_TOKEN_HERE",
            "claude_api_key": "PASTE_YOUR_CLAUDE_KEY_HERE",
            "github_token": "PASTE_YOUR_GITHUB_TOKEN_HERE",
            "github_username": "YOUR_GITHUB_USERNAME"
        }
        
        all_configured = True
        
        for key, placeholder in placeholders.items():
            value = config.get(key, "")
            if value == placeholder or not value:
                print(f"⚠️  Config '{key}': Still has placeholder value")
                all_configured = False
            else:
                # Don't show the full token, just confirmation
                print(f"✅ Config '{key}': Configured")
        
        return all_configured
        
    except json.JSONDecodeError:
        print(f"❌ Config file: Invalid JSON")
        return False

def main():
    """Run all checks"""
    print("=" * 60)
    print("🚴‍♂️ LMNH Setup Verification")
    print("=" * 60)
    print()
    
    print("📁 Checking file structure...")
    print("-" * 60)
    
    files_ok = all([
        check_file("agent_core/__init__.py", "agent_core/__init__.py"),
        check_file("agent_core/agent.py", "agent_core/agent.py"),
        check_file("agent_core/config.py", "agent_core/config.py"),
        check_file("agent_core/claude_handler.py", "agent_core/claude_handler.py"),
        check_file("agent_core/github_handler.py", "agent_core/github_handler.py"),
        check_file("agent_core/slack_handler.py", "agent_core/slack_handler.py"),
        check_file("configs/lmnh.json", "configs/lmnh.json"),
        check_file("requirements.txt", "requirements.txt"),
        check_file("run_agent.py", "run_agent.py"),
        check_file("README.md", "README.md")
    ])
    
    print()
    print("📦 Checking dependencies...")
    print("-" * 60)
    
    deps_ok = check_dependencies()
    
    print()
    print("⚙️  Checking configuration...")
    print("-" * 60)
    
    config_ok = check_config()
    
    print()
    print("=" * 60)
    
    if files_ok and deps_ok and config_ok:
        print("✅ ✅ ✅ ALL CHECKS PASSED! ✅ ✅ ✅")
        print()
        print("🚴‍♂️ LMNH is ready to ride with NO HANDS!")
        print()
        print("To start LMNH, run:")
        print("    python run_agent.py lmnh")
        print()
        return 0
    else:
        print("❌ SOME CHECKS FAILED")
        print()
        
        if not deps_ok:
            print("📦 To install dependencies, run:")
            print("    pip install -r requirements.txt")
            print()
        
        if not config_ok:
            print("⚙️  To configure LMNH:")
            print("    1. Edit configs/lmnh.json")
            print("    2. Add your API keys")
            print("    3. See QUICKSTART.md for details")
            print()
        
        return 1

if __name__ == "__main__":
    sys.exit(main())



