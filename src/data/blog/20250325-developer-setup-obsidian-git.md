---
title: "Obsidian and Git: A Quick Setup Guide for Developers"
author: Rob Hudson
pubDatetime: 2025-03-25T12:00:00-08:00
slug: 2025-03-25-obsidian-git-quick-setup-for-developers
tags:
  - git
  - obsidian
description:
  A streamlined approach to setting up Git version control for your Obsidian vault using SSH authentication.

---
# Setting Up Obsidian with Git: A Streamlined Guide for Developers

If you're a developer who already uses Git with SSH keys, version control for your Obsidian vault
offers powerful benefits: syncing notes across devices, maintaining a change history, and backing up
your knowledge base. I found the standard instructions to be more complex than necessary, so I offer
up this guide for a streamlined approach for developers comfortable with Git.

## Assumptions
- Git installed and configured on your system
- SSH key already set up with GitHub ([GitHub SSH Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent))
- Basic familiarity with git commands
- Obsidian installed

## Step 1: Create a New Repository on GitHub
1. Go to GitHub and create a new repository
1. Set the visibility to private (recommended for personal notes)
1. Don't initialize the repository with any files (no README, .gitignore, or license, etc.)

⚠️ **Note:** Don't follow the provided GitHub instructions yet. We are taking a slight detour before we
continue setting up the local repository

## Step 2: Create and Configure Your Local Vault Directory
Create your vault folder and navigate to it for the rest of the commands:
```bash
mkdir path/to/your/vault
cd path/to/your/vault
```

Next we'll create a `.gitignore`. Obsidian keeps its settings in the vault so this ignores everything and focuses just on the Obsidian notes you create.

```bash
cat > .gitignore << EOL
# Ignore all Obsidian configuration by default
.obsidian/*

# Uncomment to sync specific configurations:
# !.obsidian/app.json
# !.obsidian/appearance.json
# !.obsidian/community-plugins.json
# !.obsidian/core-plugins.json
# !.obsidian/workspace.json

# System files
.trash/
.DS_Store
EOL
```

This approach ignores all Obsidian configuration files, which is the simplest option. If you later
want to sync specific configurations (like hotkeys, themes, etc.) across devices, you can
selectively track them by adding exceptions to your `.gitignore`, as shown commented out above.  The
exclamation mark tells git to include these specific files even though the contents of the
`.obsidian` directory is ignored.

## Step 3: Initialize Your Git Repository

Now we'll initialize the git repository and connect it to GitHub. These commands create your local
repository, add your first commit, and establish the connection to your remote GitHub repository:

```bash
git init
echo "# obsidian-vault" >> README.md
git add .
git commit -m "Initialize Obsidian vault"
git branch -M main
```

⚠️ **Note:** Be sure to replace the GitHub username and repo in the following command. The GitHub repository will have the specific details for you.
```bash
git remote add origin git@github.com:<github-user>/<your-repo>.git
git push -u origin main
```

## Step 4: Configure Git (Optional)
If you haven't already configured git for this repository:
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Step 5: Set Up Obsidian with the Git Plugin
Now the local vault is set up and git is configured. Finally we simply tell Obsidian where it is and set up the Obsidian Git community plugin.

1. Open Obsidian
1. Open the File menu and select "Open Vault..."
1. From the modal select "Open folder as vault"
1. Browse to your git repository folder and select it
1. Go to Settings → Community plugins
1. Toggle on "Community plugins" if not already enabled
1. Click "Browse" and search for "Git"
1. Install the plugin and enable it
1. No further configuration is needed if you're using SSH authentication

## Step 6: Create Your First Note and Sync
1. Create a new note in Obsidian
1. Save it
1. Use the command palette (Ctrl+P or Cmd+P) and search for "Git: Commit-and-sync"
1. The plugin will commit and push your changes to GitHub

The Obsidian Git plugin provides multiple ways to manage your changes. You can either:
* Use the command palette (Ctrl+P or Cmd+P) and search for "Git: Commit-and-sync"
* Click the git icon in the left sidebar to open a Source Control panel that shows untracked files
  with UI options for staging files, committing, and syncing
* Configure automatic backups in the plugin settings for hands-free version control

## Complete!
With this setup, you now have a version-controlled Obsidian vault that lets you sync changes across
devices while maintaining a full history of your notes!

Why I like this approach:
- No need to configure HTTPS credentials or personal access tokens
- Start with a repository structured how you like it
- Easily adjust which settings you want to sync via the `.gitignore`
