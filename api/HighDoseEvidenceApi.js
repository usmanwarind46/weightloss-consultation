import Fetcher from "@/library/Fetcher";

// POST /api/order/dosage-document (app_url already ends with /api/)
export const HIGH_DOSE_EVIDENCE_ENDPOINT = "order/dosage-document";

// data: FormData with order_id, item_id, medication_name, dosage, dosage_time, evidence
export const HighDoseEvidenceUpload = async (data) => {
  return Fetcher.post(HIGH_DOSE_EVIDENCE_ENDPOINT, data);
};

export default { HighDoseEvidenceUpload };
