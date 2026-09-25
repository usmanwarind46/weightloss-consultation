// Patient ke gender/pregnancy se related shared checks.
// Gender API se "Female" / "female" dono shakal me aa sakta hai, isliye
// har jagah lowercase compare karte hain.

export const PREGNANCY_BLOCK_MESSAGE =
  "This treatment is not suitable if you are pregnant, trying to get pregnant or breastfeeding. We recommend you speak to your GP in person.";

export const isFemalePatient = (patientInfo) =>
  String(patientInfo?.gender || "").trim().toLowerCase() === "female";

// Female hai aur pregnancy ka jawab "no" nahi hai (yes ya bilkul khali) —
// dono suraton me aage nahi jaane dena.
export const isPregnancyBlocked = (patientInfo) =>
  isFemalePatient(patientInfo) &&
  String(patientInfo?.pregnancy || "").trim().toLowerCase() !== "no";
