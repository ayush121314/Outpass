const express = require("express");
const {
  getStudentData,
  checkExistence,
  sendOtp,
  register,
  getOutpassHistoryofstudent,
  login,
  requestOutpass,
  getOutpassHistory,
  getoutpass,
  updateOutpassStatus
} = require("../controllers/studentController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/get-student-data", authMiddleware, getStudentData);
router.post("/request-outpass", authMiddleware, requestOutpass);
router.get("/outpass-history", authMiddleware, getOutpassHistory);
router.post("/check-existence", checkExistence);
router.post("/send-otp", sendOtp);
router.post("/register", register);
router.post("/login", login);
router.get("/student-outpasses/:Rollno", getOutpassHistoryofstudent);
router.get('/outpass-requests',getoutpass);
router.put('/outpass-requested/:_id', updateOutpassStatus);
module.exports = router; 
