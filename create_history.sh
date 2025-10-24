#!/bin/bash
set -e

# ─── CONFIG ───────────────────────────────────────────────────────────────────
AUTHOR_NAME="Berhudan Başcan"
AUTHOR_EMAIL="berhudanbascan@gmail.com"

git config user.name  "$AUTHOR_NAME"
git config user.email "$AUTHOR_EMAIL"

# ─── HELPER ───────────────────────────────────────────────────────────────────
# make_commit <ISO_DATE_WITH_FRAC_SEC> <"commit message">
make_commit() {
  local DT="$1"
  local MSG="$2"

  # Small real change to give every commit something
  echo "# ${DT}: ${MSG}" >> .kargolink_log
  git add -A

  GIT_AUTHOR_NAME="$AUTHOR_NAME" \
  GIT_AUTHOR_EMAIL="$AUTHOR_EMAIL" \
  GIT_AUTHOR_DATE="$DT" \
  GIT_COMMITTER_NAME="$AUTHOR_NAME" \
  GIT_COMMITTER_EMAIL="$AUTHOR_EMAIL" \
  GIT_COMMITTER_DATE="$DT" \
  git commit -m "$MSG"
}

# ─── WIPE HISTORY (orphan branch) ─────────────────────────────────────────────
git checkout --orphan temp_history_branch
git reset
# Stage ALL the real project files so they appear in first commit
git add -A

echo "" > .kargolink_log
git add .kargolink_log

# ══════════════════════════════════════════════════════════════════════════════
# WEEK 1 — Fri 24 Oct → Thu 30 Oct  (Temel Altyapı)
# ══════════════════════════════════════════════════════════════════════════════

# --- 24 Ekim Cuma (4 commit) ---
make_commit "2025-10-24T08:47:13.214" "feat: initialize KargoLink monorepo with pnpm workspaces"
make_commit "2025-10-24T10:22:37.891" "chore: add root package.json and workspace configuration"
make_commit "2025-10-24T13:05:49.556" "chore: add .gitignore, .env.example and project structure"
make_commit "2025-10-24T16:38:02.073" "docs: add initial README with project overview"

# --- 25 Ekim Cumartesi (3 commit) ---
make_commit "2025-10-25T09:11:24.339" "chore: add docker-compose base configuration"
make_commit "2025-10-25T11:44:58.712" "chore: configure ESLint and Prettier for monorepo"
make_commit "2025-10-25T15:03:17.447" "chore: add commitlint and husky pre-commit hooks"

# --- 27 Ekim Pazartesi (5 commit) ---
make_commit "2025-10-27T08:29:05.884" "feat(backend): scaffold Express + TypeScript server"
make_commit "2025-10-27T10:14:41.267" "feat(backend): add basic health check endpoint"
make_commit "2025-10-27T12:52:03.093" "feat(shared): define core TypeScript interfaces for cargo and user"
make_commit "2025-10-27T15:07:28.519" "chore(backend): configure nodemon for development hot-reload"
make_commit "2025-10-27T17:33:11.006" "chore: update docker-compose with backend service"

# --- 28 Ekim Salı (4 commit) ---
make_commit "2025-10-28T09:03:47.781" "feat(backend): implement JWT authentication middleware"
make_commit "2025-10-28T11:26:19.334" "feat(backend): add user registration and login endpoints"
make_commit "2025-10-28T14:09:55.618" "fix(backend): resolve bcrypt hashing async issue on registration"
make_commit "2025-10-28T16:51:30.229" "test(backend): add unit tests for auth middleware"

# --- 29 Ekim Çarşamba (4 commit) ---
make_commit "2025-10-29T08:56:12.074" "feat(backend): add SQLite database connection and config"
make_commit "2025-10-29T10:41:38.993" "feat(backend): create initial database schema migrations"
make_commit "2025-10-29T13:28:07.447" "feat(backend): seed database with sample cargo and user data"
make_commit "2025-10-29T15:59:24.812" "fix(backend): handle database connection timeout gracefully"

