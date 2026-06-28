import asyncio
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import select, func
from app.core.config import settings
from app.models.activity import Activity
from app.models.gamification import GamificationProfile
from app.models.user import User

async def main():
    engine = create_async_engine(str(settings.DATABASE_URL))
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as db:
        # Find all users
        users = (await db.execute(select(User))).scalars().all()
        for user in users:
            # Get their activities total impact
            stmt_acts = select(Activity).where(Activity.user_id == user.id)
            acts = (await db.execute(stmt_acts)).scalars().all()
            total_impact = sum(abs(int(a.impact_score)) for a in acts)
            
            # Get gamification profile
            stmt_gp = select(GamificationProfile).where(GamificationProfile.user_id == user.id)
            gp = (await db.execute(stmt_gp)).scalar_one_or_none()
            if not gp:
                gp = GamificationProfile(user_id=user.id, total_eco_points=0)
                db.add(gp)
            
            print(f"User {user.email}: current gamification points {gp.total_eco_points}, actual activities impact {total_impact}")
            
            # Correct points
            if gp.total_eco_points < total_impact:
                gp.total_eco_points = total_impact
                print(f"Updated {user.email} points to {total_impact}")
                
        await db.commit()

asyncio.run(main())
