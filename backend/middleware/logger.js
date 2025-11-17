const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Custom token for response time in seconds
morgan.token('response-time-sec', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${(parseFloat(responseTime) / 1000).toFixed(3)}s` : '0s';
});

// Development logging format (colorful console output)
const devLogger = morgan('dev');

// Production logging format (write to file)
const prodLogger = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
  { stream: accessLogStream }
);

// Combined logger for both console and file
const combinedLogger = (req, res, next) => {
  devLogger(req, res, () => {});
  prodLogger(req, res, () => {});
  next();
};

// Custom logger for error logging
const errorLogger = (err, req, res, next) => {
  const errorLog = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${err.message}\n${err.stack}\n`;
  
  fs.appendFile(
    path.join(logsDir, 'error.log'),
    errorLog,
    (writeErr) => {
      if (writeErr) console.error('Failed to write error log:', writeErr);
    }
  );
  
  next(err);
};

module.exports = {
  devLogger,
  prodLogger,
  combinedLogger,
  errorLogger
};
