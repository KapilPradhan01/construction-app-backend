const Document = require("../models/Document");
const supabase = require("../config/supabase");
const crypto = require("crypto");
const { requireOwnedProject } = require("../utils/projectAccess");
const BUCKET = process.env.SUPABASE_BUCKET;

const uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        const { projectId, name, type } = req.body;
        if (!projectId) return res.status(400).json({ message: "projectId is required" });
        if (!await requireOwnedProject(req, res, projectId)) return;
        const file = req.file;
        const extension = file.originalname.split(".").pop()?.toLowerCase() || "file";
        const filePath = `${projectId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file.buffer, { contentType: file.mimetype, upsert: false });
        if (uploadError) return res.status(500).json({ message: "Failed to upload file", error: uploadError.message });
        const { data: signedData, error: signedError } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, 3600);
        if (signedError) {
            await supabase.storage.from(BUCKET).remove([filePath]);
            return res.status(500).json({ message: "Failed to create file URL", error: signedError.message });
        }
        const document = await Document.create({ projectId, name: name?.trim() || file.originalname, type: type || "other", fileUrl: signedData.signedUrl, storagePath: filePath, fileName: file.originalname, createdBy: req.user.id });
        res.status(201).json({ message: "Document uploaded successfully", document });
    } catch (error) { res.status(500).json({ message: "Failed to upload document", error: error.message }); }
};

const getProjectDocuments = async (req, res) => {
    try {
        if (!await requireOwnedProject(req, res, req.params.projectId)) return;
        const documents = await Document.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
        const documentsWithUrls = await Promise.all(documents.map(async document => {
            if (!document.storagePath) return document;
            const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(document.storagePath, 3600);
            if (error) return document;
            return { ...document.toObject(), fileUrl: data.signedUrl };
        }));
        res.json({ count: documentsWithUrls.length, documents: documentsWithUrls });
    } catch (error) { res.status(500).json({ message: "Failed to fetch documents", error: error.message }); }
};

const getDocumentUrl = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ message: "Document not found" });
        if (!await requireOwnedProject(req, res, document.projectId)) return;
        if (!document.storagePath) return res.status(404).json({ message: "File is not available" });
        const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(document.storagePath, 3600);
        if (error) return res.status(500).json({ message: "Failed to generate document URL", error: error.message });
        res.json({ url: data.signedUrl });
    } catch (error) { res.status(500).json({ message: "Failed to open document", error: error.message }); }
};

const updateDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ message: "Document not found" });
        if (!await requireOwnedProject(req, res, document.projectId)) return;
        if (req.body.name !== undefined) document.name = req.body.name;
        if (req.body.type !== undefined) document.type = req.body.type;
        await document.save();
        res.json({ message: "Document updated successfully", document });
    } catch (error) { res.status(500).json({ message: "Failed to update document", error: error.message }); }
};

const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ message: "Document not found" });
        if (!await requireOwnedProject(req, res, document.projectId)) return;
        if (document.storagePath) {
            const { error } = await supabase.storage.from(BUCKET).remove([document.storagePath]);
            if (error) console.error("Storage delete error:", error.message);
        }
        await Document.deleteOne({ _id: document._id });
        res.json({ message: "Document deleted successfully" });
    } catch (error) { res.status(500).json({ message: "Failed to delete document", error: error.message }); }
};

module.exports = { uploadDocument, getProjectDocuments, getDocumentUrl, updateDocument, deleteDocument };