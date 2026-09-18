def _event_payload(**overrides):
    payload = {
        "event_id": "evt-1",
        "event_type": "ASSIGNMENT_GRADED",
        "source_service": "marking_grading_service",
        "actor_id": "instructor-1",
        "recipient_ids": ["student-1"],
        "entity_type": "assignment",
        "entity_id": "assignment-1",
        "course_id": "course-1",
        "title": "Assignment graded",
        "message": "Your Database Design assignment has been graded.",
    }
    payload.update(overrides)
    return payload


def test_ingest_event_requires_internal_api_key(client):
    response = client.post("/internal/notifications/events", json=_event_payload())
    assert response.status_code == 401


def test_ingest_event_creates_notification(client, internal_headers):
    response = client.post(
        "/internal/notifications/events", json=_event_payload(), headers=internal_headers
    )
    assert response.status_code == 201
    body = response.json()
    assert body["created"] == 1
    assert body["skipped_duplicates"] == 0
    assert len(body["notification_ids"]) == 1


def test_ingest_event_correct_recipient_and_metadata(client, internal_headers, student_headers):
    client.post("/internal/notifications/events", json=_event_payload(), headers=internal_headers)

    response = client.get("/notifications", headers=student_headers)
    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) == 1
    notif = items[0]
    assert notif["recipient_id"] == "student-1"
    assert notif["type"] == "ASSIGNMENT_GRADED"
    assert notif["category"] == "GRADE"
    assert notif["metadata"]["course_id"] == "course-1"


def test_ingest_event_fans_out_to_multiple_recipients(client, internal_headers):
    payload = _event_payload(
        event_type="LIVE_SESSION_CREATED",
        recipient_ids=["student-1", "student-2", "student-3"],
    )
    response = client.post(
        "/internal/notifications/events", json=payload, headers=internal_headers
    )
    assert response.status_code == 201
    assert response.json()["created"] == 3


def test_duplicate_event_does_not_create_duplicate_notification(client, internal_headers, student_headers):
    payload = _event_payload()

    first = client.post("/internal/notifications/events", json=payload, headers=internal_headers)
    assert first.json()["created"] == 1

    second = client.post("/internal/notifications/events", json=payload, headers=internal_headers)
    assert second.json()["created"] == 0
    assert second.json()["skipped_duplicates"] == 1

    response = client.get("/notifications", headers=student_headers)
    assert len(response.json()["items"]) == 1


def test_malformed_event_rejected(client, internal_headers):
    response = client.post(
        "/internal/notifications/events",
        json={"event_type": "ASSIGNMENT_GRADED"},  # missing required fields
        headers=internal_headers,
    )
    assert response.status_code == 422


def test_unknown_event_type_still_processed_with_fallback_category(client, internal_headers, student_headers):
    payload = _event_payload(event_type="SOME_BRAND_NEW_EVENT_TYPE", event_id="evt-unknown")
    response = client.post(
        "/internal/notifications/events", json=payload, headers=internal_headers
    )
    assert response.status_code == 201
    assert response.json()["created"] == 1

    items = client.get("/notifications", headers=student_headers).json()["items"]
    assert any(n["type"] == "SOME_BRAND_NEW_EVENT_TYPE" and n["category"] == "SYSTEM" for n in items)
