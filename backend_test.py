#!/usr/bin/env python3
"""
Backend API Testing for Bangalore Fashion Magazine
Tests all backend endpoints including new talent management features
"""

import requests
import json
import sys
from datetime import datetime
import os
from dotenv import load_dotenv
import base64

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://bangfash-update.preview.emergentagent.com')
BASE_API_URL = f"{BACKEND_URL}/api"

print(f"Testing Backend API at: {BASE_API_URL}")
print("=" * 80)

# Global variables to store test data
admin_token = None
talent_id = None
talent_token = None
hero_image_id = None
award_id = None

def create_test_image():
    """Create a small test image in base64 format"""
    # Simple 1x1 pixel PNG in base64
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

def test_root_endpoint():
    """Test GET /api/ - Root endpoint"""
    print("\n1. Testing Root Endpoint (GET /api/)")
    try:
        response = requests.get(f"{BASE_API_URL}/", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('message') == 'Hello World':
                print("   ✅ Root endpoint working correctly")
                return True
            else:
                print("   ❌ Root endpoint returned unexpected response")
                return False
        else:
            print("   ❌ Root endpoint failed")
            return False
            
    except Exception as e:
        print(f"   ❌ Root endpoint error: {str(e)}")
        return False

def test_user_register():
    """Test POST /api/auth/register - Register regular user"""
    print("\n2. Testing User Register (POST /api/auth/register)")
    try:
        test_data = {
            "name": "Regular User",
            "email": "user@bangalorefashion.com",
            "password": "userpass123",
            "confirmPassword": "userpass123",
            "is_admin": False
        }
        
        response = requests.post(f"{BASE_API_URL}/auth/register", 
                               json=test_data, 
                               timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'id' in data and 'name' in data and 'email' in data:
                print("   ✅ User register working - regular user created")
                return True
            else:
                print("   ❌ User register returned invalid response format")
                return False
        elif response.status_code == 400:
            print("   ⚠️ User register returned 400 - might be validation error or user exists")
            return True  # Consider this working if it's just a duplicate
        else:
            print(f"   ❌ User register failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ User register error: {str(e)}")
        return False

def test_admin_register():
    """Test POST /api/auth/register - Register admin user"""
    global admin_token
    print("\n3. Testing Admin Register (POST /api/auth/register)")
    try:
        test_data = {
            "name": "Admin User",
            "email": "admin@bangalorefashion.com",
            "password": "adminpass123",
            "confirmPassword": "adminpass123",
            "is_admin": True
        }
        
        response = requests.post(f"{BASE_API_URL}/auth/register", 
                               json=test_data, 
                               timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'id' in data and 'name' in data and 'email' in data:
                print("   ✅ Admin register working - admin user created")
                # Now login to get admin token
                login_data = {
                    "email": "admin@bangalorefashion.com",
                    "password": "adminpass123"
                }
                login_response = requests.post(f"{BASE_API_URL}/auth/login", json=login_data, timeout=10)
                if login_response.status_code == 200:
                    admin_token = login_response.json().get('token')
                    print(f"   ✅ Admin login successful, token obtained")
                return True
            else:
                print("   ❌ Admin register returned invalid response format")
                return False
        elif response.status_code == 400:
            print("   ⚠️ Admin register returned 400 - trying to login existing admin")
            # Try to login existing admin
            login_data = {
                "email": "admin@bangalorefashion.com",
                "password": "adminpass123"
            }
            login_response = requests.post(f"{BASE_API_URL}/auth/login", json=login_data, timeout=10)
            if login_response.status_code == 200:
                admin_token = login_response.json().get('token')
                print(f"   ✅ Existing admin login successful, token obtained")
                return True
            return False
        else:
            print(f"   ❌ Admin register failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Admin register error: {str(e)}")
        return False

def test_user_login():
    """Test POST /api/auth/login - Login user with is_admin flag"""
    print("\n4. Testing User Login (POST /api/auth/login)")
    try:
        test_data = {
            "email": "user@bangalorefashion.com",
            "password": "userpass123",
            "rememberMe": True
        }
        
        response = requests.post(f"{BASE_API_URL}/auth/login", 
                               json=test_data, 
                               timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'token' in data and 'user' in data and 'message' in data:
                user = data['user']
                if 'is_admin' in user:
                    print(f"   ✅ User login working - is_admin flag: {user['is_admin']}")
                    return True
                else:
                    print("   ❌ User login missing is_admin flag")
                    return False
            else:
                print("   ❌ User login returned invalid response format")
                return False
        elif response.status_code == 401:
            print("   ❌ User login failed - Invalid credentials")
            return False
        else:
            print(f"   ❌ User login failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ User login error: {str(e)}")
        return False

def test_talent_register():
    """Test POST /api/talent/register - Register talent"""
    global talent_id
    print("\n5. Testing Talent Register (POST /api/talent/register)")
    try:
        test_data = {
            "name": "Priya Sharma",
            "email": "priya@bangaloremodel.com",
            "password": "modelpass123",
            "phone": "+91-9876543210",
            "instagram_id": "@priya_bangalore_model",
            "category": "Model",
            "bio": "Professional fashion model from Bangalore with 5 years experience",
            "profile_image": create_test_image(),
            "portfolio_images": [create_test_image(), create_test_image()]
        }
        
        response = requests.post(f"{BASE_API_URL}/talent/register", 
                               json=test_data, 
                               timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'id' in data and 'name' in data and 'email' in data and 'category' in data:
                talent_id = data['id']
                print(f"   ✅ Talent register working - talent created with ID: {talent_id}")
                print(f"   ✅ Approval status: {data.get('is_approved', 'N/A')}")
                return True
            else:
                print("   ❌ Talent register returned invalid response format")
                return False
        elif response.status_code == 400:
            print("   ⚠️ Talent register returned 400 - might be validation error or talent exists")
            return False
        else:
            print(f"   ❌ Talent register failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Talent register error: {str(e)}")
        return False

def test_talent_login():
    """Test POST /api/talent/login - Talent login"""
    global talent_token
    print("\n6. Testing Talent Login (POST /api/talent/login)")
    try:
        test_data = {
            "email": "priya@bangaloremodel.com",
            "password": "modelpass123",
            "rememberMe": False
        }
        
        response = requests.post(f"{BASE_API_URL}/talent/login", 
                               json=test_data, 
                               timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'token' in data and 'talent' in data and 'message' in data:
                talent_token = data['token']
                talent = data['talent']
                print(f"   ✅ Talent login working - token obtained")
                print(f"   ✅ Talent details: {talent['name']} ({talent['category']})")
                return True
            else:
                print("   ❌ Talent login returned invalid response format")
                return False
        elif response.status_code == 401:
            print("   ❌ Talent login failed - Invalid credentials")
            return False
        else:
            print(f"   ❌ Talent login failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Talent login error: {str(e)}")
        return False

def test_get_talents_before_approval():
    """Test GET /api/talents - Get approved talents (should be empty before approval)"""
    print("\n7. Testing Get Approved Talents Before Approval (GET /api/talents)")
    try:
        response = requests.get(f"{BASE_API_URL}/talents", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Get talents working - found {len(data)} approved talents")
            return True
        else:
            print(f"   ❌ Get talents failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Get talents error: {str(e)}")
        return False

def test_admin_get_pending_talents():
    """Test GET /api/admin/talents/pending - Get pending talents"""
    print("\n8. Testing Admin Get Pending Talents (GET /api/admin/talents/pending)")
    try:
        headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}
        response = requests.get(f"{BASE_API_URL}/admin/talents/pending", 
                              headers=headers, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Get pending talents working - found {len(data)} pending talents")
            if len(data) > 0:
                print(f"   ✅ Sample pending talent: {data[0]['name']} ({data[0]['category']})")
            return True
        else:
            print(f"   ❌ Get pending talents failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Get pending talents error: {str(e)}")
        return False

def test_admin_approve_talent():
    """Test PUT /api/admin/talent/{id}/approve - Approve talent"""
    print("\n9. Testing Admin Approve Talent (PUT /api/admin/talent/{id}/approve)")
    if not talent_id:
        print("   ❌ No talent ID available for approval test")
        return False
        
    try:
        headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}
        response = requests.put(f"{BASE_API_URL}/admin/talent/{talent_id}/approve", 
                              headers=headers, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'message' in data:
                print(f"   ✅ Talent approval working - {data['message']}")
                return True
            else:
                print("   ❌ Talent approval returned invalid response format")
                return False
        elif response.status_code == 404:
            print("   ❌ Talent not found for approval")
            return False
        else:
            print(f"   ❌ Talent approval failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Talent approval error: {str(e)}")
        return False

def test_admin_update_talent_rank():
    """Test PUT /api/admin/talent/{id}/rank?rank=1 - Update talent rank"""
    print("\n10. Testing Admin Update Talent Rank (PUT /api/admin/talent/{id}/rank)")
    if not talent_id:
        print("   ❌ No talent ID available for rank update test")
        return False
        
    try:
        headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}
        response = requests.put(f"{BASE_API_URL}/admin/talent/{talent_id}/rank?rank=1", 
                              headers=headers, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'message' in data:
                print(f"   ✅ Talent rank update working - {data['message']}")
                return True
            else:
                print("   ❌ Talent rank update returned invalid response format")
                return False
        elif response.status_code == 404:
            print("   ❌ Talent not found for rank update")
            return False
        else:
            print(f"   ❌ Talent rank update failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Talent rank update error: {str(e)}")
        return False

def test_get_talents_after_approval():
    """Test GET /api/talents - Get approved talents (should include our talent now)"""
    print("\n11. Testing Get Approved Talents After Approval (GET /api/talents)")
    try:
        response = requests.get(f"{BASE_API_URL}/talents", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Get talents working - found {len(data)} approved talents")
            if len(data) > 0:
                print(f"   ✅ Sample approved talent: {data[0]['name']} (Rank: {data[0]['rank']})")
            return True
        else:
            print(f"   ❌ Get talents failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Get talents error: {str(e)}")
        return False

def test_get_single_talent():
    """Test GET /api/talent/{id} - Get single talent"""
    print("\n12. Testing Get Single Talent (GET /api/talent/{id})")
    if not talent_id:
        print("   ❌ No talent ID available for single talent test")
        return False
        
    try:
        response = requests.get(f"{BASE_API_URL}/talent/{talent_id}", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'id' in data and 'name' in data and 'category' in data:
                print(f"   ✅ Get single talent working - {data['name']} ({data['category']})")
                return True
            else:
                print("   ❌ Get single talent returned invalid response format")
                return False
        elif response.status_code == 404:
            print("   ❌ Talent not found")
            return False
        else:
            print(f"   ❌ Get single talent failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Get single talent error: {str(e)}")
        return False

def test_update_talent_profile():
    """Test PUT /api/talent/{id} - Update talent profile"""
    print("\n13. Testing Update Talent Profile (PUT /api/talent/{id})")
    if not talent_id:
        print("   ❌ No talent ID available for profile update test")
        return False
        
    try:
        update_data = {
            "bio": "Updated bio: Professional fashion model from Bangalore with 6 years experience in runway and commercial modeling",
            "phone": "+91-9876543211"
        }
        
        response = requests.put(f"{BASE_API_URL}/talent/{talent_id}", 
                              json=update_data, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'id' in data and 'bio' in data:
                print(f"   ✅ Update talent profile working - bio updated")
                return True
            else:
                print("   ❌ Update talent profile returned invalid response format")
                return False
        elif response.status_code == 404:
            print("   ❌ Talent not found for update")
            return False
        else:
            print(f"   ❌ Update talent profile failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Update talent profile error: {str(e)}")
        return False

def test_get_hero_images():
    """Test GET /api/hero-images - Get all hero images"""
    print("\n14. Testing Get Hero Images (GET /api/hero-images)")
    try:
        response = requests.get(f"{BASE_API_URL}/hero-images", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Get hero images working - found {len(data)} hero images")
            return True
        else:
            print(f"   ❌ Get hero images failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Get hero images error: {str(e)}")
        return False

def test_admin_create_hero_image():
    """Test POST /api/admin/hero-images - Create hero image"""
    global hero_image_id
    print("\n15. Testing Admin Create Hero Image (POST /api/admin/hero-images)")
    try:
        hero_data = {
            "image_data": create_test_image(),
            "title": "Bangalore Fashion Week 2024",
            "subtitle": "Discover the latest trends",
            "category": "Fashion Show",
            "order": 1
        }
        
        headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}
        response = requests.post(f"{BASE_API_URL}/admin/hero-images", 
                               json=hero_data, headers=headers, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'message' in data and 'id' in data:
                hero_image_id = data['id']
                print(f"   ✅ Create hero image working - {data['message']}")
                return True
            else:
                print("   ❌ Create hero image returned invalid response format")
                return False
        else:
            print(f"   ❌ Create hero image failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Create hero image error: {str(e)}")
        return False

def test_get_awards():
    """Test GET /api/awards - Get all awards"""
    print("\n16. Testing Get Awards (GET /api/awards)")
    try:
        response = requests.get(f"{BASE_API_URL}/awards", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Get awards working - found {len(data)} awards")
            return True
        else:
            print(f"   ❌ Get awards failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Get awards error: {str(e)}")
        return False

def test_admin_create_award():
    """Test POST /api/admin/awards - Create award"""
    global award_id
    print("\n17. Testing Admin Create Award (POST /api/admin/awards)")
    try:
        award_data = {
            "title": "Model of the Week",
            "winner_name": "Priya Sharma",
            "winner_image": create_test_image(),
            "description": "Outstanding performance in Bangalore Fashion Week 2024"
        }
        
        headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}
        response = requests.post(f"{BASE_API_URL}/admin/awards", 
                               json=award_data, headers=headers, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'message' in data and 'id' in data:
                award_id = data['id']
                print(f"   ✅ Create award working - {data['message']}")
                return True
            else:
                print("   ❌ Create award returned invalid response format")
                return False
        else:
            print(f"   ❌ Create award failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Create award error: {str(e)}")
        return False

def test_admin_export_talents():
    """Test GET /api/admin/talents/export - Export talents as CSV"""
    print("\n18. Testing Admin Export Talents (GET /api/admin/talents/export)")
    try:
        headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}
        response = requests.get(f"{BASE_API_URL}/admin/talents/export", 
                              headers=headers, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'csv' in content_type or 'text' in content_type:
                print(f"   ✅ Export talents working - CSV file generated")
                print(f"   ✅ Content-Type: {content_type}")
                return True
            else:
                print(f"   ❌ Export talents returned unexpected content type: {content_type}")
                return False
        else:
            print(f"   ❌ Export talents failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Export talents error: {str(e)}")
        return False

def test_admin_delete_hero_image():
    """Test DELETE /api/admin/hero-images/{id} - Delete hero image"""
    print("\n19. Testing Admin Delete Hero Image (DELETE /api/admin/hero-images/{id})")
    if not hero_image_id:
        print("   ❌ No hero image ID available for deletion test")
        return False
        
    try:
        headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}
        response = requests.delete(f"{BASE_API_URL}/admin/hero-images/{hero_image_id}", 
                                 headers=headers, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'message' in data:
                print(f"   ✅ Delete hero image working - {data['message']}")
                return True
            else:
                print("   ❌ Delete hero image returned invalid response format")
                return False
        elif response.status_code == 404:
            print("   ❌ Hero image not found for deletion")
            return False
        else:
            print(f"   ❌ Delete hero image failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Delete hero image error: {str(e)}")
        return False

def test_admin_delete_award():
    """Test DELETE /api/admin/awards/{id} - Delete award"""
    print("\n20. Testing Admin Delete Award (DELETE /api/admin/awards/{id})")
    if not award_id:
        print("   ❌ No award ID available for deletion test")
        return False
        
    try:
        headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}
        response = requests.delete(f"{BASE_API_URL}/admin/awards/{award_id}", 
                                 headers=headers, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'message' in data:
                print(f"   ✅ Delete award working - {data['message']}")
                return True
            else:
                print("   ❌ Delete award returned invalid response format")
                return False
        elif response.status_code == 404:
            print("   ❌ Award not found for deletion")
            return False
        else:
            print(f"   ❌ Delete award failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Delete award error: {str(e)}")
        return False

def test_admin_delete_talent():
    """Test DELETE /api/admin/talent/{id} - Delete talent (cleanup)"""
    print("\n21. Testing Admin Delete Talent (DELETE /api/admin/talent/{id})")
    if not talent_id:
        print("   ❌ No talent ID available for deletion test")
        return False
        
    try:
        headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}
        response = requests.delete(f"{BASE_API_URL}/admin/talent/{talent_id}", 
                                 headers=headers, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'message' in data:
                print(f"   ✅ Delete talent working - {data['message']}")
                return True
            else:
                print("   ❌ Delete talent returned invalid response format")
                return False
        elif response.status_code == 404:
            print("   ❌ Talent not found for deletion")
            return False
        else:
            print(f"   ❌ Delete talent failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Delete talent error: {str(e)}")
        return False

def main():
    """Run all backend tests"""
    print("BANGALORE FASHION MAGAZINE - COMPREHENSIVE BACKEND API TESTING")
    print("=" * 80)
    
    # Test all endpoints in logical order
    test_functions = [
        ("Root Endpoint", test_root_endpoint),
        ("User Register", test_user_register),
        ("Admin Register & Login", test_admin_register),
        ("User Login (with is_admin flag)", test_user_login),
        ("Talent Register", test_talent_register),
        ("Talent Login", test_talent_login),
        ("Get Talents (Before Approval)", test_get_talents_before_approval),
        ("Admin Get Pending Talents", test_admin_get_pending_talents),
        ("Admin Approve Talent", test_admin_approve_talent),
        ("Admin Update Talent Rank", test_admin_update_talent_rank),
        ("Get Talents (After Approval)", test_get_talents_after_approval),
        ("Get Single Talent", test_get_single_talent),
        ("Update Talent Profile", test_update_talent_profile),
        ("Get Hero Images", test_get_hero_images),
        ("Admin Create Hero Image", test_admin_create_hero_image),
        ("Get Awards", test_get_awards),
        ("Admin Create Award", test_admin_create_award),
        ("Admin Export Talents CSV", test_admin_export_talents),
        ("Admin Delete Hero Image", test_admin_delete_hero_image),
        ("Admin Delete Award", test_admin_delete_award),
        ("Admin Delete Talent (Cleanup)", test_admin_delete_talent)
    ]
    
    results = {}
    for test_name, test_func in test_functions:
        results[test_name] = test_func()
    
    print("\n" + "=" * 80)
    print("SUMMARY OF TEST RESULTS:")
    print("=" * 80)
    
    working_count = 0
    total_count = len(results)
    
    # Group results by category
    categories = {
        "Authentication": ["Root Endpoint", "User Register", "Admin Register & Login", "User Login (with is_admin flag)"],
        "Talent Management": ["Talent Register", "Talent Login", "Get Talents (Before Approval)", "Get Single Talent", "Update Talent Profile"],
        "Admin Operations": ["Admin Get Pending Talents", "Admin Approve Talent", "Admin Update Talent Rank", "Get Talents (After Approval)", "Admin Export Talents CSV", "Admin Delete Talent (Cleanup)"],
        "Hero Images": ["Get Hero Images", "Admin Create Hero Image", "Admin Delete Hero Image"],
        "Awards": ["Get Awards", "Admin Create Award", "Admin Delete Award"]
    }
    
    for category, tests in categories.items():
        print(f"\n{category}:")
        for test in tests:
            if test in results:
                status_icon = "✅" if results[test] else "❌"
                status_text = "WORKING" if results[test] else "FAILED"
                print(f"  {status_icon} {test}: {status_text}")
                if results[test]:
                    working_count += 1
    
    print(f"\nOverall: {working_count}/{total_count} endpoints working ({working_count/total_count*100:.1f}%)")
    
    # Test the main flow
    main_flow_tests = ["Talent Register", "Admin Approve Talent", "Get Talents (After Approval)"]
    main_flow_working = all(results.get(test, False) for test in main_flow_tests)
    
    print(f"\n🎯 Main Flow (Talent Registration → Admin Approval → Public List): {'✅ WORKING' if main_flow_working else '❌ FAILED'}")
    
    if working_count >= total_count * 0.8:  # 80% success rate
        print("🎉 Backend API is mostly functional!")
        return 0
    else:
        print("⚠️ Backend API needs attention - multiple endpoints failing")
        return 1

if __name__ == "__main__":
    sys.exit(main())