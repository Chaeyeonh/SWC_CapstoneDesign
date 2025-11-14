const express = require("express");
const { runTest } = require("../controllers/testController");

const router = express.Router();

router.post("/", runTest);

module.exports = router;