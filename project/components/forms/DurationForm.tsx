import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, Switch, Platform, TouchableOpacity } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Duration } from '@/types';
import { addDuration } from '@/utils/storage';
import { colors } from '@/utils/colors';
import { Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';

interface DurationFormProps {
  onSuccess?: (duration: Duration) => void;
}

export function DurationForm({ onSuccess }: DurationFormProps) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isEstimated, setIsEstimated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const [errors, setErrors] = useState({
    startDate: '',
    endDate: '',
  });

  const formatDate = (date: Date) => {
    return dayjs(date).format('DD/MM/YYYY');
  };

  const formatTime = (date: Date) => {
    return dayjs(date).format('HH:mm');
  };

  const validate = (): boolean => {
    const newErrors = {
      startDate: '',
      endDate: '',
    };
    
    if (!startDate) {
      newErrors.startDate = 'Data e hora de início são obrigatórios';
    }
    
    if (endDate && endDate < startDate) {
      newErrors.endDate = 'Data e hora de término devem ser posteriores ao início';
    }
    
    setErrors(newErrors);
    
    return !newErrors.startDate && !newErrors.endDate;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const newDuration: Duration = {
        id: uuidv4(),
        startTime: startDate.toISOString(),
        endTime: endDate?.toISOString(),
        isEstimated,
        createdAt: new Date().toISOString(),
      };
      
      const success = await addDuration(newDuration);
      
      if (success) {
        setStartDate(new Date());
        setEndDate(null);
        setIsEstimated(false);
        setErrors({
          startDate: '',
          endDate: '',
        });
        
        onSuccess?.(newDuration);
      } else {
        Alert.alert('Erro', 'Não foi possível salvar o registro de tempo. Tente novamente.');
      }
    } catch (error) {
      console.error('Error saving duration:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o registro de tempo.');
    } finally {
      setIsLoading(false);
    }
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    if (Platform.OS === 'android') {
      setShowStartDate(false);
      setShowStartTime(true);
    }
    setStartDate(currentDate);
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTime(false);
    if (selectedTime) {
      const newDateTime = new Date(startDate);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setStartDate(newDateTime);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate || new Date();
    if (Platform.OS === 'android') {
      setShowEndDate(false);
      setShowEndTime(true);
    }
    setEndDate(currentDate);
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTime(false);
    if (selectedTime && endDate) {
      const newDateTime = new Date(endDate);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setEndDate(newDateTime);
    }
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Data de Início</Text>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowStartDate(true)}
        >
          <Clock size={20} color={colors.primary[500]} />
          <Text style={styles.dateButtonText}>
            {formatDate(startDate)} {formatTime(startDate)}
          </Text>
        </TouchableOpacity>
        {errors.startDate ? <Text style={styles.errorText}>{errors.startDate}</Text> : null}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Data de Término (opcional)</Text>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowEndDate(true)}
        >
          <Clock size={20} color={colors.primary[500]} />
          <Text style={styles.dateButtonText}>
            {endDate ? `${formatDate(endDate)} ${formatTime(endDate)}` : 'Selecionar data e hora'}
          </Text>
        </TouchableOpacity>
        {errors.endDate ? <Text style={styles.errorText}>{errors.endDate}</Text> : null}
      </View>
      
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Tempo estimado?</Text>
        <Switch
          value={isEstimated}
          onValueChange={setIsEstimated}
          trackColor={{ false: colors.gray[300], true: colors.primary[400] }}
          thumbColor={isEstimated ? colors.primary[600] : colors.gray[100]}
        />
      </View>
      
      <Button
        title="Registrar Tempo"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
      />

      {(showStartDate || showEndDate) && (
        <DateTimePicker
          value={showStartDate ? startDate : (endDate || new Date())}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={showStartDate ? onStartDateChange : onEndDateChange}
        />
      )}

      {(showStartTime || showEndTime) && (
        <DateTimePicker
          value={showStartTime ? startDate : (endDate || new Date())}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={showStartTime ? onStartTimeChange : onEndTimeChange}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.gray[700],
    marginBottom: 6,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.white,
  },
  dateButtonText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.gray[800],
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switchLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.gray[700],
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.error[500],
    marginTop: 4,
  },
  button: {
    marginTop: 8,
  },
});