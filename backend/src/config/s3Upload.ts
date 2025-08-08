import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'your-default-s3-bucket-name';

export async function uploadFileToS3( 
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
): Promise<string> {
  const uploadParams = {
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const s3Url = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    return s3Url;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
}

export const extractKeyFromS3Url = (s3Url: string): string | null => {
  if (!s3Url || typeof s3Url !== 'string' || !s3Url.includes(`s3.${process.env.AWS_REGION}.amazonaws.com/${S3_BUCKET_NAME}/`)) {
    return null;
  }
  try {
    const url = new URL(s3Url);
    let key = url.pathname.substring(1); 
    const bucketPrefix = `${S3_BUCKET_NAME}/`;
    if (key.startsWith(bucketPrefix)) {
      key = key.substring(bucketPrefix.length);
    }
    return key;
  } catch (error) {
    console.error('Error extracting S3 key from URL:', error);
    return null;
  }
};

export const deleteFileFromS3 = async (key: string): Promise<void> => {
  if (!key) {
    console.warn('Attempted to delete S3 object with empty key. Skipping deletion.');
    return;
  }

  const deleteParams = {
    Bucket: S3_BUCKET_NAME,
    Key: key,
  };

  try {
    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
    console.log(`Successfully deleted S3 object: ${key}`);
  } catch (error) {
    console.error(`Error deleting S3 object ${key}:`, error);
    throw error;
  }
};
