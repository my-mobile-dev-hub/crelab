-- RLS Policies for Payment Expansion tables

ALTER TABLE "wallets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wallet_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "booking_milestones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "processed_webhook_events" ENABLE ROW LEVEL SECURITY;

-- Wallets: user can only read/update their own wallet
CREATE POLICY wallets_select_own ON "wallets"
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY wallets_update_own ON "wallets"
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Wallet transactions: user can only read transactions on their own wallet
CREATE POLICY wallet_transactions_select_own ON "wallet_transactions"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "wallets" WHERE "wallets".id = wallet_id AND "wallets".user_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'ADMIN'
  );

-- Booking milestones: client and provider on the booking can read; server-side writes
CREATE POLICY booking_milestones_select_involved ON "booking_milestones"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "bookings" WHERE "bookings".id = booking_id AND ("bookings".client_id = auth.uid() OR "bookings".provider_id IN (SELECT id FROM "providers" WHERE user_id = auth.uid())))
    OR auth.jwt() ->> 'role' = 'ADMIN'
  );

-- Processed webhook events: admin only
CREATE POLICY processed_webhook_events_select_admin ON "processed_webhook_events"
  FOR SELECT USING (auth.jwt() ->> 'role' = 'ADMIN');
