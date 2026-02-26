"""
Test suite for Designer Store feature
Tests: Store Settings, Products CRUD, Orders, Reviews, Designers endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@bangalorefashionmag.com"
ADMIN_PASSWORD = "Admin@123BFM"


class TestStoreSettings:
    """Store settings CRUD tests"""
    
    def test_get_store_settings(self):
        """GET /api/store/settings should return store settings"""
        response = requests.get(f"{BASE_URL}/api/store/settings")
        assert response.status_code == 200
        data = response.json()
        # Verify structure
        assert "hero_images" in data
        assert "contact_email" in data
        assert "contact_phone" in data
        assert "contact_instagram" in data
        print(f"✓ Store settings fetched: {data}")
    
    def test_update_store_settings(self):
        """PUT /api/store/settings should update store settings"""
        test_settings = {
            "hero_images": ["https://example.com/hero1.jpg"],
            "contact_email": "test_contact@store.com",
            "contact_phone": "+91 9876543210",
            "contact_instagram": "test_store_insta"
        }
        response = requests.put(f"{BASE_URL}/api/store/settings", json=test_settings)
        assert response.status_code == 200
        
        # Verify update persisted
        get_response = requests.get(f"{BASE_URL}/api/store/settings")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["contact_email"] == test_settings["contact_email"]
        assert data["contact_phone"] == test_settings["contact_phone"]
        print(f"✓ Store settings updated successfully")
        
        # Cleanup - reset to empty
        requests.put(f"{BASE_URL}/api/store/settings", json={
            "hero_images": [],
            "contact_email": "",
            "contact_phone": "",
            "contact_instagram": ""
        })


class TestDesignersEndpoint:
    """Test /api/store/designers endpoint"""
    
    def test_get_store_designers(self):
        """GET /api/store/designers should return designers list"""
        response = requests.get(f"{BASE_URL}/api/store/designers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Designers endpoint working, returned {len(data)} designers")


class TestProductsCRUD:
    """Products CRUD tests - requires designer setup"""
    
    @pytest.fixture(scope="class")
    def designer_talent(self, request):
        """Create a test designer talent for product testing"""
        import uuid
        talent_id = f"TEST_{uuid.uuid4().hex[:8]}"
        talent_data = {
            "id": talent_id,
            "name": f"Test Designer {talent_id[:8]}",
            "email": f"test_designer_{talent_id[:8]}@test.com",
            "password": "TestPass123",
            "phone": "9876543210",
            "category": "Designer Store",
            "profile_image": "https://via.placeholder.com/300",
            "is_approved": True,
            "bio": "Test designer for product testing"
        }
        
        # Create designer using admin endpoint (need to login first)
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip("Admin login failed - skipping product tests")
        
        token = login_response.json().get("token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Check if we can create talent via admin endpoint
        # For now, we'll use the talents register endpoint
        register_response = requests.post(f"{BASE_URL}/api/talents/register", json={
            "name": talent_data["name"],
            "email": talent_data["email"],
            "password": talent_data["password"],
            "phone": talent_data["phone"],
            "category": "Designer Store",
            "profile_image": talent_data["profile_image"],
            "agreed_to_terms": True
        })
        
        if register_response.status_code == 200:
            created_talent = register_response.json().get("talent", {})
            talent_id = created_talent.get("id")
            
            # Try to approve the talent
            requests.put(f"{BASE_URL}/api/admin/talents/{talent_id}/approve", headers=headers)
            
            request.cls.designer_id = talent_id
            request.cls.headers = headers
            print(f"✓ Created test designer with ID: {talent_id}")
            
            yield talent_id
            
            # Cleanup - delete test talent
            requests.delete(f"{BASE_URL}/api/admin/talents/{talent_id}", headers=headers)
        else:
            # If registration fails (possibly duplicate), try to find existing test designer
            talents_response = requests.get(f"{BASE_URL}/api/admin/talents/all", headers=headers)
            if talents_response.status_code == 200:
                all_talents = talents_response.json()
                test_designer = next((t for t in all_talents if t.get("category") == "Designer Store"), None)
                if test_designer:
                    request.cls.designer_id = test_designer.get("id")
                    request.cls.headers = headers
                    yield test_designer.get("id")
                    return
            pytest.skip("Could not create or find designer for product testing")
    
    def test_get_products_empty(self):
        """GET /api/store/products should work even with no products"""
        response = requests.get(f"{BASE_URL}/api/store/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Products endpoint working, returned {len(data)} products")
    
    def test_create_product_without_designer(self):
        """POST /api/store/products with invalid designer should fail"""
        product_data = {
            "name": "Test Product Invalid Designer",
            "price": 999.0,
            "designer_id": "nonexistent-designer-id"
        }
        response = requests.post(f"{BASE_URL}/api/store/products", json=product_data)
        assert response.status_code == 404
        assert "Designer not found" in response.json().get("detail", "")
        print("✓ Product creation correctly rejected for invalid designer")


class TestProductsWithDesigner:
    """Tests that require a valid designer"""
    
    @pytest.fixture(autouse=True)
    def setup_designer(self):
        """Setup or find a designer for product tests"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip("Admin login failed")
        
        self.token = login_response.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Get all talents and find a Designer Store talent
        talents_response = requests.get(f"{BASE_URL}/api/admin/talents/all", headers=self.headers)
        if talents_response.status_code == 200:
            all_talents = talents_response.json()
            designer = next((t for t in all_talents if t.get("category") == "Designer Store"), None)
            if designer:
                self.designer_id = designer.get("id")
                self.designer_name = designer.get("name")
                return
        
        # Create a new designer if none exists
        register_response = requests.post(f"{BASE_URL}/api/talents/register", json={
            "name": "Test Store Designer",
            "email": f"test_store_designer_{uuid.uuid4().hex[:6]}@test.com",
            "password": "TestPass123",
            "phone": "9876543210",
            "category": "Designer Store",
            "profile_image": "https://via.placeholder.com/300",
            "agreed_to_terms": True
        })
        
        if register_response.status_code == 200:
            created_talent = register_response.json().get("talent", {})
            self.designer_id = created_talent.get("id")
            self.designer_name = created_talent.get("name")
            # Approve the talent
            requests.put(f"{BASE_URL}/api/admin/talents/{self.designer_id}/approve", headers=self.headers)
        else:
            pytest.skip("Could not find or create designer for product tests")
    
    def test_product_crud_flow(self):
        """Test full product CRUD: Create → Read → Update → Delete"""
        if not hasattr(self, 'designer_id'):
            pytest.skip("No designer available for product tests")
        
        # CREATE
        product_data = {
            "name": "TEST_Beautiful Silk Dress",
            "description": "A beautiful handcrafted silk dress",
            "size": "M",
            "material": "Pure Silk",
            "price": 15000.0,
            "shipping_info": "Free shipping in India",
            "images": ["https://via.placeholder.com/300"],
            "designer_id": self.designer_id
        }
        
        create_response = requests.post(f"{BASE_URL}/api/store/products", json=product_data)
        assert create_response.status_code == 200
        created_product = create_response.json()
        assert created_product["name"] == product_data["name"]
        assert created_product["price"] == product_data["price"]
        assert created_product["designer_id"] == self.designer_id
        product_id = created_product["id"]
        print(f"✓ Product created: {product_id}")
        
        # READ - Get single product
        get_response = requests.get(f"{BASE_URL}/api/store/products/{product_id}")
        assert get_response.status_code == 200
        fetched_product = get_response.json()
        assert fetched_product["id"] == product_id
        assert fetched_product["name"] == product_data["name"]
        print(f"✓ Product fetched successfully")
        
        # READ - Get all products (should include our product)
        list_response = requests.get(f"{BASE_URL}/api/store/products")
        assert list_response.status_code == 200
        products = list_response.json()
        assert any(p["id"] == product_id for p in products)
        print(f"✓ Product appears in product list")
        
        # READ - Get products by designer
        designer_products_response = requests.get(f"{BASE_URL}/api/store/products?designer_id={self.designer_id}")
        assert designer_products_response.status_code == 200
        designer_products = designer_products_response.json()
        assert any(p["id"] == product_id for p in designer_products)
        print(f"✓ Product appears in designer's product list")
        
        # UPDATE
        update_data = {
            "name": "TEST_Updated Silk Dress",
            "price": 18000.0,
            "size": "L"
        }
        update_response = requests.put(f"{BASE_URL}/api/store/products/{product_id}", json=update_data)
        assert update_response.status_code == 200
        updated_product = update_response.json()
        assert updated_product["name"] == update_data["name"]
        assert updated_product["price"] == update_data["price"]
        assert updated_product["size"] == update_data["size"]
        print(f"✓ Product updated successfully")
        
        # Verify update persisted
        verify_response = requests.get(f"{BASE_URL}/api/store/products/{product_id}")
        assert verify_response.status_code == 200
        verified_product = verify_response.json()
        assert verified_product["name"] == update_data["name"]
        print(f"✓ Product update verified via GET")
        
        # DELETE
        delete_response = requests.delete(f"{BASE_URL}/api/store/products/{product_id}")
        assert delete_response.status_code == 200
        print(f"✓ Product deleted successfully")
        
        # Verify deletion
        get_deleted_response = requests.get(f"{BASE_URL}/api/store/products/{product_id}")
        assert get_deleted_response.status_code == 404
        print(f"✓ Product deletion verified - returns 404")


