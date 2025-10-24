# Idiot's Guide: Installing the Task Lifecycle Dashboard

## What You Need Before Starting

- A computer (Windows, Mac, or Linux)
- Internet connection
- About 30 minutes of your time

## Step 1: Install Python

### Windows Users:
1. Go to https://python.org/downloads
2. Click the big yellow "Download Python" button
3. Run the downloaded file
4. **IMPORTANT**: Check the box that says "Add Python to PATH"
5. Click "Install Now"
6. Wait for it to finish

### Mac Users:
1. Open Terminal (press Cmd+Space, type "terminal", press Enter)
2. Install Homebrew first by pasting this command:
   ```
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
3. Then install Python:
   ```
   brew install python
   ```

### Linux Users:
Open terminal and run:
```
sudo apt update
sudo apt install python3 python3-pip
```

## Step 2: Download the Dashboard

### Option A: Using Git (Recommended)
1. Open Terminal/Command Prompt
2. Navigate to where you want the project:
   ```
   cd Desktop
   ```
3. Download the project:
   ```
   git clone https://github.com/yourusername/task-lifecycle-dashboard.git
   cd task-lifecycle-dashboard
   ```

### Option B: Download ZIP
1. Go to the GitHub page
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to your Desktop
5. Open Terminal/Command Prompt and navigate to the folder

## Step 3: Set Up the Environment

1. Create a virtual environment (this keeps things clean):
   ```
   python -m venv venv
   ```

2. Activate it:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

3. You should see `(venv)` at the start of your command line now

## Step 4: Install Required Packages

Run this command:
```
pip install -r requirements.txt
```

Wait for it to finish downloading and installing everything.

## Step 5: Set Up the Database

1. Create the database:
   ```
   python manage.py migrate
   ```

2. Create an admin user:
   ```
   python manage.py createsuperuser
   ```
   - Enter a username (like "admin")
   - Enter your email
   - Create a password (you'll need this later)

## Step 6: Start the Dashboard

Run this command:
```
python manage.py runserver
```

You should see something like:
```
Starting development server at http://127.0.0.1:8000/
```

## Step 7: Open the Dashboard

1. Open your web browser
2. Go to: http://127.0.0.1:8000
3. You should see the Task Lifecycle Dashboard!

## Step 8: Access Admin Panel (Optional)

1. Go to: http://127.0.0.1:8000/admin
2. Login with the username/password you created in Step 5
3. Here you can manage users, tasks, and settings

## Troubleshooting

### "Python not found" error:
- Make sure you checked "Add Python to PATH" during installation
- Try using `python3` instead of `python`

### "Permission denied" error:
- On Mac/Linux, try adding `sudo` before commands
- On Windows, run Command Prompt as Administrator

### Port 8000 already in use:
- Try a different port: `python manage.py runserver 8001`
- Then go to http://127.0.0.1:8001

### Can't access from other computers:
- Run: `python manage.py runserver 0.0.0.0:8000`
- Others can access via your IP address: http://YOUR-IP:8000

## Daily Usage

### Starting the Dashboard:
1. Open Terminal/Command Prompt
2. Navigate to project folder: `cd path/to/task-lifecycle-dashboard`
3. Activate environment: `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows)
4. Start server: `python manage.py runserver`
5. Open browser to http://127.0.0.1:8000

### Stopping the Dashboard:
- Press `Ctrl+C` in the terminal where the server is running

## Getting Help

- Check the logs in the terminal for error messages
- Look at the `docs/troubleshooting.md` file
- Create an issue on GitHub if you're stuck
- Make sure your internet connection is working

## What's Next?

- Read `docs/user-guide.md` to learn how to use the dashboard
- Check `docs/configuration.md` to customize settings
- See `docs/api.md` if you want to integrate with other tools