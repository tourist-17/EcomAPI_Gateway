const express = require("express");
const morgan = require("morgan");
const ratelimit = require("express-rate-limit");
const axios = require("axios");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();

const PORT = 3004;
const limiter = ratelimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
});

app.use(morgan("combined"));
app.use(limiter);

app.use("/orderservice", async (req, res, next) => {
  //   console.log(req.headers["x-access-token"]);

  try {
    // console.log(req.headers["userid"]);
    const response = await axios.get(
      "http://localhost:3003/api/v1/isAuthenticated",
      {
        headers: {
          userid: "1",
          "x-access-token": req.headers["x-access-token"],
        },
      }
    );
    // console.log(response.data);
    if (response.data) {
      next();
    } else {
      return res.status(401).json({
        message: "Unauthorised",
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorised",
    });
  }
});
app.use(
  "/orderservice",
  createProxyMiddleware({
    target: "http://localhost:3002/",
    changeOrigin: true,
  })
);

app.get("/api/v1/info", async (req, res) => {
  return res.json({ message: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server Started at port ${PORT}`);
});
