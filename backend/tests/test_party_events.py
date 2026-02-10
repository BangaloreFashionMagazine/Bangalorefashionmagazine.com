"""
Test Party Events APIs - for party invites, bookings, entry codes
Tests GET /api/party-events (active only), GET /api/admin/party-events (all),
POST, PUT, DELETE operations
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPartyEventsAPI:
    """Test Party Events CRUD operations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup fixture - stores created event IDs for cleanup"""
        self.created_event_ids = []
        yield
        # Cleanup test events
        for event_id in self.created_event_ids:
            try:
                requests.delete(f"{BASE_URL}/api/admin/party-events/{event_id}")
            except:
                pass

    def test_api_health(self):
        """Test API is accessible"""
        response = requests.get(f"{BASE_URL}/api")
        assert response.status_code == 200
        print("API is accessible")

    def test_get_active_party_events(self):
        """Test GET /api/party-events returns only active events"""
        response = requests.get(f"{BASE_URL}/api/party-events")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Check all returned events are active
        for event in data:
            assert event.get('is_active') == True
            assert 'id' in event
            assert 'title' in event
            assert 'venue' in event
            assert 'event_date' in event
        print(f"GET /api/party-events returned {len(data)} active events")

    def test_get_all_party_events_admin(self):
        """Test GET /api/admin/party-events returns all events"""
        response = requests.get(f"{BASE_URL}/api/admin/party-events")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"GET /api/admin/party-events returned {len(data)} total events")

    def test_create_party_event(self):
        """Test POST /api/admin/party-events creates new event"""
        unique_code = f"TEST{uuid.uuid4().hex[:6].upper()}"
        new_event = {
            "title": "TEST_Party Event",
            "venue": "Test Venue, Bangalore",
            "event_date": "Jan 25, 2026",
            "description": "Test party event description",
            "entry_code": unique_code,
            "booking_info": "Book via test website",
            "contact": "9876543210",
            "is_active": True
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/party-events", json=new_event)
        assert response.status_code == 200
        data = response.json()
        assert 'id' in data
        assert data.get('message') == "Party event created"
        
        self.created_event_ids.append(data['id'])
        print(f"Created party event with ID: {data['id']}")
        
        # Verify event exists via GET
        get_response = requests.get(f"{BASE_URL}/api/admin/party-events")
        assert get_response.status_code == 200
        events = get_response.json()
        created_event = next((e for e in events if e['id'] == data['id']), None)
        assert created_event is not None
        assert created_event['title'] == new_event['title']
        assert created_event['venue'] == new_event['venue']
        assert created_event['entry_code'] == unique_code
        assert created_event['is_active'] == True
        print("Event creation verified via GET")

    def test_create_party_event_active_appears_in_public(self):
        """Test that active events appear in public endpoint"""
        unique_code = f"PUB{uuid.uuid4().hex[:6].upper()}"
        new_event = {
            "title": "TEST_Public Party Event",
            "venue": "Public Venue",
            "event_date": "Feb 1, 2026",
            "entry_code": unique_code,
            "is_active": True
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/party-events", json=new_event)
        assert response.status_code == 200
        event_id = response.json()['id']
        self.created_event_ids.append(event_id)
        
        # Check public endpoint includes this event
        public_response = requests.get(f"{BASE_URL}/api/party-events")
        assert public_response.status_code == 200
        public_events = public_response.json()
        found = next((e for e in public_events if e['id'] == event_id), None)
        assert found is not None
        print(f"Active event {event_id} appears in public endpoint")

    def test_create_inactive_event_not_in_public(self):
        """Test that inactive events do NOT appear in public endpoint"""
        unique_code = f"HID{uuid.uuid4().hex[:6].upper()}"
        new_event = {
            "title": "TEST_Hidden Party Event",
            "venue": "Hidden Venue",
            "event_date": "Feb 2, 2026",
            "entry_code": unique_code,
            "is_active": False
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/party-events", json=new_event)
        assert response.status_code == 200
        event_id = response.json()['id']
        self.created_event_ids.append(event_id)
        
        # Check public endpoint does NOT include this event
        public_response = requests.get(f"{BASE_URL}/api/party-events")
        assert public_response.status_code == 200
        public_events = public_response.json()
        found = next((e for e in public_events if e['id'] == event_id), None)
        assert found is None
        print(f"Inactive event {event_id} correctly hidden from public endpoint")

    def test_update_party_event_toggle_active(self):
        """Test PUT /api/admin/party-events/{id} toggles is_active"""
        # Create an active event
        new_event = {
            "title": "TEST_Toggle Event",
            "venue": "Toggle Venue",
            "event_date": "Feb 5, 2026",
            "is_active": True
        }
        
        create_response = requests.post(f"{BASE_URL}/api/admin/party-events", json=new_event)
        assert create_response.status_code == 200
        event_id = create_response.json()['id']
        self.created_event_ids.append(event_id)
        
        # Toggle to inactive
        update_response = requests.put(f"{BASE_URL}/api/admin/party-events/{event_id}", json={"is_active": False})
        assert update_response.status_code == 200
        assert update_response.json().get('message') == "Party event updated"
        
        # Verify it's hidden from public
        public_response = requests.get(f"{BASE_URL}/api/party-events")
        public_events = public_response.json()
        found = next((e for e in public_events if e['id'] == event_id), None)
        assert found is None
        print(f"Event {event_id} toggled to inactive and hidden from public")
        
        # Toggle back to active
        update_response2 = requests.put(f"{BASE_URL}/api/admin/party-events/{event_id}", json={"is_active": True})
        assert update_response2.status_code == 200
        
        # Verify it's visible in public again
        public_response2 = requests.get(f"{BASE_URL}/api/party-events")
        public_events2 = public_response2.json()
        found2 = next((e for e in public_events2 if e['id'] == event_id), None)
        assert found2 is not None
        print(f"Event {event_id} toggled back to active and visible in public")

    def test_delete_party_event(self):
        """Test DELETE /api/admin/party-events/{id} deletes event"""
        # Create event to delete
        new_event = {
            "title": "TEST_Delete Event",
            "venue": "Delete Venue",
            "event_date": "Feb 10, 2026",
            "is_active": True
        }
        
        create_response = requests.post(f"{BASE_URL}/api/admin/party-events", json=new_event)
        assert create_response.status_code == 200
        event_id = create_response.json()['id']
        
        # Delete the event
        delete_response = requests.delete(f"{BASE_URL}/api/admin/party-events/{event_id}")
        assert delete_response.status_code == 200
        assert delete_response.json().get('message') == "Party event deleted"
        
        # Verify event no longer exists
        all_response = requests.get(f"{BASE_URL}/api/admin/party-events")
        all_events = all_response.json()
        found = next((e for e in all_events if e['id'] == event_id), None)
        assert found is None
        print(f"Event {event_id} successfully deleted")

    def test_delete_nonexistent_event_returns_404(self):
        """Test DELETE with invalid ID returns 404"""
        fake_id = "nonexistent-event-id-12345"
        response = requests.delete(f"{BASE_URL}/api/admin/party-events/{fake_id}")
        assert response.status_code == 404
        print("DELETE nonexistent event correctly returns 404")

    def test_existing_event_structure(self):
        """Test existing party event has correct structure (BFM Fashion Night 2026)"""
        known_event_id = "3ade0e8d-5770-4757-8dd6-deecd8ec7811"
        
        # Check admin endpoint
        response = requests.get(f"{BASE_URL}/api/admin/party-events")
        assert response.status_code == 200
        events = response.json()
        
        existing_event = next((e for e in events if e['id'] == known_event_id), None)
        if existing_event:
            # Verify structure
            assert 'title' in existing_event
            assert 'venue' in existing_event
            assert 'event_date' in existing_event
            assert 'is_active' in existing_event
            assert 'entry_code' in existing_event
            print(f"Found existing event: {existing_event['title']}, Entry Code: {existing_event.get('entry_code')}")
        else:
            print(f"Known event {known_event_id} not found - may have been deleted")
            # This is not a failure - event may have been cleaned up

    def test_event_with_all_fields(self):
        """Test creating event with all optional fields"""
        unique_code = f"FULL{uuid.uuid4().hex[:6].upper()}"
        full_event = {
            "title": "TEST_Full Event",
            "venue": "Full Venue, MG Road",
            "event_date": "March 15, 2026",
            "description": "A complete test event with all fields",
            "image": "https://example.com/image.jpg",
            "entry_code": unique_code,
            "booking_info": "Book via website or call",
            "contact": "9999888877",
            "is_active": True
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/party-events", json=full_event)
        assert response.status_code == 200
        event_id = response.json()['id']
        self.created_event_ids.append(event_id)
        
        # Verify all fields were saved
        all_response = requests.get(f"{BASE_URL}/api/admin/party-events")
        events = all_response.json()
        created = next((e for e in events if e['id'] == event_id), None)
        
        assert created is not None
        assert created['title'] == full_event['title']
        assert created['venue'] == full_event['venue']
        assert created['event_date'] == full_event['event_date']
        assert created['description'] == full_event['description']
        assert created['entry_code'] == full_event['entry_code']
        assert created['booking_info'] == full_event['booking_info']
        assert created['contact'] == full_event['contact']
        print(f"Event with all fields created and verified: {event_id}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
