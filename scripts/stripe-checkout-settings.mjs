import { readFileSync } from 'node:fs';

export const STRIPE_ACCOUNT_ID = 'acct_1TBaml3SIDKPozJg';
export const LIVE_PRICE_ID = 'price_1Uauhs3SIDKPozJgG76NVzVE';
export const TEST_PRODUCT_ID = 'prod_Vb8fRfea3E5K6M';
export const PERSONAL_UTILITY_TAX_CODE = 'txcd_10202001';
export const WEBHOOK_URL = 'https://stowgui-license.trainvent.workers.dev/stripe/webhook';
export const SUCCESS_URL = 'https://stowgui.com/buy/success/';
export const INVOICE_FOOTER = 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.';
export const CONSENT = 'I agree to the [terms](https://stowgui.com/en/terms/) and that delivery of the license key begins immediately. I know that I lose my right of withdrawal once delivery has begun. / Ich stimme den [AGB](https://stowgui.com/de/terms/) zu und dass die Lieferung des Lizenzschlüssels sofort beginnt. Mir ist bekannt, dass ich dadurch mit Beginn der Lieferung mein Widerrufsrecht verliere.';
export const EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'charge.refunded', 'charge.dispute.closed'];

function commonSettings(price, successUrl) {
  const manifest = JSON.parse(readFileSync(new URL('../worker/src/legal/manifest.json', import.meta.url)));
  const params = {
    'line_items[0][price]': price, 'line_items[0][quantity]': '1',
    billing_address_collection: 'required', 'consent_collection[terms_of_service]': 'required',
    'after_completion[type]': 'redirect', 'after_completion[redirect][url]': successUrl,
    'metadata[app]': 'stowgui', 'metadata[legal_source_sha256]': manifest.source,
  };
  for (const [name, hash] of Object.entries(manifest.pdfs)) params[`metadata[${name.replaceAll('.', '_')}]`] = hash;
  return { params, manifest };
}

export function checkoutSettings(price, successUrl = SUCCESS_URL) {
  const { params, manifest } = commonSettings(price, successUrl);
  return { params: { ...params,
    'custom_text[terms_of_service_acceptance][message]': CONSENT,
    'invoice_creation[enabled]': 'true', 'invoice_creation[invoice_data][footer]': INVOICE_FOOTER,
  }, manifest };
}

export function managedCheckoutSettings(price, successUrl = SUCCESS_URL) {
  const { params, manifest } = commonSettings(price, successUrl);
  delete params['consent_collection[terms_of_service]'];
  return { params: { ...params, 'managed_payments[enabled]': 'true', 'metadata[checkout_provider]': 'managed' }, manifest };
}
