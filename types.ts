import type { User } from "./auth.ts";

export interface Contact {
  name: string;
  profileImageUrl?: string;
}

export interface GeneratedCard extends Contact {
  imageUrl: string;
}

export interface PlanConfig {
  name: string;
  limit: number;
}

export interface AgencyConfig {
  appName: string;
  appAccent: string;
  logo: string | null;
  apiKey: string;
  cnameDomain: string;
  plans: {
    pro: PlanConfig;
    business: PlanConfig;
    agency: PlanConfig;
  };
  privacyPolicy?: string;
  termsAndConditions?: string;
}

// Re-export User from the new auth file to maintain a single point of type imports
export type { User };