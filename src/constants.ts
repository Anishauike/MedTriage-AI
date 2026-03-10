import { TriageLevel } from './types';

export const TRIAGE_LEVELS: Record<TriageLevel, { color: string; description: string; priority: number }> = {
  'Emergency': {
    color: 'bg-red-600 text-white',
    description: 'Immediate, life-saving intervention required.',
    priority: 1
  },
  'Urgent': {
    color: 'bg-orange-500 text-white',
    description: 'Serious condition; requires assessment within 30-60 minutes.',
    priority: 2
  },
  'Routine': {
    color: 'bg-green-500 text-white',
    description: 'Stable condition; requires assessment within 1-2 hours.',
    priority: 3
  },
  'Self-care': {
    color: 'bg-blue-500 text-white',
    description: 'Stable condition; can wait for assessment or self-treat.',
    priority: 4
  }
};

export const INITIAL_VITALS = {
  heartRate: 75,
  systolicBP: 120,
  diastolicBP: 80,
  spO2: 98,
  temperature: 37.0,
  painLevel: 0
};

export const SYMPTOMS_LIST = [
  'Chest Pain',
  'Breathing Difficulty',
  'Severe Bleeding',
  'Dizziness',
  'Fever',
  'Vomiting'
];
