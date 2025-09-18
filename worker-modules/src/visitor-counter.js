import { AppError } from './config.js';

const logger = {
  info: (msg, data = {}) => console.log(`[VISITOR] ${msg}`, data),
  debug: (msg, data = {}) => console.log(`[VISITOR] ${msg}`, data),
  warn: (msg, data = {}) => console.warn(`[VISITOR] ${msg}`, data),
  error: (msg, data = {}) => console.error(`[VISITOR] ${msg}`, data)
};

// Visitor counter storage keys
const VISITOR_KEYS = {
  daily: (date) => `visitors_${date}`,
  total: 'visitors_total',
  unique: 'visitors_unique',
  monthly: (year, month) => `visitors_monthly_${year}_${month}`,
  ip_hash: (ip) => `visitor_ip_${ip}`
};

// Generate visitor ID from IP address (privacy-compliant)
function generateVisitorId(ip, userAgent) {
  // Create a simple hash of IP + user agent for unique identification
  const data = `${ip}:${userAgent || 'unknown'}:${new Date().toISOString().split('T')[0]}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Get current month in YYYY-MM format
function getCurrentMonth() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Track visitor
export async function trackVisitor(request, env) {
  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';
    const today = getCurrentDate();
    const currentMonth = getCurrentMonth();
    const visitorId = generateVisitorId(ip, userAgent);

    logger.info('Tracking visitor', { ip, visitorId, date: today });

    // Check if this visitor was already counted today
    const todayVisitorKey = `${VISITOR_KEYS.ip_hash(visitorId)}_${today}`;
    const alreadyCounted = await env.PAPERS.get(todayVisitorKey);

    if (!alreadyCounted) {
      // Mark this visitor as counted for today (expires in 24 hours)
      await env.PAPERS.put(todayVisitorKey, '1', {
        expirationTtl: 24 * 60 * 60 // 24 hours
      });

      // Increment daily counter
      const dailyKey = VISITOR_KEYS.daily(today);
      const dailyCount = await env.PAPERS.get(dailyKey);
      const newDailyCount = (dailyCount ? parseInt(dailyCount) : 0) + 1;
      await env.PAPERS.put(dailyKey, newDailyCount.toString(), {
        expirationTtl: 7 * 24 * 60 * 60 // Keep for 7 days
      });

      // Increment total counter
      const totalKey = VISITOR_KEYS.total;
      const totalCount = await env.PAPERS.get(totalKey);
      const newTotalCount = (totalCount ? parseInt(totalCount) : 0) + 1;
      await env.PAPERS.put(totalKey, newTotalCount.toString());

      // Increment monthly counter
      const monthlyKey = VISITOR_KEYS.monthly(currentMonth.split('-')[0], currentMonth.split('-')[1]);
      const monthlyCount = await env.PAPERS.get(monthlyKey);
      const newMonthlyCount = (monthlyCount ? parseInt(monthlyCount) : 0) + 1;
      await env.PAPERS.put(monthlyKey, newMonthlyCount.toString(), {
        expirationTtl: 32 * 24 * 60 * 60 // Keep for ~1 month
      });

      logger.info('New visitor counted', { visitorId, daily: newDailyCount, total: newTotalCount });

      return {
        isNewVisitor: true,
        daily: newDailyCount,
        total: newTotalCount,
        monthly: newMonthlyCount
      };
    } else {
      // Get current counts for returning visitor
      const dailyCount = await env.PAPERS.get(VISITOR_KEYS.daily(today)) || '0';
      const totalCount = await env.PAPERS.get(VISITOR_KEYS.total) || '0';
      const monthlyCount = await env.PAPERS.get(VISITOR_KEYS.monthly(currentMonth.split('-')[0], currentMonth.split('-')[1])) || '0';

      return {
        isNewVisitor: false,
        daily: parseInt(dailyCount),
        total: parseInt(totalCount),
        monthly: parseInt(monthlyCount)
      };
    }
  } catch (error) {
    logger.error('Error tracking visitor:', error);
    // Return default values if tracking fails
    return {
      isNewVisitor: false,
      daily: 0,
      total: 0,
      monthly: 0,
      error: error.message
    };
  }
}

// Get visitor statistics
export async function getVisitorStats(env) {
  try {
    const today = getCurrentDate();
    const currentMonth = getCurrentMonth();

    const dailyCount = await env.PAPERS.get(VISITOR_KEYS.daily(today)) || '0';
    const totalCount = await env.PAPERS.get(VISITOR_KEYS.total) || '0';
    const monthlyCount = await env.PAPERS.get(VISITOR_KEYS.monthly(currentMonth.split('-')[0], currentMonth.split('-')[1])) || '0';

    // Get last 7 days for trend
    const dailyTrend = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = await env.PAPERS.get(VISITOR_KEYS.daily(dateStr)) || '0';
      dailyTrend.push({
        date: dateStr,
        count: parseInt(count)
      });
    }

    return {
      today: parseInt(dailyCount),
      total: parseInt(totalCount),
      thisMonth: parseInt(monthlyCount),
      dailyTrend: dailyTrend.reverse(), // Oldest to newest
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error getting visitor stats:', error);
    return {
      today: 0,
      total: 0,
      thisMonth: 0,
      dailyTrend: [],
      error: error.message
    };
  }
}

// Format visitor statistics for display
export function formatVisitorStats(stats) {
  if (!stats || stats.error) {
    return {
      today: '0',
      total: '0',
      thisMonth: '0',
      displayText: 'Visitor stats unavailable'
    };
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return {
    today: formatNumber(stats.today),
    total: formatNumber(stats.total),
    thisMonth: formatNumber(stats.thisMonth),
    displayText: `${formatNumber(stats.total)} total visitors`
  };
}

// Clean up old visitor data (optional maintenance function)
export async function cleanupVisitorData(env, daysToKeep = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    logger.info(`Cleaning up visitor data older than ${daysToKeep} days`);

    // This would be implemented if we had a way to list keys
    // For now, we rely on TTL expiration
    return { success: true, message: 'Cleanup completed (TTL-based)' };
  } catch (error) {
    logger.error('Error cleaning up visitor data:', error);
    return { success: false, error: error.message };
  }
}

export { VISITOR_KEYS };