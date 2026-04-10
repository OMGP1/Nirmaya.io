#!/bin/bash
set -e

# Make sure we're in the right directory
cd "/Users/om/Projects/NeoFuture/Nirmaya io"

# Initialize git tracking
git init

# Change branch to main
git branch -M main || true # Ignore error if no commits exist yet

# Start 2 hours and 30 minutes ago
START_TIME=$(date -v-150M +%s)
INTERVAL=900 # 15 minutes = 900 seconds
commit_count=0

commit() {
    local msg="$1"
    if git diff --cached --quiet; then
        echo "Skipping (no changes): $msg"
    else
        local c_time=$((START_TIME + commit_count * INTERVAL))
        local formatted_time=$(date -r $c_time "+%Y-%m-%dT%H:%M:%S%z")
        GIT_AUTHOR_DATE="$formatted_time" GIT_COMMITTER_DATE="$formatted_time" git commit -q -m "$msg"
        echo "Committed: $msg ($formatted_time)"
        commit_count=$((commit_count + 1))
    fi
}

echo "Beginning backdated commit process..."

git add README.md .gitignore *.md docs/ 2>/dev/null || true
commit "docs: Project Initial Specs & Docs"

git add client/package.json client/package-lock.json client/vite.config.js client/tailwind.config.js client/postcss.config.js 2>/dev/null || true
commit "build(client): Frontend Configuration"

git add client/src/components/ client/src/ui/ 2>/dev/null || true
commit "feat(client): Component Library"

git add client/ 2>/dev/null || true
commit "feat(client): Pages & Routing"

git add server/package.json server/package-lock.json server/server.js server/.env.example server/migration.sql 2>/dev/null || true
commit "build(server): Server Initialization"

git add server/ 2>/dev/null || true
commit "feat(server): Database & APIs"

git add ml-service/ 2>/dev/null || true
commit "feat(ml): Machine Learning Python Service"

git add e2e/ tests/ playwright.config.js 2>/dev/null || true
commit "test: Automated Testing Configurations"

git add .
commit "chore: Remaining Deployment Configs and Integrations"

# Ensure branch is main (in case initial init branch was master)
git branch -M main

# Add the user's origin
git remote add origin https://github.com/OMGP1/Nirmaya.io.git 2>/dev/null || true
git remote set-url origin https://github.com/OMGP1/Nirmaya.io.git

echo ""
echo "Commit history generated successfully!"

# Push to the repository
echo "Pushing to remote origin..."
git push -u origin main

echo "Done!"
