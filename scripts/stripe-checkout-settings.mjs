import { readFileSync } from 'node:fs';

export const STRIPE_ACCOUNT_ID = 'acct_1TBaml3SIDKPozJg';
export const TEST_PRODUCT_ID = 'prod_Vb8fRfea3E5K6M';
export const PERSONAL_UTILITY_TAX_CODE = 'txcd_10202001';
export const SUCCESS_URL = 'https://stowgui.com/buy/success/';
export const EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'charge.refunded', 'charge.dispute.closed'];

export function checkoutSettings(price, successUrl = SUCCESS_URL) {
  const manifest = JSON.parse(readFileSync(new URL('../worker/src/legal/manifest.json', import.meta.url)));
  const params = {
    'line_items[0][price]': price, 'line_items[0][quantity]': '1',
    billing_address_collection: 'required', 'consent_collection[terms_of_service]': 'required',
    'after_completion[type]': 'redirect', 'after_completion[redirect][url]': successUrl,
    'managed_payments[enabled]': 'true',
    'metadata[app]': 'stowgui', 'metadata[legal_source_sha256]': manifest.source,
  };
  for (const [name, hash] of Object.entries(manifest.pdfs)) params[`metadata[${name.replaceAll('.', '_')}]`] = hash;
  return { params, manifest };
}
