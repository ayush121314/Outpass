require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.get('/', (req, res) => {
  res.send(`RUNNING ON ${PORT}`);
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(cors({
  origin: 'https://outpass-zeta.vercel.app'
}));
