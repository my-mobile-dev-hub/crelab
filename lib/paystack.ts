import crypto from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE = "https://api.paystack.co";

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

function getHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    "Content-Type": "application/json",
  };
}

export async function initTransaction(
  amountKobo: number,
  email: string,
  ref: string,
): Promise<{
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      amount: amountKobo,
      email,
      reference: ref,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack init failed: ${res.status} ${body}`);
  }

  const json: PaystackInitResponse = await res.json();
  if (!json.status) {
    throw new Error(`Paystack init error: ${json.message}`);
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secretKey: string,
): boolean {
  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

export async function subaccountSplit(
  paymentId: string,
): Promise<{
  subaccountCode: string;
  splitCode: string;
}> {
  const res = await fetch(`${PAYSTACK_BASE}/split`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      type: "flat",
      currency: "NGN",
      subaccounts: [{ subaccount: paymentId, share: 0 }],
      bearer_type: "subaccount",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack split failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  return {
    subaccountCode: json.data.subaccount_code,
    splitCode: json.data.split_code,
  };
}

export async function initiateTransfer(
  amountKobo: number,
  recipientCode: string,
  reference: string,
): Promise<{ transferCode: string }> {
  const res = await fetch(`${PAYSTACK_BASE}/transfer`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      source: "balance",
      amount: amountKobo,
      recipient: recipientCode,
      reference,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack transfer failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  if (!json.status) {
    throw new Error(`Paystack transfer error: ${json.message}`);
  }

  return { transferCode: json.data.transfer_code };
}

export async function createDedicatedVirtualAccount(
  customerEmail: string,
  customerName: string,
  phone?: string,
): Promise<{
  accountNumber: string;
  bankName: string;
}> {
  const res = await fetch(`${PAYSTACK_BASE}/dedicated_account`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      customer: {
        email: customerEmail,
        name: customerName,
        phone: phone ?? null,
      },
      preferred_bank: "wema-bank",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack DVA creation failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  if (!json.status) {
    throw new Error(`Paystack DVA creation error: ${json.message}`);
  }

  return {
    accountNumber: json.data.dedicated_account.account_number,
    bankName: json.data.dedicated_account.bank.name,
  };
}

export async function getTransferRecipient(
  bankCode: string,
  accountNumber: string,
  name: string,
): Promise<{ recipientCode: string }> {
  const res = await fetch(`${PAYSTACK_BASE}/transferrecipient`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      type: "nuban",
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack recipient creation failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  if (!json.status) {
    throw new Error(`Paystack recipient creation error: ${json.message}`);
  }

  return { recipientCode: json.data.recipient_code };
}

export async function refund(paystackRef: string): Promise<void> {
  const res = await fetch(`${PAYSTACK_BASE}/refund`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      reference: paystackRef,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack refund failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  if (!json.status) {
    throw new Error(`Paystack refund error: ${json.message}`);
  }
}
