import { AgentContext, AgentResponse, Agent, AgentType } from './types';
import { AgentMemory } from './memory';
import { AgentTools } from './tools';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export abstract class BaseAgent implements Agent {
  abstract type: AgentType;
  abstract name: string;
  abstract description: string;
  abstract systemPrompt: string;
  abstract tools: string[];
  
  protected memory: AgentMemory;
  protected agentTools: AgentTools;
  
  constructor() {
    this.memory = new AgentMemory();
    this.agentTools = new AgentTools();
  }

  async run(message: string, context: AgentContext): Promise<AgentResponse> {
    try {
      // Store user message in memory
      await this.memory.storeConversation(
        context.workspaceId,
        context.userId,
        this.type,
        message,
        'user'
      );
      
      // Get conversation history from memory
      const conversationHistory = await this.memory.getConversationHistory(
        context.workspaceId,
        context.userId,
        this.type,
        10
      );
      
      // Update context with memory
      context.conversationHistory = conversationHistory.map(conv => ({
        id: conv.id,
        role: conv.role,
        content: conv.message,
        timestamp: new Date(conv.timestamp),
        metadata: conv.metadata
      }));
      
      // Build the conversation history
      const messages = this.buildMessages(message, context);
      
      // Get AI response
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I could not process your request.';
      
      // Store AI response in memory
      await this.memory.storeConversation(
        context.workspaceId,
        context.userId,
        this.type,
        aiResponse,
        'assistant'
      );
      
      // Process any actions that need to be taken
      const actions = await this.extractActions(aiResponse, context);
      
      // Execute actions using tools
      await this.executeActions(actions, context);
      
      return {
        message: aiResponse,
        actions,
        metadata: {
          agentType: this.type,
          timestamp: new Date(),
          tokensUsed: completion.usage?.total_tokens
        }
      };
    } catch (error) {
      console.error(`Error in ${this.type} agent:`, error);
      return {
        message: 'I apologize, but I encountered an error. Please try again.',
        metadata: { error: error.message }
      };
    }
  }

  protected buildMessages(message: string, context: AgentContext): any[] {
    const messages = [
      {
        role: 'system',
        content: this.buildSystemPrompt(context)
      }
    ];

    // Add recent conversation history (last 10 messages)
    const recentHistory = context.conversationHistory.slice(-10);
    for (const historyMessage of recentHistory) {
      messages.push({
        role: historyMessage.role,
        content: historyMessage.content
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    return messages;
  }

  protected buildSystemPrompt(context: AgentContext): string {
    let prompt = this.systemPrompt;
    
    // Add business context
    if (context.businessInfo) {
      prompt += `\n\nBusiness Context:\n`;
      prompt += `- Business Name: ${context.businessInfo.name}\n`;
      prompt += `- Industry: ${context.businessInfo.industry}\n`;
      if (context.businessInfo.website) prompt += `- Website: ${context.businessInfo.website}\n`;
      if (context.businessInfo.phone) prompt += `- Phone: ${context.businessInfo.phone}\n`;
      if (context.businessInfo.businessHours) prompt += `- Business Hours: ${context.businessInfo.businessHours}\n`;
      if (context.businessInfo.services) prompt += `- Services: ${context.businessInfo.services.join(', ')}\n`;
    }

    // Add integration context
    if (context.integrations) {
      prompt += `\n\nAvailable Integrations:\n`;
      if (context.integrations.crm) prompt += `- CRM: Connected\n`;
      if (context.integrations.calendar) prompt += `- Calendar: Connected\n`;
      if (context.integrations.email) prompt += `- Email: Connected\n`;
    }

    prompt += `\n\nCurrent time: ${new Date().toISOString()}`;
    
    return prompt;
  }

  protected async extractActions(response: string, context: AgentContext): Promise<any[]> {
    // Override in specific agents to extract and execute actions
    return [];
  }
  
  protected async executeActions(actions: any[], context: AgentContext): Promise<void> {
    const toolContext = {
      workspaceId: context.workspaceId,
      userId: context.userId,
      agentType: this.type
    };
    
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'send_email':
            await this.agentTools.sendEmail(toolContext, action.data);
            break;
          case 'send_sms':
            await this.agentTools.sendSMS(toolContext, action.data);
            break;
          case 'book_appointment':
            await this.agentTools.bookAppointment(toolContext, action.data);
            break;
          case 'update_crm':
            await this.agentTools.updateCRM(toolContext, action.data);
            break;
          case 'make_call':
            await this.agentTools.makeCall(toolContext, action.data);
            break;
          case 'trigger_workflow':
            await this.agentTools.triggerWorkflow(toolContext, action.data);
            break;
          default:
            console.log('Unknown action type:', action.type);
        }
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);
      }
    }
  }

  // Utility methods for common operations
  protected async sendEmail(to: string, subject: string, body: string, context: AgentContext): Promise<boolean> {
    // Implement email sending logic
    console.log('Sending email:', { to, subject, body });
    return true;
  }

  protected async sendSMS(to: string, message: string, context: AgentContext): Promise<boolean> {
    // Implement SMS sending logic
    console.log('Sending SMS:', { to, message });
    return true;
  }

  protected async updateCRM(data: any, context: AgentContext): Promise<boolean> {
    // Implement CRM update logic
    console.log('Updating CRM:', data);
    return true;
  }

  protected async bookAppointment(details: any, context: AgentContext): Promise<boolean> {
    // Implement appointment booking logic
    console.log('Booking appointment:', details);
    return true;
  }
}