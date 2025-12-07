import { AgentContext, AgentResponse, AgentType } from './types';
import { SalesAgent } from './sales-agent';
import { SupportAgent } from './support-agent';
import { AppointmentAgent } from './appointment-agent';
import { VoiceAgent } from './voice-agent';
import { ContentAgent } from './content-agent';
import { WorkflowAgent } from './workflow-agent';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AgentRouter {
  private agents: Map<AgentType, any>;

  constructor() {
    this.agents = new Map([
      ['sales', new SalesAgent()],
      ['support', new SupportAgent()],
      ['appointment', new AppointmentAgent()],
      ['voice', new VoiceAgent()],
      ['content', new ContentAgent()],
      ['workflow', new WorkflowAgent()],
    ]);
  }

  async routeMessage(message: string, context: AgentContext): Promise<AgentResponse> {
    try {
      // Determine which agent should handle this message
      const agentType = await this.determineAgent(message, context);
      
      // Get the appropriate agent
      const agent = this.agents.get(agentType);
      if (!agent) {
        throw new Error(`Agent type ${agentType} not found`);
      }

      // Run the agent
      const response = await agent.run(message, context);
      
      // Log the interaction
      await this.logInteraction(agentType, message, response, context);
      
      return response;
    } catch (error) {
      console.error('Error routing message:', error);
      return {
        message: 'I apologize, but I encountered an error processing your request. Please try again.',
        metadata: { error: error.message }
      };
    }
  }

  private async determineAgent(message: string, context: AgentContext): Promise<AgentType> {
    const routingPrompt = `
You are an AI agent router. Analyze the user message and determine which specialized agent should handle it.

Available agents:
- sales: Handle lead conversion, outbound calls, follow-ups, objections, booking sales calls
- support: Answer questions, troubleshoot issues, customer service, general inquiries
- appointment: Manage scheduling, calendar, reminders, confirmations, rescheduling
- voice: Handle phone calls, voice interactions (when message indicates phone/voice context)
- content: Create marketing content, social posts, emails, creative writing
- workflow: Build automations, configure workflows, technical setup

User message: "${message}"

Business context: ${context.businessInfo?.name || 'Unknown'} in ${context.businessInfo?.industry || 'Unknown'} industry

Respond with ONLY the agent type (sales, support, appointment, voice, content, or workflow).`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: routingPrompt }],
        max_tokens: 10,
        temperature: 0.1,
      });

      const agentType = completion.choices[0]?.message?.content?.trim().toLowerCase() as AgentType;
      
      // Validate the response
      if (!this.agents.has(agentType)) {
        // Default to support for unclear requests
        return 'support';
      }

      return agentType;
    } catch (error) {
      console.error('Error determining agent:', error);
      // Default to support agent on error
      return 'support';
    }
  }

  private async logInteraction(
    agentType: AgentType,
    message: string,
    response: AgentResponse,
    context: AgentContext
  ): Promise<void> {
    try {
      // Log to database (implement based on your database setup)
      console.log('Agent interaction:', {
        agentType,
        workspaceId: context.workspaceId,
        userId: context.userId,
        message: message.substring(0, 100),
        response: response.message.substring(0, 100),
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  }

  // Get agent capabilities for UI
  getAgentCapabilities(): Record<AgentType, string[]> {
    return {
      sales: ['Lead conversion', 'Outbound calls', 'Follow-ups', 'Objection handling'],
      support: ['Customer service', 'Troubleshooting', 'General inquiries', 'Issue resolution'],
      appointment: ['Scheduling', 'Calendar management', 'Reminders', 'Confirmations'],
      voice: ['Phone calls', 'Voice interactions', 'Call routing', 'Voice responses'],
      content: ['Marketing content', 'Social posts', 'Email campaigns', 'Creative writing'],
      workflow: ['Automation setup', 'Workflow configuration', 'Integration management', 'Technical setup']
    };
  }
}