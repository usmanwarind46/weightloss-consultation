// Evidence of previous treatment for a high dose, saved per dose id until the
// order exists. It lives in IndexedDB because a File cannot be stored in
// localStorage (the cart store), and it has to survive a page reload between
// the dosage page and checkout.

const DB_NAME = "weightloss-high-dose-evidence";
const STORE = "evidence";

const openDb = () =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const run = async (mode, action) => {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = action(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request?.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
};

// entry: { file, medication_name, dosage, dosage_time }
export const saveHighDoseEvidence = (doseId, entry) =>
  run("readwrite", (store) => store.put(entry, String(doseId)));

export const getHighDoseEvidence = (doseId) =>
  run("readonly", (store) => store.get(String(doseId)));

export const deleteHighDoseEvidence = (doseId) =>
  run("readwrite", (store) => store.delete(String(doseId)));

export const getAllHighDoseEvidenceIds = () =>
  run("readonly", (store) => store.getAllKeys());

// A saved entry belongs to a cart dose only if the dose still needs consent
// and its confirmed details are the ones saved with the file.
export const evidenceMatchesDose = (entry, dose) =>
  Boolean(
    entry?.file &&
      dose?.product_concent &&
      dose?.consentGiven &&
      entry.medication_name === dose.medication_name &&
      entry.dosage === dose.dosage &&
      entry.dosage_time === dose.dosage_time,
  );

const MAX_RETRIES = 3;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// One request, retried up to MAX_RETRIES times (1s, 2s, 3s apart).
const postWithRetry = async (upload, buildFormData) => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // A fresh FormData each time so a retry never reuses a sent body.
      await upload(buildFormData());
      return true;
    } catch (err) {
      console.error(
        `Dosage document upload failed (attempt ${attempt + 1}/${MAX_RETRIES + 1})`,
        err,
      );
      if (attempt < MAX_RETRIES) await wait(1000 * (attempt + 1));
    }
  }
  return false;
};

// Called once order/consultationMayfair has returned the order id, before the
// payment page opens. Only doses that were actually sent in that request are
// uploaded, and only when the saved file still matches the dose's confirmed
// details, so a dose the user unselected or swapped is never sent.
// Returns true when every high dose in the order has its document uploaded
// (or the order has no high dose), false otherwise.
export const uploadHighDoseEvidenceForOrder = async (orderId, sentDoses = []) => {
  const highDoses = sentDoses.filter((dose) => dose?.product_concent);

  // Files saved for doses that are not in this order are no longer needed.
  try {
    const sentIds = new Set(sentDoses.map((dose) => String(dose.id)));
    const savedIds = await getAllHighDoseEvidenceIds();
    await Promise.all(
      savedIds
        .filter((id) => !sentIds.has(String(id)))
        .map((id) => deleteHighDoseEvidence(id)),
    );
  } catch (err) {
    if (highDoses.length === 0) return true;
  }

  if (highDoses.length === 0) return true;
  if (!orderId) return false;

  const { HighDoseEvidenceUpload } = await import("@/api/HighDoseEvidenceApi");

  for (const dose of highDoses) {
    let entry;
    try {
      entry = await getHighDoseEvidence(dose.id);
    } catch (err) {
      entry = null;
    }
    if (!evidenceMatchesDose(entry, dose)) {
      console.error("Dosage document missing for dose", dose.id);
      return false;
    }

    const uploaded = await postWithRetry(HighDoseEvidenceUpload, () => {
      const formData = new FormData();
      formData.append("order_id", orderId);
      formData.append("item_id", dose.item_id ?? dose.id);
      formData.append("medication_name", dose.medication_name);
      formData.append("dosage", dose.dosage);
      formData.append("dosage_time", dose.dosage_time);
      formData.append("evidence", entry.file, entry.file.name);
      return formData;
    });
    if (!uploaded) return false;
  }

  return true;
};
