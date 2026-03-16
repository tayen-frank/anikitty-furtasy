import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const R2_FOLDERS = ["styles", "uploads", "results"] as const;

export type R2Folder = (typeof R2_FOLDERS)[number];

type CreateUploadUrlInput = {
  folder: R2Folder;
  fileType: string;
  userId?: string;
  expiresInSeconds?: number;
};

type UploadObjectToR2Input = {
  folder: R2Folder;
  fileType: string;
  body: BodyInit | Blob | ArrayBuffer | ArrayBufferView;
  userId?: string;
  cacheControl?: string;
};

let cachedR2Client: S3Client | null = null;

export function getR2Client() {
  if (cachedR2Client) {
    return cachedR2Client;
  }

  const config = getR2Config();
  cachedR2Client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return cachedR2Client;
}

export function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim() ?? "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim() ?? "";
  const bucketName = process.env.R2_BUCKET_NAME?.trim() ?? "";
  const publicUrl = process.env.R2_PUBLIC_URL?.trim().replace(/\/+$/g, "") ?? "";

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl,
    isConfigured: Boolean(accountId && accessKeyId && secretAccessKey && bucketName && publicUrl),
  };
}

export function isValidR2Folder(folder: string): folder is R2Folder {
  return R2_FOLDERS.includes(folder as R2Folder);
}

export function buildR2ObjectKey({
  folder,
  fileType,
  userId = "anonymous",
}: {
  folder: R2Folder;
  fileType: string;
  userId?: string;
}) {
  const extension = getFileExtensionFromMimeType(fileType);
  const safeUserId = sanitizePathSegment(userId);
  const fileName = `${crypto.randomUUID()}.${extension}`;

  return `${folder}/${safeUserId}/${fileName}`;
}

export function buildR2PublicUrl(objectKey: string) {
  const config = getR2Config();

  if (!config.publicUrl) {
    throw new Error("R2_PUBLIC_URL is not configured.");
  }

  return `${config.publicUrl}/${objectKey}`;
}

export async function createPresignedUploadUrl({
  folder,
  fileType,
  userId,
  expiresInSeconds = 60,
}: CreateUploadUrlInput) {
  const config = getR2Config();

  if (!config.isConfigured) {
    throw new Error(
      "R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL.",
    );
  }

  const objectKey = buildR2ObjectKey({ folder, fileType, userId });
  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: objectKey,
    ContentType: fileType,
  });
  const uploadUrl = await getSignedUrl(getR2Client(), command, {
    expiresIn: expiresInSeconds,
  });
  const publicUrl = buildR2PublicUrl(objectKey);

  return {
    uploadUrl,
    publicUrl,
    objectKey,
    method: "PUT" as const,
    headers: {
      "Content-Type": fileType,
    },
  };
}

export async function uploadObjectToR2({
  folder,
  fileType,
  body,
  userId,
  cacheControl = "public, max-age=31536000, immutable",
}: UploadObjectToR2Input) {
  const config = getR2Config();

  if (!config.isConfigured) {
    throw new Error(
      "R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL.",
    );
  }

  const objectKey = buildR2ObjectKey({ folder, fileType, userId });
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: objectKey,
      Body: body,
      ContentType: fileType,
      CacheControl: cacheControl,
    }),
  );

  return {
    objectKey,
    publicUrl: buildR2PublicUrl(objectKey),
  };
}

function sanitizePathSegment(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "anonymous";
}

function getFileExtensionFromMimeType(fileType: string) {
  const normalized = fileType.toLowerCase();

  switch (normalized) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/heic":
    case "image/heif":
      return "heic";
    case "image/svg+xml":
      return "svg";
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}
