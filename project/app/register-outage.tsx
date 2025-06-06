import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/utils/colors';
import { 
  getLocations, 
  getDurations, 
  getDamages,
  addOutage,
} from '@/utils/storage';
import { Location, Duration, Damage, PowerOutage } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, Clock, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export default function RegisterOutageScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [durations, setDurations] = useState<Duration[]>([]);
  const [damages, setDamages] = useState<Damage[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedDurationId, setSelectedDurationId] = useState('');
  const [selectedDamagesIds, setSelectedDamagesIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [dateError, setDateError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [durationError, setDurationError] = useState('');
  
  const router = useRouter();
  
  const loadData = useCallback(async () => {
    try {
      const locationsData = await getLocations();
      const durationsData = await getDurations();
      const damagesData = await getDamages();
      
      setLocations(locationsData);
      setDurations(durationsData);
      setDamages(damagesData);
    } catch (error) {
      console.error('Error loading data for outage registration:', error);
      Alert.alert(
        'Erro ao Carregar Dados',
        'Não foi possível carregar os dados necessários. Certifique-se de ter registrado pelo menos uma localização e um tempo de interrupção.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const validate = (): boolean => {
    let isValid = true;
    
    // Validate date (DD/MM/YYYY format)
    if (!selectedDate.trim()) {
      setDateError('Data é obrigatória');
      isValid = false;
    } else if (!/^(\d{2})\/(\d{2})\/(\d{4})$/.test(selectedDate.trim())) {
      setDateError('Formato deve ser DD/MM/AAAA');
      isValid = false;
    } else {
      setDateError('');
    }
    
    // Validate location
    if (!selectedLocationId) {
      setLocationError('Selecione uma localização');
      isValid = false;
    } else {
      setLocationError('');
    }
    
    // Validate duration
    if (!selectedDurationId) {
      setDurationError('Selecione um tempo de interrupção');
      isValid = false;
    } else {
      setDurationError('');
    }
    
    return isValid;
  };
  
  const handleSubmit = async () => {
    if (!validate()) return;
    
    setSubmitting(true);
    
    try {
      // Convert date string to ISO format
      const [day, month, year] = selectedDate.split('/');
      const dateISO = new Date(`${year}-${month}-${day}`).toISOString();
      
      const newOutage: PowerOutage = {
        id: uuidv4(),
        date: dateISO,
        locationId: selectedLocationId,
        durationId: selectedDurationId,
        damagesIds: selectedDamagesIds,
      };
      
      const success = await addOutage(newOutage);
      
      if (success) {
        Alert.alert(
          'Sucesso',
          'Evento de falta de energia registrado com sucesso.',
          [{ text: 'OK', onPress: () => router.replace('/') }]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível salvar o evento. Tente novamente.');
      }
    } catch (error) {
      console.error('Error saving outage:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o evento.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const toggleDamageSelection = (damageId: string) => {
    if (selectedDamagesIds.includes(damageId)) {
      setSelectedDamagesIds(selectedDamagesIds.filter(id => id !== damageId));
    } else {
      setSelectedDamagesIds([...selectedDamagesIds, damageId]);
    }
  };
  
  const renderLocationOptions = () => {
    if (locations.length === 0) {
      return (
        <Text style={styles.emptyText}>
          Nenhuma localização cadastrada. Adicione uma na tela de Localizações.
        </Text>
      );
    }
    
    return locations.map(location => (
      <Card 
        key={location.id}
        variant={selectedLocationId === location.id ? 'elevated' : 'outline'}
        style={[
          styles.optionCard,
          selectedLocationId === location.id && styles.selectedCard
        ]}
      >
        <Text
          style={[
            styles.optionText,
            selectedLocationId === location.id && styles.selectedText
          ]}
          onPress={() => setSelectedLocationId(location.id)}
        >
          {location.neighborhood}, {location.city}
          {location.zipCode ? ` - ${location.zipCode}` : ''}
        </Text>
      </Card>
    ));
  };
  
  const renderDurationOptions = () => {
    if (durations.length === 0) {
      return (
        <Text style={styles.emptyText}>
          Nenhum tempo de interrupção cadastrado. Adicione um na tela de Tempo.
        </Text>
      );
    }
    
    return durations.map(duration => {
      const startDate = new Date(duration.startTime);
      const endDate = duration.endTime ? new Date(duration.endTime) : null;
      
      let durationText = `Início: ${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`;
      if (endDate) {
        durationText += ` - Término: ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}`;
      } else {
        durationText += ' - Em andamento';
      }
      
      return (
        <Card 
          key={duration.id}
          variant={selectedDurationId === duration.id ? 'elevated' : 'outline'}
          style={[
            styles.optionCard,
            selectedDurationId === duration.id && styles.selectedCard
          ]}
        >
          <Text
            style={[
              styles.optionText,
              selectedDurationId === duration.id && styles.selectedText
            ]}
            onPress={() => setSelectedDurationId(duration.id)}
          >
            {durationText}
            {duration.isEstimated ? ' (Estimado)' : ''}
          </Text>
        </Card>
      );
    });
  };
  
  const renderDamageOptions = () => {
    if (damages.length === 0) {
      return (
        <Text style={styles.emptyText}>
          Nenhum prejuízo cadastrado. Adicione um na tela de Prejuízos (opcional).
        </Text>
      );
    }
    
    return damages.map(damage => (
      <Card 
        key={damage.id}
        variant={selectedDamagesIds.includes(damage.id) ? 'elevated' : 'outline'}
        style={[
          styles.optionCard,
          selectedDamagesIds.includes(damage.id) && styles.selectedCard
        ]}
      >
        <Text
          style={[
            styles.optionText,
            selectedDamagesIds.includes(damage.id) && styles.selectedText
          ]}
          onPress={() => toggleDamageSelection(damage.id)}
          numberOfLines={2}
        >
          {damage.description}
        </Text>
      </Card>
    ));
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Registrar Ocorrência" showBackButton />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Data da Ocorrência</Text>
        <Input
          placeholder="DD/MM/AAAA"
          value={selectedDate}
          onChangeText={setSelectedDate}
          error={dateError}
          leftIcon={<Calendar size={20} color={colors.primary[500]} />}
        />
        
        <Text style={styles.sectionTitle}>
          Localização Afetada <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}
        <View style={styles.optionsContainer}>
          {renderLocationOptions()}
        </View>
        
        <Text style={styles.sectionTitle}>
          Tempo de Interrupção <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        {durationError ? <Text style={styles.errorText}>{durationError}</Text> : null}
        <View style={styles.optionsContainer}>
          {renderDurationOptions()}
        </View>
        
        <Text style={styles.sectionTitle}>Prejuízos (opcional)</Text>
        <View style={styles.optionsContainer}>
          {renderDamageOptions()}
        </View>
        
        <Button
          title="Registrar Ocorrência"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          style={styles.submitButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: colors.gray[800],
    marginTop: 16,
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: colors.error[500],
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.error[500],
    marginBottom: 8,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionCard: {
    marginBottom: 8,
    padding: 12,
  },
  selectedCard: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  optionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.gray[800],
  },
  selectedText: {
    fontFamily: 'Inter-Medium',
    color: colors.primary[700],
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.gray[500],
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  submitButton: {
    marginTop: 24,
  },
});