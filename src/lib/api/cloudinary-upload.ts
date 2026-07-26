import type { SignedUploadParams } from './public-types';

export interface CloudinaryUploadResult {
  public_id: string;
  resource_type: 'image' | 'video';
  format: string;
  bytes: number;
}

/**
 * Uploads a single file directly to Cloudinary (never touches our
 * backend) using a signature our backend generated. Uses XHR rather
 * than fetch specifically because fetch has no upload-progress event -
 * XHR's upload.onprogress is the only way to show a real progress bar
 * for a large video upload on a slow connection.
 */
export function uploadToCloudinary(
  file: File,
  sig: SignedUploadParams,
  onProgress: (percent: number) => void,
): Promise<CloudinaryUploadResult> {
  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', sig.apiKey);
    form.append('timestamp', String(sig.timestamp));
    form.append('signature', sig.signature);
    form.append('allowed_formats', sig.allowedFormats);
    if (sig.folder) form.append('folder', sig.folder);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed for ${file.name} (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error(`Upload failed for ${file.name} (network error)`));

    xhr.send(form);
  });
}
