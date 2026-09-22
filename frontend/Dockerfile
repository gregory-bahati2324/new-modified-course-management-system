# ---------------------------------------------------------------------------
# Stage 1 - build the React app
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# API base URLs are baked into the JS bundle at build time (Vite). They are EMPTY on purpose:
# the browser then calls the same origin the page came from ("/auth/login", "/modules", ...)
# and nginx (stage 2) routes each prefix to the right microservice.
# Override a build arg only if an API is hosted on a different domain.
ARG VITE_API_BASE_URL=""
ARG VITE_API_COURSE_BASE_URL_COURSE=""
ARG VITE_API_MODULE_LESSON_BASE_URL=""
ARG VITE_API_ASSIGNMENT_BASE_URL=""
ARG VITE_API_PROGRESS_BASE_URL=""
ARG VITE_API_MARKING_GRADING_BASE_URL=""
ARG VITE_API_SCHEDULING_BASE_URL=""
ARG VITE_API_NOTIFICATION_BASE_URL=""
ARG VITE_USE_MOCK_DATA="false"
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_API_COURSE_BASE_URL_COURSE=$VITE_API_COURSE_BASE_URL_COURSE \
    VITE_API_MODULE_LESSON_BASE_URL=$VITE_API_MODULE_LESSON_BASE_URL \
    VITE_API_ASSIGNMENT_BASE_URL=$VITE_API_ASSIGNMENT_BASE_URL \
    VITE_API_PROGRESS_BASE_URL=$VITE_API_PROGRESS_BASE_URL \
    VITE_API_MARKING_GRADING_BASE_URL=$VITE_API_MARKING_GRADING_BASE_URL \
    VITE_API_SCHEDULING_BASE_URL=$VITE_API_SCHEDULING_BASE_URL \
    VITE_API_NOTIFICATION_BASE_URL=$VITE_API_NOTIFICATION_BASE_URL \
    VITE_USE_MOCK_DATA=$VITE_USE_MOCK_DATA

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2 - nginx: serves the SPA and reverse-proxies the API (see nginx/lms/routes.conf)
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine

# The stock default.conf is replaced at start-up by 25-lms-nginx-mode.sh
RUN rm -f /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/lms/ /etc/nginx/lms/
COPY nginx/25-lms-nginx-mode.sh /docker-entrypoint.d/25-lms-nginx-mode.sh
RUN chmod +x /docker-entrypoint.d/25-lms-nginx-mode.sh

# Set at run time from docker-compose / .env
ENV SERVER_NAME=_ \
    CLIENT_MAX_BODY_SIZE=200m

EXPOSE 80 443

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
