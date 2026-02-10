#!/usr/bin/env python3
"""
Comprehensive Authentication Testing for Bangalore Fashion Magazine
Tests all authentication scenarios as requested in the review
"""

import requests
import json
import sys
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://gallery-sync-1.preview.emergentagent.com')
BASE_API_URL = f"{BACKEND_URL}/api"

print(f"Testing Authentication API at: {BASE_API_URL}")
print("=" * 60)

def test_root_endpoint():
    """Test GET /api/ - Root endpoint (should return "Hello World")"""
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

def test_register_new_user():
    """Test POST /api/auth/register - Register a new user with specified data"""
    print("\n2. Testing Auth Register - New User (POST /api/auth/register)")
    
    # Use unique email to avoid conflicts
    unique_id = str(uuid.uuid4())[:8]
    test_data = {
        "name": "Test User",
        "email": f"test-{unique_id}@example.com",
        "password": "password123",
        "confirmPassword": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_API_URL}/auth/register", 
                               json=test_data, 
                               timeout=10)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if 'id' in data and 'name' in data and 'email' in data:
                if data['name'] == "Test User" and data['email'] == test_data['email']:
                    print("   ✅ Register endpoint working - user created successfully")
                    return True, test_data['email']
                else:
                    print("   ❌ Register endpoint returned incorrect user data")
                    return False, None
            else:
                print("   ❌ Register endpoint returned invalid response format")
                return False, None
        else:
            print(f"   ❌ Register endpoint failed with status {response.status_code}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Register endpoint error: {str(e)}")
        return False, None

def test_login_registered_user(email):
    """Test POST /api/auth/login - Login with the registered user"""
    print("\n3. Testing Auth Login - Valid Credentials (POST /api/auth/login)")
    try:
        test_data = {
            "email": email,
            "password": "password123",
            "rememberMe": True
        }
        
        response = requests.post(f"{BASE_API_URL}/auth/login", 
                               json=test_data, 
                               timeout=10)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if 'token' in data and 'user' in data and 'message' in data:
                user = data['user']
                if user['email'] == email and data['message'] == "Login successful":
                    print("   ✅ Login endpoint working - authentication successful")
                    return True
                else:
                    print("   ❌ Login endpoint returned incorrect user data")
                    return False
            else:
                print("   ❌ Login endpoint returned invalid response format")
                return False
        elif response.status_code == 401:
            print("   ❌ Login failed - Invalid credentials (401)")
            return False
        else:
            print(f"   ❌ Login endpoint failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Login endpoint error: {str(e)}")
        return False

def test_login_wrong_password(email):
    """Test POST /api/auth/login - Login with wrong password (should fail with 401)"""
    print("\n4. Testing Auth Login - Wrong Password (POST /api/auth/login)")
    try:
        test_data = {
            "email": email,
            "password": "wrongpassword",
            "rememberMe": False
        }
        
        response = requests.post(f"{BASE_API_URL}/auth/login", 
                               json=test_data, 
                               timeout=10)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 401:
            data = response.json()
            if 'detail' in data and 'Invalid email or password' in data['detail']:
                print("   ✅ Login correctly rejected wrong password (401)")
                return True
            else:
                print("   ⚠️ Login returned 401 but with unexpected error message")
                return False
        elif response.status_code == 200:
            print("   ❌ Login incorrectly accepted wrong password")
            return False
        else:
            print(f"   ⚠️ Login endpoint returned unexpected status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Login wrong password test error: {str(e)}")
        return False

def test_register_existing_email(email):
    """Test POST /api/auth/register - Register with existing email (should fail with 400)"""
    print("\n5. Testing Auth Register - Existing Email (POST /api/auth/register)")
    try:
        test_data = {
            "name": "Another User",
            "email": email,  # Same email as registered user
            "password": "newpassword123",
            "confirmPassword": "newpassword123"
        }
        
        response = requests.post(f"{BASE_API_URL}/auth/register", 
                               json=test_data, 
                               timeout=10)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 400:
            data = response.json()
            if 'detail' in data and 'already registered' in data['detail'].lower():
                print("   ✅ Register correctly rejected existing email (400)")
                return True
            else:
                print("   ⚠️ Register returned 400 but with unexpected error message")
                return False
        elif response.status_code == 200:
            print("   ❌ Register incorrectly accepted existing email")
            return False
        else:
            print(f"   ⚠️ Register endpoint returned unexpected status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Register existing email test error: {str(e)}")
        return False

def main():
    """Run all authentication tests as specified in the review request"""
    print("BANGALORE FASHION MAGAZINE - AUTHENTICATION TESTING")
    print("Testing scenarios as requested in review:")
    print("1. GET /api/ - Root endpoint")
    print("2. POST /api/auth/register - Register new user")
    print("3. POST /api/auth/login - Login with registered user")
    print("4. POST /api/auth/login - Login with wrong password")
    print("5. POST /api/auth/register - Register with existing email")
    print("=" * 60)
    
    # Test 1: Root endpoint
    root_result = test_root_endpoint()
    
    # Test 2: Register new user
    register_result, user_email = test_register_new_user()
    
    if not register_result or not user_email:
        print("\n❌ Cannot continue with login tests - registration failed")
        return 1
    
    # Test 3: Login with registered user
    login_result = test_login_registered_user(user_email)
    
    # Test 4: Login with wrong password
    wrong_password_result = test_login_wrong_password(user_email)
    
    # Test 5: Register with existing email
    existing_email_result = test_register_existing_email(user_email)
    
    # Summary
    results = {
        'Root Endpoint (GET /api/)': root_result,
        'Register New User': register_result,
        'Login Valid Credentials': login_result,
        'Login Wrong Password (should fail)': wrong_password_result,
        'Register Existing Email (should fail)': existing_email_result
    }
    
    print("\n" + "=" * 60)
    print("AUTHENTICATION TEST RESULTS SUMMARY:")
    print("=" * 60)
    
    working_count = 0
    total_count = len(results)
    
    for test_name, status in results.items():
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {test_name}: {'PASS' if status else 'FAIL'}")
        if status:
            working_count += 1
    
    print(f"\nOverall: {working_count}/{total_count} tests passed")
    
    if working_count == total_count:
        print("🎉 All authentication endpoints are working correctly!")
        return 0
    else:
        print("⚠️ Some authentication tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())