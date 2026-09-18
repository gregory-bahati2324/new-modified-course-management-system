def _seed(client, internal_headers, recipient_id="student-1", **overrides):
    payload = {
        "event_id": overrides.pop("event_id", "evt-seed"),
        "event_type": overrides.pop("event_type", "ASSIGNMENT_GRADED"),
        "source_service": "marking_grading_service",
        "recipient_ids": [recipient_id],
        "title": overrides.pop("title", "Assignment graded"),
        "message": overrides.pop("message", "Graded."),
        **overrides,
    }
    return client.post("/internal/notifications/events", json=payload, headers=internal_headers)


def test_user_cannot_access_another_users_notifications(client, internal_headers, student_headers, other_student_headers):
    _seed(client, internal_headers, recipient_id="student-1")

    mine = client.get("/notifications", headers=student_headers).json()["items"]
    assert len(mine) == 1
    notif_id = mine[0]["id"]

    # student-2 cannot fetch student-1's notification by id
    resp = client.get(f"/notifications/{notif_id}", headers=other_student_headers)
    assert resp.status_code == 404

    # nor mark it read
    resp = client.patch(f"/notifications/{notif_id}/read", headers=other_student_headers)
    assert resp.status_code == 404

    # nor delete it
    resp = client.delete(f"/notifications/{notif_id}", headers=other_student_headers)
    assert resp.status_code == 404

    # and student-2's own list is empty
    theirs = client.get("/notifications", headers=other_student_headers).json()["items"]
    assert theirs == []


def test_requires_authentication(client):
    resp = client.get("/notifications")
    assert resp.status_code in (401, 403)


def test_mark_one_as_read(client, internal_headers, student_headers):
    _seed(client, internal_headers)
    items = client.get("/notifications", headers=student_headers).json()["items"]
    notif_id = items[0]["id"]
    assert items[0]["is_read"] is False

    resp = client.patch(f"/notifications/{notif_id}/read", headers=student_headers)
    assert resp.status_code == 200
    assert resp.json()["is_read"] is True
    assert resp.json()["read_at"] is not None

    count = client.get("/notifications/count", headers=student_headers).json()
    assert count["unread_count"] == 0


def test_mark_all_read(client, internal_headers, student_headers):
    for i in range(3):
        _seed(client, internal_headers, event_id=f"evt-{i}")

    before = client.get("/notifications/count", headers=student_headers).json()
    assert before["unread_count"] == 3

    resp = client.patch("/notifications/read-all", headers=student_headers)
    assert resp.status_code == 200

    after = client.get("/notifications/count", headers=student_headers).json()
    assert after["unread_count"] == 0


def test_unread_filtering(client, internal_headers, student_headers):
    for i in range(3):
        _seed(client, internal_headers, event_id=f"evt-{i}")

    items = client.get("/notifications", headers=student_headers).json()["items"]
    client.patch(f"/notifications/{items[0]['id']}/read", headers=student_headers)

    unread = client.get("/notifications/unread", headers=student_headers).json()
    assert unread["total"] == 2
    assert all(not n["is_read"] for n in unread["items"])


def test_category_filtering(client, internal_headers, student_headers):
    _seed(client, internal_headers, event_id="evt-a", event_type="ASSIGNMENT_GRADED")
    _seed(client, internal_headers, event_id="evt-b", event_type="LIVE_SESSION_CREATED")

    grades = client.get("/notifications?category=GRADE", headers=student_headers).json()
    assert grades["total"] == 1
    assert grades["items"][0]["category"] == "GRADE"

    schedule = client.get("/notifications?category=SCHEDULE", headers=student_headers).json()
    assert schedule["total"] == 1
    assert schedule["items"][0]["category"] == "SCHEDULE"


def test_pagination(client, internal_headers, student_headers):
    for i in range(5):
        _seed(client, internal_headers, event_id=f"evt-{i}")

    page1 = client.get("/notifications?page=1&limit=2", headers=student_headers).json()
    assert len(page1["items"]) == 2
    assert page1["total"] == 5

    page3 = client.get("/notifications?page=3&limit=2", headers=student_headers).json()
    assert len(page3["items"]) == 1


def test_delete_notification(client, internal_headers, student_headers):
    _seed(client, internal_headers)
    items = client.get("/notifications", headers=student_headers).json()["items"]
    notif_id = items[0]["id"]

    resp = client.delete(f"/notifications/{notif_id}", headers=student_headers)
    assert resp.status_code == 200

    items_after = client.get("/notifications", headers=student_headers).json()["items"]
    assert items_after == []


def test_non_admin_cannot_create_manual_notification(client, student_headers):
    resp = client.post(
        "/notifications",
        json={"recipient_id": "student-1", "title": "Hi", "message": "Hi"},
        headers=student_headers,
    )
    assert resp.status_code == 403


def test_admin_can_create_manual_notification(client, admin_headers, student_headers):
    resp = client.post(
        "/notifications",
        json={
            "recipient_id": "student-1",
            "type": "SYSTEM_ANNOUNCEMENT",
            "category": "SYSTEM",
            "title": "Maintenance window",
            "message": "The LMS will be down for maintenance on Sunday.",
        },
        headers=admin_headers,
    )
    assert resp.status_code == 201

    items = client.get("/notifications", headers=student_headers).json()["items"]
    assert len(items) == 1
    assert items[0]["type"] == "SYSTEM_ANNOUNCEMENT"
