"""
Direct psycopg2 script to backfill gamification points from existing activities.
Run with: .\\venv\\Scripts\\python.exe fix_gamification_sync.py
"""
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5433,
    database="ecosense",
    user="ecosense",
    password="ecosense"
)
cur = conn.cursor()

# Get all users
cur.execute("SELECT id, email FROM users WHERE is_active = TRUE")
users = cur.fetchall()

print(f"Found {len(users)} users")

for user_id, email in users:
    # Sum absolute impact from all activities
    cur.execute("SELECT COALESCE(SUM(ABS(impact_score)), 0) FROM activities WHERE user_id = %s", (user_id,))
    total_impact = int(cur.fetchone()[0])
    
    # Get current gamification points
    cur.execute("SELECT id, total_eco_points FROM gamification_profiles WHERE user_id = %s", (user_id,))
    gp = cur.fetchone()
    
    if gp:
        gp_id, current_points = gp
        print(f"User {email}: current={current_points} pts, activities impact={total_impact} pts")
        if current_points < total_impact:
            cur.execute("UPDATE gamification_profiles SET total_eco_points = %s WHERE id = %s", (total_impact, gp_id))
            print(f"  ✅ Updated to {total_impact} pts")
    else:
        print(f"User {email}: no gamification profile, creating with {total_impact} pts")
        cur.execute(
            "INSERT INTO gamification_profiles (id, user_id, total_eco_points, current_level, current_streak, highest_streak, created_at, updated_at) "
            "VALUES (gen_random_uuid(), %s, %s, 'Eco Rookie', 0, 0, NOW(), NOW())",
            (user_id, total_impact)
        )

conn.commit()
cur.close()
conn.close()
print("✅ Done! Gamification points synced.")
