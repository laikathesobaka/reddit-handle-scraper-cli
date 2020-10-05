const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (app) => {
  app.use(
    "/",
    createProxyMiddleware({
      target: "http://[::1]:3001",
      changeOrigin: true,
      secure: false,
    })
  );
};
