from pathlib import Path

# Configuration for uvicorn
log_level = "info"
reload = True

# Watch the app directory for changes
reload_dirs = ["app"]

# Exclude the virtual environment directory
reload_excludes = ["venv", ".git", "__pycache__", "*.pyc"]
