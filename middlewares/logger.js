const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '../logs.log');

const logger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms\n`;
    fs.appendFile(logPath, logEntry, err => {
      if (err) console.error('Erreur journalisation:', err);
    });
  });

  next();
};

module.exports = logger;
