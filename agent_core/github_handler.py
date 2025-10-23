import git
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class GitHubHandler:
    """Handles Git/GitHub operations"""
    
    def __init__(self, github_token, github_username, workspace_path):
        self.token = github_token
        self.username = github_username
        self.workspace = Path(workspace_path)
        self.workspace.mkdir(parents=True, exist_ok=True)
    
    def clone_or_pull(self, repo_url, branch="main"):
        """
        Clone a repo or pull latest if it exists
        
        Returns: path to repo
        """
        # Extract repo name from URL
        repo_name = repo_url.rstrip('/').split('/')[-1].replace('.git', '')
        repo_path = self.workspace / repo_name
        
        # Add authentication to URL
        if 'https://' in repo_url:
            auth_url = repo_url.replace(
                'https://', 
                f'https://{self.username}:{self.token}@'
            )
        else:
            auth_url = repo_url
        
        try:
            if repo_path.exists():
                logger.info(f"Pulling latest changes: {repo_name}")
                repo = git.Repo(repo_path)
                origin = repo.remotes.origin
                origin.pull(branch)
            else:
                logger.info(f"Cloning repository: {repo_name}")
                repo = git.Repo.clone_from(auth_url, repo_path, branch=branch)
            
            logger.info(f"Repository ready: {repo_path}")
            return str(repo_path)
            
        except Exception as e:
            logger.error(f"Git operation failed: {e}")
            return None
    
    def commit_and_push(self, repo_path, commit_message, branch="main"):
        """
        Commit all changes and push to remote
        
        Returns: True if successful
        """
        try:
            repo = git.Repo(repo_path)
            
            # Check if there are changes
            if not repo.is_dirty() and not repo.untracked_files:
                logger.info("No changes to commit")
                return True
            
            # Add all changes
            repo.git.add(A=True)
            
            # Commit
            repo.index.commit(commit_message)
            logger.info(f"Committed: {commit_message}")
            
            # Push
            origin = repo.remote(name='origin')
            origin.push(branch)
            logger.info(f"Pushed to {branch}")
            
            return True
            
        except Exception as e:
            logger.error(f"Commit/push failed: {e}")
            return False
    
    def read_file(self, repo_path, file_path):
        """Read a file from the repo"""
        full_path = Path(repo_path) / file_path
        
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading {file_path}: {e}")
            return None
    
    def write_file(self, repo_path, file_path, content):
        """Write content to a file in the repo"""
        full_path = Path(repo_path) / file_path
        
        try:
            # Create parent directories if needed
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logger.info(f"Wrote to: {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error writing {file_path}: {e}")
            return False


