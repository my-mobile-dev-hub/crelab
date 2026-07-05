interface UploadVideoResult {
  url: string;
  thumbnailUrl: string;
  duration: number;
}

interface UploadImageResult {
  url: string;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

function cloudinaryUrl(path: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/${path}`;
}

export async function uploadVideo(
  file: File | Blob,
): Promise<UploadVideoResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("resource_type", "video");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) {
    throw new Error(`Cloudinary upload failed: ${res.statusText}`);
  }

  const data = await res.json();

  return {
    url: data.secure_url,
    thumbnailUrl: data.secure_url.replace(
      /\.(mp4|webm|mov|avi)$/i,
      ".jpg",
    ),
    duration: Math.round(data.duration ?? 0),
  };
}

export function generateVideoThumbnail(videoUrl: string): string {
  const publicId = extractPublicId(videoUrl);
  if (publicId) {
    return cloudinaryUrl(`video/upload/w_600,q_auto,g_auto/${publicId}.jpg`);
  }
  return videoUrl.replace(/\.(mp4|webm|mov|avi)$/i, ".jpg");
}

export async function uploadImage(
  file: File | Blob,
): Promise<UploadImageResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("resource_type", "image");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) {
    throw new Error(`Cloudinary image upload failed: ${res.statusText}`);
  }

  const data = await res.json();

  return { url: data.secure_url };
}

function extractPublicId(url: string): string | null {
  const match = url.match(
    /\/video\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/,
  );
  return match ? match[1] : null;
}
