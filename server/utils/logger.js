// server/utils/logger.js

function log(category, message, data = {}) {
  const time = new Date().toISOString();

  const logObject = {
    time,
    category,
    message,
    ...data,
  };

  console.log(JSON.stringify(logObject));
}

module.exports = { log };
