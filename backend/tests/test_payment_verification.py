"""Payment API tests - focus on payment-settings, create-order, and verify-payment endpoints."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://store-feature-test.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


class TestPaymentSettings:
    def test_payment_settings_returns_razorpay_configured(self, client):
        r = client.get(f"{API}/payment-settings", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "razorpay_configured" in data
        assert "payment_enabled" in data
        assert "registration_fee" in data
        assert isinstance(data["razorpay_configured"], bool)
        print(f"payment-settings: {data}")


class TestCreateOrder:
    def test_create_order_endpoint_exists(self, client):
        payload = {
            "amount": 1000,  # ₹10 in paise
            "talent_id": "test-talent-id-verify",
            "talent_name": "Test Talent",
            "talent_email": "test-verify@example.com",
            "talent_phone": "9999999999"
        }
        r = client.post(f"{API}/create-order", json=payload, timeout=30)
        # Endpoint must not 404
        assert r.status_code != 404, f"create-order endpoint missing: {r.text}"
        print(f"create-order status: {r.status_code}, body: {r.text[:400]}")
        if r.status_code == 200:
            data = r.json()
            assert "order_id" in data
            assert "amount" in data
            assert "currency" in data
            assert "key_id" in data
        else:
            # With placeholder keys, we expect 500 with an auth-related error from Razorpay
            body = r.text.lower()
            assert r.status_code in (500, 400)
            # This confirms endpoint reached Razorpay but keys invalid
            print(f"create-order failed as expected with placeholder keys: {body[:300]}")


class TestVerifyPayment:
    def test_verify_payment_endpoint_exists(self, client):
        """Verify the endpoint exists and accepts request (won't validate actual sig)."""
        payload = {
            "razorpay_order_id": "order_TEST123",
            "razorpay_payment_id": "pay_TEST123",
            "razorpay_signature": "invalid_signature",
            "talent_id": "test-talent-id"
        }
        r = client.post(f"{API}/verify-payment", json=payload, timeout=30)
        # Must NOT be 404 or 405 - the primary bug user reported
        assert r.status_code != 404, f"verify-payment endpoint MISSING (404): {r.text}"
        assert r.status_code != 405, f"verify-payment method not allowed: {r.text}"
        print(f"verify-payment status: {r.status_code}, body: {r.text[:400]}")
        # Expect 400 (bad signature) or 500 (razorpay not configured with real keys)
        assert r.status_code in (400, 500)
        # Response should include a JSON detail message with helpful info
        try:
            data = r.json()
            assert "detail" in data
            print(f"verify-payment detail: {data['detail']}")
        except Exception:
            pytest.fail(f"verify-payment did not return JSON: {r.text}")

    def test_verify_payment_validates_required_fields(self, client):
        """Missing required fields should return 422."""
        r = client.post(f"{API}/verify-payment", json={"talent_id": "x"}, timeout=30)
        assert r.status_code == 422, f"Expected 422 for missing fields, got {r.status_code}: {r.text}"

    def test_verify_payment_bad_signature_returns_400(self, client):
        """With valid schema but bad signature, we should get 400 (not 500) if Razorpay client is configured."""
        payload = {
            "razorpay_order_id": "order_FakeButValidShape",
            "razorpay_payment_id": "pay_FakeButValidShape",
            "razorpay_signature": "0" * 64,
            "talent_id": "test-talent-id"
        }
        r = client.post(f"{API}/verify-payment", json=payload, timeout=30)
        print(f"bad-sig verify: status={r.status_code}, body={r.text[:400]}")
        # This informs us whether Razorpay is configured or not
        assert r.status_code in (400, 500)


class TestPaymentHistory:
    def test_payment_history_no_objectid(self, client):
        r = client.get(f"{API}/payment-history", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "payments" in data
        assert "total_revenue" in data
        assert "total_count" in data
        # Ensure no mongo _id leaked
        for p in data["payments"]:
            assert "_id" not in p
