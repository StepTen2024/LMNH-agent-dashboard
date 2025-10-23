# 🎨 Chat Message Formatting System

## Overview
LMNH's chat now has **SICK** styling with animations and special formatting! 🔥

## Formatting Syntax

### 1. **Actions** (Animated! ✨)
Use single asterisks `*like this*` for actions:

```
*revs up virtual engines*
*flexes non-existent muscles*
*strikes a superhero pose*
```

**Result:** 
- ✨ Surrounded by sparkles
- Neon green color (#00ff88)
- Pulsing animation
- Italic text

### 2. **Bold Text**
Use double asterisks `**like this**` for emphasis:

```
This is **AMAZING!**
I'm **THIS** good!
**EPIC!**
```

**Result:**
- Bold white text
- Stands out in messages

### 3. **Code** 
Use backticks `` `like this` `` for code/technical terms:

```
Working on `masterpiece.tsx`
Using `git push`
Running `npm install`
```

**Result:**
- Monospace font
- Dark background
- Neon green text
- Bordered box

### 4. **Special Catchphrase**
The phrase "LOOK MUM NO HANDS!" gets special treatment:

```
LOOK MUM NO HANDS! 🚴‍♂️
```

**Result:**
- Neon green background with opacity
- Border with neon green
- Bouncing animation!
- Shadow glow effect
- Rounded corners

## Examples in Use

### Example 1: Excited Response
```
LOOK MUM NO HANDS! *typing furiously* This code is **BEAUTIFUL!**
```

Renders as:
- "LOOK MUM NO HANDS!" - bouncing green badge
- "*typing furiously*" - ✨ pulsing italic green ✨
- "**BEAUTIFUL!**" - bold white

### Example 2: Technical Response
```
I'm working on `api_server.py` right now! *cracks knuckles that don't exist*
```

Renders as:
- "`api_server.py`" - code box with green text
- "*cracks knuckles that don't exist*" - ✨ animated action ✨

### Example 3: Full Personality
```
Hey! *waves enthusiastically* Ready to code some **EPIC** stuff? 

LOOK MUM NO HANDS! Let's use `React` and `TypeScript` to build something amazing! 

*revs up engines* 🚀
```

All formatted with animations and colors!

## How It Works

### Frontend (`ChatModal.tsx`)
```typescript
const formatMessageContent = (content: string) => {
  // Regex patterns for:
  // - **bold**
  // - *actions*
  // - `code`
  // - LOOK MUM NO HANDS!
  
  // Returns JSX with styled spans
}
```

### Backend (`api_server.py`)
Claude AI is instructed to use these patterns:

```python
context = """
- Uses actions in *asterisks* like *revs up engines*
- Uses **bold** for emphasis
- Uses `code` for technical terms
- Catchphrase: "LOOK MUM NO HANDS! 🚴‍♂️"
"""
```

## Styling Details

### Actions
```css
className="italic text-lmnh-green animate-pulse font-medium"
```
- Italic style
- Neon green (#00ff88)
- Continuous pulse animation
- Medium font weight
- Sparkles (✨) on both sides

### Bold
```css
className="font-bold text-white"
```
- Bold font
- White color for contrast

### Code
```css
className="bg-lmnh-dark border border-lmnh-green/50 px-2 py-0.5 rounded text-lmnh-green font-mono text-sm"
```
- Dark background
- Green border with opacity
- Monospace font
- Small padding
- Rounded corners

### Special Catchphrase
```css
className="inline-block font-bold text-lmnh-green animate-bounce bg-lmnh-green/20 px-2 py-1 rounded-lg border-2 border-lmnh-green shadow-lg shadow-lmnh-green/50"
```
- Bouncing animation!
- Green badge background
- Bold border
- Shadow glow
- Rounded large

## Usage

### For LMNH Responses
Just use the syntax naturally in responses:

```python
response = "Hey! *waves* I'm working on **important stuff** using `git` right now!"
```

### For Claude AI
The system prompt includes formatting instructions, so Claude automatically uses them!

## Result
✅ **Chat messages are now ALIVE!** 🎉  
✅ Actions are animated with sparkles ✨  
✅ Bold text stands out  
✅ Code looks professional  
✅ "LOOK MUM NO HANDS!" bounces! 🚴‍♂️  

---

**Built with ❤️ and absolutely NO HANDS!** 🚴‍♂️

Now with **STYLE!** ✨

