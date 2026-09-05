const MAX_INPUT_BYTES = 15 * 1024 * 1024;

export type CompressedImage = {
  file: File;
  originalBytes: number;
  compressedBytes: number;
};

function loadImage(file: File): Promise<{ source: CanvasImageSource; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ source: image, width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This image could not be read."));
    };
    image.src = url;
  });
}

async function decodeImage(file: File) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {
      // Some browsers cannot decode every image format through createImageBitmap.
    }
  }

  const image = await loadImage(file);
  return { ...image, close: () => undefined };
}

export async function compressImageToWebp(file: File, maxDimension = 1600, quality = 0.86): Promise<CompressedImage> {
  if (!file.type.startsWith("image/")) throw new Error("Choose a JPG, PNG or WebP image.");
  if (file.size > MAX_INPUT_BYTES) throw new Error("Choose an image smaller than 15 MB.");

  const decoded = await decodeImage(file);
  try {
    const scale = Math.min(1, maxDimension / Math.max(decoded.width, decoded.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(decoded.width * scale));
    canvas.height = Math.max(1, Math.round(decoded.height * scale));

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare this image.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("The image could not be compressed.")), "image/webp", quality);
    });

    const baseName = file.name.replace(/\.[^/.]+$/, "").trim() || "logo";
    const compressedFile = new File([blob], `${baseName}.webp`, { type: "image/webp", lastModified: Date.now() });
    return { file: compressedFile, originalBytes: file.size, compressedBytes: compressedFile.size };
  } finally {
    decoded.close();
  }
}
