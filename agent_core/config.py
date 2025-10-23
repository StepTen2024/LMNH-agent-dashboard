import json
import os

class AgentConfig:
    """Load and manage agent configuration"""
    
    def __init__(self, config_file):
        self.config_file = config_file
        self.config = self.load_config()
    
    def load_config(self):
        """Load config from JSON file"""
        if not os.path.exists(self.config_file):
            raise FileNotFoundError(f"Config file not found: {self.config_file}")
        
        with open(self.config_file, 'r') as f:
            return json.load(f)
    
    def get(self, key, default=None):
        """Get config value"""
        return self.config.get(key, default)
    
    def __getitem__(self, key):
        """Allow dict-style access"""
        return self.config[key]


