// GP letter upload ke liye file checks. Sirf allowed formats pass hote hain, aur
// file ke andar ke bytes bhi dekhte hain taake .bat ya .exe ko rename karke
// .pdf ya .jpg bana dene se upload na ho sake.

export const GP_LETTER_MAX_SIZE_MB = 50;

export const GP_LETTER_ACCEPT =
  ".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.avif,application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif";

export const GP_LETTER_FORMATS_TEXT = `PDF, JPEG, PNG, WEBP, HEIC, HEIF or AVIF · Maximum ${GP_LETTER_MAX_SIZE_MB} MB`;

const INVALID_TYPE_MESSAGE =
  "This file type is not allowed. Please upload a PDF or an image (JPEG, PNG, WEBP, HEIC, HEIF or AVIF).";

const EXTENSION_KIND = {
  pdf: "pdf",
  jpg: "image",
  jpeg: "image",
  png: "image",
  webp: "image",
  heic: "image",
  heif: "image",
  avif: "image",
};

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
];

const HEIF_BRANDS = ["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1", "avif", "avis"];

const ascii = (bytes, start, end) =>
  String.fromCharCode(...bytes.slice(start, end));

const startsWith = (bytes, signature) =>
  signature.every((byte, index) => bytes[index] === byte);

const detectKind = (bytes) => {
  if (ascii(bytes, 0, 5) === "%PDF-") return "pdf";
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image";
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") return "image";
  if (ascii(bytes, 4, 8) === "ftyp" && HEIF_BRANDS.includes(ascii(bytes, 8, 12))) return "image";
  return null;
};

export const getFileExtension = (name = "") =>
  name.includes(".") ? name.split(".").pop().trim().toLowerCase() : "";

/** Resolves with an error message for the patient, or null if the file is fine. */
export const validateGpLetterFile = async (file) => {
  const kind = EXTENSION_KIND[getFileExtension(file?.name)];
  if (!kind) return INVALID_TYPE_MESSAGE;

  // Some browsers leave the type empty for HEIC; the bytes are checked below anyway.
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) return INVALID_TYPE_MESSAGE;

  if (file.size === 0) {
    return "This file appears to be empty. Please choose another file.";
  }
  if (file.size > GP_LETTER_MAX_SIZE_MB * 1024 * 1024) {
    return `File too large. Maximum allowed size is ${GP_LETTER_MAX_SIZE_MB} MB.`;
  }

  const buffer = await file.slice(0, 12).arrayBuffer();
  if (detectKind(new Uint8Array(buffer)) !== kind) return INVALID_TYPE_MESSAGE;

  return null;
};

// HEIC browser mein preview nahi hota, is liye photo upload ki tarah JPEG mein convert
export const convertHeicToJpeg = async (file) => {
  const { heicTo } = await import("heic-to");
  try {
    const blob = await heicTo({ blob: file, toType: "image/jpeg", quality: 0.9 });
    return new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
      type: "image/jpeg",
    });
  } catch (err) {
    return file;
  }
};
