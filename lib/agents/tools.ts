import { createClient } from '@supabase/supabase-js';
import { Twilio } from 'twilio';
import Stripe from 'stripe';

interface ToolContext {
  workspaceId: string;
  userId: string;
  agentType: string;
}

export class AgentTools {
  private supabase;
  private twilio;
  private stripe;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    this.twilio = new Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
    
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });
  }

  // CRM Tools
  async updateCRM(context: ToolContext, data: any): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('crm_contacts')
        .upsert({
          workspace_id: context.workspaceId,
          user_id: context.userId,
          ...data,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating CRM:', error);
      return false;
    }
  }

  async getCRMContact(context: ToolContext, contactId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('crm_contacts')
        .select('*')
        .eq('workspace_id', context.workspaceId)
        .eq('id', contactId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting CRM contact:', error);
      return null;
    }
  }

  // Email Tools
  async sendEmail(context: ToolContext, params: {
    to: string;
    subject: string;
    body: string;
    template?: string;
  }): Promise<boolean> {
    try {
      // Log email to database
      const { error } = await this.supabase
        .from('email_logs')
        .insert({
          workspace_id: context.workspaceId,
          user_id: context.userId,
          agent_type: context.agentType,
          to_email: params.to,
          subject: params.subject,
          body: params.body,
          template: params.template,
          status: 'sent',
          sent_at: new Date().toISOString()
        });

      if (error) throw error;

      // Here you would integrate with your email service (SendGrid, etc.)
      console.log('Email sent:', params);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // SMS Tools
  async sendSMS(context: ToolContext, params: {
    to: string;
    message: string;
    from?: string;
  }): Promise<boolean> {
    try {
      const message = await this.twilio.messages.create({
        body: params.message,
        from: params.from || process.env.TWILIO_PHONE_NUMBER!,
        to: params.to
      });

      // Log SMS to database
      await this.supabase
        .from('sms_logs')
        .insert({
          workspace_id: context.workspaceId,
          user_id: context.userId,
          agent_type: context.agentType,
          to_phone: params.to,
          message: params.message,
          twilio_sid: message.sid,
          status: 'sent',
          sent_at: new Date().toISOString()
        });

      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  // Calendar Tools
  async bookAppointment(context: ToolContext, params: {
    title: string;
    startTime: Date;
    endTime: Date;
    attendeeEmail?: string;
    description?: string;
  }): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('appointments')
        .insert({
          workspace_id: context.workspaceId,
          user_id: context.userId,
          agent_type: context.agentType,
          title: params.title,
          start_time: params.startTime.toISOString(),
          end_time: params.endTime.toISOString(),
          attendee_email: params.attendeeEmail,
          description: params.description,
          status: 'confirmed',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error booking appointment:', error);
      return false;
    }
  }

  async getAvailableSlots(context: ToolContext, date: Date): Promise<Date[]> {
    try {
      // Get business hours from workspace settings
      const { data: workspace } = await this.supabase
        .from('workspaces')
        .select('business_hours')
        .eq('id', context.workspaceId)
        .single();

      // Get existing appointments for the date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: appointments } = await this.supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('workspace_id', context.workspaceId)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString());

      // Calculate available slots (simplified logic)
      const slots: Date[] = [];
      const businessHours = workspace?.business_hours || { start: '09:00', end: '17:00' };
      
      // Generate hourly slots between business hours
      for (let hour = 9; hour < 17; hour++) {
        const slot = new Date(date);
        slot.setHours(hour, 0, 0, 0);
        
        // Check if slot conflicts with existing appointments
        const hasConflict = appointments?.some(apt => {
          const aptStart = new Date(apt.start_time);
          const aptEnd = new Date(apt.end_time);
          return slot >= aptStart && slot < aptEnd;
        });
        
        if (!hasConflict) {
          slots.push(slot);
        }
      }

      return slots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  }

  // Voice Tools
  async makeCall(context: ToolContext, params: {
    to: string;
    from?: string;
    message?: string;
  }): Promise<boolean> {
    try {
      const call = await this.twilio.calls.create({
        to: params.to,
        from: params.from || process.env.TWILIO_PHONE_NUMBER!,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/twiml`,
        method: 'POST'
      });

      // Log call to database
      await this.supabase
        .from('call_logs')
        .insert({
          workspace_id: context.workspaceId,
          user_id: context.userId,
          agent_type: context.agentType,
          to_phone: params.to,
          twilio_sid: call.sid,
          status: 'initiated',
          created_at: new Date().toISOString()
        });

      return true;
    } catch (error) {
      console.error('Error making call:', error);
      return false;
    }
  }

  // Workflow Tools
  async triggerWorkflow(context: ToolContext, params: {
    workflowType: string;
    data: any;
  }): Promise<boolean> {
    try {
      // Queue workflow execution
      const { error } = await this.supabase
        .from('workflow_queue')
        .insert({
          workspace_id: context.workspaceId,
          user_id: context.userId,
          workflow_type: params.workflowType,
          data: params.data,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error triggering workflow:', error);
      return false;
    }
  }

  // Knowledge Base Tools
  async searchKnowledgeBase(context: ToolContext, query: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('knowledge_base')
        .select('*')
        .eq('workspace_id', context.workspaceId)
        .textSearch('content', query)
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }
  }

  // Integration Tools
  async getIntegrationData(context: ToolContext, integration: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('integration_accounts')
        .select('*')
        .eq('workspace_id', context.workspaceId)
        .eq('integration_type', integration)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting integration data:', error);
      return null;
    }
  }
}