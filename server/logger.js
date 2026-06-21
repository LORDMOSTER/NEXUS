const winston = require('winston');

// Regex to find sensitive keys and replace their values
const scrubRegex = /("passcode"|"password"|"token")\s*:\s*"?([^",\s}]+)"?/gi;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      // Apply redaction
      let scrubbedMessage = message;
      if (typeof message === 'string') {
        scrubbedMessage = message.replace(scrubRegex, '$1: "[ENCRYPTED_REDACTED]"');
      } else if (typeof message === 'object') {
        const stringified = JSON.stringify(message);
        scrubbedMessage = stringified.replace(scrubRegex, '$1: "[ENCRYPTED_REDACTED]"');
      }
      return `[${timestamp}] ${level}: ${scrubbedMessage}`;
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Stream for Morgan integration
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;
