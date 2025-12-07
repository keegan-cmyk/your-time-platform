import { redis } from './redis'

// Cache utility functions
export class CacheManager {
  private prefix: string

  constructor(prefix: string = 'cache') {
    this.prefix = prefix
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(this.getKey(key))
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      if (ttlSeconds) {
        await redis.setex(this.getKey(key), ttlSeconds, serialized)
      } else {
        await redis.set(this.getKey(key), serialized)
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redis.del(this.getKey(key))
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(this.getKey(key))
      return result === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await redis.incrby(this.getKey(key), amount)
    } catch (error) {
      console.error('Cache increment error:', error)
      return 0
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await redis.expire(this.getKey(key), ttlSeconds)
    } catch (error) {
      console.error('Cache expire error:', error)
    }
  }
}

// Specific cache instances
export const userCache = new CacheManager('user')
export const workspaceCache = new CacheManager('workspace')
export const agentCache = new CacheManager('agent')
export const workflowCache = new CacheManager('workflow')
export const sessionCache = new CacheManager('session')

// Rate limiting
export class RateLimiter {
  private prefix: string

  constructor(prefix: string = 'ratelimit') {
    this.prefix = prefix
  }

  private getKey(identifier: string, window: string): string {
    return `${this.prefix}:${identifier}:${window}`
  }

  async checkLimit(
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now()
    const window = Math.floor(now / (windowSeconds * 1000))
    const key = this.getKey(identifier, window.toString())

    try {
      const current = await redis.incr(key)
      
      if (current === 1) {
        await redis.expire(key, windowSeconds)
      }

      const remaining = Math.max(0, limit - current)
      const resetTime = (window + 1) * windowSeconds * 1000

      return {
        allowed: current <= limit,
        remaining,
        resetTime
      }
    } catch (error) {
      console.error('Rate limit error:', error)
      // Allow request on error
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + windowSeconds * 1000
      }
    }
  }
}

// Rate limiter instances
export const apiRateLimiter = new RateLimiter('api')
export const authRateLimiter = new RateLimiter('auth')
export const voiceRateLimiter = new RateLimiter('voice')

// Session management
export class SessionManager {
  private cache = new CacheManager('session')
  private defaultTTL = 24 * 60 * 60 // 24 hours

  async createSession(userId: string, data: any, ttlSeconds?: number): Promise<string> {
    const sessionId = crypto.randomUUID()
    const sessionData = {
      userId,
      data,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString()
    }

    await this.cache.set(sessionId, sessionData, ttlSeconds || this.defaultTTL)
    return sessionId
  }

  async getSession(sessionId: string): Promise<any | null> {
    const session = await this.cache.get(sessionId)
    if (session) {
      // Update last accessed time
      session.lastAccessed = new Date().toISOString()
      await this.cache.set(sessionId, session, this.defaultTTL)
    }
    return session
  }

  async updateSession(sessionId: string, data: any): Promise<void> {
    const session = await this.cache.get(sessionId)
    if (session) {
      session.data = { ...session.data, ...data }
      session.lastAccessed = new Date().toISOString()
      await this.cache.set(sessionId, session, this.defaultTTL)
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.cache.del(sessionId)
  }

  async extendSession(sessionId: string, ttlSeconds?: number): Promise<void> {
    await this.cache.expire(sessionId, ttlSeconds || this.defaultTTL)
  }
}

export const sessionManager = new SessionManager()