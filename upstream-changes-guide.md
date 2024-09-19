# Guide: Applying Upstream Changes

This guide outlines the process for applying upstream changes from the original AstroPaper repository to your forked version.

## Initial Setup

1. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/satnaing/astro-paper.git
   ```

2. Fetch the upstream tags:
   ```bash
   git fetch upstream --tags
   ```

## Applying Changes (e.g., from v4.3.0 to v4.4.0)

1. Create and switch to a new branch:
   ```bash
   git switch -c upstream-4.4
   ```

2. Fetch the specific version tag:
   ```bash
   git fetch upstream tag v4.4.0
   ```

3. Apply changes from the new version:
   ```bash
   git checkout v4.4.0 -- .
   ```

## Reviewing and Committing Changes

1. Use GitHub Desktop to review changes:
   - Uncheck all changes initially
   - Selectively add changes you want to include

2. Commit the selected changes:
   ```bash
   git commit -m 'Apply upstream v4.4.0 changes'
   ```

3. Clean up any untracked files:
   ```bash
   git checkout .
   git clean -fd
   ```

4. Update dependencies and amend the commit:
   ```bash
   npm install
   git commit -a --amend -C HEAD
   ```

## Testing and Merging

1. Test the changes locally:
   ```bash
   npm run dev
   ```

2. If everything looks good, merge the changes:
   ```bash
   git switch main
   git merge --ff-only upstream-4.4
   git push
   ```

## Notes

- Always review changes carefully before committing.
- Test thoroughly before pushing to ensure compatibility with your customizations.
- This process helps maintain your fork while incorporating upstream improvements.
