import AsyncStorage from '@react-native-async-storage/async-storage';
import { PowerOutage, Location, Duration, Damage, Recommendation } from '@/types';

// Chaves de armazenamento
const STORAGE_KEYS = {
  OUTAGES: '@powerOutages',
  LOCATIONS: '@locations',
  DURATIONS: '@durations',
  DAMAGES: '@damages',
  RECOMMENDATIONS: '@recommendations',
};

// Função genérica para obter dados
export async function getData<T>(key: string): Promise<T[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Erro ao ler do armazenamento:', e);
    return [];
  }
}

// Função genérica para salvar dados
export async function saveData<T>(key: string, data: T[]): Promise<boolean> {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (e) {
    console.error('Erro ao salvar no armazenamento:', e);
    return false;
  }
}

// Faltas de Energia
export const getOutages = (): Promise<PowerOutage[]> => getData<PowerOutage>(STORAGE_KEYS.OUTAGES);
export const saveOutages = (outages: PowerOutage[]): Promise<boolean> => saveData(STORAGE_KEYS.OUTAGES, outages);
export const addOutage = async (outage: PowerOutage): Promise<boolean> => {
  const outages = await getOutages();
  return saveOutages([...outages, outage]);
};

// Localizações
export const getLocations = (): Promise<Location[]> => getData<Location>(STORAGE_KEYS.LOCATIONS);
export const saveLocations = (locations: Location[]): Promise<boolean> => saveData(STORAGE_KEYS.LOCATIONS, locations);
export const addLocation = async (location: Location): Promise<boolean> => {
  const locations = await getLocations();
  return saveLocations([...locations, location]);
};

// Durações
export const getDurations = (): Promise<Duration[]> => getData<Duration>(STORAGE_KEYS.DURATIONS);
export const saveDurations = (durations: Duration[]): Promise<boolean> => saveData(STORAGE_KEYS.DURATIONS, durations);
export const addDuration = async (duration: Duration): Promise<boolean> => {
  const durations = await getDurations();
  return saveDurations([...durations, duration]);
};

// Prejuízos
export const getDamages = (): Promise<Damage[]> => getData<Damage>(STORAGE_KEYS.DAMAGES);
export const saveDamages = (damages: Damage[]): Promise<boolean> => saveData(STORAGE_KEYS.DAMAGES, damages);
export const addDamage = async (damage: Damage): Promise<boolean> => {
  const damages = await getDamages();
  return saveDamages([...damages, damage]);
};

// Recomendações
export const getRecommendations = (): Promise<Recommendation[]> => getData<Recommendation>(STORAGE_KEYS.RECOMMENDATIONS);
export const saveRecommendations = (recommendations: Recommendation[]): Promise<boolean> => 
  saveData(STORAGE_KEYS.RECOMMENDATIONS, recommendations);
export const addRecommendation = async (recommendation: Recommendation): Promise<boolean> => {
  const recommendations = await getRecommendations();
  return saveRecommendations([...recommendations, recommendation]);
};

// Inicializar recomendações padrão se não existirem
export const initializeRecommendations = async (): Promise<void> => {
  const existingRecommendations = await getRecommendations();
  
  if (existingRecommendations.length === 0) {
    const defaultRecommendations: Recommendation[] = [
      {
        id: '1',
        phase: 'before',
        title: 'Prepare um Kit de Emergência',
        description: 'Inclua lanternas, pilhas, suprimentos de primeiros socorros, alimentos não perecíveis e água.',
      },
      {
        id: '2',
        phase: 'before',
        title: 'Carregue Dispositivos Essenciais',
        description: 'Mantenha celulares, baterias portáteis e dispositivos médicos essenciais totalmente carregados quando houver previsão de tempestades.',
      },
      {
        id: '3',
        phase: 'during',
        title: 'Mantenha Distância de Fios Caídos',
        description: 'Nunca se aproxime ou toque em fios de energia caídos. Reporte imediatamente à companhia de energia.',
      },
      {
        id: '4',
        phase: 'during',
        title: 'Use Fontes de Luz Alternativas com Segurança',
        description: 'Use lanternas em vez de velas para evitar riscos de incêndio.',
      },
      {
        id: '5',
        phase: 'after',
        title: 'Descarte Alimentos Estragados',
        description: 'Jogue fora alimentos perecíveis que ficaram acima de 4°C por mais de 2 horas.',
      },
      {
        id: '6',
        phase: 'after',
        title: 'Verifique seus Vizinhos',
        description: 'Especialmente idosos ou pessoas com condições médicas que possam precisar de assistência.',
      },
    ];
    
    await saveRecommendations(defaultRecommendations);
  }
};

// Limpar todos os dados (para fins de teste)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.OUTAGES,
      STORAGE_KEYS.LOCATIONS,
      STORAGE_KEYS.DURATIONS,
      STORAGE_KEYS.DAMAGES,
    ]);
  } catch (e) {
    console.error('Erro ao limpar dados:', e);
  }
};