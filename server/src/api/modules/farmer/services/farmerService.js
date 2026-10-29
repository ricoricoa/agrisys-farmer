const model = require('../models/farmerModel');

function getStatus() {
  return { module: model.name, status: 'ready' };
}

module.exports = { getStatus };
