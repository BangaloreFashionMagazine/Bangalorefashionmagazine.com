"""
Test suite for Multi-Image Upload Feature
Testing:
1. Contest Winners (Awards) API - POST /api/admin/awards with winner_images array (up to 5 images)
2. Contest Winners (Awards) API - GET /api/awards returns winner_images array
3. Hero Images API - 10 image limit validation
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test image data (small base64 placeholder)
TEST_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

class TestAPIBasics:
    """Verify API is accessible"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api")
        assert response.status_code == 200
        print(f"SUCCESS: API root returns: {response.json()}")

    def test_awards_endpoint_accessible(self):
        """Test awards endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/awards")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Awards endpoint accessible, {len(data)} awards found")

    def test_hero_images_endpoint_accessible(self):
        """Test hero images endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/hero-images")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Hero images endpoint accessible, {len(data)} images found")


class TestContestWinnersMultiImage:
    """Test Contest Winners (Awards) multi-image upload feature"""
    
    def test_create_award_with_single_image(self):
        """Test creating award with single image in winner_images array"""
        payload = {
            "title": "TEST_Model of the Week Single",
            "winner_name": "TEST_Single Image Winner",
            "winner_images": [TEST_IMAGE],
            "description": "Test winner with single image",
            "category": "Model - Female"
        }
        response = requests.post(f"{BASE_URL}/api/admin/awards", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"SUCCESS: Award created with ID: {data['id']}")
        
        # Verify by fetching
        get_response = requests.get(f"{BASE_URL}/api/awards?active_only=false")
        assert get_response.status_code == 200
        awards = get_response.json()
        created = next((a for a in awards if a.get("id") == data["id"]), None)
        assert created is not None
        assert created["winner_images"] == [TEST_IMAGE]
        assert created["winner_image"] == TEST_IMAGE  # First image should also be in winner_image field
        print(f"SUCCESS: Award verified with 1 image in winner_images array")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/awards/{data['id']}")
        return data["id"]

    def test_create_award_with_multiple_images(self):
        """Test creating award with multiple images (up to 5)"""
        payload = {
            "title": "TEST_Model of the Week Multi",
            "winner_name": "TEST_Multi Image Winner",
            "winner_images": [TEST_IMAGE, TEST_IMAGE, TEST_IMAGE],  # 3 images
            "description": "Test winner with multiple images",
            "category": "Model - Male"
        }
        response = requests.post(f"{BASE_URL}/api/admin/awards", json=payload)
        assert response.status_code == 200
        data = response.json()
        print(f"SUCCESS: Award created with 3 images, ID: {data['id']}")
        
        # Verify the images were stored
        get_response = requests.get(f"{BASE_URL}/api/awards?active_only=false")
        awards = get_response.json()
        created = next((a for a in awards if a.get("id") == data["id"]), None)
        assert created is not None
        assert len(created.get("winner_images", [])) == 3
        print(f"SUCCESS: Verified 3 images in winner_images array")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/awards/{data['id']}")

    def test_create_award_with_5_images(self):
        """Test creating award with exactly 5 images (maximum allowed)"""
        payload = {
            "title": "TEST_Model of the Week Max",
            "winner_name": "TEST_Max Image Winner",
            "winner_images": [TEST_IMAGE] * 5,  # 5 images
            "description": "Test winner with maximum 5 images",
            "category": "Designers"
        }
        response = requests.post(f"{BASE_URL}/api/admin/awards", json=payload)
        assert response.status_code == 200
        data = response.json()
        print(f"SUCCESS: Award created with 5 images, ID: {data['id']}")
        
        # Verify all 5 images were stored
        get_response = requests.get(f"{BASE_URL}/api/awards?active_only=false")
        awards = get_response.json()
        created = next((a for a in awards if a.get("id") == data["id"]), None)
        assert created is not None
        assert len(created.get("winner_images", [])) == 5
        print(f"SUCCESS: Verified 5 images stored (maximum limit)")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/awards/{data['id']}")

    def test_create_award_with_more_than_5_images_truncates(self):
        """Test that awards with more than 5 images are truncated to 5"""
        payload = {
            "title": "TEST_Model of the Week Truncate",
            "winner_name": "TEST_Truncate Image Winner",
            "winner_images": [TEST_IMAGE] * 8,  # 8 images (should be truncated to 5)
            "description": "Test winner with excess images",
            "category": "Photography"
        }
        response = requests.post(f"{BASE_URL}/api/admin/awards", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify only 5 images were stored
        get_response = requests.get(f"{BASE_URL}/api/awards?active_only=false")
        awards = get_response.json()
        created = next((a for a in awards if a.get("id") == data["id"]), None)
        assert created is not None
        assert len(created.get("winner_images", [])) <= 5
        print(f"SUCCESS: 8 images truncated to {len(created.get('winner_images', []))} (limit enforced)")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/awards/{data['id']}")

    def test_award_response_contains_winner_images_field(self):
        """Verify GET /api/awards returns winner_images array in response"""
        # First create a test award
        payload = {
            "title": "TEST_Response Field Test",
            "winner_name": "TEST_Field Winner",
            "winner_images": [TEST_IMAGE, TEST_IMAGE],
            "description": "Test response fields",
            "category": "Makeup & Hair"
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/awards", json=payload)
        award_id = create_response.json()["id"]
        
        # Fetch awards
        response = requests.get(f"{BASE_URL}/api/awards?active_only=false")
        assert response.status_code == 200
        awards = response.json()
        
        created = next((a for a in awards if a.get("id") == award_id), None)
        assert created is not None
        
        # Verify required fields in response
        assert "id" in created
        assert "title" in created
        assert "winner_name" in created
        assert "winner_image" in created  # Legacy single image field
        assert "winner_images" in created  # New multi-image field
        assert isinstance(created["winner_images"], list)
        print(f"SUCCESS: Response contains all required fields including winner_images array")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/awards/{award_id}")


class TestHeroImagesLimit:
    """Test Hero Images 10 image limit"""
    
    def test_hero_images_endpoint_returns_list(self):
        """Test GET /api/hero-images returns list"""
        response = requests.get(f"{BASE_URL}/api/hero-images")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Hero images returns list with {len(data)} items")

    def test_create_hero_image(self):
        """Test creating a hero image"""
        payload = {
            "image_data": TEST_IMAGE,
            "title": "TEST_Hero Image",
            "subtitle": "Test Subtitle",
            "category": "Editorial",
            "order": 99
        }
        response = requests.post(f"{BASE_URL}/api/admin/hero-images", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"SUCCESS: Hero image created with ID: {data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/hero-images/{data['id']}")

    def test_hero_images_list_limit(self):
        """Test that hero images list returns up to 10 items"""
        response = requests.get(f"{BASE_URL}/api/hero-images")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 10  # Should be limited to 10
        print(f"SUCCESS: Hero images returns {len(data)} items (limit is 10)")


class TestAwardsCRUDFlow:
    """Test full CRUD flow for awards with multi-image support"""
    
    def test_full_crud_flow_with_multi_images(self):
        """Test Create → Read → Delete flow for awards with multiple images"""
        # CREATE
        payload = {
            "title": "TEST_CRUD Flow Award",
            "winner_name": "TEST_CRUD Winner",
            "winner_images": [TEST_IMAGE, TEST_IMAGE, TEST_IMAGE],
            "description": "CRUD test",
            "category": "Model - Female"
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/awards", json=payload)
        assert create_response.status_code == 200
        award_id = create_response.json()["id"]
        print(f"CREATE SUCCESS: Award ID {award_id}")
        
        # READ
        get_response = requests.get(f"{BASE_URL}/api/awards?active_only=false")
        assert get_response.status_code == 200
        awards = get_response.json()
        created = next((a for a in awards if a.get("id") == award_id), None)
        assert created is not None
        assert len(created.get("winner_images", [])) == 3
        print(f"READ SUCCESS: Found award with 3 images")
        
        # DELETE
        delete_response = requests.delete(f"{BASE_URL}/api/admin/awards/{award_id}")
        assert delete_response.status_code == 200
        print(f"DELETE SUCCESS: Award deleted")
        
        # VERIFY DELETION
        get_after_delete = requests.get(f"{BASE_URL}/api/awards?active_only=false")
        awards_after = get_after_delete.json()
        deleted = next((a for a in awards_after if a.get("id") == award_id), None)
        assert deleted is None
        print(f"VERIFY SUCCESS: Award no longer exists")


class TestBackwardCompatibility:
    """Test backward compatibility with legacy winner_image field"""
    
    def test_legacy_winner_image_field_populated(self):
        """Test that winner_image field is populated from first image"""
        payload = {
            "title": "TEST_Legacy Compat",
            "winner_name": "TEST_Legacy Winner",
            "winner_images": [TEST_IMAGE, TEST_IMAGE],
            "description": "Test legacy compatibility"
        }
        response = requests.post(f"{BASE_URL}/api/admin/awards", json=payload)
        assert response.status_code == 200
        award_id = response.json()["id"]
        
        # Verify winner_image is populated
        get_response = requests.get(f"{BASE_URL}/api/awards?active_only=false")
        awards = get_response.json()
        created = next((a for a in awards if a.get("id") == award_id), None)
        
        assert created is not None
        assert created.get("winner_image") == TEST_IMAGE  # First image
        assert created.get("winner_images")[0] == TEST_IMAGE
        print(f"SUCCESS: Legacy winner_image field populated with first image")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/awards/{award_id}")


# Cleanup fixture
@pytest.fixture(scope="module", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed data after tests complete"""
    yield
    # Cleanup any remaining test awards
    try:
        response = requests.get(f"{BASE_URL}/api/awards?active_only=false")
        if response.status_code == 200:
            awards = response.json()
            for award in awards:
                if award.get("title", "").startswith("TEST_") or award.get("winner_name", "").startswith("TEST_"):
                    requests.delete(f"{BASE_URL}/api/admin/awards/{award['id']}")
                    print(f"Cleaned up test award: {award['id']}")
    except Exception as e:
        print(f"Cleanup error: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
