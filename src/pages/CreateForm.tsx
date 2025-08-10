import { useState } from "react";
import { Plus, Trash2, Save, ArrowUp, ArrowDown } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import type { FieldType, FormField, FormSchema } from "@/lib/types";
import { saveFormToLocalStorage } from "@/lib/utils";

export default function CreateForm() {
  const [formName, setFormName] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);

  const fieldTypes: { value: FieldType; label: string }[] = [
    { value: "text", label: "Text Input" },
    { value: "number", label: "Number" },
    { value: "password", label: "Password" },
    { value: "textarea", label: "Text Area" },
    { value: "select", label: "Select Dropdown" },
    { value: "radio", label: "Radio Buttons" },
    { value: "checkbox", label: "Checkboxes" },
    { value: "date", label: "Date Picker" },
    { value: "mobile", label: "Mobile Number" },
    { value: "derived", label: "Derived Field" },
  ];

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: "text",
      label: "",
      validation: {},
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const newFields = [...fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[index], newFields[targetIndex]] = [
        newFields[targetIndex],
        newFields[index],
      ];
      setFields(newFields);
    }
  };

  const addOption = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field) {
      const options = field.options || [];
      updateField(fieldId, { options: [...options, ""] });
    }
  };

  const updateOption = (
    fieldId: string,
    optionIndex: number,
    value: string
  ) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field && field.options) {
      const newOptions = field.options.filter((_, i) => i !== optionIndex);
      updateField(fieldId, { options: newOptions });
    }
  };

  const updateValidation = (fieldId: string, key: string, value: any) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field) {
      updateField(fieldId, {
        validation: {
          ...field.validation,
          [key]: value,
        },
      });
    }
  };

  const validateForm = () => {
    if (!formName.trim()) {
      toast.error("Please enter a form name");
      return false;
    }
    if (fields.length === 0) {
      toast.error("Please add at least one field");
      return false;
    }

    for (const field of fields) {
      if (!field.label.trim()) {
        toast.error("Please enter labels for all fields");
        return false;
      }

      if (
        needsOptions(field.type) &&
        (!field.options ||
          field.options.length === 0 ||
          field.options.some((opt) => !opt.trim()))
      ) {
        toast.error(`Please add valid options for ${field.label}`);
        return false;
      }

      if (field.type === "derived") {
        if (!field.derived?.parentFields?.length) {
          toast.error(
            `Please select parent fields for derived field: ${field.label}`
          );
          return false;
        }
        if (!field.derived?.formula?.trim()) {
          toast.error(
            `Please enter a formula for derived field: ${field.label}`
          );
          return false;
        }
      }
    }
    return true;
  };

  const saveForm = () => {
    if (!validateForm()) return;

    const formSchema: FormSchema = {
      id: Date.now().toString(),
      name: formName,
      createdAt: new Date().toISOString(),
      fields: fields,
    };

    try {
      saveFormToLocalStorage(formSchema);
      toast.success("Form saved successfully!");
      setFormName("");
      setFields([]);
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Error saving form. Please try again.");
    }
  };

  const needsOptions = (type: FieldType) => {
    return ["select", "radio", "checkbox"].includes(type);
  };

  const supportsValidation = (type: FieldType) => {
    return !["derived", "checkbox", "radio"].includes(type);
  };

  const getAvailableParentFields = (currentFieldId: string) => {
    return fields.filter(
      (f) => f.id !== currentFieldId && f.type !== "derived"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Navigation />
        <div className="text-center mb-8 mt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Create New Form
          </h1>
          <p className="text-lg text-gray-600">
            Build your custom form with our easy-to-use builder
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="form-name">Form Name</Label>
              <Input
                id="form-name"
                placeholder="Enter form name..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              Form Fields
            </h2>
            <Button onClick={addField} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Field
            </Button>
          </div>

          {fields.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 mb-4">No fields added yet</p>
                <Button
                  onClick={addField}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Field
                </Button>
              </CardContent>
            </Card>
          ) : (
            fields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Field {index + 1}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => moveField(index, "up")}
                        variant="outline"
                        size="sm"
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => moveField(index, "down")}
                        variant="outline"
                        size="sm"
                        disabled={index === fields.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => removeField(field.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Field Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value: FieldType) =>
                          updateField(field.id, {
                            type: value,
                            options: needsOptions(value) ? [""] : undefined,
                            derived:
                              value === "derived"
                                ? { parentFields: [], formula: "" }
                                : undefined,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Field Label</Label>
                      <Input
                        placeholder="Enter field label..."
                        value={field.label}
                        onChange={(e) =>
                          updateField(field.id, { label: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {field.type !== "derived" &&
                    (field.type === "text" ||
                      field.type === "password" ||
                      field.type === "mobile" ||
                      field.type === "number") && (
                      <div className="space-y-2">
                        <Label>Default Value</Label>
                        <Input
                          type={field.type === "number" ? "number" : "text"}
                          placeholder="Enter default value..."
                          value={field.defaultValue || ""}
                          onChange={(e) =>
                            updateField(field.id, {
                              defaultValue: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}

                  {field.type === "textarea" && (
                    <div className="space-y-2">
                      <Label>Default Value</Label>
                      <Textarea
                        placeholder="Enter default value..."
                        value={field.defaultValue || ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            defaultValue: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                  )}

                  {field.type === "date" && (
                    <div className="space-y-2">
                      <Label>Default Value</Label>
                      <Input
                        type="date"
                        value={field.defaultValue || ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            defaultValue: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  {needsOptions(field.type) && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Options</Label>
                        <Button
                          onClick={() => addOption(field.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(field.options || []).map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <Input
                              placeholder={`Option ${optionIndex + 1}`}
                              value={option}
                              onChange={(e) =>
                                updateOption(
                                  field.id,
                                  optionIndex,
                                  e.target.value
                                )
                              }
                            />
                            <Button
                              onClick={() =>
                                removeOption(field.id, optionIndex)
                              }
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {field.type === "derived" && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
                      <h4 className="font-medium text-blue-900">
                        Derived Field Configuration
                      </h4>

                      <div className="space-y-2">
                        <Label>Parent Fields (Select Multiple)</Label>
                        <div className="space-y-2">
                          {getAvailableParentFields(field.id).map(
                            (parentField) => (
                              <div
                                key={parentField.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`parent-${field.id}-${parentField.id}`}
                                  checked={
                                    field.derived?.parentFields?.includes(
                                      parentField.id
                                    ) || false
                                  }
                                  onCheckedChange={(checked) => {
                                    const currentParents =
                                      field.derived?.parentFields || [];
                                    const newParents = checked
                                      ? [...currentParents, parentField.id]
                                      : currentParents.filter(
                                          (id) => id !== parentField.id
                                        );

                                    updateField(field.id, {
                                      derived: {
                                        parentFields: newParents,
                                        formula: field.derived?.formula || "",
                                      },
                                    });
                                  }}
                                />
                                <Label
                                  htmlFor={`parent-${field.id}-${parentField.id}`}
                                >
                                  {parentField.label ||
                                    `Field ${parentField.id}`}{" "}
                                  ({parentField.type})
                                </Label>
                              </div>
                            )
                          )}
                        </div>
                        {getAvailableParentFields(field.id).length === 0 && (
                          <p className="text-sm text-gray-500">
                            No available parent fields. Add other fields first.
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Formula</Label>
                        <Input
                          placeholder="e.g., field1 + field2 or 2024 - birthYear"
                          value={field.derived?.formula || ""}
                          onChange={(e) =>
                            updateField(field.id, {
                              derived: {
                                parentFields: field.derived?.parentFields || [],
                                formula: e.target.value,
                              },
                            })
                          }
                        />
                        <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                          <strong>Available variables:</strong>{" "}
                          {field.derived?.parentFields
                            ?.map((pid) => {
                              const parent = fields.find((f) => f.id === pid);
                              return parent
                                ? `${pid} (${parent.label || "unlabeled"})`
                                : pid;
                            })
                            .join(", ") || "None selected"}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`required-${field.id}`}
                        checked={field.validation?.required || false}
                        onCheckedChange={(checked) =>
                          updateValidation(field.id, "required", checked)
                        }
                        disabled={field.type === "derived"}
                      />
                      <Label htmlFor={`required-${field.id}`}>
                        Required field
                      </Label>
                    </div>

                    {supportsValidation(field.type) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(field.type === "text" ||
                          field.type === "textarea" ||
                          field.type === "password") && (
                          <>
                            <div className="space-y-2">
                              <Label>Minimum Length</Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Min length"
                                value={field.validation?.minLength || ""}
                                onChange={(e) =>
                                  updateValidation(
                                    field.id,
                                    "minLength",
                                    e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Maximum Length</Label>
                              <Input
                                type="number"
                                min="1"
                                placeholder="Max length"
                                value={field.validation?.maxLength || ""}
                                onChange={(e) =>
                                  updateValidation(
                                    field.id,
                                    "maxLength",
                                    e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </div>
                          </>
                        )}

                        {field.type === "number" && (
                          <>
                            <div className="space-y-2">
                              <Label>Minimum Value</Label>
                              <Input
                                type="number"
                                placeholder="Min value"
                                value={field.validation?.min || ""}
                                onChange={(e) =>
                                  updateValidation(
                                    field.id,
                                    "min",
                                    e.target.value
                                      ? parseFloat(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Maximum Value</Label>
                              <Input
                                type="number"
                                placeholder="Max value"
                                value={field.validation?.max || ""}
                                onChange={(e) =>
                                  updateValidation(
                                    field.id,
                                    "max",
                                    e.target.value
                                      ? parseFloat(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </div>
                          </>
                        )}

                        {field.type === "text" && (
                          <div className="flex items-center space-x-2 md:col-span-2">
                            <Checkbox
                              id={`email-${field.id}`}
                              checked={field.validation?.email || false}
                              onCheckedChange={(checked) =>
                                updateValidation(field.id, "email", checked)
                              }
                            />
                            <Label htmlFor={`email-${field.id}`}>
                              Validate as email
                            </Label>
                          </div>
                        )}

                        {field.type === "password" && (
                          <div className="flex items-center space-x-2 md:col-span-2">
                            <Checkbox
                              id={`password-${field.id}`}
                              checked={field.validation?.password || false}
                              onCheckedChange={(checked) =>
                                updateValidation(field.id, "password", checked)
                              }
                            />
                            <Label htmlFor={`password-${field.id}`}>
                              Strong password (min 8 chars, must contain number)
                            </Label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {fields.length > 0 && (
          <div className="flex gap-4 justify-between mt-8">
            <Button onClick={addField} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Field
            </Button>

            <div className="flex gap-2">
              <Button onClick={saveForm} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Form
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
