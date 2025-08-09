// shadcn ui utility for className merging
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import type { FormSchema } from "./types";

export const saveFormToLocalStorage = (form: FormSchema) => {
  const forms = JSON.parse(localStorage.getItem("forms") || "[]");
  forms.push(form);
  localStorage.setItem("forms", JSON.stringify(forms));
};

export const getFormsFromLocalStorage = (): FormSchema[] => {
  return JSON.parse(localStorage.getItem("forms") || "[]");
};
