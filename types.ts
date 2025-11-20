export interface CleaningAnalysis {
  roomName: string;
  score: number;
  summary: string;
  issues: string[];
  tips: string[];
}

export interface RoomEntry {
  id: string;
  file: File;
  previewUrl: string;
  status: 'analyzing' | 'complete' | 'error';
  analysis: CleaningAnalysis | null;
  error?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING', // Used when at least one image is being analyzed
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}