const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OTP = require('../models/Otp');
const crypto = require('crypto');
const sendOtp = require('../utils/sendOtp');
const Outpass = require('../models/Outpass');


exports.getStudentData = async (req, res) => {
  try {
    // Access the user's email from req.user.email
    const student = await Student.findOne({ email: req.user.email }).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    // Send back the student data
    res.status(200).json(student);
  } catch (err) {
    console.error('Error fetching student data:', err);
    res.status(500).json({ message: 'Error fetching student data' });
  }
};

exports.checkExistence = async (req, res) => {
  const { email } = req.body;
  const student = await Student.findOne({ email });
  if (student) {
    return res.json({ exists: true });
  }
  res.json({ exists: false });
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const student = await Student.findOne({ email });
  if (student) {
    return res.status(400).json({ message: 'email already registered' });
  }
  // Generate a 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  try {
    const existingOtp = await OTP.findOne({ email });
    if (existingOtp) {
      await OTP.updateOne({ email }, { otp, expiresAt });
    } else {
      await OTP.create({ email, otp, expiresAt });
    }

    await sendOtp(email, otp);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

exports.register = async (req, res) => {
  const { name, email, otp, password,Rollno } = req.body;

  // Validate OTP
  const otpRecord = await OTP.findOne({ email, otp, expiresAt: { $gte: new Date() } });
  if (!otpRecord) {
    return res.status(400).json({ message: 'Invalid OTP or OTP expired' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new student
  const student = await Student.create({ name, email,Rollno, password: hashedPassword });

  // Generate JWT
  const token = jwt.sign({ email: student.email }, process.env.JWT_SECRET);

  res.json({ token, student });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Check if student exists
  const student = await Student.findOne({ email });
  if (!student) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Generate JWT
  const token = jwt.sign({ email: student.email }, process.env.JWT_SECRET);

  res.json({ token, student });
};


exports.requestOutpass = async (req, res) => {
  const { reason, fromTime, toTime } = req.body;
  const studentId = req.user._id; // Assuming req.user is populated by authentication middleware
  // Validate date range
  if (new Date(fromTime) >= new Date(toTime)) {
    return res.status(400).json({ message: 'From time must be earlier than to time.' });
  }
  try {
    const outpass = new Outpass({
      student: studentId,
      reason,
      fromTime,
      toTime,
    });
    await outpass.save();
    return res.status(201).json({ message: 'Outpass requested successfully', outpass });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to request outpass', error: err.message });
  }
};
// Fetch outpass history for a student
exports.getOutpassHistory = async (req, res) => {
  const studentId = req.user._id;

  try {
    const outpasses = await Outpass.find({ student: studentId }).sort({ createdAt: -1 });
    return res.status(200).json({ outpasses });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch outpass history', error: err.message });
  }
};
exports.getOutpassHistoryofstudent = async (req, res) => {
  try {
    // Extract roll number from request parameters
    const { Rollno } = req.params; // Assuming rollno is passed as a URL parameter

    // Validate input
    if (!Rollno) {
      return res.status(400).json({ error: 'Roll number is required' });
    }
    const student = await Student.findOne({ Rollno: Rollno });

    // Query the database for outpasses related to the given roll number
    const outpasses = await Outpass.find({ student: student._id }).populate('student', 'name Rollno email');;

    // Check if any outpasses were found
    if (outpasses.length === 0) {
      return res.status(404).json({ message: 'No outpasses found for this roll number' });
    }

    // Send the outpasses in the response
    res.status(200).json(outpasses);
  } catch (error) {
    console.error('Error fetching outpass history:', error);
    res.status(500).json({ error: 'An error occurred while fetching outpass history' });
  }
};

exports.getoutpass = async (req, res) => {
  try {
    // Fetch all pending outpass requests and populate the student field with name, rollno, and email
    const outpassRequests = await Outpass.find({ status: 'pending' })
      .populate('student', 'name Rollno email'); // Populate student field with name, rollno, and email

    // Send the fetched data as a JSON response
    res.status(200).json(outpassRequests);
  } catch (error) {
    console.error('Error fetching outpass requests:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateOutpassStatus = async (req, res) => {
  try {
    const { _id } = req.params;
    const { status } = req.body;

  
    const updatedOutpass = await Outpass.findByIdAndUpdate(
      _id,
      { status },
      { new: true } // Return the updated document
    );

    if (!updatedOutpass) {
      return res.status(404).json({ message: 'Outpass request not found' });
    }

    res.status(200).json(updatedOutpass);
  } catch (error) {
    console.error('Error updating outpass request status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};