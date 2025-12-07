import { Redis } from '@upstash/redis'

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is not set')
}

// Initialize Redis client
export const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
})

// Test Redis connection
export async function testRedisConnection(): Promise<boolean> {
  try {
    await redis.ping()
    console.log('Redis connection successful')
    return true
  } catch (error) {
    console.error('Redis connection failed:', error)
    return false
  }
}

// Queue management
export class QueueManager {
  private queueName: string

  constructor(queueName: string) {
    this.queueName = queueName
  }

  async addJob(jobData: any, delay?: number) {
    const job = {
      id: crypto.randomUUID(),
      data: jobData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }

    if (delay) {
      await redis.zadd(`${this.queueName}:delayed`, Date.now() + delay, JSON.stringify(job))
    } else {
      await redis.lpush(this.queueName, JSON.stringify(job))
    }

    return job.id
  }

  async getJob() {
    const jobString = await redis.rpop(this.queueName)
    return jobString ? JSON.parse(jobString) : null
  }

  async processDelayedJobs() {
    const now = Date.now()
    const jobs = await redis.zrangebyscore(`${this.queueName}:delayed`, 0, now)
    
    for (const jobString of jobs) {
      await redis.lpush(this.queueName, jobString)
      await redis.zrem(`${this.queueName}:delayed`, jobString)
    }
  }
}

// Workflow queue
export const workflowQueue = new QueueManager('workflows')

// Agent queue
export const agentQueue = new QueueManager('agents')

// Voice queue
export const voiceQueue = new QueueManager('voice')