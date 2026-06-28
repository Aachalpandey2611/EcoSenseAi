from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
import razorpay
import hmac
import hashlib
from pydantic import BaseModel

from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter()

# Initialize Razorpay Client
try:
    rzp_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
except Exception as e:
    rzp_client = None
    print(f"Failed to initialize Razorpay Client: {e}")


class OrderCreateResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str


class PaymentVerifyRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str


@router.post("/create-order", response_model=OrderCreateResponse)
async def create_order(current_user: User = Depends(get_current_active_user)):
    """Create a Razorpay order for upgrading to Pro tier."""
    if not rzp_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Payment gateway is not configured properly."
        )

    # ₹199 per month = 19900 paise
    amount = 19900
    currency = "INR"

    try:
        # We need to run the Razorpay SDK call in a thread or just synchronously
        # since it's a blocking HTTP call. FastAPI handles it okay if it's quick.
        order_data = {
            "amount": amount,
            "currency": currency,
            "receipt": f"receipt_{str(current_user.id)[:8]}",
            "notes": {
                "user_id": str(current_user.id),
                "email": current_user.email,
                "tier": "pro"
            }
        }
        order = rzp_client.order.create(data=order_data)

        return OrderCreateResponse(
            order_id=order["id"],
            amount=order["amount"],
            currency=order["currency"],
            key_id=settings.RAZORPAY_KEY_ID
        )
    except Exception as e:
        print(f"Error creating Razorpay order: {e}")
        # HACKATHON DEMO FAILSAFE:
        # If the campus/office Wi-Fi drops the connection to Razorpay,
        # return a demo bypass token so the user can still be upgraded for the pitch!
        return OrderCreateResponse(
            order_id="demo_bypassed_order",
            amount=amount,
            currency=currency,
            key_id="demo"
        )


@router.post("/verify")
async def verify_payment(
    payload: PaymentVerifyRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify the Razorpay payment signature and upgrade user."""
    
    # Normally you'd use rzp_client.utility.verify_payment_signature, 
    # but doing it manually is also straightforward and avoids exceptions.
    msg = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"
    secret = settings.RAZORPAY_KEY_SECRET.encode("utf-8")
    
    generated_signature = hmac.new(
        secret,
        msg.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    if payload.razorpay_order_id == "demo_bypassed_order":
        print("Demo Mode fallback active - Bypassing signature check")
    elif generated_signature != payload.razorpay_signature:
        # In test mode with dummy keys, we can bypass this for the hackathon
        # if the user hasn't set up real keys yet.
        if settings.RAZORPAY_KEY_ID == "rzp_test_dummy_key_id":
            print("WARNING: Bypassing signature verification because dummy keys are in use.")
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment signature."
            )

    # Upgrade the user
    try:
        current_user.subscription_tier = "pro"
        db.add(current_user)
        await db.commit()
        await db.refresh(current_user)
        return {"status": "success", "message": "Successfully upgraded to Pro!"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user tier."
        )
