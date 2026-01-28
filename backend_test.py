#!/usr/bin/env python3
"""
Backend API Testing for Bangalore Fashion Magazine
Tests all backend endpoints and reports status
"""

import requests
import json
import sys
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://blr-trend-mag.preview.emergentagent.com')
BASE_API_URL = f"{BACKEND_URL}/api"

print(f"Testing Backend API at: {BASE_API_URL}")
print("=" * 60)

def test_root_endpoint():
    """Test GET /api/ - Root endpoint"""
    print("\n1. Testing Root Endpoint (GET /api/)")
    try:
        response = requests.get(f"{BASE_API_URL}/", timeout=10)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
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

def test_auth_login():
    """Test POST /api/auth/login - Login endpoint"""
    print("\n2. Testing Auth Login (POST /api/auth/login)")
    try:
        test_data = {
            "email": "fashionista@bangalore.com",
            "password": "fashionpass123"
        }
        
        response = requests.post(f"{BASE_API_URL}/auth/login", 
                               json=test_data, 
                               timeout=10)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 404:
            print("   ❌ Login endpoint NOT IMPLEMENTED (404 Not Found)")
            return False
        elif response.status_code == 200:
            print("   ✅ Login endpoint exists and responding")
            return True
        else:
            print(f"   ⚠️ Login endpoint exists but returned {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Login endpoint error: {str(e)}")
        return False

def test_auth_register():
    """Test POST /api/auth/register - Register endpoint"""
    print("\n3. Testing Auth Register (POST /api/auth/register)")
    try:
        test_data = {
            "name": "Fashion Model",
            "email": "newmodel@bangalore.com",
            "password": "modelpass123",
            "phone": "+91-9876543210"
        }
        
        response = requests.post(f"{BASE_API_URL}/auth/register", 
                               json=test_data, 
                               timeout=10)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 404:
            print("   ❌ Register endpoint NOT IMPLEMENTED (404 Not Found)")
            return False
        elif response.status_code == 200 or response.status_code == 201:
            print("   ✅ Register endpoint exists and responding")
            return True
        else:
            print(f"   ⚠️ Register endpoint exists but returned {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Register endpoint error: {str(e)}")
        return False

def test_get_status():
    """Test GET /api/status - Get status checks"""
    print("\n4. Testing Get Status Checks (GET /api/status)")
    try:
        response = requests.get(f"{BASE_API_URL}/status", timeout=10)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Status endpoint working, returned {len(data)} status checks")
            return True
        else:
            print("   ❌ Status GET endpoint failed")
            return False
            
    except Exception as e:
        print(f"   ❌ Status GET endpoint error: {str(e)}")
        return False

def test_post_status():
    """Test POST /api/status - Create status check"""
    print("\n5. Testing Create Status Check (POST /api/status)")
    try:
        test_data = {
            "client_name": "Fashion Magazine Test Client"
        }
        
        response = requests.post(f"{BASE_API_URL}/status", 
                               json=test_data, 
                               timeout=10)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if 'id' in data and 'client_name' in data and 'timestamp' in data:
                print("   ✅ Status POST endpoint working correctly")
                return True
            else:
                print("   ❌ Status POST endpoint returned invalid response format")
                return False
        else:
            print("   ❌ Status POST endpoint failed")
            return False
            
    except Exception as e:
        print(f"   ❌ Status POST endpoint error: {str(e)}")
        return False

def main():
    """Run all backend tests"""
    print("BANGALORE FASHION MAGAZINE - BACKEND API TESTING")
    print("=" * 60)
    
    results = {
        'root_endpoint': test_root_endpoint(),
        'auth_login': test_auth_login(),
        'auth_register': test_auth_register(),
        'get_status': test_get_status(),
        'post_status': test_post_status()
    }
    
    print("\n" + "=" * 60)
    print("SUMMARY OF TEST RESULTS:")
    print("=" * 60)
    
    working_count = 0
    total_count = len(results)
    
    for endpoint, status in results.items():
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {endpoint.replace('_', ' ').title()}: {'WORKING' if status else 'FAILED/MISSING'}")
        if status:
            working_count += 1
    
    print(f"\nOverall: {working_count}/{total_count} endpoints working")
    
    if working_count == total_count:
        print("🎉 All backend endpoints are working!")
        return 0
    else:
        print("⚠️ Some backend endpoints need attention")
        return 1

if __name__ == "__main__":
    sys.exit(main())