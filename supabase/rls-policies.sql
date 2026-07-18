-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_briefs ENABLE ROW LEVEL SECURITY;

-- users: can only read/update own row
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- transactions: own rows only
CREATE POLICY "transactions_select_own" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert_own" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions_update_own" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "transactions_delete_own" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- agent_logs: own rows only
CREATE POLICY "agent_logs_select_own" ON agent_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "agent_logs_insert_own" ON agent_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- agent_chats: own rows only
CREATE POLICY "agent_chats_select_own" ON agent_chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "agent_chats_insert_own" ON agent_chats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- reports: own rows only
CREATE POLICY "reports_select_own" ON reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reports_insert_own" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- daily_briefs: own rows only
CREATE POLICY "daily_briefs_select_own" ON daily_briefs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_briefs_insert_own" ON daily_briefs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_briefs_update_own" ON daily_briefs FOR UPDATE USING (auth.uid() = user_id);
