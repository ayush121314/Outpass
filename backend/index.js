require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');

const visitorroutes = require('./routes/visitorroutes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/visitor',visitorroutes);

app.get('/', (req, res) => {
  res.send(`RUNNING ON ${PORT}`);
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const allowedOrigins = ['https://outpass-zeta.vercel.app', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
