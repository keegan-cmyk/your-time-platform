-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Workspaces policies
CREATE POLICY "Users can view workspaces they belong to" ON workspaces
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = workspaces.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Workspace owners can update their workspaces" ON workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Workspace owners can delete their workspaces" ON workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- Workspace members policies
CREATE POLICY "Users can view workspace members for their workspaces" ON workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_id AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = workspaces.id AND wm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Workspace owners can manage members" ON workspace_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

-- Subscriptions policies
CREATE POLICY "Users can view subscriptions for their workspaces" ON subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_id AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_id = workspaces.id AND user_id = auth.uid()
        )
      )
    )
  );

-- Agents policies
CREATE POLICY "Users can manage agents in their workspaces" ON agents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_id AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_id = workspaces.id AND user_id = auth.uid()
        )
      )
    )
  );

-- AI logs policies
CREATE POLICY "Users can view AI logs for their workspaces" ON ai_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_id AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_id = workspaces.id AND user_id = auth.uid()
        )
      )
    )
  );

-- Workflow templates policies
CREATE POLICY "Users can view public workflow templates" ON workflow_templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own workflow templates" ON workflow_templates
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create workflow templates" ON workflow_templates
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Workflow instances policies
CREATE POLICY "Users can manage workflow instances in their workspaces" ON workflow_instances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_id AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_id = workspaces.id AND user_id = auth.uid()
        )
      )
    )
  );

-- Workflow logs policies
CREATE POLICY "Users can view workflow logs for their workspaces" ON workflow_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_id AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_id = workspaces.id AND user_id = auth.uid()
        )
      )
    )
  );

-- Credentials policies
CREATE POLICY "Users can manage credentials in their workspaces" ON credentials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_id AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_id = workspaces.id AND user_id = auth.uid()
        )
      )
    )
  );

-- Integration accounts policies
CREATE POLICY "Users can manage integration accounts in their workspaces" ON integration_accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_id AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_id = workspaces.id AND user_id = auth.uid()
        )
      )
    )
  );

-- Call logs policies
CREATE POLICY "Users can view call logs for their workspaces" ON call_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_id AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_id = workspaces.id AND user_id = auth.uid()
        )
      )
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Support tickets policies
CREATE POLICY "Users can view support tickets for their workspaces" ON support_tickets
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_id AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_id = workspaces.id AND user_id = auth.uid()
        )
      )
    )
  );

-- Audit logs policies
CREATE POLICY "Users can view audit logs for their workspaces" ON audit_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_id AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_id = workspaces.id AND user_id = auth.uid()
        )
      )
    )
  );