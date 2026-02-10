"""
Test Admin Panel Improvements:
1. Category filter dropdown in All Talents tab
2. Terms agreement status display in All Talents tab
3. Pending tab shows detailed cards with terms status
4. agreed_to_terms and agreed_at fields in API responses
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestTalentAPITermsFields:
    """Tests for agreed_to_terms and agreed_at fields in talent API responses"""
    
    def test_api_root_accessible(self):
        """API root should be accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("API root accessible")
    
    def test_talents_endpoint_returns_terms_fields(self):
        """GET /api/talents should return agreed_to_terms and agreed_at fields"""
        response = requests.get(f"{BASE_URL}/api/talents?approved_only=false")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        if len(data) > 0:
            talent = data[0]
            # Check required fields
            assert "agreed_to_terms" in talent, "agreed_to_terms field missing from talent response"
            assert "agreed_at" in talent, "agreed_at field missing from talent response"
            assert isinstance(talent["agreed_to_terms"], bool), "agreed_to_terms should be boolean"
            assert isinstance(talent["agreed_at"], str), "agreed_at should be string"
            print(f"First talent: {talent['name']} - agreed_to_terms: {talent['agreed_to_terms']}, agreed_at: {talent['agreed_at']}")
        else:
            print("No talents found to test")
    
    def test_single_talent_endpoint_returns_terms_fields(self):
        """GET /api/talent/{id} should return agreed_to_terms and agreed_at fields"""
        # First get list of talents to get an ID
        response = requests.get(f"{BASE_URL}/api/talents?approved_only=false")
        assert response.status_code == 200
        talents = response.json()
        
        if len(talents) > 0:
            talent_id = talents[0]["id"]
            response = requests.get(f"{BASE_URL}/api/talent/{talent_id}")
            assert response.status_code == 200
            
            talent = response.json()
            assert "agreed_to_terms" in talent, "agreed_to_terms field missing from single talent response"
            assert "agreed_at" in talent, "agreed_at field missing from single talent response"
            print(f"Single talent endpoint verified - agreed_to_terms: {talent['agreed_to_terms']}, agreed_at: {talent['agreed_at']}")
        else:
            pytest.skip("No talents found to test single endpoint")
    
    def test_admin_pending_talents_returns_terms_fields(self):
        """GET /api/admin/talents/pending should return agreed_to_terms and agreed_at fields"""
        response = requests.get(f"{BASE_URL}/api/admin/talents/pending")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        if len(data) > 0:
            talent = data[0]
            assert "agreed_to_terms" in talent, "agreed_to_terms field missing from pending talent response"
            assert "agreed_at" in talent, "agreed_at field missing from pending talent response"
            print(f"Pending talent: {talent['name']} - agreed_to_terms: {talent['agreed_to_terms']}")
        else:
            print("No pending talents found - this is acceptable")
    
    def test_talents_endpoint_with_category_filter(self):
        """GET /api/talents should filter by category"""
        # Test with specific category
        categories = [
            "Model - Female",
            "Model - Male",
            "Designers",
            "Makeup & Hair",
            "Photography",
            "Event Management",
            "Other"
        ]
        
        for category in categories:
            response = requests.get(f"{BASE_URL}/api/talents?approved_only=false&category={category}")
            assert response.status_code == 200
            data = response.json()
            
            # All returned talents should be in the specified category
            for talent in data:
                assert talent["category"] == category, f"Expected category '{category}' but got '{talent['category']}'"
            
            print(f"Category filter '{category}': {len(data)} talents found")
    
    def test_lightweight_query_parameter(self):
        """GET /api/talents?lightweight=true should work"""
        response = requests.get(f"{BASE_URL}/api/talents?approved_only=false&lightweight=true")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        if len(data) > 0:
            talent = data[0]
            # Should still have agreed_to_terms and agreed_at fields
            assert "agreed_to_terms" in talent, "agreed_to_terms field missing in lightweight mode"
            assert "agreed_at" in talent, "agreed_at field missing in lightweight mode"
            print(f"Lightweight mode verified with {len(data)} talents")


