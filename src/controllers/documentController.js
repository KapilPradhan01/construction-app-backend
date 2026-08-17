const Document = require("../models/Document");
const supabase = require("../config/supabase");
const crypto = require("crypto");

const BUCKET = process.env.SUPABASE_BUCKET;

// Upload document to Supabase Storage
const uploadDocument = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        const {
            projectId,
            name,
            type
        } = req.body;

        if (!projectId) {
            return res.status(400).json({
                message: "projectId is required"
            });
        }

        const file = req.file;

        // Create unique file path
        const extension =
            file.originalname.split(".").pop()?.toLowerCase() || "file";

        const filePath =
            `${projectId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (uploadError) {
            return res.status(500).json({
                message: "Failed to upload file",
                error: uploadError.message
            });
        }

        // Generate temporary signed URL
        const { data: signedData, error: signedError } =
            await supabase.storage
                .from(BUCKET)
                .createSignedUrl(filePath, 60 * 60);

        if (signedError) {

            // Remove uploaded file if URL generation fails
            await supabase.storage
                .from(BUCKET)
                .remove([filePath]);

            return res.status(500).json({
                message: "Failed to create file URL",
                error: signedError.message
            });
        }

        // Save document metadata in MongoDB
        const document = await Document.create({

            projectId,

            name:
                name?.trim() ||
                file.originalname,

            type: type || "other",

            fileUrl: signedData.signedUrl,

            storagePath: filePath,

            fileName: file.originalname,

            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Document uploaded successfully",
            document
        });

    } catch (error) {

        console.error("Document upload error:", error);

        res.status(500).json({
            message: "Failed to upload document",
            error: error.message
        });
    }
};


// Get project documents
const getProjectDocuments = async (req, res) => {

    try {

        const documents = await Document.find({
            projectId: req.params.projectId
        })
        .sort({ createdAt: -1 });

        // Generate fresh signed URLs
        const documentsWithUrls = await Promise.all(

            documents.map(async (document) => {

                if (!document.storagePath) {
                    return document;
                }

                const { data, error } =
                    await supabase.storage
                        .from(BUCKET)
                        .createSignedUrl(
                            document.storagePath,
                            60 * 60
                        );

                if (error) {
                    return document;
                }

                return {
                    ...document.toObject(),
                    fileUrl: data.signedUrl
                };
            })
        );

        res.json({
            count: documentsWithUrls.length,
            documents: documentsWithUrls
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch documents",
            error: error.message
        });
    }
};

const getDocumentUrl = async (req, res) => {
    try {

        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                message: "Document not found"
            });
        }

        if (!document.storagePath) {
            return res.status(404).json({
                message: "File is not available"
            });
        }

        const { data, error } =
            await supabase.storage
                .from(BUCKET)
                .createSignedUrl(
                    document.storagePath,
                    60 * 60
                );

        if (error) {
            return res.status(500).json({
                message: "Failed to generate document URL",
                error: error.message
            });
        }

        res.json({
            url: data.signedUrl
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to open document",
            error: error.message
        });
    }
};

module.exports = {
    uploadDocument,
    getProjectDocuments,
    getDocumentUrl
};