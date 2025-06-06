import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Recommendation } from '@/types';
import { colors } from '@/utils/colors';
import { CircleAlert as AlertCircle, CloudLightning, CircleCheck as CheckCircle } from 'lucide-react-native';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  // Get the right icon and color based on the phase
  const getPhaseIcon = () => {
    switch (recommendation.phase) {
      case 'before':
        return <AlertCircle size={24} color={colors.warning[600]} />;
      case 'during':
        return <CloudLightning size={24} color={colors.error[600]} />;
      case 'after':
        return <CheckCircle size={24} color={colors.success[600]} />;
      default:
        return <AlertCircle size={24} color={colors.warning[600]} />;
    }
  };

  const getPhaseBadgeStyle = () => {
    switch (recommendation.phase) {
      case 'before':
        return styles.beforeBadge;
      case 'during':
        return styles.duringBadge;
      case 'after':
        return styles.afterBadge;
      default:
        return styles.beforeBadge;
    }
  };

  const getPhaseTextStyle = () => {
    switch (recommendation.phase) {
      case 'before':
        return styles.beforeText;
      case 'during':
        return styles.duringText;
      case 'after':
        return styles.afterText;
      default:
        return styles.beforeText;
    }
  };

  const getPhaseLabel = () => {
    switch (recommendation.phase) {
      case 'before':
        return 'Antes';
      case 'during':
        return 'Durante';
      case 'after':
        return 'Após';
      default:
        return 'Antes';
    }
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        {getPhaseIcon()}
        <View style={[styles.phaseBadge, getPhaseBadgeStyle()]}>
          <Text style={[styles.phaseText, getPhaseTextStyle()]}>
            {getPhaseLabel()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.title}>{recommendation.title}</Text>
      <Text style={styles.description}>{recommendation.description}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 12,
  },
  beforeBadge: {
    backgroundColor: colors.warning[100],
  },
  duringBadge: {
    backgroundColor: colors.error[100],
  },
  afterBadge: {
    backgroundColor: colors.success[100],
  },
  phaseText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  beforeText: {
    color: colors.warning[700],
  },
  duringText: {
    color: colors.error[700],
  },
  afterText: {
    color: colors.success[700],
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: colors.gray[900],
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
  },
});