const port = Number(process.env.PORT) || 3000;
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

module.exports = {
  port,
  corsOptions: {
    origin: allowedOrigin,
  },
};
