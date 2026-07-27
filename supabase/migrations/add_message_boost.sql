-- Message Boost add-on: one-time purchase of extra messages when a user
-- hits their daily plan cap. Bonus pool persists across days until spent.

ALTER TABLE users ADD COLUMN IF NOT EXISTS bonus_messages integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION decrement_bonus_messages(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET bonus_messages = GREATEST(bonus_messages - 1, 0)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
