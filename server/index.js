//서버 부팅, 라우트 연결

const express = require("express");
const cors = require("cors");
const runRoutes = require("./routes/runRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", runRoutes);


app.listen(4000, () => {
  console.log("Server listening on http://localhost:4000");
});
