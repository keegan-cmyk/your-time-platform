import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

type OnboardingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [businessName, setBusinessName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const totalSteps = 4;
  const progress = (currentStep + 1) / totalSteps;

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Retail',
    'Real Estate',
    'Education',
    'Consulting',
    'Other',
  ];

  const services = [
    'Lead Generation',
    'Customer Support',
    'Appointment Scheduling',
    'Content Creation',
    'Email Marketing',
    'Social Media Management',
    'Sales Automation',
    'Data Analysis',
  ];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      navigation.navigate('Dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View>
            <Title style={styles.stepTitle}>Tell us about your business</Title>
            <Paragraph style={styles.stepDescription}>
              Let's start with some basic information about your business.
            </Paragraph>

            <TextInput
              label="Business Name"
              value={businessName}
              onChangeText={setBusinessName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Website URL (optional)"
              value={website}
              onChangeText={setWebsite}
              mode="outlined"
              placeholder="https://yourwebsite.com"
              style={styles.input}
            />

            <TextInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>
        );

      case 1:
        return (
          <View>
            <Title style={styles.stepTitle}>What's your industry?</Title>
            <Paragraph style={styles.stepDescription}>
              This helps us customize your automation workflows.
            </Paragraph>

            <View style={styles.chipContainer}>
              {industries.map((ind) => (
                <Chip
                  key={ind}
                  mode={industry === ind ? 'flat' : 'outlined'}
                  selected={industry === ind}
                  onPress={() => setIndustry(ind)}
                  style={styles.chip}
                >
                  {ind}
                </Chip>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View>
            <Title style={styles.stepTitle}>What services do you offer?</Title>
            <Paragraph style={styles.stepDescription}>
              Select all that apply. We'll create relevant automations for you.
            </Paragraph>

            <View style={styles.chipContainer}>
              {services.map((service) => (
                <Chip
                  key={service}
                  mode={selectedServices.includes(service) ? 'flat' : 'outlined'}
                  selected={selectedServices.includes(service)}
                  onPress={() => toggleService(service)}
                  style={styles.chip}
                >
                  {service}
                </Chip>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Title style={styles.stepTitle}>You're all set!</Title>
            <Paragraph style={styles.stepDescription}>
              We're setting up your personalized AI agents and workflows based on
              your business needs.
            </Paragraph>

            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text style={styles.summaryTitle}>Business Summary</Text>
                <Text style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Business:</Text> {businessName}
                </Text>
                <Text style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Industry:</Text> {industry}
                </Text>
                <Text style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Services:</Text>{' '}
                  {selectedServices.join(', ')}
                </Text>
              </Card.Content>
            </Card>
          </View>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return businessName.trim() !== '';
      case 1:
        return industry !== '';
      case 2:
        return selectedServices.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Title style={styles.title}>Setup Your Time</Title>
        <ProgressBar progress={progress} style={styles.progressBar} />
        <Text style={styles.stepCounter}>
          Step {currentStep + 1} of {totalSteps}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>{renderStep()}</Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <Button mode="outlined" onPress={handleBack} style={styles.backButton}>
            Back
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleNext}
          disabled={!canProceed()}
          style={styles.nextButton}
        >
          {currentStep === totalSteps - 1 ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1f2937',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  stepCounter: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  card: {
    elevation: 4,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1f2937',
  },
  stepDescription: {
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  summaryCard: {
    backgroundColor: '#f3f4f6',
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  summaryItem: {
    marginBottom: 8,
    color: '#374151',
  },
  summaryLabel: {
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});

export default OnboardingScreen;