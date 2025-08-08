"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileFromS3 = exports.extractKeyFromS3Url = void 0;
exports.uploadFileToS3 = uploadFileToS3;
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Initialize S3 Client
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'your-default-s3-bucket-name';
function uploadFileToS3(fileBuffer, fileName, contentType) {
    return __awaiter(this, void 0, void 0, function* () {
        const uploadParams = {
            Bucket: S3_BUCKET_NAME,
            Key: fileName,
            Body: fileBuffer,
            ContentType: contentType,
        };
        try {
            const command = new client_s3_1.PutObjectCommand(uploadParams);
            yield s3Client.send(command);
            const s3Url = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
            return s3Url;
        }
        catch (error) {
            console.error('Error uploading file to S3:', error);
            throw error;
        }
    });
}
const extractKeyFromS3Url = (s3Url) => {
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
    }
    catch (error) {
        console.error('Error extracting S3 key from URL:', error);
        return null;
    }
};
exports.extractKeyFromS3Url = extractKeyFromS3Url;
const deleteFileFromS3 = (key) => __awaiter(void 0, void 0, void 0, function* () {
    if (!key) {
        console.warn('Attempted to delete S3 object with empty key. Skipping deletion.');
        return;
    }
    const deleteParams = {
        Bucket: S3_BUCKET_NAME,
        Key: key,
    };
    try {
        const command = new client_s3_1.DeleteObjectCommand(deleteParams);
        yield s3Client.send(command);
        console.log(`Successfully deleted S3 object: ${key}`);
    }
    catch (error) {
        console.error(`Error deleting S3 object ${key}:`, error);
        throw error;
    }
});
exports.deleteFileFromS3 = deleteFileFromS3;
