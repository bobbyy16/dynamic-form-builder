import { useState, useEffect } from "react";
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  FileText,
  Search,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import type { FormSchema } from "@/lib/types";

const ViewAllForms = () => {
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredForms, setFilteredForms] = useState<FormSchema[]>([]);

  useEffect(() => {
    // Load forms from localStorage
    try {
      const savedForms = localStorage.getItem("forms");
      if (savedForms) {
        const parsedForms = JSON.parse(savedForms);
        setForms(parsedForms);
        setFilteredForms(parsedForms);
      }
    } catch (error) {
      console.error("Error loading forms from localStorage:", error);
      setForms([]);
      setFilteredForms([]);
    }
  }, []);

  useEffect(() => {
    const filtered = forms.filter((form) =>
      form.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredForms(filtered);
  }, [searchTerm, forms]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCreateNew = () => {
    // In real app, this would navigate to create form
    alert("Would navigate to Create Form page");
  };

  const handlePreview = (form: FormSchema) => {
    // Save form to localStorage for preview
    try {
      localStorage.setItem("previewForm", JSON.stringify(form));
      alert(
        `Form "${form.name}" loaded for preview! (In a real app, this would navigate to the preview page)`
      );
      console.log("Form loaded for preview:", form);
    } catch (error) {
      console.error("Error loading form for preview:", error);
      alert("Error loading form for preview. Please try again.");
    }
  };

  const handleEdit = (form: FormSchema) => {
    // In a real app, this would load the form data into the create form page for editing
    try {
      localStorage.setItem("editForm", JSON.stringify(form));
      alert(
        `Form "${form.name}" loaded for editing! (In a real app, this would navigate to the edit page)`
      );
      console.log("Form loaded for editing:", form);
    } catch (error) {
      console.error("Error loading form for editing:", error);
      alert("Error loading form for editing. Please try again.");
    }
  };

  const handleDelete = (form: FormSchema) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${form.name}"? This action cannot be undone.`
      )
    ) {
      try {
        const updatedForms = forms.filter((f) => f.id !== form.id);
        setForms(updatedForms);
        setFilteredForms(
          updatedForms.filter((f) =>
            f.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );

        // Update localStorage
        localStorage.setItem("forms", JSON.stringify(updatedForms));

        // Also remove any related submissions
        const submissions = JSON.parse(
          localStorage.getItem("formSubmissions") || "[]"
        );
        const updatedSubmissions = submissions.filter(
          (submission: any) => submission.formId !== form.id
        );
        localStorage.setItem(
          "formSubmissions",
          JSON.stringify(updatedSubmissions)
        );

        console.log("Form deleted:", form);
        alert(`Form "${form.name}" has been deleted successfully.`);
      } catch (error) {
        console.error("Error deleting form:", error);
        alert("Error deleting form. Please try again.");
      }
    }
  };

  const getFieldTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      text: "bg-blue-100 text-blue-800",
      number: "bg-green-100 text-green-800",
      textarea: "bg-purple-100 text-purple-800",
      select: "bg-orange-100 text-orange-800",
      radio: "bg-pink-100 text-pink-800",
      checkbox: "bg-indigo-100 text-indigo-800",
      date: "bg-yellow-100 text-yellow-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Navigation />

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            My Forms
          </h1>
          <p className="text-lg text-gray-600">
            Manage and organize all your created forms
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Create New Form
          </button>
        </div>

        {filteredForms.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
            {searchTerm ? (
              <>
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No forms found
                </h3>
                <p className="text-gray-500 mb-4">
                  No forms match your search term "{searchTerm}"
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No forms created yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Get started by creating your first form
                </p>
                <button
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Form
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {form.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(form.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {form.fields.length} field
                      {form.fields.length !== 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {form.fields.slice(0, 3).map((field, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFieldTypeBadgeColor(
                            field.type
                          )}`}
                        >
                          {field.type}
                        </span>
                      ))}
                      {form.fields.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          +{form.fields.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(form)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleEdit(form)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(form)}
                      className="flex items-center justify-center px-3 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredForms.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Showing {filteredForms.length} of {forms.length} form
              {forms.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllForms;