class TestOrders:
    """Order endpoints tests"""
    
    @pytest.fixture(autouse=True)
    def setup_product(self):
        """Create a product for order testing"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip("Admin login failed")
        
        self.token = login_response.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Get a designer
        talents_response = requests.get(f"{BASE_URL}/api/admin/talents/all", headers=self.headers)
        designer = None
        if talents_response.status_code == 200:
            all_talents = talents_response.json()
            designer = next((t for t in all_talents if t.get("category") == "Designer Store"), None)
        
        if not designer:
            # Create one
            register_response = requests.post(f"{BASE_URL}/api/talents/register", json={
                "name": "Order Test Designer",
                "email": f"order_test_{uuid.uuid4().hex[:6]}@test.com",
                "password": "TestPass123",
                "phone": "9876543210",
                "category": "Designer Store",
                "profile_image": "https://via.placeholder.com/300",
                "agreed_to_terms": True
            })
            if register_response.status_code == 200:
                designer = register_response.json().get("talent", {})
                requests.put(f"{BASE_URL}/api/admin/talents/{designer['id']}/approve", headers=self.headers)
            else:
                pytest.skip("Could not create designer for order tests")
        
        self.designer_id = designer.get("id")
        
        # Create a product
        product_data = {
            "name": "TEST_Order Test Product",
            "price": 5000.0,
            "designer_id": self.designer_id
        }
        product_response = requests.post(f"{BASE_URL}/api/store/products", json=product_data)
        if product_response.status_code == 200:
            self.product = product_response.json()
            yield
            # Cleanup
            requests.delete(f"{BASE_URL}/api/store/products/{self.product['id']}")
        else:
            pytest.skip("Could not create product for order tests")
    
    def test_create_order(self):
        """POST /api/store/orders should create order with customer details"""
        order_data = {
            "product_id": self.product["id"],
            "customer_name": "Test Customer",
            "customer_email": "testcustomer@test.com",
            "customer_phone": "9876543210",
            "customer_address": "123 Test Street, Test City 560001",
            "notes": "Please deliver before 5pm"
        }
        
        response = requests.post(f"{BASE_URL}/api/store/orders", json=order_data)
        assert response.status_code == 200
        order = response.json()
        
        assert order["product_id"] == order_data["product_id"]
        assert order["customer_name"] == order_data["customer_name"]
        assert order["customer_phone"] == order_data["customer_phone"]
        assert order["customer_address"] == order_data["customer_address"]
        assert order["status"] == "pending"
        assert "id" in order
        
        self.order_id = order["id"]
        print(f"✓ Order created: {self.order_id}")
    
    def test_get_orders(self):
        """GET /api/store/orders should return orders list"""
        # First create an order
        order_data = {
            "product_id": self.product["id"],
            "customer_name": "Test Get Orders",
            "customer_email": "testgetorders@test.com",
            "customer_phone": "9876543211",
            "customer_address": "456 Test Avenue, Test City 560002"
        }
        create_response = requests.post(f"{BASE_URL}/api/store/orders", json=order_data)
        assert create_response.status_code == 200
        
        # Get all orders
        response = requests.get(f"{BASE_URL}/api/store/orders")
        assert response.status_code == 200
        orders = response.json()
        assert isinstance(orders, list)
        assert len(orders) > 0
        print(f"✓ Orders fetched: {len(orders)} orders")
    
    def test_update_order_status(self):
        """PUT /api/store/orders/{id}/status should update order status"""
        # Create an order first
        order_data = {
            "product_id": self.product["id"],
            "customer_name": "Test Status Update",
            "customer_email": "teststatus@test.com",
            "customer_phone": "9876543212",
            "customer_address": "789 Test Road, Test City 560003"
        }
        create_response = requests.post(f"{BASE_URL}/api/store/orders", json=order_data)
        assert create_response.status_code == 200
        order_id = create_response.json()["id"]
        
        # Update status to confirmed
        status_response = requests.put(f"{BASE_URL}/api/store/orders/{order_id}/status?status=confirmed")
        assert status_response.status_code == 200
        print(f"✓ Order status updated to confirmed")
        
        # Update to shipped
        status_response = requests.put(f"{BASE_URL}/api/store/orders/{order_id}/status?status=shipped")
        assert status_response.status_code == 200
        print(f"✓ Order status updated to shipped")
        
        # Update to delivered
        status_response = requests.put(f"{BASE_URL}/api/store/orders/{order_id}/status?status=delivered")
        assert status_response.status_code == 200
        print(f"✓ Order status updated to delivered")
    
    def test_invalid_order_status(self):
        """PUT /api/store/orders/{id}/status with invalid status should fail"""
        # Create an order first
        order_data = {
            "product_id": self.product["id"],
            "customer_name": "Test Invalid Status",
            "customer_email": "testinvalid@test.com",
            "customer_phone": "9876543213",
            "customer_address": "101 Test Lane, Test City 560004"
        }
        create_response = requests.post(f"{BASE_URL}/api/store/orders", json=order_data)
        assert create_response.status_code == 200
        order_id = create_response.json()["id"]
        
        # Try invalid status
        status_response = requests.put(f"{BASE_URL}/api/store/orders/{order_id}/status?status=invalid_status")
        assert status_response.status_code == 400
        print(f"✓ Invalid order status correctly rejected")


class TestReviews:
    """Product reviews tests"""
    
    @pytest.fixture(autouse=True)
    def setup_product_for_review(self):
        """Create a product for review testing"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip("Admin login failed")
        
        self.token = login_response.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Get a designer
        talents_response = requests.get(f"{BASE_URL}/api/admin/talents/all", headers=self.headers)
        designer = None
        if talents_response.status_code == 200:
            all_talents = talents_response.json()
            designer = next((t for t in all_talents if t.get("category") == "Designer Store"), None)
        
        if not designer:
            register_response = requests.post(f"{BASE_URL}/api/talents/register", json={
                "name": "Review Test Designer",
                "email": f"review_test_{uuid.uuid4().hex[:6]}@test.com",
                "password": "TestPass123",
                "phone": "9876543210",
                "category": "Designer Store",
                "profile_image": "https://via.placeholder.com/300",
                "agreed_to_terms": True
            })
            if register_response.status_code == 200:
                designer = register_response.json().get("talent", {})
                requests.put(f"{BASE_URL}/api/admin/talents/{designer['id']}/approve", headers=self.headers)
            else:
                pytest.skip("Could not create designer for review tests")
        
        self.designer_id = designer.get("id")
        
        # Create a product
        product_data = {
            "name": "TEST_Review Test Product",
            "price": 3000.0,
            "designer_id": self.designer_id
        }
        product_response = requests.post(f"{BASE_URL}/api/store/products", json=product_data)
        if product_response.status_code == 200:
            self.product = product_response.json()
            yield
            # Cleanup
            requests.delete(f"{BASE_URL}/api/store/products/{self.product['id']}")
        else:
            pytest.skip("Could not create product for review tests")
    
    def test_create_review(self):
        """POST /api/store/reviews should create product review"""
        review_data = {
            "product_id": self.product["id"],
            "reviewer_name": "Happy Customer",
            "rating": 5,
            "comment": "Excellent product! Highly recommended."
        }
        
        response = requests.post(f"{BASE_URL}/api/store/reviews", json=review_data)
        assert response.status_code == 200
        review = response.json()
        
        assert review["product_id"] == review_data["product_id"]
        assert review["reviewer_name"] == review_data["reviewer_name"]
        assert review["rating"] == review_data["rating"]
        assert review["comment"] == review_data["comment"]
        assert "id" in review
        print(f"✓ Review created successfully")
    
    def test_get_product_reviews(self):
        """GET /api/store/reviews/{product_id} should return reviews"""
        # Create a review first
        review_data = {
            "product_id": self.product["id"],
            "reviewer_name": "Another Customer",
            "rating": 4,
            "comment": "Good quality, fast delivery"
        }
        requests.post(f"{BASE_URL}/api/store/reviews", json=review_data)
        
        # Get reviews
        response = requests.get(f"{BASE_URL}/api/store/reviews/{self.product['id']}")
        assert response.status_code == 200
        reviews = response.json()
        assert isinstance(reviews, list)
        assert len(reviews) > 0
        print(f"✓ Reviews fetched: {len(reviews)} reviews")
    
    def test_invalid_rating(self):
        """POST /api/store/reviews with invalid rating should fail"""
        review_data = {
            "product_id": self.product["id"],
            "reviewer_name": "Invalid Reviewer",
            "rating": 10,  # Invalid - should be 1-5
            "comment": "This should fail"
        }
        
        response = requests.post(f"{BASE_URL}/api/store/reviews", json=review_data)
        assert response.status_code == 400
        print(f"✓ Invalid rating correctly rejected")
    
    def test_review_nonexistent_product(self):
        """POST /api/store/reviews for nonexistent product should fail"""
        review_data = {
            "product_id": "nonexistent-product-id",
            "reviewer_name": "Lost Customer",
            "rating": 5,
            "comment": "This product doesn't exist"
        }
        
        response = requests.post(f"{BASE_URL}/api/store/reviews", json=review_data)
        assert response.status_code == 404
        print(f"✓ Review for nonexistent product correctly rejected")


class TestAdminLogin:
    """Test admin authentication"""
    
    def test_admin_login(self):
        """POST /api/auth/login should authenticate admin"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["is_admin"] == True
        print(f"✓ Admin login successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
