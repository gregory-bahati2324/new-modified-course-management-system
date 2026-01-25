import requests
from core.config import MODULE_SERVICE_BASE_URL

TIMEOUT = 5  # seconds


def get_course_modules(course_id: str) -> list:
    url = f"{MODULE_SERVICE_BASE_URL}/modules/course/{course_id}"
    response = requests.get(url, timeout=TIMEOUT)

    if response.status_code != 200:
        raise RuntimeError("Failed to fetch modules from module service")

    return response.json()


def get_module_lessons(module_id: str) -> list:
    url = f"{MODULE_SERVICE_BASE_URL}/modules/{module_id}/lessons"
    response = requests.get(url, timeout=TIMEOUT)

    if response.status_code != 200:
        raise RuntimeError("Failed to fetch lessons from module service")

    return response.json()
