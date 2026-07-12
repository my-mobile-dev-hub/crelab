export class InsufficientBalanceError extends Error {
  status = 400;
  code = "INSUFFICIENT_BALANCE" as const;
  constructor(message = "Insufficient wallet balance") {
    super(message);
    this.name = "InsufficientBalanceError";
  }
}

export class MilestoneAmountMismatchError extends Error {
  status = 400;
  code = "MILESTONE_AMOUNT_MISMATCH" as const;
  constructor(message = "Milestone amounts do not match booking total") {
    super(message);
    this.name = "MilestoneAmountMismatchError";
  }
}

export class MilestoneLimitError extends Error {
  status = 400;
  code = "MILESTONE_LIMIT_EXCEEDED" as const;
  constructor(message = "Maximum 5 milestones per booking") {
    super(message);
    this.name = "MilestoneLimitError";
  }
}

export class MilestoneMinimumError extends Error {
  status = 400;
  code = "MILESTONE_MINIMUM_REQUIRED" as const;
  constructor(message = "Minimum 2 milestones required") {
    super(message);
    this.name = "MilestoneMinimumError";
  }
}

export class WebhookSignatureError extends Error {
  status = 401;
  code = "INVALID_WEBHOOK_SIGNATURE" as const;
  constructor(message = "Invalid webhook signature") {
    super(message);
    this.name = "WebhookSignatureError";
  }
}

export class DuplicateWebhookError extends Error {
  status = 200;
  code = "DUPLICATE_WEBHOOK" as const;
  constructor(message = "Duplicate webhook event") {
    super(message);
    this.name = "DuplicateWebhookError";
  }
}
