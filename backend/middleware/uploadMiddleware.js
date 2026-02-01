const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    console.log('Multer destination function invoked for file:', file.originalname);
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  console.log('File filter checking file:', file.originalname);
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (mimetype && extname) {
    console.log('File accepted:', file.originalname);
    return cb(null, true);
  } else {
    console.log('File rejected:', file.originalname);
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB
  fileFilter: fileFilter
});

module.exports = { upload };
