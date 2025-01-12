const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const nodemailer = require('nodemailer');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Models
const Student = sequelize.define('Student', {
  name: DataTypes.STRING,
  registrationNumber: DataTypes.STRING,
  department: DataTypes.STRING,
  companyName: DataTypes.STRING,
  offerType: DataTypes.STRING,
  stipend: DataTypes.INTEGER,
  startDate: DataTypes.DATE,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  email: DataTypes.STRING,
  offerLetterPath: DataTypes.STRING,
  mailCopyPath: DataTypes.STRING
});

const Review = sequelize.define('Review', {
  studentId: DataTypes.INTEGER,
  reviewerId: DataTypes.INTEGER,
  status: DataTypes.STRING,
  remarks: DataTypes.TEXT
});

const HODReview = sequelize.define('HODReview', {
  studentId: DataTypes.INTEGER,
  hodId: DataTypes.INTEGER,
  status: DataTypes.STRING,
  remarks: DataTypes.TEXT
});

// File upload configuration
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Routes
app.post('/api/submit', upload.fields([
  { name: 'offerLetter', maxCount: 1 },
  { name: 'mailCopy', maxCount: 1 }
]), async (req, res) => {
  try {
    const { files } = req;
    const studentData = {
      ...req.body,
      offerLetterPath: files.offerLetter[0].path,
      mailCopyPath: files.mailCopy[0].path
    };
    
    const student = await Student.create(studentData);
    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reviewer/review', async (req, res) => {
  try {
    const { studentId, reviewerId, status, remarks } = req.body;
    const review = await Review.create({
      studentId,
      reviewerId,
      status,
      remarks
    });
    
    await Student.update(
      { status: status },
      { where: { id: studentId } }
    );
    
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hod/review', async (req, res) => {
  try {
    const { studentId, hodId, status, remarks } = req.body;
    const student = await Student.findByPk(studentId);
    
    const hodReview = await HODReview.create({
      studentId,
      hodId,
      status,
      remarks
    });
    
    // Send email to student
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: 'Your NOC Application Status',
      text: `Dear ${student.name},\n\nYour Placement Application has been ${status}.\n${
        status === 'rejected' ? `Reason: ${remarks}` : ''
      }\n\nBest regards,\nPlacement Cell`
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ success: true, hodReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reviewer/submissions', async (req, res) => {
  try {
    const submissions = await Student.findAll({
      where: { status: 'pending' }
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/hod/submissions', async (req, res) => {
  try {
    const submissions = await Student.findAll({
      where: { status: 'accepted' },
      include: Review
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});