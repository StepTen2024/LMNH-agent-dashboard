# 🚴‍♂️ LMNH Floating Logo - Interactive Easter Egg

## What It Does

An animated, interactive floating logo that moves around your dashboard and **runs away when you try to catch it!**

## Features

### 🎮 Interactive Behavior
- **Mouse Detection**: Detects your cursor within 150px radius
- **Escape Mode**: Runs away at 8x speed when you get too close
- **Can't Catch Me**: The closer you get, the faster it runs!

### 🎨 Visual Effects
- **Animated Glow**: Pulsing neon green gradient (#00ff88)
- **Rotating Circle**: Outer ring spins continuously (8s rotation)
- **Size Changes**: Shrinks when scared (scale-90), grows on hover
- **Speed Lines**: Appear when in escape mode
- **Scared Emoji**: 😱 pops up when you get too close
- **Random Thoughts**: "Can't catch me! 🏃‍♂️" bubble appears occasionally

### 🌊 Movement Physics
- **Gentle Floating**: Smooth, organic movement when idle
- **Wall Bouncing**: Bounces off screen edges
- **Random Direction**: Changes direction naturally
- **Panic Mode**: Fast directional escape from cursor

### 🎯 Technical Details

**Component**: `/dashboard/components/FloatingLogo.tsx`

**Key Parameters**:
- Detection Radius: 150px
- Escape Speed: 8 units/frame
- Normal Speed: 1 unit/frame
- Frame Rate: ~60fps (16ms interval)
- Logo Size: 120x120px

**Animation Features**:
- CSS transforms for smooth movement
- RequestAnimationFrame-style interval
- Real-time mouse tracking
- Dynamic velocity calculations
- Collision detection with screen bounds

## How to Use

1. **Open Dashboard**: Navigate to http://localhost:4002
2. **Look for the Logo**: You'll see a glowing bicycle emoji floating around
3. **Try to Catch It**: Move your mouse towards it
4. **Watch It Run**: It'll dodge and run away from your cursor!
5. **Have Fun**: Try to corner it against the screen edges

## User Experience

The logo is:
- ✅ **Non-intrusive**: Doesn't block important content
- ✅ **Playful**: Adds personality to the dashboard
- ✅ **Performance-friendly**: Smooth 60fps animation
- ✅ **Responsive**: Works on any screen size
- ✅ **Easter Egg**: Delightful surprise for users

## Code Structure

```typescript
// Mouse tracking
useEffect(() => {
  // Track mouse position globally
  window.addEventListener('mousemove', handleMouseMove);
});

// Animation loop
useEffect(() => {
  const animate = () => {
    // Calculate distance to mouse
    // Run away if too close
    // Otherwise, gentle floating
    // Bounce off walls
  };
  
  setInterval(animate, 16); // 60fps
});
```

## Customization

Want to change the behavior? Edit these values in `FloatingLogo.tsx`:

```typescript
const detectionRadius = 150;  // How far away triggers escape
const escapeSpeed = 8;        // How fast it runs
const normalSpeed = 1;        // Floating speed
const logoSize = 120;         // Size of the logo
```

## Future Enhancements

Potential additions:
- [ ] Multiple logos that coordinate
- [ ] Click to trigger special animation
- [ ] Sound effects when escaping
- [ ] Achievement: "You caught LMNH!"
- [ ] Different moods based on agent status
- [ ] Trail effect as it moves

## Fun Facts

- The logo uses the same neon green (#00ff88) as the rest of the dashboard
- It runs away in the exact opposite direction from your cursor
- You can try to corner it against the edges, but it will bounce!
- The scared emoji only appears when you're within the detection radius
- It has a 2% chance per frame to show a random thought bubble when idle

## Try These Challenges

1. **The Corner Trap**: Try to trap it in a corner
2. **The Chase**: Follow it around the screen
3. **The Surprise**: Quickly move your mouse towards it
4. **The Patience Game**: Let it float naturally and observe the pattern
5. **The Speed Test**: See how fast you can make it move

---

**LOOK MUM NO HANDS!** 🚴‍♂️

Built with React, TypeScript, and way too much caffeine.

