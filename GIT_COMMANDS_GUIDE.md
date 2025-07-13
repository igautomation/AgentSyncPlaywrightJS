# Git Commands Reference Guide

## 🚀 Basic Git Operations

### Repository Setup
```bash
# Clone repository
git clone <repository-url>
cd <repository-name>

# Initialize new repository
git init
git remote add origin <repository-url>
```

### Configuration
```bash
# Set user information
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Check configuration
git config --list
```

## 📝 Daily Workflow Commands

### Status and Information
```bash
# Check repository status
git status

# View commit history
git log --oneline
git log --graph --oneline --all

# Show differences
git diff
git diff --staged
git diff HEAD~1
```

### Staging and Committing
```bash
# Add files to staging
git add .                    # Add all files
git add <filename>           # Add specific file
git add *.js                 # Add all JS files
git add src/                 # Add entire directory

# Commit changes
git commit -m "Your commit message"
git commit -am "Add and commit in one step"

# Amend last commit
git commit --amend -m "Updated commit message"
```

## 🌿 Branch Management

### Creating and Switching Branches
```bash
# List branches
git branch                   # Local branches
git branch -r               # Remote branches
git branch -a               # All branches

# Create new branch
git branch <branch-name>
git checkout -b <branch-name>    # Create and switch
git switch -c <branch-name>      # Modern syntax

# Switch branches
git checkout <branch-name>
git switch <branch-name>         # Modern syntax

# Delete branches
git branch -d <branch-name>      # Safe delete
git branch -D <branch-name>      # Force delete
git push origin --delete <branch-name>  # Delete remote branch
```

### Branch Operations
```bash
# Rename branch
git branch -m <old-name> <new-name>
git branch -m <new-name>         # Rename current branch

# Track remote branch
git branch --set-upstream-to=origin/<branch-name>
```

## 🔄 Merging and Rebasing

### Merging
```bash
# Merge branch into current branch
git merge <branch-name>

# Merge with no fast-forward
git merge --no-ff <branch-name>

# Abort merge
git merge --abort
```

### Rebasing
```bash
# Rebase current branch onto another
git rebase <branch-name>

# Interactive rebase
git rebase -i HEAD~3            # Last 3 commits
git rebase -i <commit-hash>

# Continue/abort rebase
git rebase --continue
git rebase --abort
```

## 🌐 Remote Operations

### Fetching and Pulling
```bash
# Fetch from remote
git fetch origin
git fetch --all

# Pull changes
git pull origin <branch-name>
git pull --rebase origin <branch-name>
```

### Pushing
```bash
# Push to remote
git push origin <branch-name>
git push -u origin <branch-name>    # Set upstream

# Force push (use carefully)
git push --force-with-lease origin <branch-name>
git push -f origin <branch-name>    # Dangerous!

# Push all branches
git push --all origin
```

## 🔧 Advanced Operations

### Stashing
```bash
# Stash changes
git stash
git stash push -m "Work in progress"

# List stashes
git stash list

# Apply stash
git stash pop                # Apply and remove
git stash apply             # Apply but keep
git stash apply stash@{2}   # Apply specific stash

# Drop stash
git stash drop stash@{1}
git stash clear             # Remove all stashes
```

### Reset and Revert
```bash
# Reset (use carefully)
git reset --soft HEAD~1     # Keep changes staged
git reset --mixed HEAD~1    # Keep changes unstaged
git reset --hard HEAD~1     # Discard changes

# Revert commits
git revert <commit-hash>
git revert HEAD~1
```

### Cherry-picking
```bash
# Apply specific commit to current branch
git cherry-pick <commit-hash>
git cherry-pick <commit1>..<commit2>
```

## 🏷️ Tags

### Creating and Managing Tags
```bash
# Create tag
git tag v1.0.0
git tag -a v1.0.0 -m "Version 1.0.0"

# List tags
git tag
git tag -l "v1.*"

# Push tags
git push origin v1.0.0
git push origin --tags

# Delete tags
git tag -d v1.0.0
git push origin --delete v1.0.0
```

