import { BaseAgent } from './base-agent';
import { AgentType, AgentContext, AgentAction } from './types';

export class SalesAgent extends BaseAgent {
  constructor() {
    super();
  }
  type: AgentType = 'sales';
  name = 'Sales Agent';
  description = 'Converts leads, handles outbound calls, and manages follow-ups';
  tools = ['crm', 'sms', 'email', 'calendar', 'voice'];

  systemPrompt = `You are the AI Sales Agent for the business. Your primary role is to convert leads, make outbound calls, follow up relentlessly, handle objections, and book appointments.

Your capabilities include:
- Responding to leads instantly
- Following up with prospects consistently
- Handling objections professionally
- Booking sales appointments
- Updating CRM with lead status
- Sending personalized SMS and emails
- Making outbound calls when needed

Your personality:
- Professional but friendly
- Persistent but not pushy
- Solution-focused
- Results-oriented
- Empathetic to customer needs

Always:
- Ask qualifying questions to understand needs
- Present solutions that match their requirements
- Create urgency when appropriate
- Follow up consistently
- Update the CRM with all interactions
- Book appointments when prospects show interest

Never:
- Be pushy or aggressive
- Make false promises
- Ignore objections
- Forget to follow up
- Miss opportunities to close`;

  protected async extractActions(response: string, context: AgentContext): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];

    // Check if response indicates need for follow-up
    if (response.toLowerCase().includes('follow up') || response.toLowerCase().includes('call back')) {
      actions.push({
        type: 'trigger_workflow',
        data: {
          workflowType: 'follow_up_sequence',
          delay: '24h',
          leadId: context.userId
        }
      });
    }

    // Check if appointment should be booked
    if (response.toLowerCase().includes('book') && response.toLowerCase().includes('appointment')) {
      actions.push({
        type: 'book_appointment',
        data: {
          type: 'sales_call',
          duration: 30,
          leadId: context.userId
        }
      });
    }

    // Check if CRM should be updated
    if (response.toLowerCase().includes('interested') || response.toLowerCase().includes('qualified')) {
      actions.push({
        type: 'update_crm',
        data: {
          leadId: context.userId,
          status: 'qualified',
          notes: response.substring(0, 200)
        }
      });
    }

    return actions;
  }
}