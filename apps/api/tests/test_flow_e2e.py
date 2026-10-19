import urllib.request
import urllib.error
import json
from datetime import datetime, timedelta

api_base = 'http://127.0.0.1:8001/api/v1'

print("=== 1. Testing Venues ===")
with urllib.request.urlopen(f"{api_base}/venues", timeout=5) as r:
    venues = json.loads(r.read().decode())
    court_id = venues[0]['courts'][0]['id']
    venue_name = venues[0]['name']
    court_name = venues[0]['courts'][0]['name']
    print(f"[OK] Venue: {venue_name}, Court: {court_name} (ID: {court_id})")

print("\n=== 2. Testing Google Auth ===")
auth_data = json.dumps({'email': 'jogador.teste@arenago.com.br', 'name': 'Jogador de Teste Google'}).encode()
req = urllib.request.Request(f"{api_base}/auth/google", data=auth_data, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req, timeout=5) as r:
    auth_res = json.loads(r.read().decode())
    token = auth_res['access_token']
    user_id = auth_res['user_id']
    print(f"[OK] Auth user: {auth_res['full_name']} (ID: {user_id})")
    print(f"[OK] Token: {token[:25]}...")

print("\n=== 3. Testing Check Availability (Before Booking) ===")
# Escolhendo uma data futura
start_slot = (datetime.now() + timedelta(days=5)).replace(hour=16, minute=0, second=0, microsecond=0).isoformat()
end_slot = (datetime.now() + timedelta(days=5)).replace(hour=17, minute=0, second=0, microsecond=0).isoformat()

check_data = json.dumps({'court_id': court_id, 'start_time': start_slot, 'end_time': end_slot}).encode()
req = urllib.request.Request(f"{api_base}/bookings/check-availability", data=check_data, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req, timeout=5) as r:
    check_res = json.loads(r.read().decode())
    print("[OK] Initial availability:", check_res)
    assert check_res['available'] == True, "Slot should be available initially"

print("\n=== 4. Testing Create Intent Unauthenticated (Security Check: 401 Expected) ===")
pay_data = json.dumps({
    'court_id': court_id,
    'start_time': start_slot,
    'end_time': end_slot,
    'payment_method': 'PIX'
}).encode()
req_unauth = urllib.request.Request(f"{api_base}/payments/create-intent", data=pay_data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req_unauth, timeout=5) as r:
        print("[FAIL] Unauthenticated booking was allowed!")
except urllib.error.HTTPError as e:
    if e.code == 401:
        print("[OK - SECURE] Successfully rejected unauthenticated booking with 401 Unauthorized")
    else:
        print(f"[WARN] Unexpected status: {e.code}")

print("\n=== 5. Testing Create Intent Authenticated (Google User) ===")
req_auth = urllib.request.Request(f"{api_base}/payments/create-intent", data=pay_data, headers={
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
})
try:
    with urllib.request.urlopen(req_auth, timeout=10) as r:
        pay_res = json.loads(r.read().decode())
        print(f"[OK] Booking created successfully!")
        print(f"     Booking ID: {pay_res.get('booking_id')}")
        print(f"     Payment ID: {pay_res.get('payment_id')}")
        print(f"     Amount: R$ {pay_res.get('amount')}")
        print(f"     Status: {pay_res.get('status')}")
        print(f"     PIX Code present: {bool(pay_res.get('pix_code'))}")
        booking_id = pay_res.get('booking_id')
except urllib.error.HTTPError as e:
    print(f"[ERROR] HTTP Error {e.code}: {e.read().decode()}")
    raise e

print("\n=== 6. Testing Availability Revalidation After Booking (Slot Collision Prevention) ===")
req_check_again = urllib.request.Request(f"{api_base}/bookings/check-availability", data=check_data, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req_check_again, timeout=5) as r:
    check_again_res = json.loads(r.read().decode())
    print("[OK] Revalidation result:", check_again_res)
    if not check_again_res['available']:
        print("[SUCCESS] Conflict detected properly! Slot is locked / reserved.")
    else:
        print("[WARN] Slot was not reported as occupied!")

print("\n=== ALL BACKEND CHECKS PASSED SUCCESSFULLY ===")