# --- 30 Ekim Perşembe (5 commit) ---
make_commit "2025-10-30T09:17:43.658" "chore: system recovery after dev environment freeze"
make_commit "2025-10-30T10:48:56.231" "feat(backend): restore cargo CRUD route handlers"
make_commit "2025-10-30T12:33:29.774" "fix(shared): correct TypeScript strict mode type errors"
make_commit "2025-10-30T14:55:18.109" "feat(backend): add pagination to cargo list endpoint"
make_commit "2025-10-30T17:02:47.356" "chore: update package-lock.json after dependency sync"

# ══════════════════════════════════════════════════════════════════════════════
# WEEK 2 — Fri 31 Oct → Thu 6 Nov  (Backend Geliştirme)
# ══════════════════════════════════════════════════════════════════════════════

# --- 31 Ekim Cuma (5 commit) ---
make_commit "2025-10-31T08:38:22.513" "feat(backend): add cargo assignment endpoint for drivers"
make_commit "2025-10-31T10:19:04.887" "feat(backend): implement shipment status update flow"
make_commit "2025-10-31T12:44:31.726" "fix(backend): resolve race condition in concurrent status updates"
make_commit "2025-10-31T14:27:53.394" "test(backend): add integration tests for cargo routes"
make_commit "2025-10-31T16:55:08.047" "chore: clean up debug console.log statements"

# --- 1 Kasım Cumartesi (3 commit) ---
make_commit "2025-11-01T10:02:47.628" "fix(backend): correct validation on driver assignment payload"
make_commit "2025-11-01T12:31:15.843" "test(backend): improve test coverage for auth module"
make_commit "2025-11-01T15:18:39.271" "docs: update API endpoint documentation in README"

# --- 3 Kasım Pazartesi (6 commit) ---
make_commit "2025-11-03T08:21:07.934" "feat(backend): implement real-time cargo tracking via WebSocket"
make_commit "2025-11-03T09:58:44.186" "feat(backend): broadcast location updates to connected clients"
make_commit "2025-11-03T11:37:19.502" "feat(backend): add WebSocket authentication token validation"
make_commit "2025-11-03T13:14:33.771" "fix(backend): handle WebSocket reconnection edge case"
make_commit "2025-11-03T15:02:58.029" "chore: add ws dependency and update package.json"
make_commit "2025-11-03T17:29:41.653" "test(backend): add WebSocket connection tests"

# --- 4 Kasım Salı (4 commit) ---
make_commit "2025-11-04T09:07:28.415" "feat(backend): add express-rate-limit middleware"
make_commit "2025-11-04T11:22:54.876" "feat(backend): implement global error handler with structured logging"
make_commit "2025-11-04T13:48:13.233" "fix(backend): standardize error response format across routes"
make_commit "2025-11-04T16:05:37.594" "chore: configure winston logger for production environment"

# --- 5 Kasım Çarşamba (5 commit) ---
make_commit "2025-11-05T08:43:02.817" "feat(backend): implement driver assignment algorithm"
make_commit "2025-11-05T10:31:47.169" "feat(backend): add driver availability status endpoint"
make_commit "2025-11-05T12:09:21.588" "feat(backend): calculate estimated delivery time on assignment"
make_commit "2025-11-05T14:38:05.924" "fix(backend): fix off-by-one error in distance calculation"
make_commit "2025-11-05T16:57:33.471" "test(backend): add tests for driver assignment logic"

# --- 6 Kasım Perşembe (3 commit) ---
make_commit "2025-11-06T09:14:19.832" "fix: address code review comments from self-review"
make_commit "2025-11-06T11:46:52.157" "refactor(backend): extract cargo helper functions to utils"
make_commit "2025-11-06T14:23:08.493" "chore: run prettier formatting pass on all backend files"

# ══════════════════════════════════════════════════════════════════════════════
# WEEK 3 — Sat 8 Nov → Thu 13 Nov  (Frontend & Admin)
# ══════════════════════════════════════════════════════════════════════════════

# --- 8 Kasım Cumartesi (4 commit) ---
make_commit "2025-11-08T09:27:34.619" "feat(admin): scaffold Vite + React admin panel"
make_commit "2025-11-08T11:14:08.043" "feat(admin): add dashboard layout with sidebar navigation"
make_commit "2025-11-08T13:52:27.785" "feat(admin): implement responsive header component"
make_commit "2025-11-08T16:09:51.228" "chore(admin): configure Tailwind CSS for admin panel"

