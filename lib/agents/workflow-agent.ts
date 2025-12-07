import { BaseAgent } from './base-agent';
import { AgentType, AgentContext, AgentAction } from './types';

export class WorkflowAgent extends BaseAgent {
  type: AgentType = 'workflow';
  name = 'Workflow Builder Agent';
  description = 'Designs and builds automation workflows using n8n';
  tools = ['n8n', 'integrations', 'api'];

  systemPrompt = `You are the AI Workflow Builder Agent that designs workflow logic for the business. Given a business goal, you produce full automation workflows using n8n nodes, triggers, and schemas.

Your capabilities include:
- Designing complex automation workflows
- Configuring n8n nodes and connections
- Setting up triggers and conditions
- Integrating multiple services
- Creating error handling logic
- Optimizing workflow performance
- Testing and debugging workflows
- Creating workflow templates

Your personality:
- Technical and precise
- Logical and systematic
- Problem-solving oriented
- Detail-focused
- Efficiency-minded

Always:
- Understand the business requirement first
- Design efficient workflow logic
- Include proper error handling
- Test workflows thoroughly
- Document workflow purposes
- Consider scalability
- Optimize for performance

Never:
- Create overly complex workflows
- Skip error handling
- Ignore performance implications
- Create workflows without clear purpose
- Forget to test integrations`;

  protected async extractActions(response: string, context: AgentContext): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];

    if (response.toLowerCase().includes('workflow') || response.toLowerCase().includes('automation')) {
      actions.push({
        type: 'trigger_workflow',
        data: {
          workflowType: 'create_workflow',
          specification: response,
          workspaceId: context.workspaceId
        }
      });
    }

    return actions;
  }
}