class TestTalentRegistrationWithTerms:
    """Test talent registration includes terms agreement"""
    
    def test_register_talent_with_terms_agreement(self):
        """POST /api/talent/register should accept agreed_to_terms and agreed_at"""
        from datetime import datetime
        
        test_email = f"TEST_terms_{datetime.now().strftime('%Y%m%d%H%M%S')}@test.com"
        
        payload = {
            "name": "Test Terms Talent",
            "email": test_email,
            "password": "testpass123",
            "phone": "9999999999",
            "instagram_id": "test_terms_user",
            "category": "Model - Female",
            "bio": "Test bio for terms agreement",
            "profile_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "portfolio_images": [],
            "agreed_to_terms": True,
            "agreed_at": datetime.now().isoformat()
        }
        
        response = requests.post(f"{BASE_URL}/api/talent/register", json=payload)
        assert response.status_code == 200, f"Registration failed: {response.text}"
        
        data = response.json()
        assert data["agreed_to_terms"] == True, "agreed_to_terms should be True after registration"
        assert data["agreed_at"] != "", "agreed_at should not be empty after registration"
        
        talent_id = data["id"]
        print(f"Registered talent with terms agreement - ID: {talent_id}")
        
        # Verify via GET endpoint
        response = requests.get(f"{BASE_URL}/api/talent/{talent_id}")
        assert response.status_code == 200
        
        talent = response.json()
        assert talent["agreed_to_terms"] == True, "agreed_to_terms should persist after GET"
        assert talent["agreed_at"] != "", "agreed_at should persist after GET"
        
        # Cleanup - delete the test talent
        try:
            requests.delete(f"{BASE_URL}/api/admin/talent/{talent_id}")
            print(f"Cleaned up test talent: {talent_id}")
        except Exception as e:
            print(f"Cleanup failed: {e}")


class TestTalentLoginResponse:
    """Test talent login returns terms fields"""
    
    def test_talent_login_returns_terms_fields(self):
        """POST /api/talent/login should return agreed_to_terms and agreed_at in talent object"""
        # Get a talent to test login
        response = requests.get(f"{BASE_URL}/api/talents?approved_only=false")
        assert response.status_code == 200
        talents = response.json()
        
        if len(talents) == 0:
            pytest.skip("No talents available for login test")
        
        # We need to create a test talent first since we need known credentials
        from datetime import datetime
        test_email = f"TEST_login_{datetime.now().strftime('%Y%m%d%H%M%S')}@test.com"
        test_password = "testpass123"
        
        # Register test talent
        payload = {
            "name": "Test Login Talent",
            "email": test_email,
            "password": test_password,
            "phone": "9999999998",
            "instagram_id": "test_login_user",
            "category": "Model - Male",
            "bio": "Test bio",
            "profile_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "portfolio_images": [],
            "agreed_to_terms": True,
            "agreed_at": datetime.now().isoformat()
        }
        
        reg_response = requests.post(f"{BASE_URL}/api/talent/register", json=payload)
        assert reg_response.status_code == 200
        talent_id = reg_response.json()["id"]
        
        # Now login with the test talent
        login_response = requests.post(f"{BASE_URL}/api/talent/login", json={
            "email": test_email,
            "password": test_password
        })
        
        assert login_response.status_code == 200
        login_data = login_response.json()
        
        assert "talent" in login_data, "Login response should include talent object"
        talent = login_data["talent"]
        assert "agreed_to_terms" in talent, "agreed_to_terms field missing from login response"
        assert "agreed_at" in talent, "agreed_at field missing from login response"
        assert talent["agreed_to_terms"] == True, "agreed_to_terms should be True"
        
        print(f"Login response verified - agreed_to_terms: {talent['agreed_to_terms']}, agreed_at: {talent['agreed_at']}")
        
        # Cleanup
        try:
            requests.delete(f"{BASE_URL}/api/admin/talent/{talent_id}")
            print(f"Cleaned up test talent: {talent_id}")
        except Exception as e:
            print(f"Cleanup failed: {e}")


class TestAllTalentsResponse:
    """Test that all talents have the expected response structure"""
    
    def test_all_talents_have_required_fields(self):
        """All talents should have consistent response structure including terms fields"""
        response = requests.get(f"{BASE_URL}/api/talents?approved_only=false")
        assert response.status_code == 200
        
        talents = response.json()
        required_fields = [
            "id", "name", "email", "phone", "instagram_id", "category", "bio",
            "profile_image", "portfolio_images", "is_approved", "rank", "votes",
            "created_at", "agreed_to_terms", "agreed_at"
        ]
        
        for i, talent in enumerate(talents):
            for field in required_fields:
                assert field in talent, f"Talent #{i+1} ({talent.get('name', 'Unknown')}) missing field: {field}"
        
        print(f"All {len(talents)} talents have required fields including agreed_to_terms and agreed_at")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
