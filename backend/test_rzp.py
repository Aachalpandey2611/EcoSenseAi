import razorpay
import sys

key_id = "rzp_test_T6ucwCgG5yugMN"
key_secret = "EjGv7x8bEyhMsP8YgWEFb99L"

try:
    client = razorpay.Client(auth=(key_id, key_secret))
    order_data = {
        "amount": 19900,
        "currency": "INR",
        "receipt": "receipt_test",
        "notes": {
            "tier": "pro"
        }
    }
    order = client.order.create(data=order_data)
    print("SUCCESS: Order Created:", order)
except Exception as e:
    print("FAILED:", e)
