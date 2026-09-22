#!/usr/bin/env bash
# =============================================================================
#  Smoke test for a running LMS stack, driven entirely through the public URL (nginx).
#
#    ./scripts/smoke-test.sh                          # http://localhost
#    ./scripts/smoke-test.sh https://my-domain.org    # your real site
#    ./scripts/smoke-test.sh https://1.2.3.4 -k       # self-signed / IP (skip cert check)
#
#  It is read-only: it never creates data. For every API prefix it checks that the request
#    * reaches the right microservice (JSON answer, not the React index.html),
#    * is NOT answered with a redirect (the old 307 problem),
#    * gives the status a not-logged-in user should get (401/403/422).
#  Exit code 0 = everything passed.
# =============================================================================
BASE="${1:-http://localhost}"; BASE="${BASE%/}"
shift || true
CURL_EXTRA=("$@")
PASS=0; FAIL=0

# check "<label>" METHOD /path "<allowed status codes, space separated>" <json|html|any> [body]
check() {
  local label="$1" method="$2" path="$3" allowed="$4" kind="$5" body="${6:-}"
  local args=(-s -m 20 -o /tmp/.smoke_body -D /tmp/.smoke_hdr -w '%{http_code}' -X "$method" "${CURL_EXTRA[@]}")
  [ -n "$body" ] && args+=(-H 'Content-Type: application/json' -d "$body")
  local code; code="$(curl "${args[@]}" "$BASE$path")"
  local ctype; ctype="$(grep -i '^content-type:' /tmp/.smoke_hdr | tr -d '\r' | tr 'A-Z' 'a-z')"
  local ok=1 why=""
  [[ " $allowed " == *" $code "* ]] || { ok=0; why="status $code, expected one of: $allowed"; }
  case "$kind" in
    json) [[ "$ctype" == *json* ]] || { ok=0; why="${why:+$why; }content-type is not JSON (${ctype:-none}) - request did not reach the API"; } ;;
    html) [[ "$ctype" == *html* ]] || { ok=0; why="${why:+$why; }content-type is not HTML (${ctype:-none})"; } ;;
  esac
  if [ $ok -eq 1 ]; then PASS=$((PASS+1)); printf '  \033[32mPASS\033[0m %-46s %s %s\n' "$label" "$code" "$method $path"
  else FAIL=$((FAIL+1)); printf '  \033[31mFAIL\033[0m %-46s %s %s\n       -> %s\n' "$label" "$code" "$method $path" "$why"; fi
}

echo "Smoke test against: $BASE"
echo; echo "Frontend (React single-page app)"
check "nginx health"                    GET /healthz                  "200" any
check "home page"                       GET /                         "200" html
check "SPA deep link /login"            GET /login                    "200" html
check "SPA deep link /student/courses"  GET /student/courses          "200" html
check "missing asset is a real 404"     GET /assets/nope-12345.js     "404" any

echo; echo "API routing (no redirects, right service, JSON)"
check "auth        GET  /auth/me"                    GET  /auth/me                       "401 403" json
check "auth        POST /auth/login (empty body)"    POST /auth/login                    "422"     json '{}'
check "course      GET  /api/courses/all (public)"   GET  /api/courses/all               "200"     json
check "modules     GET  /modules"                    GET  /modules                       "200"     json
check "modules     GET  /modules/  (slash)"          GET  /modules/                      "200"     json
check "modules     POST /modules (empty body)"       POST /modules                       "422"     json '{}'
check "modules     POST /modules/ (empty body)"      POST /modules/                      "422"     json '{}'
check "progress    GET  /progress/courses/x"         GET  /progress/courses/x            "401 403" json
check "assignments GET  /assignments"                GET  /assignments                   "401 403" json
check "assignments GET  /assignments/  (slash)"      GET  /assignments/                  "401 403" json
check "assessments GET  /assessments"                GET  /assessments                   "401 403" json
check "assessments GET  /assessments/  (slash)"      GET  /assessments/                  "401 403" json
check "questions   GET  /questions/assessments/x/ (slash)" GET /questions/assessments/x/     "401 403" json
check "questions   GET  /questions/assessments/x"    GET  /questions/assessments/x       "401 403" json
check "grading     GET  /grading/dashboard"          GET  /grading/dashboard             "401 403" json
check "sessions    GET  /sessions/my"                GET  /sessions/my                   "401 403" json
check "notifs      GET  /notifications"              GET  /notifications                 "401 403" json
check "unknown /api/* is a JSON 404"                 GET  /api/does-not-exist            "404"     json
check "internal endpoints are not public"            POST /internal/notifications/events "404"     json '{}'

echo; echo "Result: $PASS passed, $FAIL failed"
rm -f /tmp/.smoke_body /tmp/.smoke_hdr
[ "$FAIL" -eq 0 ]
