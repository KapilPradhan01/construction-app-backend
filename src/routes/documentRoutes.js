const express = require("express");


const {
    uploadDocument,
    getProjectDocuments,
    getDocumentUrl
} = require("../controllers/documentController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
    "/upload",
    protect,
    upload.single("file"),
    uploadDocument
);

router.get(
    "/project/:projectId",
    protect,
    getProjectDocuments
);

router.get(
    "/:id/url",
    protect,
    getDocumentUrl
);

module.exports = router;