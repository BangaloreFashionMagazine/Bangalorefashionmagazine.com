"""Backend tests for Magazine Builder API endpoints."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://store-feature-test.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api/magazine-builder"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def created_magazine(session):
    payload = {
        "talent": {
            "name": "TEST_Talent",
            "category": "MODEL",
            "headline": "Rising star",
            "biography": "Bio text",
            "career_journey": "Journey text",
            "achievements": "Awards",
            "location": "Bangalore",
            "instagram": "test_handle",
            "interview_qa": [
                {"question": "Q1", "answer": "A1"},
                {"question": "Q2", "answer": "A2"},
            ],
        },
        "images": {
            "cover_image": "https://example.com/cover.jpg",
            "profile_image": "https://example.com/profile.jpg",
            "portfolio_images": ["https://example.com/p1.jpg", "https://example.com/p2.jpg"],
        },
        "template": "black_gold",
    }
    r = session.post(f"{API}/generate", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "id" in data and "pages" in data
    yield data
    # cleanup
    session.delete(f"{API}/{data['id']}")


class TestTemplates:
    def test_get_templates(self, session):
        r = session.get(f"{API}/templates")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) == 3
        ids = {t["id"] for t in data}
        assert ids == {"black_gold", "editorial", "dark_luxury"}


class TestGenerateMagazine:
    def test_generate_creates_seven_pages(self, created_magazine):
        pages = created_magazine["pages"]
        assert len(pages) == 7
        types = [p["page_type"] for p in pages]
        assert types == ["cover", "profile", "journey", "portfolio", "interview", "spotlight", "back_cover"]

    def test_generate_uses_template(self, created_magazine):
        assert created_magazine["template"] == "black_gold"

    def test_cover_has_talent_name(self, created_magazine):
        cover = created_magazine["pages"][0]
        texts = [e.get("content") for e in cover["elements"] if e.get("type") == "text"]
        assert any("TEST_TALENT" in str(t) for t in texts)


class TestMagazineCRUD:
    def test_get_magazine(self, session, created_magazine):
        r = session.get(f"{API}/{created_magazine['id']}")
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == created_magazine["id"]
        assert data["talent"]["name"] == "TEST_Talent"
        assert "_id" not in data  # mongo _id excluded

    def test_get_magazine_not_found(self, session):
        r = session.get(f"{API}/non-existent-id-xyz")
        assert r.status_code == 404

    def test_list_magazines(self, session, created_magazine):
        r = session.get(f"{API}/list")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        ids = [m["id"] for m in data]
        assert created_magazine["id"] in ids

    def test_update_magazine(self, session, created_magazine):
        mag_id = created_magazine["id"]
        get_r = session.get(f"{API}/{mag_id}")
        current = get_r.json()
        update_payload = {
            "id": mag_id,
            "title": "TEST_Updated_Title",
            "talent": current["talent"],
            "images": current["images"],
            "pages": current["pages"],
            "template": "editorial",
        }
        r = session.put(f"{API}/{mag_id}", json=update_payload)
        assert r.status_code == 200
        # verify
        verify = session.get(f"{API}/{mag_id}").json()
        assert verify["title"] == "TEST_Updated_Title"
        assert verify["template"] == "editorial"

    def test_duplicate_magazine(self, session, created_magazine):
        r = session.post(f"{API}/{created_magazine['id']}/duplicate")
        assert r.status_code == 200
        new_id = r.json()["id"]
        assert new_id != created_magazine["id"]
        # cleanup dup
        session.delete(f"{API}/{new_id}")

    def test_delete_nonexistent(self, session):
        r = session.delete(f"{API}/does-not-exist-abc")
        assert r.status_code == 404
