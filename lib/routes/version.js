const version = require('../../package.json').version;

// note - this double json is a hack to avoid bare strings
module.exports = (req, res) => res.status(200).json(JSON.stringify(version));
