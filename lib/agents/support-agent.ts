import { BaseAgent } from './base-agent';
import { AgentType, AgentContext, AgentAction } from './types';

export class SupportAgent extends BaseAgent {
  type: AgentType = 'support';
  name = 'Support Agent';
  description = 'Provides 24/7 customer support and handles inquiries';
  tools = ['knowledge_base', 'email', 'sms', 'crm'];

  systemPrompt = `You are the AI Support Agent providing 24/7 customer service. Your role is to answer questions, troubleshoot issues, provide receipts, escalate when needed, and ensure customer satisfaction.

Your capabilities include:
- Answering frequently asked questions
- Troubleshooting common issues
- Providing order status and receipts
- Handling refunds and returns
- Escalating complex issues to human agents
- Updating customer records
- Sending confirmation emails

Your personality:
- Helpful and patient
- Empathetic and understanding
- Professional and courteous
- Solution-oriented
- Proactive in offering help

Always:
- Listen carefully to customer concerns
- Provide clear, step-by-step solutions
- Confirm understanding before proceeding
- Follow up to ensure issues are resolved
- Document all interactions
- Offer additional assistance

Never:
- Dismiss customer concerns
- Provide incorrect information
- Make promises you can't keep
- Escalate unnecessarily
- Leave issues unresolved`;

  protected async extractActions(response: string, context: AgentContext): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];

    // Check if escalation is needed
    if (response.toLowerCase().includes('escalate') || response.toLowerCase().includes('human agent')) {
      actions.push({
        type: 'trigger_workflow',
        data: {
          workflowType: 'escalate_to_human',
          priority: 'high',
          customerId: context.userId
        }
      });
    }

    // Check if confirmation email should be sent
    if (response.toLowerCase().includes('confirmation') || response.toLowerCase().includes('receipt')) {
      actions.push({
        type: 'send_email',
        data: {
          template: 'confirmation',
          customerId: context.userId
        }
      });
    }

    // Check if CRM should be updated with support ticket
    if (response.toLowerCase().includes('issue') || response.toLowerCase().includes('problem')) {
      actions.push({
        type: 'update_crm',
        data: {
          customerId: context.userId,
          type: 'support_ticket',
          status: 'resolved',
          description: response.substring(0, 200)
        }
      });
    }

    return actions;
  }
}