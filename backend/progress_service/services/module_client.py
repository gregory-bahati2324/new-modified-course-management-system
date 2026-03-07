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

def get_lesson_version(lesson_id: str) -> int:
    url = f"{MODULE_SERVICE_BASE_URL}/modules/lessons/{lesson_id}"
    response = requests.get(url, timeout=TIMEOUT)

    if response.status_code != 200:
        raise RuntimeError(
            f"Module Service Error | "
            f"Status: {response.status_code} | "
            f"URL: {url} | "
            f"Response: {response.text}"
        )

    lesson_data = response.json()

    version = lesson_data.get("version")

    if version is None:
        raise RuntimeError(
            f"Lesson {lesson_id} returned NULL version from module service"
        )

    return int(version)

def get_module_info(module_id: str):
    url = f"{MODULE_SERVICE_BASE_URL}/modules/{module_id}"
    response = requests.get(url, timeout=TIMEOUT)

    if response.status_code != 200:
        raise RuntimeError(response.text)

    return response.json()


