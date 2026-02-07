"""
Backend API Tests for Admin Panel Lazy Loading and Featured Video Feature
Tests: Admin panel lazy loading, video CRUD operations, and other admin tab functionalities
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasicAPIs:
    """Test basic API health and connectivity"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Bangalore Fashion Magazine API"
        print("✓ API root endpoint working")
    
    def test_get_categories(self):
        """Test categories endpoint"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        assert len(data["categories"]) > 0
        print(f"✓ Categories endpoint working: {len(data['categories'])} categories")


class TestAdminAuthentication:
    """Test admin login and authentication"""
    
    def test_admin_login(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@bangalorefashionmag.com",
            "password": "Admin@123BFM"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "admin@bangalorefashionmag.com"
        print("✓ Admin login successful")
        return data["token"]
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@bangalorefashionmag.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")


class TestVideoFeature:
    """Test Featured Video CRUD operations"""
    
    def test_get_video(self):
        """Test GET video endpoint"""
        response = requests.get(f"{BASE_URL}/api/video")
        assert response.status_code == 200
        data = response.json()
        # Video might be empty or have data
        print(f"✓ GET video endpoint working: {data}")
        return data
    
    def test_create_video(self):
        """Test creating a new video via admin endpoint"""
        test_video = {
            "title": "TEST_Video_For_Testing",
            "video_url": "https://www.youtube.com/watch?v=test123456",
            "video_type": "youtube"
        }
        response = requests.post(f"{BASE_URL}/api/admin/video", json=test_video)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "id" in data
        print(f"✓ Video created successfully: {data['id']}")
        return data["id"]
    
    def test_get_video_after_create(self):
        """Test GET video returns the created video"""
        response = requests.get(f"{BASE_URL}/api/video")
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "title" in data
        assert "video_url" in data
        assert "video_type" in data
        print(f"✓ Video data returned: {data.get('title')}")
        return data
    
    def test_delete_video(self):
        """Test deleting a video"""
        response = requests.delete(f"{BASE_URL}/api/admin/video")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Video deleted: {data['message']}")
    
    def test_get_video_after_delete(self):
        """Test GET video returns empty after delete"""
        response = requests.get(f"{BASE_URL}/api/video")
        assert response.status_code == 200
        data = response.json()
        # Should be empty or have no id
        assert data == {} or "id" not in data
        print("✓ Video is empty after deletion")


class TestAdminTabs:
    """Test all admin panel tab data fetching (Lazy Loading validation)"""
    
    def test_pending_talents_tab(self):
        """Test Pending tab - GET pending talents"""
        response = requests.get(f"{BASE_URL}/api/admin/talents/pending")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Pending talents tab working: {len(data)} pending talents")
    
    def test_all_talents_tab(self):
        """Test All Talents tab"""
        response = requests.get(f"{BASE_URL}/api/talents?approved_only=false")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ All talents tab working: {len(data)} total talents")
    
    def test_hero_images_tab(self):
        """Test Hero Images tab"""
        response = requests.get(f"{BASE_URL}/api/hero-images")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Hero images tab working: {len(data)} hero images")
    
    def test_contests_awards_tab(self):
        """Test Contest & Winners tab"""
        response = requests.get(f"{BASE_URL}/api/awards?active_only=false")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Awards/contests tab working: {len(data)} awards")
    
    def test_advertisements_tab(self):
        """Test Ads tab"""
        response = requests.get(f"{BASE_URL}/api/advertisements")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Advertisements tab working: {len(data)} ads")
    
    def test_magazine_tab(self):
        """Test Magazine tab"""
        response = requests.get(f"{BASE_URL}/api/magazine")
        assert response.status_code == 200
        data = response.json()
        # Can be empty dict or have magazine data
        assert isinstance(data, dict)
        print(f"✓ Magazine tab working: {'Magazine exists' if data.get('id') else 'No magazine'}")
    
    def test_music_tab(self):
        """Test Background Music tab"""
        response = requests.get(f"{BASE_URL}/api/music")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"✓ Music tab working: {'Music exists' if data.get('id') else 'No music'}")


class TestVideoFullCRUDFlow:
    """Full CRUD flow test for video feature"""
    
    def test_full_video_crud_flow(self):
        """Test complete video CRUD: Create → Read → Delete → Verify"""
        # 1. Create video
        test_video = {
            "title": "TEST_CRUD_Video",
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "video_type": "youtube"
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/video", json=test_video)
        assert create_response.status_code == 200
        create_data = create_response.json()
        assert "id" in create_data
        print(f"1. Created video: {create_data['id']}")
        
        # 2. Read and verify video data
        get_response = requests.get(f"{BASE_URL}/api/video")
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["title"] == test_video["title"]
        assert get_data["video_url"] == test_video["video_url"]
        assert get_data["video_type"] == test_video["video_type"]
        print(f"2. Verified video data: {get_data['title']}")
        
        # 3. Delete video
        delete_response = requests.delete(f"{BASE_URL}/api/admin/video")
        assert delete_response.status_code == 200
        print("3. Deleted video")
        
        # 4. Verify deletion
        verify_response = requests.get(f"{BASE_URL}/api/video")
        assert verify_response.status_code == 200
        verify_data = verify_response.json()
        assert verify_data == {} or "id" not in verify_data
        print("4. Verified video is deleted")
        
        print("✓ Full video CRUD flow completed successfully")


class TestVimeoVideoSupport:
    """Test Vimeo video support"""
    
    def test_vimeo_video_create(self):
        """Test creating a Vimeo video"""
        test_video = {
            "title": "TEST_Vimeo_Video",
            "video_url": "https://vimeo.com/123456789",
            "video_type": "vimeo"
        }
        response = requests.post(f"{BASE_URL}/api/admin/video", json=test_video)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"✓ Vimeo video created: {data['id']}")
        
        # Verify video type is vimeo
        get_response = requests.get(f"{BASE_URL}/api/video")
        get_data = get_response.json()
        assert get_data["video_type"] == "vimeo"
        print("✓ Vimeo video type verified")
        
        # Clean up
        requests.delete(f"{BASE_URL}/api/admin/video")
        print("✓ Test video cleaned up")


class TestRestoreOriginalVideo:
    """Restore the original video that was set up"""
    
    def test_restore_original_video(self):
        """Restore the 'BFM Fashion Show 2025' video"""
        original_video = {
            "title": "BFM Fashion Show 2025",
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "video_type": "youtube"
        }
        response = requests.post(f"{BASE_URL}/api/admin/video", json=original_video)
        assert response.status_code == 200
        print("✓ Original video restored: BFM Fashion Show 2025")
        
        # Verify
        get_response = requests.get(f"{BASE_URL}/api/video")
        get_data = get_response.json()
        assert get_data["title"] == "BFM Fashion Show 2025"
        print("✓ Video restoration verified")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
