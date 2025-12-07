export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
  Onboarding: undefined;
  AgentChat: { agentId: string };
  WorkflowDetails: { workflowId: string };
  Settings: undefined;
  Profile: undefined;
};

export type TabParamList = {
  Home: undefined;
  Agents: undefined;
  Workflows: undefined;
  Analytics: undefined;
  Settings: undefined;
};