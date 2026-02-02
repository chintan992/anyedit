export interface SubjectEntity {
  gender: string;
  description: string;
  apparel: string;
  pose: string;
}

export interface SubjectData {
  general_summary: string;
  entities: SubjectEntity[];
}

export interface BackgroundData {
  general_summary: string;
  location: string;
  elements: string[];
}

export interface LightingData {
  description: string;
  source: string;
  quality: string;
}

export interface CompositionData {
  description: string;
  perspective: string;
  framing: string;
}

export interface AestheticData {
  description: string;
  style: string;
  mood: string;
}

// The root object strictly containing the 5 requested keys
export interface AnalysisResult {
  Subject: SubjectData;
  Background: BackgroundData;
  Lighting: LightingData;
  Composition: CompositionData;
  Aesthetic: AestheticData;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface EditConfig {
  prompt: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  imageSize: "1K" | "2K" | "4K";
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'Free' | 'Pro';
}
