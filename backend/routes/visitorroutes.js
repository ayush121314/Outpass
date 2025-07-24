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
  getOutpassHistory,
  getoutpass,
  updateOutpassStatus,
  getOutpassHistoryofvisitor
} = require("../controllers/visitorController");

router.post("/check-existence", checkExistence);
router.post("/send-otp", sendOtp);
router.post("/register", registerVisitor);
router.post("/login", loginVisitor);
router.get("/get-visitor-data", authVisitor, getVisitorData);
router.post("/request-outpass", authVisitor, requestOutpass);
router.get("/outpass-history", authVisitor, getOutpassHistory);
router.get('/outpass-requests',getoutpass);
router.put('/outpass-requested/:_id', updateOutpassStatus);
router.get("/visitor-outpasses/:visitoremail", getOutpassHistoryofvisitor);

module.exports = router;
