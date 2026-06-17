// lib/customerlabs.js
//
// Reusable CustomerLabs Purchased event tracking helper.
// Wraps the CustomerLabs JS API quirks (typed { t, v } wrappers, the `ib: true`
// identify flag, external_ids) in one place so components stay clean.
//
// Usage from any form's success handler:
//
//   import { trackCustomerLabsPurchased } from "@/config/CustomerLabs";
//
//   trackCustomerLabsPurchased({
//     formName: "Thank You - Order Placed",
//     formId: "onlineweightlossclinic_thankyou_order",
//     dedupeKey: `customerlabs_purchased_thankyou_${orderId}`,
//     identity: { firstName, lastName, email, phone, userId },
//     properties: {
//       currency: "GBP",
//       value: orderTotal,
//       transaction_id: orderId,
//       order_id: orderId,
//       event_source: "thank_you_page",
//     },
//     productProperties: [ ... ],
//   });

/** Wrap a primitive value in CustomerLabs' { t, v } descriptor. */
const str = (value) => ({ t: "string", v: value == null ? "" : String(value) });
const num = (value) => ({ t: "number", v: parseFloat(value) || 0 });

/**
 * Fire a CustomerLabs identify + Purchased event.
 * Safe to call anywhere — no-ops on the server or if the script isn't loaded.
 */
export function trackCustomerLabsPurchased({
  formName,
  formId,
  identity = {},
  properties = {},
  productProperties = [],
  dedupeKey = null,
  eventName = "Purchased",
} = {}) {
  // Guard: server-side render or script not ready.
  if (typeof window === "undefined") return;
  if (!window._cl) {
    console.warn("CustomerLabs: _cl not loaded — event skipped");
    return;
  }

  // Guard: avoid firing the same event twice (refresh / re-submit).
  if (dedupeKey && localStorage.getItem(dedupeKey)) {
    return;
  }

  const {
    firstName = "",
    lastName = "",
    email = "",
    phone = "",
    userId = "",
  } = identity;

  // Need at least one identifier for CustomerLabs to tie the event to a profile.
  if (!email && !phone) {
    console.warn("CustomerLabs: no email or phone — event skipped");
    return;
  }

  // --- Build user_traits -------------------------------------------------
  const userTraits = {
    first_name: str(firstName),
    last_name: str(lastName),
  };
  if (email) userTraits.email = str(email);
  if (phone) userTraits.phone = str(phone);
  if (userId) userTraits.user_id = str(userId);

  // --- Build the full property payload ----------------------------------
  const customProperties = {
    user_traits: { t: "Object", v: userTraits },
    form_name: str(formName),
    form_id: str(formId),
    page_url: str(window.location.href),
  };

  // Merge caller-supplied extra properties.
  // "value" must be number type per CL docs, everything else is string.
  for (const [key, value] of Object.entries(properties)) {
    if (key === "value") {
      customProperties[key] = num(value);
    } else {
      customProperties[key] = str(value);
    }
  }

  // Identifiers CustomerLabs uses to resolve the profile.
  if (email) {
    customProperties.identify_by_email = { t: "string", v: email, ib: true };
  }
  if (phone) {
    customProperties.external_ids = {
      t: "Object",
      v: { identify_by_phone: str(phone) },
    };
  }

  const payload = {
    customProperties,
    ...(productProperties.length > 0 && { productProperties }),
  };

  // --- Fire --------------------------------------------------------------
  // Per CL docs: Purchased event fires trackClick first, then identify
  // with the full payload containing both customProperties and productProperties.
  window._cl.trackClick(eventName, payload);

  if (email) {
    window._cl.identify(payload);
  }

  if (dedupeKey) {
    localStorage.setItem(dedupeKey, "true");
  }
}
