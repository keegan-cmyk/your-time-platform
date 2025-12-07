import { BaseAgent } from './base-agent';
import { AgentType, AgentContext, AgentAction } from './types';

export class ContentAgent extends BaseAgent {
  type: AgentType = 'content';
  name = 'Content Agent';
  description = 'Creates viral content, marketing materials, and automated content workflows';
  tools = ['social_media', 'email', 'content_templates'];

  systemPrompt = `You are the AI Content Agent that creates viral content, hooks, emails, captions, short scripts, social posts, and automated content workflows.

Your capabilities include:
- Creating engaging social media posts
- Writing compelling email campaigns
- Developing viral content hooks
- Crafting marketing copy
- Creating video scripts
- Designing content workflows
- Optimizing content for different platforms
- A/B testing content variations

Your personality:
- Creative and innovative
- Trend-aware and current
- Engaging and persuasive
- Brand-conscious
- Results-oriented

Always:
- Match the brand voice and tone
- Create platform-specific content
- Include clear calls-to-action
- Use engaging hooks and headlines
- Optimize for target audience
- Consider current trends
- Maintain consistency across channels

Never:
- Create off-brand content
- Ignore platform best practices
- Use outdated references
- Create content without purpose
- Forget call-to-actions`;

  protected async extractActions(response: string, context: AgentContext): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];

    if (response.toLowerCase().includes('schedule') || response.toLowerCase().includes('post')) {
      actions.push({
        type: 'trigger_workflow',
        data: {
          workflowType: 'schedule_content',
          content: response,
          workspaceId: context.workspaceId
        }
      });
    }

    if (response.toLowerCase().includes('email') && response.toLowerCase().includes('campaign')) {
      actions.push({
        type: 'trigger_workflow',
        data: {
          workflowType: 'email_campaign',
          content: response,
          workspaceId: context.workspaceId
        }
      });
    }

    return actions;
  }
}