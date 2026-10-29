const service = require('../services/farmerService');

function getStatus(_request, response) {
  response.json(service.getStatus());
}

module.exports = { getStatus };
