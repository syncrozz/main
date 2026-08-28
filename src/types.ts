export type PlatformCategory = 'All' | 'Education' | 'Campus' | 'Productivity' | 'Community' | 'Innovation';

export interface PlatformItem {
  id: string;
  name: string;
  subName?: string;
  tagline: string;
  description: string;
  category: 'Education' | 'Campus' | 'Productivity' | 'Community' | 'Innovation';
  badgeColor: string;
  accentColor: string;
  logoBg: string;
  iconName: string;
  features: string[];
  audience: string[];
  url?: string;
  isPopular?: boolean;
  status: 'Active' | 'Beta' | 'New';
  isCustom?: boolean;
  createdAt?: number | string;
  updatedAt?: number | string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
}

export interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  platformInterest?: string;
  message: string;
  status: 'new' | 'contacted' | 'resolved' | 'archived';
  read?: boolean;
  createdAt: number | string;
  updatedAt?: number | string;
  notes?: string;
}

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
}

export interface EcosystemStep {
  stepNumber: string;
  title: string;
  subTitle: string;
  description: string;
  iconName: string;
  color: string;
  details: string[];
}

export interface CategoryDetail {
  id: PlatformCategory;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  color: string;
  count: number;
  highlightedPlatforms: string[];
}
