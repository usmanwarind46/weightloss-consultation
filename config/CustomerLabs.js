// lib/customerlabs.js
//
// Reusable CustomerLabs lead tracking helper.
// Wraps the CustomerLabs JS API quirks (typed { t, v } wrappers, the `ib: true`
// identify flag, external_ids) in one place so components stay clean.
//
// Usage from any form's success handler:
//
//   import { trackCustomerLabsLead } from "@/lib/customerlabs";
//
//   trackCustomerLabsLead({
//     formName: "Consultation Form",
//     formId: "mayfair_consultation_form",
//     dedupeKey: `lead_${consultationId}`,        // optional, prevents double-fire
//     identity: { firstName, lastName, email, phone, userId },
//     properties: {                                // optional extra event data
//       consultation_id: consultationId,
//       product_id: productId,
//       product_name: productName,
//       treatment_name: productName,
//       event_source: "confirmation_summary_success",
//     },
//   });;

/** Wrap a primitive value in CustomerLabs' { t, v } descriptor.. */
const str = (value) => ({ t: "string", v: value == null ? "" : String(value) });

/**
 * Fire a CustomerLabs identify + Lead submit event.
 * Safe to call anywhere — no-ops on the server or if the script isn't loaded.
 */
export function trackCustomerLabsLead({
  formName,
  formId,
  identity = {},
  properties = {},
  dedupeKey = null,
  eventName = "Lead",
} = {}) {
  // Guard: server-side render or script not ready.
  if (typeof window === "undefined") return;
  if (!window._cl) {
    console.warn("CustomerLabs: _cl not loaded — event skipped");
    return;
  }

  // Guard: avoid firing the same lead twice (refresh / re-submit).
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

  // Need at least one identifier for CustomerLabs to tie the lead to a profile.
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

  // Merge any caller-supplied extra properties (product, ids, source, etc.).
  for (const [key, value] of Object.entries(properties)) {
    customProperties[key] = str(value);
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

  const payload = { customProperties };

  // --- Fire --------------------------------------------------------------
  window._cl.identify(payload);
  window._cl.trackClick(eventName, payload);

  if (dedupeKey) {
    localStorage.setItem(dedupeKey, "true");
  }
}
