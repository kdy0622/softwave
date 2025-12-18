
export interface BrandingGuide {
  keywords: string[];
  colors: { hex: string; name: string }[];
  layouts: { id: string; name: string; description: string }[];
  copywriting: string[];
}

export type FontStyle = 'serif' | 'sans' | 'display' | 'rounded' | 'script';

export interface ThumbnailConfig {
  backgroundImage: string | null;
  title: string;
  subtitle: string;
  filter: string;
  fontStyle: FontStyle;
  icon: string | null;
  overlayOpacity: number;
}

export interface FilterConfig {
  name: string;
  css: string;
}

export type AppTab = 'editor' | 'branding' | 'history';
