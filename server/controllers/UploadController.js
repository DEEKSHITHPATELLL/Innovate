const fs = require("fs");
const path = require("path");

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Handle file upload logic
exports.handleFileUpload = (req, res) => {
  if (req.file) {
    const filePath = path.join(uploadDir, req.file.filename);
    console.log("File uploaded successfully:", filePath);

    // You can also save details to a database or perform further processing here if needed
    res.json({ message: "File uploaded successfully!", filePath });
  } else {
    res.status(400).json({ message: "File upload failed." });
  }
};
