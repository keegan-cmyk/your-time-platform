import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Chip,
  Avatar,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { supabase, Agent, WorkflowInstance } from '../../lib/supabase';

const DashboardScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      // Load agents
      const { data: agentsData } = await supabase
        .from('agents')
        .select('*')
        .eq('is_active', true)
        .limit(5);

      // Load workflows
      const { data: workflowsData } = await supabase
        .from('workflow_instances')
        .select('*')
        .eq('status', 'active')
        .limit(5);

      setAgents(agentsData || []);
      setWorkflows(workflowsData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'sales':
        return '💼';
      case 'support':
        return '🎧';
      case 'appointment':
        return '📅';
      case 'content':
        return '✍️';
      case 'workflow':
        return '⚙️';
      case 'voice':
        return '🎤';
      default:
        return '🤖';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Title style={styles.welcomeText}>
              Welcome back, {user?.email?.split('@')[0]}!
            </Title>
            <Paragraph style={styles.subtitle}>
              Here's what's happening with your automation
            </Paragraph>
          </View>
          <Button mode="text" onPress={signOut}>
            Sign Out
          </Button>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>{agents.length}</Title>
              <Paragraph>Active Agents</Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>{workflows.length}</Title>
              <Paragraph>Running Workflows</Paragraph>
            </Card.Content>
          </Card>
        </View>

        {/* Active Agents */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Active Agents</Title>
            {agents.length > 0 ? (
              agents.map((agent) => (
                <View key={agent.id} style={styles.agentItem}>
                  <Avatar.Text
                    size={40}
                    label={getAgentIcon(agent.type)}
                    style={styles.agentAvatar}
                  />
                  <View style={styles.agentInfo}>
                    <Text style={styles.agentName}>{agent.name}</Text>
                    <Chip mode="outlined" compact>
                      {agent.type}
                    </Chip>
                  </View>
                </View>
              ))
            ) : (
              <Paragraph>No active agents yet. Create your first agent!</Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Active Workflows */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Active Workflows</Title>
            {workflows.length > 0 ? (
              workflows.map((workflow) => (
                <View key={workflow.id} style={styles.workflowItem}>
                  <View style={styles.workflowInfo}>
                    <Text style={styles.workflowName}>{workflow.name}</Text>
                    <Paragraph>{workflow.execution_count} executions</Paragraph>
                  </View>
                  <Chip
                    mode="flat"
                    style={[
                      styles.statusChip,
                      { backgroundColor: '#dcfce7' },
                    ]}
                  >
                    {workflow.status}
                  </Chip>
                </View>
              ))
            ) : (
              <Paragraph>
                No active workflows yet. Set up your first automation!
              </Paragraph>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          // Navigate to create agent/workflow
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingTop: 60,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  sectionCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1f2937',
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  agentAvatar: {
    marginRight: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#1f2937',
  },
  workflowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  workflowInfo: {
    flex: 1,
  },
  workflowName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#1f2937',
  },
  statusChip: {
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6366f1',
  },
});

export default DashboardScreen;