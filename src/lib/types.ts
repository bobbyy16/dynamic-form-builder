export type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "mobile"
  | "password"
  | "derived";

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  email?: boolean;
  password?: boolean;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  defaultValue?: any;
  options?: string[];
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
