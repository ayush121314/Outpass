const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
// Hardcoded credentials
const hardcodedEmail = 'admin1@gmail.com';
// Hash the hardcoded password (You can pre-generate this hash)
const hardcodedPasswordHash = bcrypt.hashSync('admin1password', 10); // bcrypt hash of 'admin1password'
const Outpass = require('../models/Outpass'); // Assuming you have the Outpass model defined

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the email exists in the database
    if(email!=hardcodedEmail)
    return res.status(400).json({ message: 'Invalid email or password' });
    let admin = await Admin.findOne({ email });

    if (!admin) {
      // If email doesn't exist, save it to the database
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      admin = new Admin({
        email,
        password: hashedPassword, // Save the hashed password
      });

      await admin.save();
      return res.status(201).json({ message: 'Admin created and saved successfully' });
    }

    // Compare the provided password with the hashed password from the database
    const isMatch = await bcrypt.compare(password, admin.password);

    if (isMatch) {
      // Generate a token for the session
      const token = jwt.sign({ email }, process.env.JWT_SECRET);
      return res.json({ token });
    } else {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
exports.getadmindata = async (req, res) => {
  try {
    // Access the user's email from req.user.email
    const admin = await Admin.findOne({ email: req.user.email }).select('-password');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Send back the student data
    res.status(200).json(admin);
  } catch (err) {
    console.error('Error fetching student data:', err);
    res.status(500).json({ message: 'Error fetching student data' });
  }
};


// Controller function to get all pending outpass requests
