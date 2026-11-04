const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const target = process.env.BACKEND_PROXY_TARGET || 'http://localhost:4545';

  app.use(
    '/api',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      secure: false,
      onProxyReq: (proxyReq, req, res) => {
        // Override origin header so backend CORS filter accepts proxied request
        proxyReq.setHeader('origin', target);
        proxyReq.setHeader('host', target.replace(/^https?:\/\//, ''));
      },
    })
  );
};
