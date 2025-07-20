export interface UploadedFile {
  name: string;
  size: string;
  type: 'md' | 'docx';
  file: File;
}

export interface ProcessingOptions {
  tableOfContents: boolean;
  harvardCitations: boolean;
  downloadImages: boolean;
  aiReview: boolean;
}

export type LayoutStyle = 'business' | 'academic' | 'novel' | 'modern' | 'classic';
export type OutputFormat = 'pdf' | 'docx';

export interface DocumentStructure {
  title?: string;
  content: DocumentElement[];
  images: ImageElement[];
  citations: Citation[];
}

export interface DocumentElement {
  type: 'heading' | 'paragraph' | 'image' | 'list' | 'table';
  level?: number; // for headings
  content: string;
  style?: string;
}

export interface ImageElement {
  url: string;
  alt: string;
  position: number;
  blob?: Blob;
}

export interface Citation {
  original: string;
  harvard: string;
  position: number;
}

export interface ProcessingResult {
  success: boolean;
  downloadUrl?: string;
  error?: string;
  aiReviewResults?: AIReviewResult[];
}

export interface AIReviewResult {
  page: number;
  issues: string[];
  suggestions: string[];
  score: number;
}