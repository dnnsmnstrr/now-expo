export interface NowPageData {
  status?: string;
  playlist?: {
    name: string;
    uri: string;
  };
  activities?: string[];
  plans?: string[];
  projects?: string[];
  location?: string;
  [key: string]: any;
  updatedAt: Date;
}

export type FieldType = 'string' | 'object' | 'array';

export interface CustomField {
  name: string;
  type: FieldType;
  value: any;
}