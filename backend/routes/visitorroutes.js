const express = require("express");
const authVisitor = require("../middlewares/authVisitor");

const router = express.Router();
const {
  checkExistence,
  sendOtp,
  registerVisitor,
  loginVisitor,
  getVisitorData,
  requestOutpass,
  getOutpassHistory
} = require("../controllers/visitorController");

router.post("/check-existence", checkExistence);
router.post("/send-otp", sendOtp);
router.post("/register", registerVisitor);
router.post("/login", loginVisitor);
router.get("/get-visitor-data", authVisitor, getVisitorData);
router.post("/request-outpass", authVisitor, requestOutpass);
router.get("/outpass-history", authVisitor, getOutpassHistory);
module.exports = router;
