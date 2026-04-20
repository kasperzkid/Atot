// src/lib/chapaService.ts

export interface ChapaCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface ChapaOrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface ChapaInitPayload {
  customer: ChapaCustomer;
  amount: number;
  orderItems: ChapaOrderItem[];
  callbackUrl?: string;
}

export interface ChapaInitResult {
  checkout_url: string;
  tx_ref: string;
  reference: string;
}

export function generateTxRef(): string {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ATOT-${Date.now()}-${rand}`;
}

export async function initializeChapaPayment(
  payload: ChapaInitPayload
): Promise<ChapaInitResult> {
  const secretKey = import.meta.env.VITE_CHAPA_SECRET_KEY as string;

  if (!secretKey) {
    throw new Error('VITE_CHAPA_SECRET_KEY is not set in your .env file.');
  }

  const tx_ref = generateTxRef();

  // Bare minimum payload — customization omitted entirely to avoid
  // Chapa's checkInGroup crash on their checkout page
  const body = {
    amount: payload.amount.toFixed(2),
    currency: 'ETB',
    email: payload.customer.email,
    first_name: payload.customer.firstName,
    last_name: payload.customer.lastName,
    tx_ref,
    return_url: payload.callbackUrl || `${window.location.origin}/menu?status=success`,
    meta: {
      invoices: payload.orderItems.map(item => ({
        key: item.name,
        value: `${item.qty}pcs`
      }))
    }
  };

  const response = await fetch('/api/chapa-init', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Chapa error ${response.status}: ${text}`);
  }

  const data = await response.json();

  if (data.status !== 'success' || !data.data?.checkout_url) {
    throw new Error(data.message ?? 'Chapa did not return a checkout URL.');
  }

  // Chapa API can be inconsistent with reference field naming/location.
  // We check multiple common fields.
  const officialRef = data.data.reference || data.data.id || data.data.transaction_id;

  // If still missing, we attempt a 'safe' extraction from the URL.
  // We only take the last part if it looks like a typical short reference ID (~10-15 chars).
  // Long strings (>30 chars) are usually tokens and should be ignored.
  let extractedRef = "";
  const urlParts = data.data.checkout_url.split('/');
  const lastPart = urlParts[urlParts.length - 1] || "";
  if (lastPart.length > 5 && lastPart.length < 25) {
    extractedRef = lastPart;
  }

  return { 
    checkout_url: data.data.checkout_url, 
    tx_ref,
    reference: officialRef || extractedRef || ""
  };
}
export async function verifyChapaPayment(tx_ref: string): Promise<string> {
  const secretKey = import.meta.env.VITE_CHAPA_SECRET_KEY as string;

  if (!secretKey) {
    throw new Error('VITE_CHAPA_SECRET_KEY is not set.');
  }

  const response = await fetch(`/api/chapa-verify/${tx_ref}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Verification failed: ${text}`);
  }

  const data = await response.json();
  if (data.status !== 'success' || data.data.status !== 'success') {
    throw new Error('Transaction was not successful or was not found.');
  }

  // Return the official Chapa reference ID
  return data.data.reference;
}
