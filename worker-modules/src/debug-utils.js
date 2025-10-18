// Utility functions for Chrome DevTools MCP integration
// This file provides helper functions for debugging and development

/**
 * Utility function to log debugging information that can be captured by Chrome DevTools
 * @param {string} message - Debug message
 * @param {any} data - Additional data to log
 */
export function debugLog(message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    message,
    data
  };
  
  // Log to console for Chrome DevTools
  console.log('[PaperDog Debug]', logEntry);
  
  // Also return for programmatic access
  return logEntry;
}

/**
 * Utility function to trace paper processing steps
 * @param {string} paperId - Paper identifier
 * @param {string} step - Processing step
 * @param {any} details - Step details
 */
export function tracePaperProcessing(paperId, step, details = null) {
  const traceEntry = {
    paperId,
    step,
    timestamp: new Date().toISOString(),
    details
  };
  
  console.log('[Paper Processing Trace]', traceEntry);
  return traceEntry;
}

/**
 * Utility function to monitor network requests
 * @param {string} url - Request URL
 * @param {string} method - HTTP method
 * @param {number} duration - Request duration in ms
 * @param {number} statusCode - HTTP status code
 */
export function networkLog(url, method, duration, statusCode) {
  const networkEntry = {
    url,
    method,
    duration,
    statusCode,
    timestamp: new Date().toISOString()
  };
  
  console.log('[Network Log]', networkEntry);
  
  // Highlight slow requests (> 2 seconds)
  if (duration > 2000) {
    console.warn('[Slow Request Warning]', networkEntry);
  }
  
  return networkEntry;
}

/**
 * Utility function to capture performance metrics
 * @param {string} operation - Operation name
 * @param {number} duration - Duration in ms
 * @param {any} metadata - Additional metadata
 */
export function performanceLog(operation, duration, metadata = null) {
  const perfEntry = {
    operation,
    duration,
    timestamp: new Date().toISOString(),
    metadata
  };
  
  console.log('[Performance Log]', perfEntry);
  
  // Highlight slow operations (> 1 second)
  if (duration > 1000) {
    console.warn('[Slow Operation Warning]', perfEntry);
  }
  
  return perfEntry;
}

// Export all functions as a debug utilities object
export const debugUtils = {
  debugLog,
  tracePaperProcessing,
  networkLog,
  performanceLog
};