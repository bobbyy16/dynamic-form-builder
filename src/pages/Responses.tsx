import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Responses() {
  const [responses, setResponses] = useState<any[]>([]);
  const [formName, setFormName] = useState<string | null>(null);
  const [fieldLabels, setFieldLabels] = useState<Record<string, string>>({});
  const [searchParams] = useSearchParams();
  const formId = searchParams.get("formId");

  useEffect(() => {
    const submissions = JSON.parse(
      localStorage.getItem("formSubmissions") || "[]"
    );
    let filtered = submissions;
    if (formId) {
      filtered = submissions.filter((resp: any) => resp.formId === formId);
      if (filtered.length > 0) setFormName(filtered[0].formName);
      // Load form schema and map field IDs to labels
      const forms = JSON.parse(localStorage.getItem("forms") || "[]");
      const form = forms.find((f: any) => f.id === formId);
      if (form && form.fields) {
        const labels: Record<string, string> = {};
        form.fields.forEach((field: any) => {
          labels[field.id] = field.label;
        });
        setFieldLabels(labels);
      }
    } else {
      setFieldLabels({});
    }
    setResponses(filtered);
  }, [formId]);

  // Get all unique field keys from all responses
  const getAllFields = () => {
    const fieldSet = new Set<string>();
    responses.forEach((resp) => {
      Object.keys(resp.data).forEach((key) => fieldSet.add(key));
    });
    return Array.from(fieldSet);
  };

  const allFields = getAllFields();
  const hasResponses = responses.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-full">
        <Navigation />
        <div className="text-center mb-8 mt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {formId && formName
              ? `Responses for: ${formName}`
              : "All Form Responses"}
          </h1>
          <p className="text-lg text-gray-600">
            {formId && formName
              ? `Below are all responses for the form "${formName}".`
              : "View all submitted responses for all forms"}
          </p>
        </div>

        {!hasResponses ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
                No responses yet
              </h3>
              <p className="text-gray-500 mb-4 text-sm md:text-base">
                {formId && formName
                  ? `No one has submitted the form "${formName}" yet.`
                  : "No one has submitted any forms yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {responses.map((resp, rowIndex) => (
                <Card key={resp.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm">
                        Response #{rowIndex + 1}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(resp.submittedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{resp.formName}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {allFields.map((field) => (
                      <div
                        key={field}
                        className="border-l-2 border-blue-100 pl-3"
                      >
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {fieldLabels[field] || field}
                        </div>
                        <div className="text-sm text-gray-900 mt-1">
                          {resp.data[field] ? (
                            Array.isArray(resp.data[field]) ? (
                              resp.data[field].join(", ")
                            ) : (
                              String(resp.data[field])
                            )
                          ) : (
                            <span className="text-gray-400 italic">
                              No response
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden md:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-700 min-w-[120px]">
                          #
                        </th>
                        <th className="border border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-700 min-w-[120px]">
                          Timestamp
                        </th>
                        <th className="border border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-700 min-w-[120px]">
                          Form Name
                        </th>
                        {allFields.map((field, index) => (
                          <th
                            key={field}
                            className="border border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-700 min-w-[120px]"
                          >
                            {fieldLabels[field] || field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map((resp, rowIndex) => (
                        <tr
                          key={resp.id}
                          className="hover:bg-blue-50 transition-colors duration-150"
                        >
                          <td className="border border-gray-200 px-3 py-2 text-sm text-gray-600 bg-gray-50 font-medium">
                            {rowIndex + 1}
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-sm text-gray-900">
                            {new Date(resp.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-sm text-gray-900">
                            <div
                              className="truncate max-w-[200px]"
                              title={resp.formName}
                            >
                              {resp.formName}
                            </div>
                          </td>
                          {allFields.map((field) => (
                            <td
                              key={field}
                              className="border border-gray-200 px-3 py-2 text-sm text-gray-900"
                            >
                              <div
                                className="truncate max-w-[150px]"
                                title={
                                  resp.data[field]
                                    ? Array.isArray(resp.data[field])
                                      ? resp.data[field].join(", ")
                                      : String(resp.data[field])
                                    : ""
                                }
                              >
                                {resp.data[field] ? (
                                  Array.isArray(resp.data[field]) ? (
                                    resp.data[field].join(", ")
                                  ) : (
                                    String(resp.data[field])
                                  )
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-500 space-y-1 sm:space-y-0">
                  <span>
                    {responses.length} response
                    {responses.length !== 1 ? "s" : ""} • {allFields.length + 3}{" "}
                    column
                    {allFields.length + 3 !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs">
                    Last updated:{" "}
                    {responses.length > 0
                      ? new Date(
                          Math.max(
                            ...responses.map((r) =>
                              new Date(r.submittedAt).getTime()
                            )
                          )
                        ).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
