from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
import logging
import time
import re

logger = logging.getLogger(__name__)

class SlackHandler:
    """Handles Slack communication"""
    
    def __init__(self, bot_token, agent_name):
        self.client = WebClient(token=bot_token)
        self.agent_name = agent_name
        self.bot_id = self._get_bot_id()
    
    def _get_bot_id(self):
        """Get the bot's user ID"""
        try:
            response = self.client.auth_test()
            return response['user_id']
        except SlackApiError as e:
            logger.error(f"Error getting bot ID: {e}")
            return None
    
    def send_message(self, channel, message, thread_ts=None):
        """Send a message to a channel"""
        try:
            response = self.client.chat_postMessage(
                channel=channel,
                text=f"🤖 *{self.agent_name}*: {message}",
                thread_ts=thread_ts
            )
            logger.info(f"Sent message to {channel}")
            return response['ts']  # Return timestamp for threading
            
        except SlackApiError as e:
            logger.error(f"Error sending message: {e}")
            return None
    
    def listen_for_mentions(self, channel, callback, poll_interval=5):
        """
        Poll for mentions of this bot
        
        callback: function(task_data) to call when mentioned
        """
        logger.info(f"Listening for mentions in #{channel}")
        
        last_checked = time.time()
        
        while True:
            try:
                # Get recent messages
                response = self.client.conversations_history(
                    channel=channel,
                    oldest=str(last_checked),
                    limit=10
                )
                
                for message in response['messages']:
                    # Check if bot is mentioned
                    text = message.get('text', '')
                    
                    if self.bot_id and f'<@{self.bot_id}>' in text:
                        # Extract task from message
                        task_data = self._parse_task(message)
                        
                        if task_data:
                            logger.info(f"Received task: {task_data.get('task', '')}")
                            # Call the callback function
                            callback(task_data, message['ts'])
                
                last_checked = time.time()
                time.sleep(poll_interval)
                
            except SlackApiError as e:
                logger.error(f"Error listening to Slack: {e}")
                time.sleep(poll_interval)
            except KeyboardInterrupt:
                logger.info("Stopped listening")
                break
    
    def _parse_task(self, message):
        """
        Parse a Slack message to extract task details
        
        Expected format:
        @AgentA task: Fix the login bug
        repo: https://github.com/user/repo
        file: auth.py
        """
        text = message.get('text', '')
        
        # Remove bot mention
        text = re.sub(r'<@\w+>', '', text).strip()
        
        task_data = {
            'task': '',
            'repo': '',
            'file': '',
            'branch': 'main',
            'raw_text': text
        }
        
        # Extract task
        task_match = re.search(r'task:\s*(.+?)(?:\n|$)', text, re.IGNORECASE)
        if task_match:
            task_data['task'] = task_match.group(1).strip()
        else:
            # If no "task:" label, use the whole message as task
            task_data['task'] = text
        
        # Extract repo URL
        repo_match = re.search(r'repo:\s*(.+?)(?:\n|$)', text, re.IGNORECASE)
        if repo_match:
            # Remove Slack's angle brackets around URLs
            repo_url = repo_match.group(1).strip()
            # Remove < and > characters that Slack adds
            task_data['repo'] = repo_url.replace('<', '').replace('>', '').strip()
        
        # Extract file
        file_match = re.search(r'file:\s*(.+?)(?:\n|$)', text, re.IGNORECASE)
        if file_match:
            task_data['file'] = file_match.group(1).strip()
        
        # Extract branch
        branch_match = re.search(r'branch:\s*(.+?)(?:\n|$)', text, re.IGNORECASE)
        if branch_match:
            task_data['branch'] = branch_match.group(1).strip()
        
        return task_data if task_data['task'] else None