## 🔍 Searching and Finding

### Search in Code
```bash
# Search in files
git grep "search-term"
git grep -n "search-term"      # Show line numbers
git grep -i "search-term"      # Case insensitive

# Search in commit messages
git log --grep="bug fix"
git log --oneline --grep="feature"
```

### Find Changes
```bash
# Show file history
git log --follow <filename>
git log -p <filename>          # Show patches

# Find when line was changed
git blame <filename>
git annotate <filename>

# Find commits that changed specific content
git log -S "function-name" --source --all
```

## 🛠️ Maintenance and Cleanup

### Repository Maintenance
```bash
# Clean untracked files
git clean -n                   # Dry run
git clean -f                   # Remove files
git clean -fd                  # Remove files and directories

# Garbage collection
git gc
git gc --aggressive

# Check repository integrity
git fsck
```

### Reflog (Recovery)
```bash
# View reflog
git reflog
git reflog show <branch-name>

# Recover lost commits
git checkout <commit-hash>
git branch recovery-branch <commit-hash>
```

## 🚨 Emergency Commands

### Undo Operations
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Undo merge
git reset --hard HEAD~1        # If merge was last commit
git reset --hard ORIG_HEAD     # After merge

# Restore file from specific commit
git checkout <commit-hash> -- <filename>
git restore --source=<commit-hash> <filename>
```

### Fix Common Issues
```bash
# Fix "detached HEAD"
git checkout <branch-name>
git switch <branch-name>

# Fix merge conflicts
git status                     # See conflicted files
# Edit files to resolve conflicts
git add <resolved-files>
git commit

# Cancel merge
git merge --abort
```

## 📊 Project-Specific Workflows

### Feature Development
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# Work on feature
git add .
git commit -m "Add new feature functionality"

# Finish feature
git checkout develop
git pull origin develop
git merge feature/new-feature
git push origin develop
git branch -d feature/new-feature
```

### Hotfix Workflow
```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# Apply fix
git add .
git commit -m "Fix critical issue"

# Deploy to both main and develop
git checkout main
git merge hotfix/critical-fix
git push origin main

git checkout develop
git merge hotfix/critical-fix
git push origin develop

git branch -d hotfix/critical-fix
```

### Release Workflow
```bash
# Prepare release
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Finalize release
git checkout main
git merge release/v1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

git checkout develop
git merge release/v1.2.0
git push origin develop

git branch -d release/v1.2.0
```

## 🔐 Security and Best Practices

### Secure Operations
```bash
# Sign commits
git config --global user.signingkey <key-id>
git config --global commit.gpgsign true
git commit -S -m "Signed commit"

# Verify signatures
git log --show-signature
git verify-commit <commit-hash>
```

### Best Practices
```bash
# Always pull before push
git pull origin <branch-name>
git push origin <branch-name>

# Use meaningful commit messages
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login validation issue"
git commit -m "docs: update API documentation"

# Check before committing
git status
git diff --staged
git commit -m "Your message"
```

## 🎯 Quick Reference

### Most Used Commands
```bash
git status                     # Check status
git add .                      # Stage all changes
git commit -m "message"        # Commit changes
git push origin <branch>       # Push to remote
git pull origin <branch>       # Pull from remote
git checkout -b <branch>       # Create and switch branch
git merge <branch>             # Merge branch
git log --oneline             # View commit history
```

### Emergency Commands
```bash
git stash                      # Save work temporarily
git reset --hard HEAD~1        # Undo last commit
git checkout -- <file>         # Discard file changes
git clean -fd                  # Remove untracked files
git reflog                     # View all operations
```

---

## 📚 Additional Resources

- **Git Documentation**: https://git-scm.com/docs
- **Interactive Git Tutorial**: https://learngitbranching.js.org/
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf
- **Conventional Commits**: https://www.conventionalcommits.org/

---

*This guide covers all essential Git operations for daily development work. Keep it handy for quick reference!*