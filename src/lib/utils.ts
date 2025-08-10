// shadcn ui utility for className merging
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FormSchema } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const saveFormToLocalStorage = (form: FormSchema) => {
  const forms = JSON.parse(localStorage.getItem("forms") || "[]");
  forms.push(form);
  localStorage.setItem("forms", JSON.stringify(forms));
};

export const getFormsFromLocalStorage = (): FormSchema[] => {
  return JSON.parse(localStorage.getItem("forms") || "[]");
};

export const getFormById = (id: string): FormSchema | null => {
  const forms = getFormsFromLocalStorage();
  return forms.find((form) => form.id === id) || null;
};

export const updateFormInLocalStorage = (updatedForm: FormSchema) => {
  const forms = getFormsFromLocalStorage();
  const formIndex = forms.findIndex((f) => f.id === updatedForm.id);
  if (formIndex !== -1) {
    forms[formIndex] = updatedForm;
    localStorage.setItem("forms", JSON.stringify(forms));
  }
};

export const deleteFormFromLocalStorage = (id: string) => {
  const forms = getFormsFromLocalStorage();
  const updatedForms = forms.filter((f) => f.id !== id);
  localStorage.setItem("forms", JSON.stringify(updatedForms));

  // Also remove related submissions
  const submissions = JSON.parse(
    localStorage.getItem("formSubmissions") || "[]"
  );
  const updatedSubmissions = submissions.filter(
    (submission: any) => submission.formId !== id
  );
  localStorage.setItem("formSubmissions", JSON.stringify(updatedSubmissions));
};
