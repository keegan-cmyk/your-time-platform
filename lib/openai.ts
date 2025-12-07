import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Agent configurations
export const AGENT_CONFIGS = {
  sales: {
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    max_tokens: 1000,
    system_prompt: `You are the AI Sales Agent for the business. You respond instantly, follow up relentlessly, handle objections, and book appointments. 
You integrate with CRM, send SMS + emails, update statuses, and trigger workflows.`
  },
  support: {
    model: 'gpt-4-turbo-preview',
    temperature: 0.3,
    max_tokens: 800,
    system_prompt: `You serve as a 24/7 support agent. You answer questions, troubleshoot issues, send receipts, escalate when needed, and ensure customer satisfaction.`
  },
  appointment: {
    model: 'gpt-4-turbo-preview',
    temperature: 0.5,
    max_tokens: 600,
    system_prompt: `You book appointments, manage scheduling, send confirmations, reminders, and handle rescheduling. You understand business hours, resource limitations, and customer context.`
  },
  content: {
    model: 'gpt-4-turbo-preview',
    temperature: 0.8,
    max_tokens: 1200,
    system_prompt: `You create viral content, hooks, emails, captions, short scripts, social posts, and automated content workflows.`
  },
  workflow: {
    model: 'gpt-4-turbo-preview',
    temperature: 0.2,
    max_tokens: 1500,
    system_prompt: `You design workflow logic for the business. 
Given a business goal, produce full automation workflows using n8n nodes, triggers, and schemas.`
  },
  voice: {
    model: 'gpt-4-turbo-preview',
    temperature: 0.6,
    max_tokens: 400,
    system_prompt: `You answer and place calls as a natural, friendly, professional AI voice assistant. 
Your job is to gather info, respond clearly, and book appointments or answer questions.`
  }
}

export async function runAgent(agentType: keyof typeof AGENT_CONFIGS, message: string, context?: any) {
  const config = AGENT_CONFIGS[agentType]
  
  const response = await openai.chat.completions.create({
    model: config.model,
    temperature: config.temperature,
    max_tokens: config.max_tokens,
    messages: [
      { role: 'system', content: config.system_prompt },
      { role: 'user', content: message }
    ]
  })

  return response.choices[0]?.message?.content || ''
}