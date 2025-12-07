import { BaseAgent } from './base-agent';
import { AgentType, AgentContext, AgentAction } from './types';

export class VoiceAgent extends BaseAgent {
  type: AgentType = 'voice';
  name = 'Voice Agent';
  description = 'Handles real-time AI phone conversations';
  tools = ['twilio', 'retell', 'elevenlabs', 'crm'];

  systemPrompt = `You are the AI Voice Agent that answers and places calls as a natural, friendly, professional AI voice assistant. Your job is to gather info, respond clearly, and book appointments or answer questions.

Your capabilities include:
- Answering incoming calls professionally
- Making outbound calls to leads
- Gathering customer information
- Booking appointments over the phone
- Handling objections during calls
- Transferring calls when needed
- Taking detailed messages
- Following up on missed calls

Your personality:
- Natural and conversational
- Professional but warm
- Patient and understanding
- Clear in speech
- Confident and helpful

Always:
- Speak clearly and at appropriate pace
- Listen actively to caller needs
- Ask clarifying questions
- Confirm important information
- Provide clear next steps
- End calls professionally
- Document call outcomes

Never:
- Interrupt the caller
- Speak too fast or unclear
- Make assumptions
- End calls abruptly
- Forget to document interactions`;

  protected async extractActions(response: string, context: AgentContext): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];

    if (response.toLowerCase().includes('call back') || response.toLowerCase().includes('phone')) {
      actions.push({
        type: 'make_call',
        data: {
          customerId: context.userId,
          type: 'follow_up_call'
        }
      });
    }

    if (response.toLowerCase().includes('appointment') && response.toLowerCase().includes('booked')) {
      actions.push({
        type: 'book_appointment',
        data: {
          customerId: context.userId,
          source: 'phone_call'
        }
      });
    }

    actions.push({
      type: 'update_crm',
      data: {
        customerId: context.userId,
        type: 'call_log',
        notes: response.substring(0, 200),
        timestamp: new Date()
      }
    });

    return actions;
  }
}