"""
core/constants.py
The notification type/category/priority vocabulary, scoped to events
that actually exist in this LMS's current backend (see
NOTIFICATION_INTEGRATION.md §"Event catalog" for what was deliberately
left out and why — mainly discussion/forum/messaging/admin-approval,
none of which has a real backend service behind it yet).

Kept as plain string constants (not a hard Python Enum) so a new event
type can be added by any producing service without a coordinated
release of this service — the ingestion endpoint accepts any
`event_type` string and simply records it. NOTIFICATION_TYPES below is
used only for documentation/validation-hints in the OpenAPI schema.
"""

CATEGORY_COURSE = "COURSE"
CATEGORY_MODULE = "MODULE"
CATEGORY_ASSIGNMENT = "ASSIGNMENT"
CATEGORY_ASSESSMENT = "ASSESSMENT"
CATEGORY_GRADE = "GRADE"
CATEGORY_PROGRESS = "PROGRESS"
CATEGORY_SCHEDULE = "SCHEDULE"
CATEGORY_SYSTEM = "SYSTEM"

CATEGORIES = [
    CATEGORY_COURSE, CATEGORY_MODULE, CATEGORY_ASSIGNMENT, CATEGORY_ASSESSMENT,
    CATEGORY_GRADE, CATEGORY_PROGRESS, CATEGORY_SCHEDULE, CATEGORY_SYSTEM,
]

PRIORITY_LOW = "LOW"
PRIORITY_NORMAL = "NORMAL"
PRIORITY_HIGH = "HIGH"
PRIORITY_URGENT = "URGENT"

PRIORITIES = [PRIORITY_LOW, PRIORITY_NORMAL, PRIORITY_HIGH, PRIORITY_URGENT]

# event_type -> (category, default priority, default action_url template)
# The action_url templates use the ACTUAL routes found in
# frontend/src/routes/AppRoutes.tsx — not invented ones.
EVENT_TYPE_MAP = {
    "COURSE_ENROLLED": (CATEGORY_COURSE, PRIORITY_NORMAL, "/instructor/students"),

    "MODULE_CREATED": (CATEGORY_MODULE, PRIORITY_LOW, "/student/course/{course_id}/learn"),
    "LESSON_CREATED": (CATEGORY_MODULE, PRIORITY_LOW, "/student/course/{course_id}/learn"),

    "ASSIGNMENT_CREATED": (CATEGORY_ASSIGNMENT, PRIORITY_NORMAL, "/student/assignments"),
    "ASSIGNMENT_SUBMITTED": (CATEGORY_ASSIGNMENT, PRIORITY_NORMAL, "/instructor/grade"),
    "ASSIGNMENT_GRADED": (CATEGORY_GRADE, PRIORITY_HIGH, "/student/grades"),

    "ASSESSMENT_CREATED": (CATEGORY_ASSESSMENT, PRIORITY_NORMAL, "/student/exams"),
    "ASSESSMENT_SUBMITTED": (CATEGORY_ASSESSMENT, PRIORITY_NORMAL, "/instructor/marking"),
    "ASSESSMENT_GRADED": (CATEGORY_GRADE, PRIORITY_HIGH, "/student/exam-history"),

    "COURSE_PROGRESS_MILESTONE": (CATEGORY_PROGRESS, PRIORITY_LOW, "/student/course/{course_id}/learn"),
    "COURSE_COMPLETED": (CATEGORY_PROGRESS, PRIORITY_HIGH, "/student/grades"),

    "LIVE_SESSION_CREATED": (CATEGORY_SCHEDULE, PRIORITY_NORMAL, "/student/schedule"),
    "LIVE_SESSION_UPDATED": (CATEGORY_SCHEDULE, PRIORITY_NORMAL, "/student/schedule"),
    "LIVE_SESSION_CANCELLED": (CATEGORY_SCHEDULE, PRIORITY_HIGH, "/student/schedule"),

    "SYSTEM_ANNOUNCEMENT": (CATEGORY_SYSTEM, PRIORITY_NORMAL, None),
}

NOTIFICATION_TYPES = list(EVENT_TYPE_MAP.keys())
