import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/utils/colors';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentEventCard } from '@/components/dashboard/RecentEventCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'expo-router';
import { MapPin, Clock, TriangleAlert as AlertTriangle, Zap, Plus } from 'lucide-react-native';
import { 
  getOutages, 
  getLocations, 
  getDurations, 
  getDamages,
  initializeRecommendations 
} from '@/utils/storage';
import { PowerOutage, OutageSummary } from '@/types';
import { calculateDurationHours, calculateAverageDuration } from '@/utils/formatters';

export default function OverviewScreen() {
  const [summary, setSummary] = useState<OutageSummary>({
    totalOutages: 0,
    totalLocations: 0,
    totalDamages: 0,
    averageDuration: 0,
    recentOutages: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  
  const loadData = useCallback(async () => {
    try {
      await initializeRecommendations();
      
      const outages = await getOutages();
      const locations = await getLocations();
      const durations = await getDurations();
      const damages = await getDamages();
      
      const durationValues = durations.map(dur => 
        calculateDurationHours(dur.startTime, dur.endTime)
      );
      const avgDuration = calculateAverageDuration(durationValues);
      
      const sortedOutages = [...outages].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const recent = sortedOutages.slice(0, 5);
      
      setSummary({
        totalOutages: outages.length,
        totalLocations: locations.length,
        totalDamages: damages.length,
        averageDuration: avgDuration,
        recentOutages: recent,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);
  
  const handleRegisterOutage = () => {
    router.push('/register-outage');
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[600]]}
            tintColor={colors.primary[600]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Panorama Geral</Text>
          <Button
            title="Registrar"
            variant="primary"
            size="small"
            leftIcon={<Plus size={16} color="white" />}
            onPress={handleRegisterOutage}
          />
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            title="Total de Ocorrências"
            value={summary.totalOutages}
            icon={<Zap size={24} color={colors.primary[600]} />}
          />
          <StatCard
            title="Locais Afetados"
            value={summary.totalLocations}
            icon={<MapPin size={24} color={colors.warning[600]} />}
            color={colors.warning[600]}
          />
        </View>
        
        <View style={styles.statsContainer}>
          <StatCard
            title="Tempo Médio"
            value={`${summary.averageDuration.toFixed(1)}h`}
            icon={<Clock size={24} color={colors.accent[600]} />}
            color={colors.accent[600]}
          />
          <StatCard
            title="Prejuízos Reportados"
            value={summary.totalDamages}
            icon={<AlertTriangle size={24} color={colors.error[600]} />}
            color={colors.error[600]}
          />
        </View>
        
        {summary.totalOutages === 0 ? (
          <Card variant="outline" style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhum registro encontrado</Text>
            <Text style={styles.emptyDescription}>
              Registre ocorrências de falta de energia usando o botão "Registrar" acima.
            </Text>
          </Card>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Eventos Recentes</Text>
            {summary.recentOutages.map((outage) => (
              <RecentEventCard key={outage.id} outage={outage} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: Platform.OS === 'android' ? 16 : 0,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: colors.gray[900],
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.gray[800],
    marginTop: 16,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: colors.gray[800],
    marginBottom: 8,
  },
  emptyDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
});