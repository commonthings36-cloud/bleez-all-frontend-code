export interface Watermark {
  id?: string;
  name: string;
  type: 'TEXT' | 'IMAGE' | 'LOGO' | 'TEXT_AND_LOGO' | 'DYNAMIC_TEXT';
  textTemplate?: string;
  imageUrl?: string;
  font?: string;
  fontSize?: number;
  fontColorHex?: string;
  opacity?: number;
  rotationDegrees?: number;
  position?: 'CENTER' | 'BOTTOM_RIGHT' | 'BOTTOM_CENTER' | 'DIAGONAL_FULL' | 'REPEATED_GRID';
  repeatAcrossPage?: boolean;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WatermarkRule {
  id?: string;
  name: string;
  priority: number;
  audience?: string;
  planCode?: string;
  organizationId?: string;
  outputType?: string;
  enabled: boolean;
  watermarkId?: string;
  isCleanOutput?: boolean;
  status?: string;
  createdAt?: string;
}

export interface WatermarkTestResult {
  applyWatermark: boolean;
  ruleName?: string;
  matchedPriority?: number;
  watermark?: Watermark;
  resolvedText?: string;
}
