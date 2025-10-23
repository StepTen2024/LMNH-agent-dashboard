from anthropic import Anthropic
import json
import logging

logger = logging.getLogger(__name__)

class ClaudeHandler:
    """Handles communication with Claude API"""
    
    def __init__(self, api_key):
        self.client = Anthropic(api_key=api_key)
        self.model = "claude-sonnet-4-20250514"
    
    def analyze_task(self, task_description, context=""):
        """
        Ask Claude to analyze a task and create a plan
        
        Returns: dict with plan, files to modify, etc.
        """
        logger.info(f"Analyzing task: {task_description}")
        
        prompt = f"""You are an autonomous coding agent. Analyze this task:

Task: {task_description}

Context: {context}

Provide a detailed plan in JSON format:
{{
    "summary": "brief task summary",
    "steps": ["step 1", "step 2", ...],
    "files_to_modify": ["path/to/file1.py", "path/to/file2.js"],
    "estimated_difficulty": "easy/medium/hard",
    "potential_issues": ["issue 1", "issue 2"]
}}

Respond ONLY with valid JSON, no markdown, no explanation."""
        
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            plan_text = response.content[0].text.strip()
            
            # Remove markdown code blocks if present
            if plan_text.startswith('```'):
                lines = plan_text.split('\n')
                plan_text = '\n'.join(lines[1:-1])
            
            plan = json.loads(plan_text)
            logger.info(f"Plan created: {plan.get('summary', 'No summary')}")
            return plan
            
        except Exception as e:
            logger.error(f"Error analyzing task: {e}")
            return None
    
    def generate_code(self, task, file_path, current_content=""):
        """
        Ask Claude to write/modify code
        
        Returns: new file content as string
        """
        logger.info(f"Generating code for: {file_path}")
        
        prompt = f"""You are a coding agent. Modify this file to complete the task.

Task: {task}

File: {file_path}

Current content:
```
{current_content if current_content else "# Empty file"}
```

Provide the COMPLETE new file content. 
- Only output the code
- No markdown, no explanations, no ```
- Just the raw code ready to write to file"""
        
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=8000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            code = response.content[0].text.strip()
            
            # Remove markdown if Claude added it anyway
            if code.startswith('```'):
                lines = code.split('\n')
                code = '\n'.join(lines[1:-1])
            
            logger.info(f"Code generated successfully")
            return code
            
        except Exception as e:
            logger.error(f"Error generating code: {e}")
            return None


