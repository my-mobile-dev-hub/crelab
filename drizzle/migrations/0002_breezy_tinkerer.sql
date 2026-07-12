CREATE TYPE "public"."bug_report_severity" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."bug_report_status" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('PENDING', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'DISPUTED', 'RELEASED', 'REFUNDED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."payment_mode" AS ENUM('ESCROW', 'MILESTONE', 'DIRECT');--> statement-breakpoint
CREATE TYPE "public"."wallet_transaction_type" AS ENUM('TOPUP_CARD', 'TOPUP_BANK', 'BOOKING_DEBIT', 'ESCROW_HOLD', 'ESCROW_RELEASE', 'MILESTONE_DEBIT', 'MILESTONE_RELEASE', 'DIRECT_PAYMENT_DEBIT', 'DIRECT_PAYMENT_CREDIT', 'WITHDRAWAL', 'FEE_DEBIT', 'REFUND');--> statement-breakpoint
CREATE TABLE "booking_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" text NOT NULL,
	"index" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"amount_kobo" integer NOT NULL,
	"fee_kobo" integer NOT NULL,
	"status" "milestone_status" DEFAULT 'PENDING' NOT NULL,
	"due_date" timestamp with time zone,
	"funded_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"released_at" timestamp with time zone,
	"review_deadline" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bug_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"steps_to_reproduce" text,
	"expected_behavior" text,
	"actual_behavior" text,
	"severity" "bug_report_severity" DEFAULT 'MEDIUM' NOT NULL,
	"status" "bug_report_status" DEFAULT 'OPEN' NOT NULL,
	"page_url" text,
	"user_agent" text,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"admin_notes" text,
	"resolved_at" timestamp with time zone,
	"resolved_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processed_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"paystack_ref" text NOT NULL,
	"event_type" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "processed_webhook_events_paystack_ref_unique" UNIQUE("paystack_ref")
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"type" "wallet_transaction_type" NOT NULL,
	"amount_kobo" integer NOT NULL,
	"direction" text NOT NULL,
	"balance_after_kobo" integer NOT NULL,
	"reference" text NOT NULL,
	"related_booking_id" text,
	"related_milestone_id" uuid,
	"paystack_ref" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wallet_transactions_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"balance_kobo" integer DEFAULT 0 NOT NULL,
	"escrow_kobo" integer DEFAULT 0 NOT NULL,
	"total_earned_kobo" integer DEFAULT 0 NOT NULL,
	"dva_account_number" text,
	"dva_bank_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_mode" "payment_mode" DEFAULT 'ESCROW' NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_milestones" ADD CONSTRAINT "booking_milestones_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_resolved_by_id_user_id_fk" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_related_booking_id_bookings_id_fk" FOREIGN KEY ("related_booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_related_milestone_id_booking_milestones_id_fk" FOREIGN KEY ("related_milestone_id") REFERENCES "public"."booking_milestones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "booking_milestones_booking_id_index_unique" ON "booking_milestones" USING btree ("booking_id","index");