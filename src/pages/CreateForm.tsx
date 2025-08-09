import { useState } from "react";
import { Plus, Trash2, Save, Eye } from "lucide-react";
import type { FieldType, FormField, FormSchema } from "@/lib/types";
import { Navigation } from "@/components/Navigation";

const CreateForm = () => {
  const [formName, setFormName] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);

  const fieldTypes: { value: FieldType; label: string }[] = [
    { value: "text", label: "Text Input" },
    { value: "number", label: "Number" },
    { value: "textarea", label: "Text Area" },
    { value: "select", label: "Select Dropdown" },
    { value: "radio", label: "Radio Buttons" },
    { value: "checkbox", label: "Checkboxes" },
    { value: "date", label: "Date Picker" },
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

  const saveForm = () => {
    if (!formName.trim()) {
      alert("Please enter a form name");
      return;
    }

    if (fields.length === 0) {
      alert("Please add at least one field");
      return;
    }

    // Validate fields
    for (const field of fields) {
      if (!field.label.trim()) {
        alert("Please enter labels for all fields");
        return;
      }
      if (
        (field.type === "select" ||
          field.type === "radio" ||
          field.type === "checkbox") &&
        (!field.options ||
          field.options.length === 0 ||
          field.options.some((opt) => !opt.trim()))
      ) {
        alert(`Please add valid options for ${field.label}`);
        return;
      }
    }

    const formSchema: FormSchema = {
      id: Date.now().toString(),
      name: formName,
      createdAt: new Date().toISOString(),
      fields: fields,
    };

    // Save to localStorage
    try {
      const existingForms = JSON.parse(localStorage.getItem("forms") || "[]");
      existingForms.push(formSchema);
      localStorage.setItem("forms", JSON.stringify(existingForms));

      alert("Form saved successfully!");

      // Clear form after saving
      setFormName("");
      setFields([]);

      console.log("Form saved:", formSchema);
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Error saving form. Please try again.");
    }
  };

  const previewForm = () => {
    if (!formName.trim() || fields.length === 0) {
      alert("Please add a form name and at least one field before previewing");
      return;
    }

    // Validate fields before preview
    for (const field of fields) {
      if (!field.label.trim()) {
        alert("Please enter labels for all fields");
        return;
      }
      if (
        (field.type === "select" ||
          field.type === "radio" ||
          field.type === "checkbox") &&
        (!field.options ||
          field.options.length === 0 ||
          field.options.some((opt) => !opt.trim()))
      ) {
        alert(`Please add valid options for ${field.label}`);
        return;
      }
    }

    const formSchema: FormSchema = {
      id: "preview-" + Date.now(),
      name: formName,
      createdAt: new Date().toISOString(),
      fields: fields,
    };

    // Save to localStorage for preview
    try {
      localStorage.setItem("previewForm", JSON.stringify(formSchema));
      alert(
        "Opening preview... (In a real app, this would navigate to the preview page)"
      );
      console.log("Form ready for preview:", formSchema);
    } catch (error) {
      console.error("Error preparing form for preview:", error);
      alert("Error preparing form for preview. Please try again.");
    }
  };

  const needsOptions = (type: FieldType) => {
    return ["select", "radio", "checkbox"].includes(type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Navigation />

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Create New Form
          </h1>
          <p className="text-lg text-gray-600">
            Build your custom form with our easy-to-use builder
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Form Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Name
            </label>
            <input
              type="text"
              placeholder="Enter form name..."
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              Form Fields
            </h2>
            <button
              onClick={addField}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Field
            </button>
          </div>

          {fields.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
              <p className="text-gray-500 mb-4">No fields added yet</p>
              <button
                onClick={addField}
                className="flex items-center gap-2 mx-auto px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Your First Field
              </button>
            </div>
          ) : (
            fields.map((field, index) => (
              <div
                key={field.id}
                className="bg-white rounded-xl shadow-sm border p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Field {index + 1}</h3>
                  <button
                    onClick={() => removeField(field.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateField(field.id, {
                            type: e.target.value as FieldType,
                            options: needsOptions(e.target.value as FieldType)
                              ? [""]
                              : undefined,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {fieldTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field Label
                      </label>
                      <input
                        type="text"
                        placeholder="Enter field label..."
                        value={field.label}
                        onChange={(e) =>
                          updateField(field.id, { label: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {field.type === "textarea" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Value
                      </label>
                      <textarea
                        placeholder="Enter default value..."
                        value={field.defaultValue || ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            defaultValue: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {field.type === "text" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Value
                      </label>
                      <input
                        type="text"
                        placeholder="Enter default value..."
                        value={field.defaultValue || ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            defaultValue: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {needsOptions(field.type) && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Options
                        </label>
                        <button
                          onClick={() => addOption(field.id)}
                          className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          Add Option
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(field.options || []).map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <input
                              type="text"
                              placeholder={`Option ${optionIndex + 1}`}
                              value={option}
                              onChange={(e) =>
                                updateOption(
                                  field.id,
                                  optionIndex,
                                  e.target.value
                                )
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={() =>
                                removeOption(field.id, optionIndex)
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`required-${field.id}`}
                      checked={field.validation?.required || false}
                      onChange={(e) =>
                        updateField(field.id, {
                          validation: {
                            ...field.validation,
                            required: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`required-${field.id}`}
                      className="text-sm text-gray-700"
                    >
                      Required field
                    </label>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {fields.length > 0 && (
          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={previewForm}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              Preview Form
            </button>
            <button
              onClick={saveForm}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Form
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateForm;
