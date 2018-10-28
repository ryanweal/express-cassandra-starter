const Promise = require('bluebird');

/**
 * Do a promise returning function with retries.
 */
exports.withRetries = (promiseFn, maxRetries, delaySeconds, errMsg, expBackoff) => {
  let retryCount = 0;

  function doIt() {
    return promiseFn().catch(err => {
      // If we've hit the max, just propagate the error
      if (retryCount >= maxRetries) {
        throw err;
      }

      // Calculate delay time in MS
      let delayMs = expBackoff === true
        ? Math.pow(delaySeconds, retryCount) * 1000
        : delaySeconds * 1000;

      // Log, delay, and try again
      retryCount++;

      console.log('verbose', `${errMsg}. Retry ${retryCount} in ${delayMs}ms.`);
      return Promise.delay(delayMs).then(doIt);
    });
  }

  return doIt();
};
