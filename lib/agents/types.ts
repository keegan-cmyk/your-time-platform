export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AgentContext {
  workspaceId: string;
  userId: string;
  businessInfo?: {
    name: string;
    industry: string;
    website?: string;
    phone?: string;
    businessHours?: string;
    services?: string[];
  };
  integrations?: {
    crm?: any;
    calendar?: any;
    email?: any;
  };
  conversationHistory: AgentMessage[];
}

export interface AgentResponse {
  message: string;
  actions?: AgentAction[];
  nextAgent?: string;
  metadata?: Record<string, any>;
}

export interface AgentAction {
  type: 'send_email' | 'send_sms' | 'book_appointment' | 'update_crm' | 'trigger_workflow' | 'make_call';
  data: Record<string, any>;
}

export type AgentType = 'sales' | 'support' | 'appointment' | 'voice' | 'content' | 'workflow';

export interface Agent {
  type: AgentType;
  name: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  run: (message: string, context: AgentContext) => Promise<AgentResponse>;
}