const express = require("express");
const { runTest } = require("../controllers/testController");

const router = express.Router();
router.get("/", (req, res) => {
  res.send("OK");
});

router.post("/", runTest);

module.exports = router;