const Redis = require('ioredis');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

// Redis client instance
let redisClient = null;
let cacheEnabled = true;

/**
 * Initialize Redis client
 */
function initializeRedis() {
  if (redisClient) {
    return redisClient;
  }

  // Check if caching is enabled
  cacheEnabled = process.env.CACHE_ENABLED !== 'false';
  
  if (!cacheEnabled) {
    console.log('Cache is disabled via CACHE_ENABLED environment variable');
    return null;
  }

  // Build Redis URL from environment variables or use defaults
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = process.env.REDIS_PORT || '6379';
  const redisUrl = process.env.REDIS_URL || `redis://${redisHost}:${redisPort}`;

  try {
    redisClient = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err.message);
      // Don't throw, allow graceful degradation
    });

    redisClient.on('connect', () => {
      console.log('Redis client connected');
    });

    redisClient.on('ready', () => {
      console.log('Redis client ready');
    });

    // Connect lazily - will connect on first use
    redisClient.connect().catch((err) => {
      console.error('Failed to connect to Redis:', err.message);
      console.log('Continuing without cache - API will work but without caching');
    });

    return redisClient;
  } catch (error) {
    console.error('Error initializing Redis:', error.message);
    console.log('Continuing without cache - API will work but without caching');
    return null;
  }
}

/**
 * Generate a deterministic cache key from parameters
 * @param {string} prefix - Cache key prefix (e.g., 'next-crop-insights')
 * @param {Object} params - Parameters to hash
 * @returns {string} Cache key
 */
function generateCacheKey(prefix, params) {
  // Normalize and sort parameters for consistent hashing
  const normalized = JSON.stringify(params, Object.keys(params).sort());
  const hash = crypto.createHash('sha256').update(normalized).digest('hex').substring(0, 16);
  return `${prefix}:${hash}`;
}

/**
 * Get cached value
 * @param {string} key - Cache key
 * @returns {Promise<Object|null>} Cached value or null
 */
async function get(key) {
  if (!cacheEnabled || !redisClient) {
    return null;
  }

  try {
    const value = await redisClient.get(key);
    if (value) {
      console.log(`Cache HIT: ${key}`);
      return JSON.parse(value);
    }
    console.log(`Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error(`Cache GET error for key ${key}:`, error.message);
    return null; // Graceful degradation
  }
}

/**
 * Set cached value with TTL
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} ttlHours - Time to live in hours (default from env or 6 hours)
 * @returns {Promise<boolean>} Success status
 */
async function set(key, value, ttlHours = null) {
  if (!cacheEnabled || !redisClient) {
    return false;
  }

  try {
    const ttl = ttlHours || parseFloat(process.env.CACHE_TTL_HOURS) || 6;
    const ttlSeconds = Math.round(ttl * 3600); // Convert hours to seconds
    
    await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
    console.log(`Cache SET: ${key} (TTL: ${ttlHours || ttl} hours)`);
    return true;
  } catch (error) {
    console.error(`Cache SET error for key ${key}:`, error.message);
    return false; // Graceful degradation
  }
}

/**
 * Delete cache entry
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
async function del(key) {
  if (!cacheEnabled || !redisClient) {
    return false;
  }

  try {
    await redisClient.del(key);
    console.log(`Cache DEL: ${key}`);
    return true;
  } catch (error) {
    console.error(`Cache DEL error for key ${key}:`, error.message);
    return false;
  }
}

/**
 * Check if cache key exists
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} True if exists
 */
async function exists(key) {
  if (!cacheEnabled || !redisClient) {
    return false;
  }

  try {
    const result = await redisClient.exists(key);
    return result === 1;
  } catch (error) {
    console.error(`Cache EXISTS error for key ${key}:`, error.message);
    return false;
  }
}

/**
 * Clear all cache entries with a specific prefix
 * @param {string} prefix - Prefix to match
 * @returns {Promise<number>} Number of keys deleted
 */
async function clearByPrefix(prefix) {
  if (!cacheEnabled || !redisClient) {
    return 0;
  }

  try {
    const keys = await redisClient.keys(`${prefix}:*`);
    if (keys.length === 0) {
      return 0;
    }
    const deleted = await redisClient.del(...keys);
    console.log(`Cache CLEAR: Deleted ${deleted} keys with prefix ${prefix}`);
    return deleted;
  } catch (error) {
    console.error(`Cache CLEAR error for prefix ${prefix}:`, error.message);
    return 0;
  }
}

/**
 * Close Redis connection
 */
async function close() {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('Redis connection closed');
    } catch (error) {
      console.error('Error closing Redis connection:', error.message);
    }
    redisClient = null;
  }
}

// Initialize Redis on module load
initializeRedis();

module.exports = {
  initializeRedis,
  generateCacheKey,
  get,
  set,
  del,
  exists,
  clearByPrefix,
  close,
  get client() {
    return redisClient;
  },
  get isEnabled() {
    return cacheEnabled && redisClient !== null;
  }
};

