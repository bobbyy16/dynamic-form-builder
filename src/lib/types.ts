// src/lib/types.ts
export type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "derived";

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  password?: boolean;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  defaultValue?: any;
  options?: string[]; // for select, radio, checkbox
  validation?: ValidationRule;
  derived?: {
    parentFields: string[];
    formula: string;
  };
}

export interface FormSchema {
  id: string;
  name: string;
  createdAt: string;
  fields: FormField[];
}
