// Tipos principais para a aplicação

export interface PowerOutage {
  id: string;
  date: string; // string ISO
  locationId: string;
  durationId: string;
  damagesIds: string[];
}

export interface Location {
  id: string;
  neighborhood: string;
  city: string;
  zipCode?: string;
  createdAt: string; // string ISO
}

export interface Duration {
  id: string;
  startTime: string; // string ISO
  endTime?: string; // string ISO
  isEstimated: boolean;
  affectedLocations?: string[];
  createdAt: string; // string ISO
}

export interface Damage {
  id: string;
  description: string;
  affectedHomes?: number;
  affectedBusinesses?: number;
  otherImpacts?: string;
  createdAt: string; // string ISO
}

export interface Recommendation {
  id: string;
  phase: 'before' | 'during' | 'after';
  title: string;
  description: string;
}

// Tipos para estatísticas e resumos
export interface OutageSummary {
  totalOutages: number;
  totalLocations: number;
  totalDamages: number;
  averageDuration: number; // em horas
  recentOutages: PowerOutage[];
}