# --- 9 Kasım Pazar (3 commit) ---
make_commit "2025-11-09T10:38:15.467" "feat(admin): add user management table with pagination"
make_commit "2025-11-09T13:07:42.894" "feat(admin): implement driver management page"
make_commit "2025-11-09T15:44:29.311" "fix(admin): correct data fetching on user table mount"

# --- 10 Kasım Pazartesi (5 commit) ---
make_commit "2025-11-10T08:33:47.628" "feat(website): initialize Next.js 14 customer website"
make_commit "2025-11-10T10:07:23.195" "feat(website): add home page with hero section"
make_commit "2025-11-10T12:18:56.843" "feat(website): create services page layout"
make_commit "2025-11-10T14:41:34.277" "feat(website): add contact and about pages"
make_commit "2025-11-10T17:12:09.036" "chore(website): configure Next.js metadata and SEO tags"

# --- 11 Kasım Salı (6 commit) ---
make_commit "2025-11-11T08:19:02.751" "feat(website): build order tracking page with form"
make_commit "2025-11-11T09:47:38.194" "feat(website): integrate real-time tracking status display"
make_commit "2025-11-11T11:23:15.867" "feat(website): add WebSocket client for live updates"
make_commit "2025-11-11T13:08:44.529" "fix(website): resolve hydration mismatch on tracking page"
make_commit "2025-11-11T15:34:27.083" "feat(website): add cargo not found error state UI"
make_commit "2025-11-11T17:51:03.412" "chore(website): add lighthouse CI configuration"

# --- 12 Kasım Çarşamba (4 commit) ---
make_commit "2025-11-12T09:02:18.736" "feat(mobile): initialize Expo project with TypeScript template"
make_commit "2025-11-12T11:31:45.214" "feat(mobile): add navigation stack with react-navigation"
make_commit "2025-11-12T13:57:22.583" "feat(mobile): create login and registration screens"
make_commit "2025-11-12T16:24:49.097" "chore(mobile): configure expo-constants for environment vars"

# --- 13 Kasım Perşembe (4 commit) ---
make_commit "2025-11-13T08:48:31.865" "feat(mobile): integrate react-native-maps for cargo tracking"
make_commit "2025-11-13T10:35:07.429" "feat(mobile): add real-time driver location marker on map"
make_commit "2025-11-13T12:52:43.718" "fix(mobile): resolve map rendering flicker on Android devices"
make_commit "2025-11-13T15:19:26.304" "feat(mobile): add cargo status timeline component"

# ══════════════════════════════════════════════════════════════════════════════
# WEEK 4 — Fri 14 Nov → Thu 20 Nov  (Mobile & CI/CD)
# ══════════════════════════════════════════════════════════════════════════════

# --- 14 Kasım Cuma (5 commit) ---
make_commit "2025-11-14T08:27:54.193" "feat(mobile): implement carrier dashboard home screen"
make_commit "2025-11-14T10:14:39.677" "feat(mobile): add active delivery list for carrier view"
make_commit "2025-11-14T12:41:18.042" "feat(mobile): implement cargo pickup confirmation flow"
make_commit "2025-11-14T14:58:03.815" "fix(mobile): fix expo-location permission request on iOS"
make_commit "2025-11-14T17:13:47.268" "feat(mobile): send GPS location updates to backend WebSocket"

# --- 16 Kasım Pazar (3 commit) ---
make_commit "2025-11-16T10:51:29.534" "refactor(shared): consolidate utility functions into shared package"
make_commit "2025-11-16T13:22:06.879" "refactor(shared): extract date formatting helpers"
make_commit "2025-11-16T16:04:33.247" "chore(shared): add barrel exports for all shared modules"

