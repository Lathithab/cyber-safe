// Redraws a photo onto a canvas and returns a resized JPEG data URL.
// This drops hidden metadata such as GPS location and keeps the stored
// image small. Used by both the report form and the feed's post box.

const MAX_EVIDENCE_SIDE = 1280;

export function readEvidenceImage(file) {
  if (!file?.type.startsWith("image/")) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const fail = () =>
      reject(new Error("The selected image could not be read."));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(
          1,
          MAX_EVIDENCE_SIDE / Math.max(img.width, img.height),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      } catch {
        fail();
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      fail();
    };
    img.src = url;
  });
}
