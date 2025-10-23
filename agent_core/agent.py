import logging
import os
from pathlib import Path
from .config import AgentConfig
from .slack_handler import SlackHandler
from .claude_handler import ClaudeHandler
from .github_handler import GitHubHandler
from .dashboard_reporter import DashboardReporter
import hashlib
import time

class CodingAgent:
    """
    The main autonomous coding agent
    With personality!
    """
    
    def __init__(self, config_file):
        """Initialize the agent"""
        # Load config
        self.config = AgentConfig(config_file)
        
        # Set up logging
        self._setup_logging()
        
        # Get agent identity
        self.name = self.config['agent_name']
        self.emoji = self.config.get('agent_emoji', '🤖')
        self.catchphrases = self.config.get('catchphrases', {})
        
        # Initialize handlers
        self.slack = SlackHandler(
            self.config['slack_bot_token'],
            self.name
        )
        
        self.claude = ClaudeHandler(
            self.config['claude_api_key']
        )
        
        self.github = GitHubHandler(
            self.config['github_token'],
            self.config['github_username'],
            self.config['workspace_path']
        )
        
        # Initialize dashboard reporter
        self.dashboard = DashboardReporter()
        self.dashboard.add_log("success", f"{self.emoji} {self.name} initialized!")
        
        self.logger.info(f"{self.emoji} {self.name} initialized!")
    
    def _setup_logging(self):
        """Set up logging"""
        log_dir = Path('logs')
        log_dir.mkdir(exist_ok=True)
        
        log_file = log_dir / f"{self.config['agent_name'].lower()}.log"
        
        logging.basicConfig(
            level=self.config.get('log_level', 'INFO'),
            format=f"{self.config.get('agent_emoji', '🤖')} %(asctime)s - %(name)s - %(levelname)s - %(message)s",
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        
        self.logger = logging.getLogger(self.config['agent_name'])
    
    def say(self, key, **kwargs):
        """Say a catchphrase"""
        phrase = self.catchphrases.get(key, key)
        return phrase.format(**kwargs)
    
    def process_task(self, task_data, thread_ts=None):
        """
        Main function to process a task from start to finish
        """
        task = task_data.get('task', '')
        repo_url = task_data.get('repo', '')
        file_path = task_data.get('file', '')
        branch = task_data.get('branch', 'main')
        channel = self.config['slack_channel']
        
        # Generate task ID
        task_id = hashlib.md5(f"{task}{time.time()}".encode()).hexdigest()[:8]
        
        self.logger.info(f"Processing task: {task}")
        
        # Add task to dashboard
        self.dashboard.add_task(task_id, task, "in_progress")
        self.dashboard.update_status("working", task, 10)
        self.dashboard.add_log("info", f"🚀 Starting task: {task}")
        
        try:
            # Step 1: Announce we're starting
            self.slack.send_message(
                channel,
                self.say('starting', task=task),
                thread_ts=thread_ts
            )
            
            # Step 2: Think about the task
            self.dashboard.update_status("working", task, 20)
            self.dashboard.add_log("info", "🤔 Analyzing task with Claude...")
            
            self.slack.send_message(
                channel,
                self.say('thinking'),
                thread_ts=thread_ts
            )
            
            plan = self.claude.analyze_task(task)
            
            if not plan:
                raise Exception("Failed to create plan")
            
            self.logger.info(f"Plan: {plan.get('summary', 'No summary')}")
            self.dashboard.add_log("success", "✅ Task analysis complete")
            
            # Step 3: Clone/pull repo
            if not repo_url:
                raise Exception("No repo URL provided!")
            
            self.dashboard.update_status("working", task, 40)
            self.dashboard.add_log("info", f"📦 Cloning repository...")
            
            self.slack.send_message(
                channel,
                self.say('cloning'),
                thread_ts=thread_ts
            )
            
            repo_path = self.github.clone_or_pull(repo_url, branch)
            
            if not repo_path:
                raise Exception("Failed to clone repository")
            
            self.dashboard.add_log("success", "✅ Repository ready")
            
            # Step 4: Make code changes
            self.dashboard.update_status("working", task, 60)
            self.dashboard.add_log("info", "💻 Writing code... LOOK MUM NO HANDS!")
            
            self.slack.send_message(
                channel,
                self.say('coding'),
                thread_ts=thread_ts
            )
            
            # Get files to modify from plan
            files_to_modify = plan.get('files_to_modify', [])
            
            if not files_to_modify and file_path:
                # If no files in plan but user specified one, use that
                files_to_modify = [file_path]
            
            if not files_to_modify:
                raise Exception("No files to modify!")
            
            # Modify each file
            for i, file in enumerate(files_to_modify):
                self.logger.info(f"Modifying: {file}")
                self.dashboard.add_log("info", f"📝 Modifying {file}")
                
                # Read current content
                current_content = self.github.read_file(repo_path, file)
                
                # Generate new code
                new_code = self.claude.generate_code(
                    task,
                    file,
                    current_content or ""
                )
                
                if not new_code:
                    self.logger.warning(f"No code generated for {file}")
                    continue
                
                # Write new code
                self.github.write_file(repo_path, file, new_code)
                
                # Update progress
                progress = 60 + (20 * (i + 1) // len(files_to_modify))
                self.dashboard.update_status("working", task, progress)
            
            # Step 5: Commit and push
            self.dashboard.update_status("working", task, 90)
            self.dashboard.add_log("info", "🚀 Pushing to GitHub...")
            
            self.slack.send_message(
                channel,
                self.say('pushing'),
                thread_ts=thread_ts
            )
            
            commit_message = f"[{self.name}] {task}"
            success = self.github.commit_and_push(repo_path, commit_message, branch)
            
            if not success:
                raise Exception("Failed to push changes")
            
            # Step 6: Celebrate success!
            self.dashboard.update_status("idle", None, 0)
            self.dashboard.update_task(task_id, "completed")
            self.dashboard.add_log("success", f"🎉 Task completed: {task}")
            
            self.slack.send_message(
                channel,
                self.say('success'),
                thread_ts=thread_ts
            )
            
            self.logger.info(f"{self.emoji} Task completed successfully!")
            
        except Exception as e:
            # Something went wrong
            self.logger.error(f"Task failed: {e}")
            
            self.dashboard.update_status("idle", None, 0)
            self.dashboard.update_task(task_id, "failed")
            self.dashboard.add_log("error", f"❌ Task failed: {str(e)}")
            
            self.slack.send_message(
                channel,
                self.say('error') + f"\n\nError: {str(e)}",
                thread_ts=thread_ts
            )
    
    def run(self):
        """
        Start the agent and listen for tasks
        """
        channel = self.config['slack_channel']
        
        # Announce we're online
        self.dashboard.update_status("online", None, 0)
        self.dashboard.add_log("success", f"🟢 {self.name} is ONLINE!")
        
        self.slack.send_message(
            channel,
            f"🟢 {self.emoji} {self.name} is ONLINE! Look mum, no hands! Ready for tasks!"
        )
        
        self.logger.info(f"{self.emoji} {self.name} is running...")
        
        # Listen for mentions
        def task_callback(task_data, thread_ts):
            """Called when task is received"""
            self.process_task(task_data, thread_ts)
        
        # Start listening (this runs forever)
        try:
            self.slack.listen_for_mentions(channel, task_callback)
        except KeyboardInterrupt:
            self.logger.info(f"{self.emoji} {self.name} is shutting down...")
            self.dashboard.update_status("offline", None, 0)
            self.dashboard.add_log("warning", f"🔴 {self.name} is going offline")
            self.slack.send_message(
                channel,
                f"🔴 {self.emoji} {self.name} is going offline. Bye mum!"
            )


