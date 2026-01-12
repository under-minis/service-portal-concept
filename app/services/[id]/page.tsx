"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Zap,
  AlertCircle,
  Play,
  FileText,
  Upload,
  FileJson,
  Globe,
  Code,
  Loader2,
  CheckCircle2,
  Send,
  Mail,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockServices } from "@/data/mockServices";
import { formatCurrency } from "@/lib/utils/formatting";
import { getFieldRules } from "@/lib/services/fieldRules";
import type { Service } from "@/types/service";

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;
  const [tempServices, setTempServices] = useState<Service[]>([]);

  // Load temporary services from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("tempServices");
      if (stored) {
        try {
          setTempServices(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse tempServices from sessionStorage", e);
        }
      }
    }
  }, []);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchSuccess, setBatchSuccess] = useState(false);
  const [showCsvRequirements, setShowCsvRequirements] = useState(false);
  const [showJsonRequirements, setShowJsonRequirements] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "form" | "csv" | "json" | "live" | "embed"
  >("form");
  const [isDragging, setIsDragging] = useState(false);
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [newEmailName, setNewEmailName] = useState("");
  const [newEmailAddress, setNewEmailAddress] = useState("");
  const [isAddingEmail, setIsAddingEmail] = useState(false);

  // Update service in tempServices and sessionStorage
  const updateService = (updatedService: Service) => {
    setTempServices((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === updatedService.id);
      let updated: Service[];

      if (existingIndex >= 0) {
        // Update existing temp service
        updated = prev.map((s) =>
          s.id === updatedService.id ? updatedService : s
        );
      } else {
        // Add new service (from mockServices) to tempServices
        updated = [...prev, updatedService];
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("tempServices", JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Check both mockServices and tempServices
  // Prioritize tempServices (newly created services) over mockServices
  // Use useMemo to ensure service updates when tempServices changes
  const service = useMemo(() => {
    // Check tempServices first (newly created services take precedence)
    const tempService = tempServices.find((s) => s.id === serviceId);
    if (tempService) return tempService;

    // Fall back to mockServices if not found in tempServices
    return mockServices.find((s) => s.id === serviceId);
  }, [serviceId, tempServices]);

  const fieldRules = useMemo(() => {
    if (!service) return [];
    return getFieldRules(service.workflowNames);
  }, [service]);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitSuccess(false);
  };

  const handleFileChange = (field: string, file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData((prev) => ({ ...prev, [field]: base64 }));
        setSubmitSuccess(false);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => {
        const newData = { ...prev };
        delete newData[field];
        return newData;
      });
    }
  };

  const generateReportHtml = (
    data: Record<string, string>,
    recordId?: string
  ): string => {
    const timestamp = new Date().toISOString();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Report - ${service?.name}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #e2e8f0; }
    h1 { color: #22d3ee; }
    .info { background: #1e293b; padding: 15px; border-radius: 8px; margin: 10px 0; }
    .field { margin: 10px 0; }
    .label { color: #94a3b8; font-size: 0.9em; }
    .value { color: #e2e8f0; font-weight: 500; }
  </style>
</head>
<body>
  <h1>Service Report</h1>
  <div class="info">
    <p><strong>Service:</strong> ${service?.name}</p>
    <p><strong>Service ID:</strong> ${service?.id}</p>
    ${recordId ? `<p><strong>Record ID:</strong> ${recordId}</p>` : ""}
    <p><strong>Date:</strong> ${new Date(timestamp).toLocaleString()}</p>
  </div>
  <div class="info">
    <h2>Submitted Data</h2>
    ${Object.entries(data)
      .map(
        ([key, value]) => `
      <div class="field">
        <div class="label">${key}:</div>
        <div class="value">${value}</div>
      </div>
    `
      )
      .join("")}
  </div>
  <div class="info">
    <h2>Workflows</h2>
    <p>${service?.workflowNames.join(", ")}</p>
  </div>
</body>
</html>`;
  };

  const sendReportEmails = async (reportHtml: string, recordId?: string) => {
    if (!service?.emailDestinations || service.emailDestinations.length === 0) {
      return; // No email destinations configured
    }

    try {
      // Send to all configured email destinations
      const emailPromises = service.emailDestinations.map(async (emailDest) => {
        const response = await fetch("/api/send-service-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: emailDest.email,
            serviceName: service.name,
            serviceId: service.id,
            reportHtml,
            recordId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error(`Failed to send email to ${emailDest.email}:`, error);
        }
      });

      await Promise.all(emailPromises);
    } catch {
      console.error("Error sending report emails");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;

    // Validate required fields
    const requiredFields = fieldRules.filter((rule) => rule.required);
    const missingFields = requiredFields.filter(
      (rule) => !formData[rule.field] || formData[rule.field].trim() === ""
    );

    if (missingFields.length > 0) {
      alert(
        `Please fill in all required fields: ${missingFields
          .map((f) => f.field)
          .join(", ")}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate report
      const recordId = formData.recordId || `rec-${Date.now()}`;
      const reportHtml = generateReportHtml(formData, recordId);

      // Send emails to configured destinations
      await sendReportEmails(reportHtml, recordId);

      setSubmitSuccess(true);
      // Clear form after successful submission
      setTimeout(() => {
        setFormData({});
        setSubmitSuccess(false);
      }, 3000);
    } catch {
      alert("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if ((file && file.type === "text/csv") || file?.name.endsWith(".csv")) {
      setCsvFile(file);
      setBatchSuccess(false);
    } else {
      alert("Please upload a valid CSV file");
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (
      file &&
      (file.type === "application/json" || file.name.endsWith(".json"))
    ) {
      setJsonFile(file);
      setBatchSuccess(false);
    } else {
      alert("Please upload a valid JSON file");
    }
  };

  const handleCsvBatchProcess = async () => {
    if (!csvFile || !service) return;

    setIsProcessingBatch(true);
    try {
      // Read CSV file
      const text = await csvFile.text();
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = lines.slice(1);

      // Process each row
      for (const row of rows) {
        const values = row.split(",").map((v) => v.trim());
        const rowData: Record<string, string> = {};
        headers.forEach((header, idx) => {
          rowData[header] = values[idx] || "";
        });

        // Generate report for this row
        const recordId =
          rowData.recordId ||
          `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const reportHtml = generateReportHtml(rowData, recordId);

        // Send emails
        await sendReportEmails(reportHtml, recordId);
      }

      setBatchSuccess(true);
      setCsvFile(null);
      setTimeout(() => setBatchSuccess(false), 3000);
    } catch {
      alert("Failed to process CSV file");
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleJsonBatchProcess = async () => {
    if (!jsonFile || !service) return;

    setIsProcessingBatch(true);
    try {
      // Read JSON file
      const text = await jsonFile.text();
      const data = JSON.parse(text);
      const records = Array.isArray(data) ? data : [data];

      // Process each record
      for (const record of records) {
        const recordId =
          record.recordId ||
          `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const reportHtml = generateReportHtml(record, recordId);

        // Send emails
        await sendReportEmails(reportHtml, recordId);
      }

      setBatchSuccess(true);
      setJsonFile(null);
      setTimeout(() => setBatchSuccess(false), 3000);
    } catch {
      alert("Failed to process JSON file");
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const getCsvColumns = () => {
    return fieldRules.filter((rule) => rule.required).map((rule) => rule.field);
  };

  const getJsonExample = () => {
    const example: Record<string, unknown> = {};
    fieldRules.forEach((rule) => {
      if (rule.required && rule.examples && rule.examples.length > 0) {
        if (rule.type === "number") {
          example[rule.field] = Number(rule.examples[0]);
        } else if (rule.type === "object") {
          try {
            example[rule.field] = JSON.parse(rule.examples[0]);
          } catch {
            example[rule.field] = rule.examples[0];
          }
        } else {
          example[rule.field] = rule.examples[0];
        }
      }
    });
    return JSON.stringify([example], null, 2);
  };

  // Email destination management
  const handleAddEmail = () => {
    if (!service || !newEmailAddress.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmailAddress.trim())) {
      alert("Please enter a valid email address");
      return;
    }

    const newEmailDest = {
      id: `email-${Date.now()}`,
      email: newEmailAddress.trim(),
      name: newEmailName.trim() || "Email Destination",
      createdAt: new Date().toISOString(),
    };

    const updatedService: Service = {
      ...service,
      emailDestinations: [...(service.emailDestinations || []), newEmailDest],
    };

    updateService(updatedService);
    setNewEmailName("");
    setNewEmailAddress("");
    setIsAddingEmail(false);
  };

  const handleEditEmail = (
    emailId: string,
    newName: string,
    newEmail: string
  ) => {
    if (!service) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      alert("Please enter a valid email address");
      return;
    }

    const updatedService: Service = {
      ...service,
      emailDestinations: (service.emailDestinations || []).map((dest) =>
        dest.id === emailId
          ? {
              ...dest,
              email: newEmail.trim(),
              name: newName.trim() || dest.name,
            }
          : dest
      ),
    };

    updateService(updatedService);
    setEditingEmailId(null);
    setNewEmailName("");
    setNewEmailAddress("");
  };

  const handleDeleteEmail = (emailId: string) => {
    if (!service) return;
    if (!confirm("Are you sure you want to remove this email destination?"))
      return;

    const updatedService: Service = {
      ...service,
      emailDestinations: (service.emailDestinations || []).filter(
        (dest) => dest.id !== emailId
      ),
    };

    updateService(updatedService);
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Button>
        <div className="mt-20 text-center">
          <div className="inline-block p-8 rounded-2xl bg-slate-800/30 backdrop-blur-xl border border-slate-700/50">
            <AlertCircle className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Service not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Futuristic Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <main className="relative min-h-screen container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {service.name}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="px-3 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <span className="text-xs text-slate-400">Service ID</span>
                    <span className="ml-2 font-mono text-sm text-cyan-400">
                      {service.id}
                    </span>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <span className="text-xs text-slate-400">Cost/Run</span>
                    <span className="ml-2 text-purple-400 font-semibold">
                      {formatCurrency(service.estimatedCostPerRun)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflows */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-yellow-400" />
                <Label className="text-slate-400 uppercase tracking-wider text-sm">
                  Active Workflows
                </Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {service.workflowNames.map((workflow, idx) => (
                  <Badge
                    key={idx}
                    className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/50 transition-colors px-3 py-1"
                  >
                    {workflow}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Email Destinations Card */}
              <Card className="rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-cyan-400" />
                    Email Destinations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {service?.emailDestinations &&
                  service.emailDestinations.length > 0 ? (
                    <div className="space-y-2">
                      {service.emailDestinations.map((emailDest) => {
                        const isEditing = editingEmailId === emailDest.id;
                        return (
                          <div
                            key={emailDest.id}
                            className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/50"
                          >
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input
                                  type="text"
                                  placeholder="Name (optional)"
                                  value={newEmailName}
                                  onChange={(e) =>
                                    setNewEmailName(e.target.value)
                                  }
                                  className="bg-slate-800/50 border-slate-700/50 text-slate-200 text-sm"
                                />
                                <Input
                                  type="email"
                                  placeholder="email@example.com"
                                  value={newEmailAddress}
                                  onChange={(e) =>
                                    setNewEmailAddress(e.target.value)
                                  }
                                  className="bg-slate-800/50 border-slate-700/50 text-slate-200 text-sm"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      handleEditEmail(
                                        emailDest.id,
                                        newEmailName,
                                        newEmailAddress
                                      );
                                      setNewEmailName("");
                                      setNewEmailAddress("");
                                    }}
                                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white border-0 text-xs"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingEmailId(null);
                                      setNewEmailName("");
                                      setNewEmailAddress("");
                                    }}
                                    className="border-slate-700/50 hover:border-slate-600/50 text-slate-300 text-xs"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-200 font-medium truncate">
                                    {emailDest.name}
                                  </p>
                                  <p className="text-xs text-slate-400 truncate">
                                    {emailDest.email}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingEmailId(emailDest.id);
                                      setNewEmailName(emailDest.name);
                                      setNewEmailAddress(emailDest.email);
                                    }}
                                    className="h-7 w-7 p-0 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                                    title="Edit email destination"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleDeleteEmail(emailDest.id)
                                    }
                                    className="h-7 w-7 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No email destinations configured
                    </p>
                  )}

                  {isAddingEmail ? (
                    <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 space-y-2">
                      <Input
                        type="text"
                        placeholder="Name (optional)"
                        value={newEmailName}
                        onChange={(e) => setNewEmailName(e.target.value)}
                        className="bg-slate-800/50 border-slate-700/50 text-slate-200 text-sm"
                      />
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={newEmailAddress}
                        onChange={(e) => setNewEmailAddress(e.target.value)}
                        className="bg-slate-800/50 border-slate-700/50 text-slate-200 text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleAddEmail}
                          className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white border-0 text-xs"
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsAddingEmail(false);
                            setNewEmailName("");
                            setNewEmailAddress("");
                          }}
                          className="border-slate-700/50 hover:border-slate-600/50 text-slate-300 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAddingEmail(true)}
                      className="w-full border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-2" />
                      Add Email Destination
                    </Button>
                  )}

                  {service?.emailDestinations &&
                    service.emailDestinations.length > 0 && (
                      <p className="text-xs text-slate-500 text-center pt-2 border-t border-slate-700/50">
                        Reports will be sent to all configured destinations
                      </p>
                    )}
                </CardContent>
              </Card>

              {/* Run Service Card */}
              <Card className="rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                    <Play className="h-5 w-5 text-purple-400" />
                    Run Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Manual Run */}
                  <div className="space-y-2">
                    <p className="text-slate-400 text-sm">
                      Results will be sent to your email and are visible in the
                      reports tab.
                    </p>
                  </div>

                  <div className="border-t border-slate-700/50 pt-4">
                    <Label className="text-slate-300 text-sm mb-3 block">
                      Data Input Methods
                    </Label>
                    {/* Tabs */}
                    <div className="space-y-1">
                      <button
                        onClick={() => setActiveTab("form")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeTab === "form"
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Form</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab("csv")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeTab === "csv"
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          <span>CSV Batch</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab("json")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeTab === "json"
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileJson className="h-4 w-4" />
                          <span>JSON Batch</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab("live")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeTab === "live"
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>Live Form</span>
                          <Badge className="ml-auto bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                            Soon
                          </Badge>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab("embed")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeTab === "embed"
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          <span>Embeddable</span>
                          <Badge className="ml-auto bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                            Soon
                          </Badge>
                        </div>
                      </button>
                    </div>
                  </div>

                  {batchSuccess && (
                    <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Batch processing completed successfully
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Content Area - Right Column (2/3 width) */}
            <div className="lg:col-span-2">
              <Card className="rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                    {activeTab === "form" && (
                      <FileText className="h-5 w-5 text-cyan-400" />
                    )}
                    {activeTab === "csv" && (
                      <Upload className="h-5 w-5 text-cyan-400" />
                    )}
                    {activeTab === "json" && (
                      <FileJson className="h-5 w-5 text-cyan-400" />
                    )}
                    {activeTab === "live" && (
                      <Globe className="h-5 w-5 text-cyan-400" />
                    )}
                    {activeTab === "embed" && (
                      <Code className="h-5 w-5 text-cyan-400" />
                    )}
                    {activeTab === "form" && "Data Collection Form"}
                    {activeTab === "csv" && "CSV Batch Upload"}
                    {activeTab === "json" && "JSON Batch Upload"}
                    {activeTab === "live" && "Generate Live Form"}
                    {activeTab === "embed" && "Generate Embeddable Form"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Form Tab */}
                  {activeTab === "form" && (
                    <>
                      <p className="text-slate-400 text-sm">
                        Fill out the form below to submit data for processing.
                        Fields are generated based on your selected workflows.
                      </p>

                      {submitSuccess && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                          Form submitted successfully! Your data is being
                          processed.
                        </div>
                      )}

                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        {fieldRules.map((rule) => {
                          const value = formData[rule.field] || "";

                          // Handle select fields
                          if (rule.field === "idType") {
                            return (
                              <div key={rule.field} className="space-y-2">
                                <Label
                                  htmlFor={rule.field}
                                  className="text-slate-300"
                                >
                                  ID Type
                                  {rule.required && (
                                    <span className="text-red-400 ml-1">*</span>
                                  )}
                                </Label>
                                <select
                                  id={rule.field}
                                  required={rule.required}
                                  value={value}
                                  onChange={(e) =>
                                    handleFormChange(rule.field, e.target.value)
                                  }
                                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-200 focus:border-cyan-500/50 focus:ring-cyan-500/20 focus:outline-none"
                                >
                                  <option value="">Select {rule.field}</option>
                                  {rule.examples?.map((example) => (
                                    <option key={example} value={example}>
                                      {example
                                        .replace(/_/g, " ")
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase()
                                        )}
                                    </option>
                                  ))}
                                </select>
                                <p className="text-xs text-slate-500">
                                  {rule.description}
                                </p>
                              </div>
                            );
                          }

                          if (rule.field === "documentType") {
                            return (
                              <div key={rule.field} className="space-y-2">
                                <Label
                                  htmlFor={rule.field}
                                  className="text-slate-300"
                                >
                                  Document Type
                                  {rule.required && (
                                    <span className="text-red-400 ml-1">*</span>
                                  )}
                                </Label>
                                <select
                                  id={rule.field}
                                  required={rule.required}
                                  value={value}
                                  onChange={(e) =>
                                    handleFormChange(rule.field, e.target.value)
                                  }
                                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-200 focus:border-cyan-500/50 focus:ring-cyan-500/20 focus:outline-none"
                                >
                                  <option value="">Select document type</option>
                                  {rule.examples?.map((example) => (
                                    <option key={example} value={example}>
                                      {example.charAt(0).toUpperCase() +
                                        example.slice(1)}
                                    </option>
                                  ))}
                                </select>
                                <p className="text-xs text-slate-500">
                                  {rule.description}
                                </p>
                              </div>
                            );
                          }

                          if (rule.field === "currency") {
                            return (
                              <div key={rule.field} className="space-y-2">
                                <Label
                                  htmlFor={rule.field}
                                  className="text-slate-300"
                                >
                                  Currency
                                  {rule.required && (
                                    <span className="text-red-400 ml-1">*</span>
                                  )}
                                </Label>
                                <select
                                  id={rule.field}
                                  required={rule.required}
                                  value={value}
                                  onChange={(e) =>
                                    handleFormChange(rule.field, e.target.value)
                                  }
                                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-200 focus:border-cyan-500/50 focus:ring-cyan-500/20 focus:outline-none"
                                >
                                  <option value="">Select currency</option>
                                  {rule.examples?.map((example) => (
                                    <option key={example} value={example}>
                                      {example}
                                    </option>
                                  ))}
                                </select>
                                <p className="text-xs text-slate-500">
                                  {rule.description}
                                </p>
                              </div>
                            );
                          }

                          // Handle file input for document (OCR)
                          if (rule.field === "document") {
                            return (
                              <div key={rule.field} className="space-y-2">
                                <Label
                                  htmlFor={rule.field}
                                  className="text-slate-300"
                                >
                                  Document
                                  {rule.required && (
                                    <span className="text-red-400 ml-1">*</span>
                                  )}
                                </Label>
                                <input
                                  type="file"
                                  id={rule.field}
                                  required={rule.required}
                                  accept="image/*,.pdf"
                                  onChange={(e) =>
                                    handleFileChange(
                                      rule.field,
                                      e.target.files?.[0] || null
                                    )
                                  }
                                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
                                />
                                {value && (
                                  <p className="text-xs text-green-400">
                                    File loaded (base64 encoded)
                                  </p>
                                )}
                                <p className="text-xs text-slate-500">
                                  {rule.description}
                                </p>
                              </div>
                            );
                          }

                          // Handle JSON object input (Validation)
                          if (rule.type === "object") {
                            return (
                              <div key={rule.field} className="space-y-2">
                                <Label
                                  htmlFor={rule.field}
                                  className="text-slate-300"
                                >
                                  {rule.field === "data"
                                    ? "Data (JSON)"
                                    : rule.field}
                                  {rule.required && (
                                    <span className="text-red-400 ml-1">*</span>
                                  )}
                                </Label>
                                <textarea
                                  id={rule.field}
                                  required={rule.required}
                                  value={value}
                                  onChange={(e) =>
                                    handleFormChange(rule.field, e.target.value)
                                  }
                                  placeholder={
                                    rule.examples?.[0] || "Enter JSON data"
                                  }
                                  rows={4}
                                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 focus:outline-none font-mono text-sm"
                                />
                                <p className="text-xs text-slate-500">
                                  {rule.description}
                                </p>
                              </div>
                            );
                          }

                          // Handle number inputs
                          if (rule.type === "number") {
                            return (
                              <div key={rule.field} className="space-y-2">
                                <Label
                                  htmlFor={rule.field}
                                  className="text-slate-300"
                                >
                                  {rule.field === "amount"
                                    ? "Amount"
                                    : rule.field === "refundAmount"
                                    ? "Refund Amount"
                                    : rule.field}
                                  {rule.required && (
                                    <span className="text-red-400 ml-1">*</span>
                                  )}
                                </Label>
                                <Input
                                  id={rule.field}
                                  type="number"
                                  required={rule.required}
                                  value={value}
                                  onChange={(e) =>
                                    handleFormChange(rule.field, e.target.value)
                                  }
                                  placeholder={rule.examples?.[0] || ""}
                                  className="bg-slate-900/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                                />
                                <p className="text-xs text-slate-500">
                                  {rule.description}
                                </p>
                              </div>
                            );
                          }

                          // Handle email input
                          if (rule.field === "email") {
                            return (
                              <div key={rule.field} className="space-y-2">
                                <Label
                                  htmlFor={rule.field}
                                  className="text-slate-300"
                                >
                                  Email Address
                                  {rule.required && (
                                    <span className="text-red-400 ml-1">*</span>
                                  )}
                                </Label>
                                <Input
                                  id={rule.field}
                                  type="email"
                                  required={rule.required}
                                  value={value}
                                  onChange={(e) =>
                                    handleFormChange(rule.field, e.target.value)
                                  }
                                  placeholder={
                                    rule.examples?.[0] || "user@example.com"
                                  }
                                  className="bg-slate-900/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                                />
                                <p className="text-xs text-slate-500">
                                  {rule.description}
                                </p>
                              </div>
                            );
                          }

                          // Default text input
                          return (
                            <div key={rule.field} className="space-y-2">
                              <Label
                                htmlFor={rule.field}
                                className="text-slate-300"
                              >
                                {rule.field === "recordId"
                                  ? "Record ID"
                                  : rule.field === "idNumber"
                                  ? "ID Number"
                                  : rule.field === "phone"
                                  ? "Phone Number"
                                  : rule.field === "paymentMethod"
                                  ? "Payment Method"
                                  : rule.field === "refundId"
                                  ? "Refund ID"
                                  : rule.field === "storageKey"
                                  ? "Storage Key"
                                  : rule.field}
                                {rule.required && (
                                  <span className="text-red-400 ml-1">*</span>
                                )}
                              </Label>
                              <Input
                                id={rule.field}
                                type={rule.field === "phone" ? "tel" : "text"}
                                required={rule.required}
                                value={value}
                                onChange={(e) =>
                                  handleFormChange(rule.field, e.target.value)
                                }
                                placeholder={rule.examples?.[0] || ""}
                                className="bg-slate-900/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                              />
                              <p className="text-xs text-slate-500">
                                {rule.description}
                              </p>
                            </div>
                          );
                        })}

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Submit Data
                            </>
                          )}
                        </Button>
                      </form>
                    </>
                  )}

                  {/* CSV Batch Tab */}
                  {activeTab === "csv" && (
                    <div className="space-y-4">
                      <p className="text-slate-400 text-sm">
                        Upload a CSV file to process multiple records at once.
                        Drag and drop your file or click to browse.
                      </p>

                      {/* Requirements Display */}
                      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-slate-300 font-semibold">
                            Required Columns
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCsvRequirements(true)}
                            className="text-xs text-cyan-400 hover:text-cyan-300"
                          >
                            View Details
                          </Button>
                        </div>
                        {getCsvColumns().length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {getCsvColumns().map((column) => {
                              const rule = fieldRules.find(
                                (r) => r.field === column
                              );
                              return (
                                <div
                                  key={column}
                                  className="flex items-center gap-1"
                                >
                                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                                    {column}
                                  </Badge>
                                  {rule && (
                                    <span
                                      className="text-xs text-slate-500"
                                      title={rule.description}
                                    >
                                      {rule.type || "string"}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            No required columns (all fields are optional)
                          </p>
                        )}
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <p className="text-xs text-slate-500">
                            Example: {getCsvColumns().join(", ")}
                          </p>
                        </div>
                      </div>

                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          const file = e.dataTransfer.files[0];
                          if (
                            file &&
                            (file.type === "text/csv" ||
                              file.name.endsWith(".csv"))
                          ) {
                            setCsvFile(file);
                            setBatchSuccess(false);
                          } else {
                            alert("Please drop a valid CSV file");
                          }
                        }}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          isDragging
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-slate-700/50 hover:border-cyan-500/50"
                        }`}
                      >
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleCsvUpload}
                          className="hidden"
                          id="csv-upload-drop"
                        />
                        <label
                          htmlFor="csv-upload-drop"
                          className="cursor-pointer"
                        >
                          <Upload className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                          <p className="text-slate-300 mb-2">
                            {csvFile
                              ? csvFile.name
                              : "Drag and drop CSV file here"}
                          </p>
                          <p className="text-slate-500 text-sm">
                            or click to browse
                          </p>
                        </label>
                      </div>

                      {csvFile && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowCsvRequirements(true)}
                            className="flex-1 border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Requirements
                          </Button>
                          <Button
                            onClick={handleCsvBatchProcess}
                            disabled={isProcessingBatch}
                            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0"
                          >
                            {isProcessingBatch ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Process CSV
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {batchSuccess && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          CSV batch processing completed successfully
                        </div>
                      )}
                    </div>
                  )}

                  {/* JSON Batch Tab */}
                  {activeTab === "json" && (
                    <div className="space-y-4">
                      <p className="text-slate-400 text-sm">
                        Upload a JSON file to process multiple records at once.
                        Drag and drop your file or click to browse.
                      </p>

                      {/* Requirements Display */}
                      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-slate-300 font-semibold">
                            Required Fields
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowJsonRequirements(true)}
                            className="text-xs text-cyan-400 hover:text-cyan-300"
                          >
                            View Format
                          </Button>
                        </div>
                        {fieldRules.filter((r) => r.required).length > 0 ? (
                          <div className="space-y-2">
                            {fieldRules
                              .filter((r) => r.required)
                              .map((rule) => (
                                <div
                                  key={rule.field}
                                  className="flex items-start gap-2"
                                >
                                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs mt-0.5">
                                    {rule.field}
                                  </Badge>
                                  <div className="flex-1">
                                    <p className="text-xs text-slate-400">
                                      {rule.description}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      Type: {rule.type || "string"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            No required fields (all fields are optional)
                          </p>
                        )}
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <p className="text-xs text-slate-500 mb-2">
                            Example format:
                          </p>
                          <pre className="text-xs bg-slate-950 border border-slate-700/50 p-2 rounded-lg overflow-x-auto text-slate-300 font-mono max-h-32 overflow-y-auto">
                            {getJsonExample()}
                          </pre>
                        </div>
                      </div>

                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          const file = e.dataTransfer.files[0];
                          if (
                            file &&
                            (file.type === "application/json" ||
                              file.name.endsWith(".json"))
                          ) {
                            setJsonFile(file);
                            setBatchSuccess(false);
                          } else {
                            alert("Please drop a valid JSON file");
                          }
                        }}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          isDragging
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-slate-700/50 hover:border-cyan-500/50"
                        }`}
                      >
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleJsonUpload}
                          className="hidden"
                          id="json-upload-drop"
                        />
                        <label
                          htmlFor="json-upload-drop"
                          className="cursor-pointer"
                        >
                          <FileJson className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                          <p className="text-slate-300 mb-2">
                            {jsonFile
                              ? jsonFile.name
                              : "Drag and drop JSON file here"}
                          </p>
                          <p className="text-slate-500 text-sm">
                            or click to browse
                          </p>
                        </label>
                      </div>

                      {jsonFile && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <FileJson className="h-4 w-4" />
                            <span>{jsonFile.name}</span>
                            <span className="text-xs">
                              ({(jsonFile.size / 1024).toFixed(2)} KB)
                            </span>
                          </div>
                          <Button
                            onClick={handleJsonBatchProcess}
                            disabled={isProcessingBatch}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0"
                          >
                            {isProcessingBatch ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Process JSON
                              </>
                            )}
                          </Button>
                          {service?.emailDestinations &&
                            service.emailDestinations.length > 0 && (
                              <p className="text-xs text-slate-500 text-center">
                                Reports will be sent to{" "}
                                {service.emailDestinations.length} email
                                destination(s)
                              </p>
                            )}
                        </div>
                      )}

                      {batchSuccess && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          JSON batch processing completed successfully
                        </div>
                      )}
                    </div>
                  )}

                  {/* Live Form Tab - Coming Soon */}
                  {activeTab === "live" && (
                    <div className="space-y-4">
                      <div className="p-6 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Globe className="h-5 w-5 text-yellow-400" />
                          <h3 className="text-lg font-semibold text-yellow-400">
                            Coming Soon
                          </h3>
                        </div>
                        <p className="text-slate-300 mb-4">
                          Generate a live, standalone form that you can share
                          with a URL. This feature will allow you to:
                        </p>
                        <ul className="space-y-2 text-slate-400 text-sm list-disc list-inside">
                          <li>Create a unique URL for your form</li>
                          <li>Share the form link with anyone</li>
                          <li>
                            Collect data without requiring users to access the
                            portal
                          </li>
                          <li>Customize form appearance and branding</li>
                          <li>Set form expiration dates and access controls</li>
                          <li>View submissions in real-time</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Embeddable Form Tab - Coming Soon */}
                  {activeTab === "embed" && (
                    <div className="space-y-4">
                      <div className="p-6 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Code className="h-5 w-5 text-yellow-400" />
                          <h3 className="text-lg font-semibold text-yellow-400">
                            Coming Soon
                          </h3>
                        </div>
                        <p className="text-slate-300 mb-4">
                          Generate an embeddable form code snippet that you can
                          add to your website. This feature will allow you to:
                        </p>
                        <ul className="space-y-2 text-slate-400 text-sm list-disc list-inside">
                          <li>Get an iframe embed code for your form</li>
                          <li>
                            Embed the form directly into your website or
                            application
                          </li>
                          <li>Customize form styling to match your brand</li>
                          <li>
                            Configure form dimensions and responsive behavior
                          </li>
                          <li>Set up form submission callbacks</li>
                          <li>Track form views and submissions</li>
                        </ul>
                        <div className="mt-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                          <p className="text-xs text-slate-500 mb-2">
                            Example embed code (preview):
                          </p>
                          <pre className="text-xs bg-slate-950 border border-slate-700/50 p-3 rounded-lg overflow-x-auto text-slate-300 font-mono">
                            {`<iframe 
  src="https://forms.example.com/${service?.id}" 
  width="100%" 
  height="600" 
  frameborder="0">
</iframe>`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* CSV Requirements Modal */}
      <Dialog open={showCsvRequirements} onOpenChange={setShowCsvRequirements}>
        <DialogContent className="max-w-2xl bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              CSV File Requirements
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Your CSV file must include the following columns based on your
              selected workflows.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <Label className="text-slate-300 mb-3 block font-semibold">
                Required Columns:
              </Label>
              <div className="space-y-2">
                {getCsvColumns().length > 0 ? (
                  getCsvColumns().map((column) => {
                    const rule = fieldRules.find((r) => r.field === column);
                    return (
                      <div key={column} className="flex items-start gap-2">
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 mt-0.5">
                          {column}
                        </Badge>
                        {rule && (
                          <span className="text-sm text-slate-400 flex-1">
                            {rule.description}
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500">
                    No required columns (all fields are optional)
                  </p>
                )}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <Label className="text-slate-300 mb-2 block font-semibold">
                Example CSV Format:
              </Label>
              <pre className="text-xs bg-slate-950 border border-slate-700/50 p-3 rounded-lg overflow-x-auto text-slate-300 font-mono">
                {getCsvColumns().join(",")}
                {"\n"}
                {fieldRules
                  .filter((r) => getCsvColumns().includes(r.field))
                  .map((r) => r.examples?.[0] || "")
                  .join(",")}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* JSON Requirements Modal */}
      <Dialog
        open={showJsonRequirements}
        onOpenChange={setShowJsonRequirements}
      >
        <DialogContent className="max-w-2xl bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              JSON File Format
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Your JSON file should be an array of objects with the following
              structure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <Label className="text-slate-300 mb-3 block font-semibold">
                Required Fields:
              </Label>
              <div className="space-y-2">
                {fieldRules
                  .filter((r) => r.required)
                  .map((rule) => (
                    <div key={rule.field} className="flex items-start gap-2">
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 mt-0.5">
                        {rule.field}
                      </Badge>
                      <span className="text-sm text-slate-400 flex-1">
                        {rule.description} ({rule.type || "string"})
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <Label className="text-slate-300 mb-2 block font-semibold">
                Example JSON Format:
              </Label>
              <pre className="text-xs bg-slate-950 border border-slate-700/50 p-3 rounded-lg overflow-x-auto text-slate-300 font-mono max-h-60 overflow-y-auto">
                {getJsonExample()}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
