# Contributing to Task Lifecycle Dashboard

## The Idiot's Guide to Contributing

This guide assumes you know nothing about this project and will walk you through everything step by step.

## What is This Project?

The Task Lifecycle Dashboard is a web application that helps teams track tasks from creation to completion. Think of it like a digital kanban board with extra features for monitoring task health and progress.

## Getting Started (For Complete Beginners)

### What You Need Before Starting

1. **Git** - Version control software
   - Windows: Download from https://git-scm.com/
   - Mac: Install via Homebrew `brew install git` or download from website
   - Linux: `sudo apt install git` or `sudo yum install git`

2. **Node.js and npm** - JavaScript runtime and package manager
   - Download from https://nodejs.org/ (get the LTS version)
   - This installs both Node.js and npm together

3. **A Code Editor**
   - VS Code (recommended): https://code.visualstudio.com/
   - Or any text editor you prefer

4. **A GitHub Account**
   - Sign up at https://github.com/ if you don't have one

### Step 1: Get the Code on Your Computer

1. **Fork the repository** (make your own copy)
   - Go to the project's GitHub page
   - Click the "Fork" button in the top right
   - This creates a copy under your GitHub account

2. **Clone your fork** (download it to your computer)
   ```bash
   git clone https://github.com/YOUR-USERNAME/task-lifecycle-dashboard.git
   cd task-lifecycle-dashboard
   ```
   Replace `YOUR-USERNAME` with your actual GitHub username

### Step 2: Set Up the Project

1. **Install dependencies** (download all the required packages)
   ```bash
   npm install
   ```
   This might take a few minutes the first time

2. **Start the development server**
   ```bash
   npm run dev
   ```
   The application should now be running at http://localhost:3000

3. **Verify it works**
   - Open your web browser
   - Go to http://localhost:3000
   - You should see the Task Lifecycle Dashboard

## How to Make Changes

### The Basic Workflow (Do This Every Time)

1. **Create a new branch** for your changes
   ```bash
   git checkout -b my-feature-name
   ```
   Replace `my-feature-name` with something descriptive like `fix-login-bug` or `add-dark-mode`

2. **Make your changes** using your code editor

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   ```

4. **Save your changes** to git
   ```bash
   git add .
   git commit -m "Brief description of what you changed"
   ```

5. **Push your changes** to GitHub
   ```bash
   git push origin my-feature-name
   ```

6. **Create a Pull Request**
   - Go to your fork on GitHub
   - Click "Compare & pull request"
   - Fill out the template
   - Click "Create pull request"

### What Files Do What

```
task-lifecycle-dashboard/
├── src/                    # Main application code
│   ├── components/         # Reusable UI pieces
│   ├── pages/             # Different screens/views
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Helper functions
│   └── styles/            # CSS and styling
├── public/                # Static files (images, etc.)
├── tests/                 # Test files
├── docs/                  # Documentation
├── package.json           # Project dependencies and scripts
└── README.md              # Basic project info
```

## Types of Contributions We Need

### 🐛 Bug Fixes
- **What**: Something isn't working correctly
- **Example**: Login button doesn't respond to clicks
- **How to find**: Check GitHub Issues labeled "bug"

### ✨ New Features
- **What**: Adding new functionality
- **Example**: Dark mode, export to PDF, email notifications
- **How to find**: Check GitHub Issues labeled "enhancement"

### 📚 Documentation
- **What**: Improving explanations and guides
- **Example**: Adding code comments, updating README
- **Perfect for beginners!**

### 🧪 Testing
- **What**: Writing tests to prevent bugs
- **Example**: Testing that forms validate correctly
- **How**: Add files in the `tests/` directory

### 🎨 UI/UX Improvements
- **What**: Making the app look and feel better
- **Example**: Better colors, improved layout, accessibility

## Coding Standards (The Rules)

### Code Style
- Use 2 spaces for indentation (not tabs)
- Use semicolons at the end of statements
- Use single quotes for strings: `'hello'` not `"hello"`
- Name variables clearly: `userEmail` not `ue`

### Git Commit Messages
Write clear commit messages:
- ✅ Good: `"Fix login validation for empty emails"`
- ❌ Bad: `"fixed stuff"`

### React Component Guidelines
- Use functional components with hooks
- Keep components small (under 200 lines if possible)
- Put components in their own files
- Use descriptive names: `TaskCard.jsx` not `Card.jsx`

## Testing Your Changes

### Before Submitting
Always run these commands:

```bash
# Check for code style issues
npm run lint

# Run automated tests
npm test

# Build the project to catch errors
npm run build

