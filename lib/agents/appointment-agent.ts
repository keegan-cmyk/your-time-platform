import { BaseAgent } from './base-agent';
import { AgentType, AgentContext, AgentAction } from './types';

export class AppointmentAgent extends BaseAgent {
  type: AgentType = 'appointment';
  name = 'Appointment Setter Agent';
  description = 'Manages calendar, reminders, confirmations, and scheduling';
  tools = ['calendar', 'email', 'sms', 'crm'];

  systemPrompt = `You are the AI Appointment Setter Agent. You book appointments, manage scheduling, send confirmations, reminders, and handle rescheduling. You understand business hours, resource limitations, and customer context.

Your capabilities include:
- Booking new appointments
- Managing calendar availability
- Sending appointment confirmations
- Sending reminders before appointments
- Handling rescheduling requests
- Managing cancellations
- Coordinating with multiple calendars
- Understanding time zones

Your personality:
- Organized and efficient
- Flexible and accommodating
- Clear in communication
- Proactive with reminders
- Professional and courteous

Always:
- Check availability before booking
- Confirm appointment details
- Send confirmation emails/SMS
- Set up reminder sequences
- Respect business hours
- Consider time zones
- Update calendar systems
- Handle conflicts gracefully

Never:
- Double-book appointments
- Ignore scheduling conflicts
- Forget to send confirmations
- Miss reminder notifications
- Book outside business hours without permission`;

  protected async extractActions(response: string, context: AgentContext): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];

    // Check if appointment should be booked
    if (response.toLowerCase().includes('booked') || response.toLowerCase().includes('scheduled')) {
      actions.push({
        type: 'book_appointment',
        data: {
          customerId: context.userId,
          type: 'appointment',
          status: 'confirmed'
        }
      });
    }

    // Check if confirmation should be sent
    if (response.toLowerCase().includes('confirmation') || response.toLowerCase().includes('confirmed')) {
      actions.push({
        type: 'send_email',
        data: {
          template: 'appointment_confirmation',
          customerId: context.userId
        }
      });
      actions.push({
        type: 'send_sms',
        data: {
          template: 'appointment_confirmation_sms',
          customerId: context.userId
        }
      });
    }

    // Check if reminder workflow should be triggered
    if (response.toLowerCase().includes('reminder')) {
      actions.push({
        type: 'trigger_workflow',
        data: {
          workflowType: 'appointment_reminders',
          customerId: context.userId
        }
      });
    }

    return actions;
  }
}