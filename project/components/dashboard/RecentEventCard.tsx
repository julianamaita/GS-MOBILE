import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableCard } from '@/components/ui/Card';
import { PowerOutage, Location, Duration, Damage } from '@/types';
import { getLocations, getDurations, getDamages } from '@/utils/storage';
import { colors } from '@/utils/colors';
import { formatDate, calculateDurationHours, formatDuration } from '@/utils/formatters';
import { useRouter } from 'expo-router';
import { Zap } from 'lucide-react-native';

interface RecentEventCardProps {
  outage: PowerOutage;
}

export function RecentEventCard({ outage }: RecentEventCardProps) {
  const [location, setLocation] = useState<Location | null>(null);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [damages, setDamages] = useState<Damage[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        // Fetch location
        const locations = await getLocations();
        const foundLocation = locations.find(loc => loc.id === outage.locationId);
        if (foundLocation) {
          setLocation(foundLocation);
        }
        
        // Fetch duration
        const durations = await getDurations();
        const foundDuration = durations.find(dur => dur.id === outage.durationId);
        if (foundDuration) {
          setDuration(foundDuration);
        }
        
        // Fetch damages
        const allDamages = await getDamages();
        const relatedDamages = allDamages.filter(damage => 
          outage.damagesIds.includes(damage.id)
        );
        setDamages(relatedDamages);
      } catch (error) {
        console.error('Error fetching related data:', error);
      }
    };
    
    fetchRelatedData();
  }, [outage]);

  const handlePress = () => {
    router.push(`/outage/${outage.id}`);
  };

  if (!location || !duration) {
    return null; // Don't show anything if data is not loaded yet
  }

  const durationHours = calculateDurationHours(duration.startTime, duration.endTime);
  const formattedDuration = formatDuration(durationHours);

  return (
    <TouchableCard variant="elevated" style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Zap size={20} color={colors.warning[600]} />
        <Text style={styles.date}>{formatDate(outage.date)}</Text>
      </View>
      
      <Text style={styles.location}>
        {location.neighborhood}, {location.city}
      </Text>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Duração:</Text>
          <Text style={styles.detailValue}>{formattedDuration}</Text>
        </View>
        
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Impactos:</Text>
          <Text style={styles.detailValue}>{damages.length}</Text>
        </View>
      </View>
    </TouchableCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.gray[700],
    marginLeft: 8,
  },
  location: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: colors.gray[900],
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.gray[600],
    marginRight: 4,
  },
  detailValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: colors.gray[800],
  },
});