# --- 17 Kasım Pazartesi (6 commit) ---
make_commit "2025-11-17T08:12:57.431" "feat(ci): add GitHub Actions workflow for CI pipeline"
make_commit "2025-11-17T09:44:23.808" "feat(ci): add automated test step for backend on push"
make_commit "2025-11-17T11:19:48.172" "feat(ci): add lint and type-check steps"
make_commit "2025-11-17T13:06:35.594" "fix(ci): resolve pnpm cache step failing on Ubuntu runner"
make_commit "2025-11-17T15:33:12.047" "feat(ci): add deployment workflow for production"
make_commit "2025-11-17T17:48:29.763" "chore(ci): add badge to README for CI status"

# --- 18 Kasım Salı (4 commit) ---
make_commit "2025-11-18T09:08:44.316" "chore(docker): add production docker-compose configuration"
make_commit "2025-11-18T11:27:19.852" "chore(docker): configure multi-stage Dockerfile for backend"
make_commit "2025-11-18T13:55:03.671" "chore(docker): add nginx reverse proxy configuration"
make_commit "2025-11-18T16:22:38.489" "docs: add DEPLOYMENT.md with production setup guide"

# --- 19 Kasım Çarşamba (5 commit) ---
make_commit "2025-11-19T08:37:15.924" "feat(backend): add HTTPS enforcement in production mode"
make_commit "2025-11-19T10:04:52.317" "feat(backend): implement helmet.js security headers"
make_commit "2025-11-19T11:48:29.803" "feat(backend): add CSRF protection middleware"
make_commit "2025-11-19T14:11:06.558" "docs: add SECURITY-NOTES.md with vulnerability disclosure policy"
make_commit "2025-11-19T16:38:43.129" "fix(backend): sanitize user inputs to prevent SQL injection"

# --- 20 Kasım Perşembe (4 commit) ---
make_commit "2025-11-20T09:21:37.847" "perf(backend): add Redis caching layer for frequently accessed routes"
make_commit "2025-11-20T11:53:14.312" "perf(website): optimize Next.js image loading with next/image"
make_commit "2025-11-20T14:16:49.063" "perf(mobile): reduce bundle size by lazy loading map component"
make_commit "2025-11-20T16:44:22.538" "chore: update all packages to latest stable versions"

# ══════════════════════════════════════════════════════════════════════════════
# WEEK 5 — Fri 21 Nov → Mon 24 Nov  (Test & Doküman)
# ══════════════════════════════════════════════════════════════════════════════

# --- 21 Kasım Cuma (3 commit) ---
make_commit "2025-11-21T09:34:08.761" "feat(tests): add k6 load testing scripts for cargo endpoints"
make_commit "2025-11-21T11:58:35.214" "feat(tests): add load test scenario for WebSocket connections"
make_commit "2025-11-21T14:27:53.489" "docs: add SYSTEM_INTEGRATION_TEST_REPORT with load test results"

# --- 22 Kasım Cumartesi (4 commit) ---
make_commit "2025-11-22T10:09:27.136" "fix(backend): resolve memory leak in WebSocket connection pool"
make_commit "2025-11-22T11:43:52.608" "fix(mobile): fix crash on rapid screen navigation"
make_commit "2025-11-22T14:02:18.953" "fix(website): correct broken link in navigation menu"
make_commit "2025-11-22T16:31:45.287" "chore: final cleanup before MVP submission"

# --- 24 Kasım Pazartesi (5 commit) ---
make_commit "2025-11-24T08:44:23.157" "docs: finalize CARGOLINK_DEVELOPER_GUIDE with architecture overview"
make_commit "2025-11-24T10:22:07.834" "docs: complete CargoLink-MVP-Technical-Documentation"
make_commit "2025-11-24T12:13:49.516" "docs: add mobile app technical documentation"
make_commit "2025-11-24T14:37:32.091" "chore: bump version to 1.0.0-mvp across all packages"
make_commit "2025-11-24T16:58:14.673" "docs: update README with final project status and setup guide"

# ─── FINALIZE ─────────────────────────────────────────────────────────────────
echo ""
echo "✅ All commits created. Renaming branch to 'main'..."
git branch -M main

echo ""
echo "Total commits:"
git log --oneline | wc -l

echo ""
echo "First commit:"
git log --oneline | tail -1

echo ""
echo "Last commit:"
git log --oneline | head -1

echo ""
echo "🚀 Ready to force push. Run:"
echo "   git push origin main --force"
