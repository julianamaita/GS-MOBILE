import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { colors } from '@/utils/colors';
import { getOutages, getLocations, getDurations, getDamages } from '@/utils/storage';
import { PowerOutage, Location, Duration, Damage } from '@/types';
import { formatDate, formatDateTime, calculateDurationHours, formatDuration } from '@/utils/formatters';
import { MapPin, Clock, TriangleAlert as AlertTriangle, Zap } from 'lucide-react-native';

export default function OutageDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [outage, setOutage] = useState<PowerOutage | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [damages, setDamages] = useState<Damage[]>([]);

  useEffect(() => {
    const loadOutageDetails = async () => {
      try {
        const outages = await getOutages();
        const foundOutage = outages.find(o => o.id === id);
        
        if (foundOutage) {
          setOutage(foundOutage);
          
          // Load related data
          const locations = await getLocations();
          const durations = await getDurations();
          const allDamages = await getDamages();
          
          setLocation(locations.find(l => l.id === foundOutage.locationId) || null);
          setDuration(durations.find(d => d.id === foundOutage.durationId) || null);
          setDamages(allDamages.filter(d => foundOutage.damagesIds.includes(d.id)));
        }
      } catch (error) {
        console.error('Error loading outage details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOutageDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (!outage || !location || !duration) {
    return (
      <View style={styles.container}>
        <Header title="Detalhes da Ocorrência" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ocorrência não encontrada</Text>
        </View>
      </View>
    );
  }

  const durationHours = calculateDurationHours(duration.startTime, duration.endTime);
  const formattedDuration = formatDuration(durationHours);

  return (
    <View style={styles.container}>
      <Header title="Detalhes da Ocorrência" showBackButton />
      
      <ScrollView style={styles.content}>
        <Card variant="elevated" style={styles.dateCard}>
          <View style={styles.iconRow}>
            <Zap size={24} color={colors.warning[600]} />
            <Text style={styles.date}>{formatDate(outage.date)}</Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Localização</Text>
        <Card variant="elevated" style={styles.card}>
          <View style={styles.iconRow}>
            <MapPin size={20} color={colors.primary[600]} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>{location.neighborhood}</Text>
              <Text style={styles.locationSubtitle}>{location.city}</Text>
              {location.zipCode && (
                <Text style={styles.locationDetails}>CEP: {location.zipCode}</Text>
              )}
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Duração</Text>
        <Card variant="elevated" style={styles.card}>
          <View style={styles.iconRow}>
            <Clock size={20} color={colors.primary[600]} />
            <View style={styles.durationInfo}>
              <Text style={styles.durationValue}>{formattedDuration}</Text>
              <Text style={styles.timeLabel}>Início: {formatDateTime(duration.startTime)}</Text>
              {duration.endTime ? (
                <Text style={styles.timeLabel}>Término: {formatDateTime(duration.endTime)}</Text>
              ) : (
                <Text style={styles.ongoingText}>Em andamento</Text>
              )}
              {duration.isEstimated && (
                <View style={styles.estimatedBadge}>
                  <Text style={styles.estimatedText}>Tempo Estimado</Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {damages.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Prejuízos Reportados</Text>
            {damages.map(damage => (
              <Card key={damage.id} variant="elevated" style={styles.card}>
                <View style={styles.iconRow}>
                  <AlertTriangle size={20} color={colors.error[600]} />
                  <View style={styles.damageInfo}>
                    <Text style={styles.damageDescription}>{damage.description}</Text>
                    <View style={styles.damageStats}>
                      {damage.affectedHomes !== undefined && (
                        <Text style={styles.damageStat}>
                          Residências afetadas: {damage.affectedHomes}
                        </Text>
                      )}
                      {damage.affectedBusinesses !== undefined && (
                        <Text style={styles.damageStat}>
                          Estabelecimentos afetados: {damage.affectedBusinesses}
                        </Text>
                      )}
                    </View>
                    {damage.otherImpacts && (
                      <Text style={styles.otherImpacts}>{damage.otherImpacts}</Text>
                    )}
                  </View>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  dateCard: {
    marginBottom: 24,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  date: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.gray[900],
    marginLeft: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: colors.gray[800],
    marginBottom: 8,
  },
  card: {
    marginBottom: 16,
  },
  locationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: colors.gray[900],
    marginBottom: 4,
  },
  locationSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.gray[700],
  },
  locationDetails: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4,
  },
  durationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  durationValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.gray[900],
    marginBottom: 8,
  },
  timeLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.gray[700],
    marginBottom: 4,
  },
  ongoingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.warning[600],
  },
  estimatedBadge: {
    backgroundColor: colors.warning[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  estimatedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.warning[700],
  },
  damageInfo: {
    marginLeft: 12,
    flex: 1,
  },
  damageDescription: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.gray[800],
    marginBottom: 8,
  },
  damageStats: {
    marginBottom: 4,
  },
  damageStat: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.gray[700],
    marginBottom: 2,
  },
  otherImpacts: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.gray[600],
    fontStyle: 'italic',
  },
});