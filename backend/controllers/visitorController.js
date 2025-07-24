const VisitorOutpass = require('../models/VisitorOutpass');
const OTP = require('../models/Otp');
const crypto = require('crypto');
const sendOtp = require('../utils/sendOtp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Visitor = require('../models/Visitor');

// Function to register visitor with OTP verification
exports.registerVisitor = async (req, res) => {
  const { visitorName, visitoremail, otp, password, visitorContact } = req.body;

  try {
    // Check if visitor already exists
    const existingVisitor = await Visitor.findOne({ visitoremail });
    if (existingVisitor) {
      return res.status(400).json({ message: 'Visitor already registered with this email.' });
    }

    // Validate OTP
    const otpRecord = await OTP.findOne({ email: visitoremail, otp, expiresAt: { $gte: new Date() } });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP or OTP expired.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new visitor
    const newVisitor = await Visitor.create({
      visitorName,
      visitoremail,
      visitorContact,
      password: hashedPassword,
    });

    // Remove OTP record after successful registration
    await OTP.deleteOne({ email: visitoremail });

    // Generate JWT for visitor authentication
    const token = jwt.sign({ email: newVisitor.visitoremail }, process.env.JWT_SECRET);

    // Respond with the JWT and visitor data
    res.status(201).json({ token, visitor: newVisitor });
  } catch (error) {
    console.error('Error registering visitor:', error);
    res.status(500).json({ message: 'Error registering visitor. Please try again.' });
  }
};

// Check existence of visitor
exports.checkExistence = async (req, res) => {
  const { visitoremail } = req.body;
  const visitor = await VisitorOutpass.findOne({ visitoremail });
  
  if (visitor) {
    return res.json({ exists: true });
  }
  
  res.json({ exists: false });
};

// Send OTP to visitor's email
exports.sendOtp = async (req, res) => {
  const { visitoremail } = req.body;
  const visitor = await VisitorOutpass.findOne({ visitoremail });

  if (visitor) {
    return res.status(400).json({ message: 'Visitor already exists. Please login.' });
  }

  // Generate a 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  try {
    const existingOtp = await OTP.findOne({ email: visitoremail });
    if (existingOtp) {
      await OTP.updateOne({ email: visitoremail }, { otp, expiresAt });
    } else {
      await OTP.create({ email: visitoremail, otp, expiresAt });
    }

    // Send OTP via utility function
    await sendOtp(visitoremail, otp);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending OTP', error: err.message });
  }
};


// Function to handle visitor login
exports.loginVisitor = async (req, res) => {
  const { visitoremail, password } = req.body;
  try {
    // Check if visitor exists
    const visitor = await Visitor.findOne({ visitoremail });
    if (!visitor) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, visitor.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT for visitor authentication
    const token = jwt.sign({ email: visitor.visitoremail }, process.env.JWT_SECRET);

    // Respond with the JWT and visitor data
    res.status(200).json({ token, visitor });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
};



// Controller to fetch visitor data
exports.getVisitorData = async (req, res) => {
  try {
    // The visitor is attached to the req object by the authVisitor middleware
    const visitor = req.visitor;

    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    // Respond with visitor's data
    res.status(200).json({
      visitorName: visitor.visitorName,
      visitoremail: visitor.visitoremail,
      visitorContact: visitor.visitorContact,
      createdAt: visitor.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching visitor data', error: err.message });
  }
};


exports.requestOutpass = async (req, res) => {
  const { reason, fromTime, toTime } = req.body;
  const visitorId = req.visitor._id; 
  if (new Date(fromTime) >= new Date(toTime)) {
    return res.status(400).json({ message: 'From time must be earlier than to time.' });
  }
  try {
    const visitorOutpass = new VisitorOutpass({
      Visitor: visitorId,
      reason,
      fromTime,
      toTime,
    });
    await visitorOutpass.save();
    return res.status(201).json({ message: 'Entrypass requested successfully', visitorOutpass });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to request Entrypass', error: err.message });
  }
};

exports.getOutpassHistory = async (req, res) => {
  const visitorId = req.visitor._id; 
  try {
    const visitorOutpasses = await VisitorOutpass.find({ Visitor: visitorId }).sort({ createdAt: -1 });
    return res.status(200).json({ visitorOutpasses });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch Entrypass history', error: err.message });
  }
};


exports.getoutpass = async (req, res) => {
  try {
    // Fetch all pending outpass requests and populate the student field with name, rollno, and email
    const outpassRequests = await VisitorOutpass.find({ status: 'pending' })
      .populate('Visitor', 'visitorName visitorContact visitoremail'); // Populate visitor field with name, rollno, and email

    // Send the fetched data as a JSON response
    res.status(200).json(outpassRequests);
  } catch (error) {
    console.error('Error fetching Entrypass requests:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateOutpassStatus = async (req, res) => {
  try {
    const { _id } = req.params;
    const { status } = req.body;

    const updatedOutpass = await VisitorOutpass.findByIdAndUpdate(
      _id,
      { status },
      { new: true } // Return the updated document
    );
    if (!updatedOutpass) {
      return res.status(404).json({ message: 'Entrypass request not found' });
    }
    res.status(200).json(updatedOutpass);
  } catch (error) {
    console.error('Error updating Entrypass request status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
exports.getOutpassHistoryofvisitor = async (req, res) => {
  try {
    // Extract roll number from request parameters
    const { visitoremail } = req.params; // Assuming rollno is passed as a URL parameter

    // Validate input
    if (!visitoremail) {
      return res.status(400).json({ error: 'email  is required' });
    }
    const visitor = await Visitor.findOne({ visitoremail: visitoremail });

    // Query the database for outpasses related to the given roll number
    const outpasses = await VisitorOutpass.find({ Visitor: visitor._id })  .populate('Visitor', 'visitorName visitorContact visitoremail');

    // Check if any outpasses were found
    if (outpasses.length === 0) {
      return res.status(404).json({ message: 'No Entrypass found for this email' });
    }

    // Send the outpasses in the response
    res.status(200).json(outpasses);
  } catch (error) {
    console.error('Error fetching Entrypass history:', error);
    res.status(500).json({ error: 'An error occurred while fetching Entrypass history' });
  }
};