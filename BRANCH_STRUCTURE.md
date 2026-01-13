# 🌿 DashForge Git Branch Structure

## 📌 Active Branches (Currently In Use)

### Main Branches
- **`feature/v2`** ⭐ **YOUR PRIMARY WORKING BRANCH**
  - Latest commit: `719e2a6` - Refactor UDFFormRenderer for better state management
  - Status: ✅ Production-ready
  - Contains: All latest features, Redux implementation, form management, admin dashboard
  - Use this for: Daily development work
  - Merge to: `dev` when feature complete, then to `main` for release

- **`dev`** 📦 Development Base
  - Latest commit: `42c1e2e` - edit
  - Status: Stable development branch
  - Use this as: Base for creating new feature branches
  - Purpose: Integration point before `main`

- **`main`** 🔒 Stable Production
  - Latest commit: `909545c` - Initial stable version Backend Assign Complete Frontend left
  - Status: Production-ready, stable
  - Use this for: Deployments and releases only
  - Protection: Do not commit directly; merge from `dev` only

---

## 📚 Archive Branches (For Learning & Reference)

These branches represent different iterations and experiments. Keep them to learn from past decisions.

### Archive: User-Defined Forms (v1)
- **`archive/v1-user-defined-forms`**
  - Latest commit: `86e23bf` - new feature added UDF
  - What was attempted: First implementation of UDF (User-Defined Forms)
  - Status: Superseded by `feature/v2`
  - Learning: Compare with v2 to see improvements in form handling

### Archive: User Authentication (v1)
- **`archive/v1-user-authentication`**
  - Latest commit: `654ea5b` - Update .gitignore to exclude build
  - What was attempted: User authentication implementation
  - Status: Superseded by `feature/v2` Redux auth
  - Learning: See how authentication evolved

### Archive: Test Branch (v1)
- **`archive/v1-test-branch`**
  - Latest commit: `654ea5b` - Update .gitignore to exclude build
  - What was attempted: Testing/experimental work
  - Status: Abandoned
  - Learning: Early testing patterns

### Archive: Backup Before UDF
- **`archive/backup-dev-before-udf`**
  - Latest commit: `2cce4da` - Update LICENSE
  - What was attempted: Backup snapshot before UDF implementation
  - Status: Historical reference
  - Learning: See state of code before major UDF overhaul

### Archive: Forms Cleanup Attempt
- **`archive/forms-cleanup-attempt`**
  - Latest commit: `42c1e2e` - edit
  - What was attempted: Redux forms cleanup and debug log removal
  - Status: Experimental (Jan 13, 2026)
  - Learning: Debug removal and Redux optimization attempts

---

## 🔄 Recommended Workflow

```bash
# 1. Start new work from dev
git checkout dev
git pull origin dev

# 2. Create feature branch from dev
git checkout -b feature/your-feature-name

# 3. Make changes and commit
git add .
git commit -m "feat: your feature description"

# 4. Push to remote
git push origin feature/your-feature-name

# 5. When done, switch to feature/v2 (or merge feature → feature/v2)
git checkout feature/v2
git merge feature/your-feature-name

# 6. When feature/v2 is complete, merge to dev
git checkout dev
git merge feature/v2

# 7. When ready for production, merge dev → main
git checkout main
git merge dev
git push origin main
```

---

## 📊 Branch Comparison

| Branch | Commits | Purpose | Status |
|--------|---------|---------|--------|
| `feature/v2` | 719e2a6 | Latest working code | ✅ Active |
| `dev` | 42c1e2e | Development base | ✅ Active |
| `main` | 909545c | Production stable | ✅ Stable |
| `archive/v1-user-defined-forms` | 86e23bf | Old UDF attempt | 📚 Learning |
| `archive/v1-user-authentication` | 654ea5b | Old auth attempt | 📚 Learning |
| `archive/v1-test-branch` | 654ea5b | Testing | 📚 Learning |
| `archive/backup-dev-before-udf` | 2cce4da | Historical backup | 📚 Reference |
| `archive/forms-cleanup-attempt` | 42c1e2e | Cleanup experiment | 📚 Learning |

---

## 🎓 How to Learn from Archive Branches

### View differences between versions
```bash
# Compare current feature/v2 with old UDF v1
git diff archive/v1-user-defined-forms..feature/v2

# See commits made after v1 UDF was created
git log archive/v1-user-defined-forms..feature/v2 --oneline
```

### Checkout old branch to review
```bash
git checkout archive/v1-user-defined-forms
# Review the code...
# Go back to your working branch
git checkout feature/v2
```

### See what changed over time
```bash
# Show all commits across all branches
git log --all --graph --oneline --decorate
```

---

## ⚠️ Important Rules

1. **Never work directly on `main`** - Always merge from `dev`
2. **Keep `feature/v2` as your primary working branch**
3. **Archive branches are read-only** - Don't commit to them
4. **Before pushing**, test your code locally
5. **Create descriptive commit messages** - Makes learning easier

---

## 🚀 Quick Commands

```bash
# See all branches with descriptions
git branch -v

# See branch graph
git log --all --graph --oneline --decorate -20

# Switch to feature/v2 (your main branch)
git checkout feature/v2

# Create new feature from dev
git checkout dev
git checkout -b feature/new-feature-name

# Clean up local branches (keeps archive/ for learning)
git branch --merged dev | grep -v "feature/v2\|dev\|main\|archive" | xargs git branch -d
```

---

**Last Updated**: January 13, 2026
**Organized By**: Git Branch Cleanup
**Purpose**: Learning & Development Workflow
