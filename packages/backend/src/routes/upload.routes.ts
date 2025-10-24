import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate, authRequired } from '../middleware/auth.middleware';
import {
  uploadMixed,
  uploadAvatar,
  uploadSingleDocument,
  uploadImages,
  validateUploadedFiles,
  handleUploadError
} from '../middleware/upload.middleware';

const router: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadResult:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *           description: Unique file key in S3
 *         url:
 *           type: string
 *           description: Public URL to access the file
 *         size:
 *           type: number
 *           description: File size in bytes
 *         mimeType:
 *           type: string
 *           description: File MIME type
 *         originalName:
 *           type: string
 *           description: Original file name
 *         thumbnailKey:
 *           type: string
 *           description: Thumbnail key (for images)
 *         thumbnailUrl:
 *           type: string
 *           description: Thumbnail URL (for images)
 */

/**
 * @swagger
 * /api/upload/single:
 *   post:
 *     summary: Upload a single file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: Upload folder path
 *       - in: query
 *         name: generateThumbnail
 *         schema:
 *           type: boolean
 *         description: Generate thumbnail for images
 *       - in: query
 *         name: maxWidth
 *         schema:
 *           type: number
 *         description: Maximum image width
 *       - in: query
 *         name: maxHeight
 *         schema:
 *           type: number
 *         description: Maximum image height
 *       - in: query
 *         name: quality
 *         schema:
 *           type: number
 *         description: Image quality (1-100)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/UploadResult'
 */
router.post('/single',
  authRequired,
  uploadMixed,
  validateUploadedFiles,
  UploadController.uploadSingle
);

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: Upload folder path
 *       - in: query
 *         name: generateThumbnail
 *         schema:
 *           type: boolean
 *         description: Generate thumbnail for images
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UploadResult'
 */
router.post('/multiple',
  authRequired,
  uploadImages,
  validateUploadedFiles,
  UploadController.uploadMultiple
);

/**
 * @swagger
 * /api/upload/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Avatar uploaded successfully
 */
router.post('/avatar',
  authRequired,
  uploadAvatar,
  validateUploadedFiles,
  UploadController.uploadAvatar
);

/**
 * @swagger
 * /api/upload/document/{shipmentId}:
 *   post:
 *     summary: Upload document for shipment
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 */
router.post('/document/:shipmentId',
  authRequired,
  uploadSingleDocument,
  validateUploadedFiles,
  UploadController.uploadDocument
);

/**
 * @swagger
 * /api/upload/file/{key}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: File key to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 */
router.delete('/file/:key',
  authRequired,
  UploadController.deleteFile
);

/**
 * @swagger
 * /api/upload/files:
 *   delete:
 *     summary: Delete multiple files
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               keys:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of file keys to delete
 *     responses:
 *       200:
 *         description: Files deleted successfully
 */
router.delete('/files',
  authRequired,
  UploadController.deleteFiles
);

/**
 * @swagger
 * /api/upload/info/{key}:
 *   get:
 *     summary: Get file information
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: File key
 *     responses:
 *       200:
 *         description: File information retrieved successfully
 */
router.get('/info/:key',
  authRequired,
  UploadController.getFileInfo
);

/**
 * @swagger
 * /api/upload/signed-url/{key}:
 *   get:
 *     summary: Get signed URL for file access
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: File key
 *       - in: query
 *         name: expiresIn
 *         schema:
 *           type: number
 *         description: URL expiration time in seconds
 *     responses:
 *       200:
 *         description: Signed URL generated successfully
 */
router.get('/signed-url/:key',
  authRequired,
  UploadController.getSignedUrl
);

/**
 * @swagger
 * /api/upload/generate-upload-url:
 *   post:
 *     summary: Generate presigned URL for file upload
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: Upload folder path
 *       - in: query
 *         name: expiresIn
 *         schema:
 *           type: number
 *         description: URL expiration time in seconds
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *               contentType:
 *                 type: string
 *             required:
 *               - fileName
 *               - contentType
 *     responses:
 *       200:
 *         description: Upload URL generated successfully
 */
router.post('/generate-upload-url',
  authRequired,
  UploadController.generateUploadUrl
);

// Image-specific routes
/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload and process image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image uploaded and processed successfully
 */
router.post('/image',
  authRequired,
  uploadImages,
  validateUploadedFiles,
  UploadController.uploadSingle
);

// Gallery upload (multiple images)
router.post('/gallery',
  authRequired,
  uploadImages,
  validateUploadedFiles,
  UploadController.uploadMultiple
);

// Document-specific routes
router.post('/pdf',
  authRequired,
  uploadSingleDocument,
  validateUploadedFiles,
  UploadController.uploadSingle
);

// Excel/CSV upload
router.post('/spreadsheet',
  authRequired,
  uploadSingleDocument,
  validateUploadedFiles,
  UploadController.uploadSingle
);

export default router;