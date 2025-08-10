"use client";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import type { FormSchema } from "@/lib/types";
import {
  getFormsFromLocalStorage,
  deleteFormFromLocalStorage,
} from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

export default function ViewAllForm() {
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredForms, setFilteredForms] = useState<FormSchema[]>([]);
  // use Sonner toast
  const navigate = useNavigate();

  useEffect(() => {
    const savedForms = getFormsFromLocalStorage();
    setForms(savedForms);
    setFilteredForms(savedForms);
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

  const handlePreview = (form: FormSchema) => {
    navigate(`/preview?id=${form.id}`);
  };

  const handleEdit = (form: FormSchema) => {
    navigate(`/edit?id=${form.id}`);
  };

  const handleDelete = (form: FormSchema) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${form.name}"? This action cannot be undone.`
      )
    ) {
      try {
        deleteFormFromLocalStorage(form.id);
        const updatedForms = forms.filter((f) => f.id !== form.id);
        setForms(updatedForms);
        setFilteredForms(
          updatedForms.filter((f) =>
            f.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
        toast.success(`Form "${form.name}" has been deleted successfully.`);
      } catch (error) {
        console.error("Error deleting form:", error);
        toast.error("Error deleting form. Please try again.");
      }
    }
  };

  const handleViewResponses = (form: FormSchema) => {
    const pwd = prompt("Enter password to view responses:");
    if (pwd === "1234") {
      navigate(`/responses?formId=${form.id}`);
    } else if (pwd !== null) {
      toast.error("Incorrect password!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Navigation />
        <div className="text-center mb-8 mt-8">
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
            <Input
              type="text"
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button asChild>
            <Link to="/create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Form
            </Link>
          </Button>
        </div>

        {filteredForms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              {searchTerm ? (
                <>
                  <Search className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No forms found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    No forms match your search term "{searchTerm}"
                  </p>
                  <Button onClick={() => setSearchTerm("")} variant="outline">
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No forms created yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Get started by creating your first form
                  </p>
                  <Button asChild>
                    <Link to="/create" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Form
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredForms.map((form) => (
              <Card
                key={form.id}
                className="hover:shadow-md transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate mb-1">
                        {form.name}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(form.createdAt)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handlePreview(form)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Preview
                    </Button>
                    <Button
                      onClick={() => handleEdit(form)}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(form)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                    <Button
                      onClick={() => handleViewResponses(form)}
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700 flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      Responses
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
}
