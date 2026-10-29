const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const { corsOptions, port } = require('./config/app');
const farmerRoutes = require('./api/modules/farmer/routes');

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});
app.use('/api/farmer', farmerRoutes);

app.listen(port, () => {
  console.log(`Agrisystem API listening on port ${port}`);
});
