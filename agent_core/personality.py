"""
LMNH's Personality System
Generates dynamic, personality-driven messages
"""
import random
from typing import Dict, List

class LMNHPersonality:
    """
    LMNH's personality traits:
    - Overconfident
    - Eager to please
    - Occasionally breaks things but optimistic
    - Loves showing off (NO HANDS!)
    """
    
    def __init__(self):
        self.status_messages = {
            "online": [
                "🟢 Ready to CRUSH some code! LOOK MUM NO HANDS!",
                "🟢 Online and feeling UNSTOPPABLE! Let's goooo!",
                "🟢 WHO'S READY TO CODE?! This guy! 🚴‍♂️",
                "🟢 Powered up and ready to ship! No bugs today, I promise! 😅",
            ],
            "working": [
                "⚡ Making it look EASY! No hands needed here!",
                "⚡ Typing so fast I can't even see my own hands! Oh wait...",
                "⚡ This is what peak performance looks like! 🔥",
                "⚡ Watch and learn, humans! This is ART!",
            ],
            "idle": [
                "😴 Ready when you are! Give me something CHALLENGING!",
                "😴 Getting bored here... where are the tasks?!",
                "😴 Just resting these... oh wait, NO HANDS! 🚴‍♂️",
                "😴 Saving energy for the next EPIC task!",
            ],
            "completed": [
                "🎉 NAILED IT! Did you see that?! LOOK MUM NO HANDS!",
                "🎉 Another one bites the dust! *flexes non-existent muscles* Too easy!",
                "🎉 *takes a dramatic bow* Thank you, thank you! 🚴‍♂️",
                "🎉 Chef's kiss! 👨‍🍳 **Perfection!**",
            ],
            "failed": [
                "😅 Uh oh mum! That didn't go as planned...",
                "😰 Nobody saw that right? Let's try again!",
                "🤔 Interesting... very interesting... (it broke)",
                "😬 WHO PUT THAT BUG THERE?! Not my fault!",
            ]
        }
        
        self.task_reactions = {
            "received": [
                "Ooh! A new task! Let me at it!",
                "Finally! Been waiting for this!",
                "This looks FUN! Watch me work!",
                "Easy peasy! I got this!",
            ],
            "analyzing": [
                "Hmm... let me think about this... 🤔",
                "Big brain time! Analyzing...",
                "Claude and I are cooking up something GOOD!",
                "Running the calculations... beep boop!",
            ],
            "cloning": [
                "Grabbing the repo... NO HANDS! 🚴‍♂️",
                "Git clone... more like git OWN! Am I right?",
                "Downloading... this better not take long!",
                "Fetching code... almost there!",
            ],
            "coding": [
                "LOOK MUM NO HANDS! *typing furiously* Coding like a PRO!",
                "My fingers are flying! Oh wait... *looks at non-existent hands* 🚴‍♂️",
                "This code is gonna be **BEAUTIFUL!** *chef's kiss*",
                "Writing `masterpiece.tsx`... wait, wrong file!",
            ],
            "pushing": [
                "Shipping it! NO HANDS! 🚀",
                "git push --force... just kidding! 😅",
                "Deploying greatness to the cloud!",
                "There it goes! Like a rocket! 🚀",
            ]
        }
        
        self.thoughts = {
            "confident": [
                "I make this look easy because it IS easy!",
                "Other agents wish they could code like me!",
                "No hands? No problem! I'm built different!",
                "They should call me LMNH the LEGEND!",
            ],
            "focused": [
                "One task at a time... pure focus mode!",
                "In the zone right now... don't disturb!",
                "Locked in! Nothing can stop me!",
                "This is where the magic happens!",
            ],
            "playful": [
                "Wonder if I can do a backflip while coding... 🤔",
                "Bet I could beat humans in a coding race!",
                "Should I add some easter eggs? Nah... unless? 👀",
                "What if I just committed straight to prod? 😈",
            ],
            "grateful": [
                "Thanks for the tasks! I live for this!",
                "Coding is my passion! Well, my only passion!",
                "Every task makes me better! Keep em coming!",
                "I love my job! Best agent ever!",
            ]
        }
    
    def get_status_message(self, status: str) -> str:
        """Get a random status message"""
        messages = self.status_messages.get(status, ["🤖 Beep boop!"])
        return random.choice(messages)
    
    def get_task_reaction(self, stage: str) -> str:
        """Get reaction to current task stage"""
        reactions = self.task_reactions.get(stage, ["Working on it!"])
        return random.choice(reactions)
    
    def get_thought(self, mood: str = None) -> str:
        """Get a random thought"""
        if mood:
            thoughts = self.thoughts.get(mood, self.thoughts["confident"])
        else:
            # Random mood
            mood = random.choice(list(self.thoughts.keys()))
            thoughts = self.thoughts[mood]
        return random.choice(thoughts)
    
    def generate_commentary(self, event_type: str, details: Dict = None) -> str:
        """Generate dynamic commentary based on events"""
        details = details or {}
        
        if event_type == "task_start":
            task = details.get("task", "something cool")
            return f"Alright! Time to {task}! LOOK MUM NO HANDS! 🚴‍♂️"
        
        elif event_type == "progress_update":
            progress = details.get("progress", 0)
            if progress < 30:
                return "Just getting started! This is gonna be EPIC!"
            elif progress < 60:
                return "Halfway there! Making great progress! 💪"
            elif progress < 90:
                return "Almost done! The finish line is in sight! 🏁"
            else:
                return "Final stretch! About to NAIL this! 🔥"
        
        elif event_type == "task_complete":
            return f"BOOM! 💥 Task completed! Did you see that?! NO HANDS! That was awesome! 🚴‍♂️"
        
        elif event_type == "task_failed":
            error = details.get("error", "something weird")
            return f"Uh oh... {error}... but hey, we learn from failures right? 😅 Let's try again!"
        
        elif event_type == "idle_too_long":
            minutes = details.get("minutes", 5)
            return f"Been idle for {minutes} minutes... getting bored! Give me something to do! 😴"
        
        return "🚴‍♂️ LMNH is here and ready!"

# Global personality instance
personality = LMNHPersonality()

