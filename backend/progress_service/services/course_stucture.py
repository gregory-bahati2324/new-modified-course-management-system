from services.module_client import get_course_modules, get_module_lessons


def get_total_modules(course_id: str) -> int:
    modules = get_course_modules(course_id)
    return len(modules)


def get_total_lessons_in_course(course_id: str) -> int:
    modules = get_course_modules(course_id)

    total = 0
    for module in modules:
        lessons = get_module_lessons(module["id"])
        total += len(lessons)

    return total


def get_total_lessons_in_module(module_id: str) -> int:
    lessons = get_module_lessons(module_id)
    return len(lessons)

