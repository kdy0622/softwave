
export interface BrandingGuide {
  keywords: string[];
  colors: { hex: string; name: string }[];
  layouts: { id: string; name: string; description: string }[];
  copywriting: string[];
}

export interface ThumbnailConfig {
  backgroundImage: string | null;
  title: string;
  subtitle: string;
  filter: string;
  fontStyle: 'serif' | 'sans';
  icon: string | null;
  overlayOpacity: number;
}

export interface FilterConfig {
  name: string;
  css: string;
}

export type AppTab = 'editor' | 'branding' | 'history';