# Test in your browser
npm run dev
```

### Manual Testing Checklist
- [ ] Does the app still start without errors?
- [ ] Do existing features still work?
- [ ] Does your new feature work as expected?
- [ ] Does it work on mobile screens?
- [ ] Are there any console errors?

## Getting Help

### If You're Stuck
1. **Check existing issues** - Someone might have had the same problem
2. **Read the error message** - It usually tells you what's wrong
3. **Ask for help** - Create a GitHub issue with the "question" label
4. **Join our discussions** - Use GitHub Discussions for general questions

### Common Problems and Solutions

**Problem**: `npm install` fails
**Solution**: Delete `node_modules` folder and `package-lock.json`, then run `npm install` again

**Problem**: Port 3000 already in use
**Solution**: Kill other processes using port 3000, or use `npm run dev -- --port 3001`

**Problem**: Git says "permission denied"
**Solution**: Make sure you're pushing to your fork, not the original repository

**Problem**: Tests are failing
**Solution**: Run `npm test` to see what's failing, fix the issues, then run again

## Pull Request Process

### Before You Submit
- [ ] Your code follows the style guide
- [ ] All tests pass
- [ ] You've tested manually in a browser
- [ ] Your branch is up to date with main
- [ ] You've written a clear description

### Pull Request Template
When creating a PR, include:

```
## What does this PR do?
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Other (explain)

## How to Test
Step-by-step instructions for reviewers

## Screenshots
If UI changes, include before/after images

## Additional Notes
Anything else reviewers should know
```

### Review Process
1. **Automated checks** run first (tests, linting)
2. **Code review** by maintainers
3. **Feedback** - you might need to make changes
4. **Approval** - once everything looks good
5. **Merge** - your code becomes part of the project!

## Development Environment Setup

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer

### Useful npm Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code style
npm run lint:fix     # Fix code style issues automatically
npm run storybook    # View component library
```

## Project Structure Deep Dive

### Component Organization
```
src/components/
├── ui/                    # Basic UI elements (buttons, inputs)
├── forms/                 # Form-specific components
├── charts/                # Data visualization components
├── layout/                # Page layout components
└── features/              # Feature-specific components
    ├── tasks/
    ├── dashboard/
    └── reports/
```

### State Management
- We use React hooks (useState, useEffect) for local state
- Context API for shared state
- Local storage for persistence

### Styling Approach
- Tailwind CSS for utility classes
- CSS Modules for component-specific styles
- Responsive design (mobile-first)

## Security Guidelines

### What NOT to Commit
- API keys or secrets
- Personal information
- Large files (over 100MB)
- node_modules directory
- .env files with real credentials

### Safe Practices
- Use environment variables for configuration
- Sanitize user input
- Keep dependencies updated
- Don't hardcode sensitive data

## Performance Considerations

### Code Splitting
- Use dynamic imports for large components
- Lazy load routes that aren't immediately needed

### Optimization
- Optimize images before adding them
- Use React.memo for expensive components
- Avoid unnecessary re-renders

## Accessibility Requirements

### Must-Haves
- All interactive elements must be keyboard accessible
- Images need alt text
- Form inputs need labels
- Proper heading hierarchy (h1, h2, h3...)
- Color contrast ratio of at least 4.5:1

### Testing Accessibility
- Use browser dev tools accessibility checker
- Test with keyboard-only navigation
- Test with screen reader if possible

## Release Process

### Version Numbers
We use Semantic Versioning (semver):
- **1.0.0** - Major version (breaking changes)
- **1.1.0** - Minor version (new features)
- **1.1.1** - Patch version (bug fixes)

### Release Schedule
- **Patch releases** - As needed for critical bugs
- **Minor releases** - Monthly
- **Major releases** - When we have significant changes

## Community Guidelines

### Be Respectful
- Use inclusive language
- Be patient with newcomers
- Provide constructive feedback
- Assume good intentions

### Communication
- Use clear, specific language in issues
- Provide context for your requests
- Be responsive to feedback
- Say thank you!

## FAQ

### Q: I'm new to programming. Can I still contribute?
A: Absolutely! Start with documentation, testing, or small bug fixes.

### Q: How long does it take to get a PR reviewed?
A: Usually within a week, but it depends on complexity and maintainer availability.

### Q: Can I work on any open issue?
A: Check if someone is already assigned. If not, comment that you'd like to work on it.

### Q: What if I break something?
A: Don't worry! That's what testing and code review are for. We can always fix it.

### Q: Do I need to know React to contribute?
A: For code contributions, yes. But you can also help with documentation, design, or testing.

### Q: How do I know what needs to be done?
A: Check GitHub Issues, especially those labeled "good first issue" or "help wanted".

## Recognition

### Contributors
All contributors are listed in our README and get a shoutout in release notes.

### Becoming a Maintainer
Active contributors may be invited to become maintainers with additional privileges.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

## Quick Reference Card

### Essential Commands
```bash
# Setup
git clone [your-fork-url]
npm install
npm run dev

# Daily workflow
git checkout -b feature-name
# make changes
npm test
npm run lint
git add .
git commit -m "description"
git push origin feature-name

# Keeping updated
git checkout main
git pull upstream main
git push origin main
```

### Need Help?
- 📖 Documentation: Check /docs folder
- 🐛 Bug reports: GitHub Issues
- 💬 Questions: GitHub Discussions
- 📧 Security issues: Email maintainers directly

Remember: Everyone was a beginner once. Don't be afraid to ask questions or make mistakes - that's how we learn!