const express = require("express");
const router = express.Router();

const { run, runHeadful } = require("../controllers/runController");

router.post("/run", run);
router.post("/run/headful", runHeadful);

module.exports = router;
