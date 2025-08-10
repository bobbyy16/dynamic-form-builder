import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, Eye, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import type { FormField, FormSchema } from "@/lib/types";
import { getFormById } from "@/lib/utils";

export default function PreviewForm() {
  const [form, setForm] = useState<FormSchema | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const formId = searchParams.get("id");

  useEffect(() => {
    if (formId) {
      // First try to get from localStorage (for preview from create form)
      const previewFormData = localStorage.getItem("previewForm");
      if (previewFormData) {
        const parsedForm = JSON.parse(previewFormData);
        if (parsedForm.id === formId) {
          setForm(parsedForm);
          initializeFormData(parsedForm);
          setLoading(false);
          return;
        }
      }

      // Then try to get from saved forms
      const formData = getFormById(formId);
      if (formData) {
        setForm(formData);
        initializeFormData(formData);
      } else {
        toast.error("Form not found");
      }
    } else {
      toast.error("No form ID provided");
    }
    setLoading(false);
  }, [formId, toast]);

  const initializeFormData = (formSchema: FormSchema) => {
    const initialData: Record<string, any> = {};
    formSchema.fields.forEach((field: FormField) => {
      if (field.type === "checkbox") {
        initialData[field.id] = [];
      } else {
        initialData[field.id] = field.defaultValue || "";
      }
    });
    setFormData(initialData);
  };

  const evaluateDerivedField = (
    field: FormField,
    formData: Record<string, any>
  ): string => {
    try {
      if (!field.derived?.formula) return "";
      // Map field IDs to valid JS variable names (e.g., f_123456)
      const context = { ...formData };
      const idToVar: Record<string, string> = {};
      Object.keys(context).forEach((id) => {
        // If id is not a valid JS variable name, prefix with 'f_'
        idToVar[id] = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(id) ? id : `f_${id}`;
      });
      // Build args and values for the function
      const argNames = Object.values(idToVar);
      const argValues = Object.keys(context).map((id) => context[id]);
      // Replace field IDs in formula with their variable names
      let formula = field.derived.formula;
      Object.entries(idToVar).forEach(([id, varName]) => {
        // Replace all occurrences of the field id with the variable name (word boundary)
        formula = formula.replace(new RegExp(`\\b${id}\\b`, "g"), varName);
      });
      const fn = new Function(...argNames, `return ${formula}`);
      return fn(...argValues);
    } catch (error) {
      console.error(`Error evaluating derived field ${field.id}:`, error);
      return "Error in formula";
    }
  };

  const updateDerivedFields = (newFormData: Record<string, any>) => {
    if (!form) return newFormData;

    const updatedData = { ...newFormData };
    form.fields.forEach((field) => {
      if (field.type === "derived" && field.derived?.formula) {
        updatedData[field.id] = evaluateDerivedField(field, updatedData);
      }
    });
    return updatedData;
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [fieldId]: value,
      };
      // Update derived fields whenever any input changes
      return updateDerivedFields(newData);
    });

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: "",
      }));
    }
  };

  const handleCheckboxChange = (
    fieldId: string,
    option: string,
    checked: boolean
  ) => {
    setFormData((prev) => {
      const currentValues = prev[fieldId] || [];
      if (checked) {
        return {
          ...prev,
          [fieldId]: [...currentValues, option],
        };
      } else {
        return {
          ...prev,
          [fieldId]: currentValues.filter((val: string) => val !== option),
        };
      }
    });
    // Clear error when user makes selection
    if (errors[fieldId]) {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form) return false;

    form.fields.forEach((field) => {
      // Password validation
      if (field.type === "password") {
        const pwd = formData[field.id];
        if (pwd) {
          if (
            field.validation?.minLength &&
            pwd.length < field.validation.minLength
          ) {
            newErrors[
              field.id
            ] = `${field.label} must be at least ${field.validation.minLength} characters`;
          }
          if (
            field.validation?.maxLength &&
            pwd.length > field.validation.maxLength
          ) {
            newErrors[
              field.id
            ] = `${field.label} must be at most ${field.validation.maxLength} characters`;
          }
          if (field.validation?.password) {
            // At least one uppercase, one lowercase, one digit, one special char
            const strong =
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
            if (!strong.test(pwd)) {
              newErrors[field.id] =
                "Password must contain uppercase, lowercase, number, and special character";
            }
          }
        }
      }

      // Derived fields: skip validation (read-only)
      if (field.type === "derived") return;
      const value = formData[field.id];
      // Required validation
      if (field.validation?.required) {
        if (field.type === "checkbox") {
          if (!value || value.length === 0) {
            newErrors[field.id] = `${field.label} is required`;
          }
        } else if (!value || (typeof value === "string" && !value.trim())) {
          newErrors[field.id] = `${field.label} is required`;
        }
      }

      // Min/Max validation for number and text
      if (field.type === "number" && value) {
        const num = Number(value);
        if (field.validation?.min !== undefined && num < field.validation.min) {
          newErrors[
            field.id
          ] = `${field.label} must be at least ${field.validation.min}`;
        }
        if (field.validation?.max !== undefined && num > field.validation.max) {
          newErrors[
            field.id
          ] = `${field.label} must be at most ${field.validation.max}`;
        }
      }
      if (field.type === "text" && value) {
        if (
          field.validation?.minLength &&
          value.length < field.validation.minLength
        ) {
          newErrors[
            field.id
          ] = `${field.label} must be at least ${field.validation.minLength} characters`;
        }
        if (
          field.validation?.maxLength &&
          value.length > field.validation.maxLength
        ) {
          newErrors[
            field.id
          ] = `${field.label} must be at most ${field.validation.maxLength} characters`;
        }
      }

      // Email validation for text fields that might be email
      if (
        field.type === "text" &&
        field.label.toLowerCase().includes("email") &&
        value
      ) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.id] = "Please enter a valid email address";
        }
      }

      // Mobile number validation (for text fields labeled as mobile/phone)
      if (
        (field.type === "text" ||
          field.type === "mobile" ||
          field.type === "number") &&
        field.label.toLowerCase().match(/(mobile|phone|cell)/) &&
        value
      ) {
        // Accepts 10-15 digits, optional +, spaces, dashes
        const phoneRegex = /^\+?[0-9\s\-]{10,15}$/;
        if (!phoneRegex.test(value)) {
          newErrors[field.id] =
            "Please enter a valid mobile number 10-15 digits";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const submissions = JSON.parse(
          localStorage.getItem("formSubmissions") || "[]"
        );
        const newSubmissionId = Date.now().toString();
        const newSubmission = {
          id: newSubmissionId,
          formId: form?.id,
          formName: form?.name,
          data: formData,
          submittedAt: new Date().toISOString(),
        };
        submissions.push(newSubmission);
        localStorage.setItem("formSubmissions", JSON.stringify(submissions));
        setSubmissionId(newSubmissionId);
        setIsSubmitted(true);
        toast.success("Form submitted successfully!");
      } catch (error) {
        console.error("Error saving form submission:", error);
        toast.error("Form submitted but could not be saved. Please try again.");
      }
    }
  };

  const resetForm = () => {
    if (form) {
      initializeFormData(form);
    }
    setErrors({});
    setIsSubmitted(false);
    setSubmissionId("");
  };

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.id];
    const errorMessage = errors[field.id];

    switch (field.type) {
      case "password":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.id}
              type="password"
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder="Enter password..."
              className={hasError ? "border-red-500" : ""}
            />
            {hasError && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        );
      case "derived":
        let derivedValue =
          field.type === "derived" ? formData[field.id] || "" : "";
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type="text"
              value={derivedValue}
              readOnly
              className="bg-gray-100 text-gray-500"
            />
          </div>
        );
      case "mobile":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.id}
              type="tel"
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder="Enter mobile number..."
              className={hasError ? "border-red-500" : ""}
              pattern="[0-9\s\-]+"
              inputMode="tel"
              minLength={10}
              maxLength={15}
            />
            {hasError && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        );
      case "text":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.id}
              type="text"
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              className={hasError ? "border-red-500" : ""}
            />
            {hasError && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.id}
              type="number"
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              className={hasError ? "border-red-500" : ""}
            />
            {hasError && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Textarea
              id={field.id}
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              rows={4}
              className={hasError ? "border-red-500" : ""}
            />
            {hasError && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Select
              value={formData[field.id] || ""}
              onValueChange={(value) => handleInputChange(field.id, value)}
            >
              <SelectTrigger className={hasError ? "border-red-500" : ""}>
                <SelectValue placeholder="Please select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-3">
            <Label>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <RadioGroup
              value={formData[field.id] || ""}
              onValueChange={(value) => handleInputChange(field.id, value)}
              className={`space-y-2 ${
                hasError ? "border border-red-500 rounded-md p-3" : ""
              }`}
            >
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                  <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {hasError && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="space-y-3">
            <Label>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <div
              className={`space-y-2 ${
                hasError ? "border border-red-500 rounded-md p-3" : ""
              }`}
            >
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${index}`}
                    checked={(formData[field.id] || []).includes(option)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(field.id, option, checked as boolean)
                    }
                  />
                  <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
            {hasError && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={hasError ? "border-red-500" : ""}
            />
            {hasError && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Navigation />
          <Card className="mt-8">
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-pulse text-center">
                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading form preview...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Navigation />
          <Card className="mt-8">
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Form not found
              </h2>
              <p className="text-gray-600">
                The form you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Navigation />
          <Card className="mt-8">
            <CardContent className="text-center py-12">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Form Submitted Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for submitting the form. Your response has been
                recorded.
              </p>
              <Card className="bg-gray-50 mb-6">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Submission Details:
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Submission ID: {submissionId}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Form: {form.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Submitted: {new Date().toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Button onClick={resetForm} variant="outline">
                Submit Another Response
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Navigation />
        <div className="text-center mb-8 mt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Eye className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Form Preview
            </h1>
          </div>
          <p className="text-gray-600">
            This is how your form will appear to users
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {form.name}
            </CardTitle>
            <p className="text-gray-600">
              Please fill out all required fields marked with{" "}
              <span className="text-red-500">*</span>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields.map((field) => renderField(field))}
              <div className="pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 text-lg font-medium"
                  size="lg"
                >
                  <Send className="h-5 w-5" />
                  Submit Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
