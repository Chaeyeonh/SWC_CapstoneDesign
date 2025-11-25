const express = require("express");
const { runTest } = require("../controllers/testController");
const { runScreening } = require("../controllers/screeningController");

const router = express.Router();

// health check
router.get("/", (req, res) => {
  res.send("OK");
});
console.log(">>> runTest reached");


// test run
router.post("/", runTest);

// screening
router.post("/screening", runScreening);

module.exports = router;
