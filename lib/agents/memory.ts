import { createClient } from '@supabase/supabase-js';

interface MemoryEntry {
  id: string;
  workspaceId: string;
  userId: string;
  agentType: string;
  key: string;
  value: any;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class AgentMemory {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async store(
    workspaceId: string,
    userId: string,
    agentType: string,
    key: string,
    value: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('agent_memory')
        .upsert({
          workspace_id: workspaceId,
          user_id: userId,
          agent_type: agentType,
          key,
          value: JSON.stringify(value),
          metadata,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'workspace_id,user_id,agent_type,key'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing memory:', error);
      throw error;
    }
  }

  async retrieve(
    workspaceId: string,
    userId: string,
    agentType: string,
    key: string
  ): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('agent_memory')
        .select('value')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .eq('agent_type', agentType)
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data ? JSON.parse(data.value) : null;
    } catch (error) {
      console.error('Error retrieving memory:', error);
      return null;
    }
  }

  async retrieveAll(
    workspaceId: string,
    userId: string,
    agentType: string
  ): Promise<Record<string, any>> {
    try {
      const { data, error } = await this.supabase
        .from('agent_memory')
        .select('key, value')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .eq('agent_type', agentType);

      if (error) throw error;

      const memory: Record<string, any> = {};
      data?.forEach(item => {
        memory[item.key] = JSON.parse(item.value);
      });

      return memory;
    } catch (error) {
      console.error('Error retrieving all memory:', error);
      return {};
    }
  }

  async delete(
    workspaceId: string,
    userId: string,
    agentType: string,
    key: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('agent_memory')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .eq('agent_type', agentType)
        .eq('key', key);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting memory:', error);
      throw error;
    }
  }

  async clearAll(
    workspaceId: string,
    userId: string,
    agentType?: string
  ): Promise<void> {
    try {
      let query = this.supabase
        .from('agent_memory')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId);

      if (agentType) {
        query = query.eq('agent_type', agentType);
      }

      const { error } = await query;
      if (error) throw error;
    } catch (error) {
      console.error('Error clearing memory:', error);
      throw error;
    }
  }

  // Conversation history management
  async storeConversation(
    workspaceId: string,
    userId: string,
    agentType: string,
    message: string,
    role: 'user' | 'assistant',
    metadata?: Record<string, any>
  ): Promise<void> {
    const conversations = await this.retrieve(workspaceId, userId, agentType, 'conversations') || [];
    
    conversations.push({
      id: Date.now().toString(),
      message,
      role,
      timestamp: new Date().toISOString(),
      metadata
    });

    // Keep only last 50 messages
    if (conversations.length > 50) {
      conversations.splice(0, conversations.length - 50);
    }

    await this.store(workspaceId, userId, agentType, 'conversations', conversations);
  }

  async getConversationHistory(
    workspaceId: string,
    userId: string,
    agentType: string,
    limit: number = 10
  ): Promise<any[]> {
    const conversations = await this.retrieve(workspaceId, userId, agentType, 'conversations') || [];
    return conversations.slice(-limit);
  }
}