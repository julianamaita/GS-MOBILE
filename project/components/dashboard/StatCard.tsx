import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { colors } from '@/utils/colors';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

export function StatCard({ title, value, icon, color = colors.primary[600] }: StatCardProps) {
  return (
    <Card variant="elevated" style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[600],
    padding: 12,
    marginHorizontal: 6,
    marginBottom: 12,
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 4,
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.primary[600],
  },
});