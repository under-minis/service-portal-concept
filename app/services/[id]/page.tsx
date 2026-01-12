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
  Network,
  Sparkles,
  Terminal,
  FileCode,
  AlertCircle,
  Code,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Mail,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockServices } from "@/data/mockServices";
import { generateRequestBody } from "@/lib/services/requestBodyGenerator";
import { getFieldRules } from "@/lib/services/fieldRules";
import { generateWebhookPayload, generateEmailPayload } from "@/lib/services/payloadGenerator";
import { CopyButton } from "@/components/services/CopyButton";
import { formatCurrency } from "@/lib/utils/formatting";
import type { Service } from "@/types/service";
import { ServiceDetailsSidebar } from "@/components/services/ServiceDetailsSidebar";

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

  const [expandedDevSections, setExpandedDevSections] = useState({
    apiEndpoint: false,
    apiKeys: false,
    requestBody: false,
    fieldRules: false,
    payloads: false,
  });

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedWebhooks, setEditedWebhooks] = useState<any[]>([]);
  const [editedEmails, setEditedEmails] = useState<any[]>([]);

  const [selectedPayload, setSelectedPayload] = useState<{
    type: "webhook" | "email";
    name: string;
    url?: string;
    email?: string;
  } | null>(null);
  const [isPayloadModalOpen, setIsPayloadModalOpen] = useState(false);

  const toggleDevSection = (
    section: "apiEndpoint" | "apiKeys" | "requestBody" | "fieldRules" | "payloads"
  ) => {
    setExpandedDevSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Check both mockServices and tempServices
  // Use useMemo to ensure service updates when tempServices changes
  const service = useMemo(() => {
    return (
      mockServices.find((s) => s.id === serviceId) ||
      tempServices.find((s) => s.id === serviceId)
    );
  }, [serviceId, tempServices]);

  // Initialize editing state when service loads
  useEffect(() => {
    if (service) {
      setEditedWebhooks(service.webhookConnections || []);
      setEditedEmails(service.emailDestinations || []);
    }
  }, [service]);


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
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-64 shrink-0">
            <ServiceDetailsSidebar />
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="mb-6 border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Button>

              {/* Service Header */}
              <div className="mb-8" id="overview">
            <div className="flex items-center justify-between mb-4">
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
            <div className="mb-6">
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

          {/* Connections & Destinations - Editable Form */}
          <Card className="mb-8 rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50" id="connections">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                  <Network className="h-5 w-5 text-cyan-400" />
                  Connections & Destinations
                </CardTitle>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-400"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedWebhooks(service.webhookConnections || []);
                        setEditedEmails(service.emailDestinations || []);
                      }}
                      className="border-slate-700/50 hover:border-slate-600 text-slate-300"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        // Update both tempServices and onboardingFlowState for persistence
                        if (typeof window !== "undefined") {
                          // Update tempServices
                          const stored = sessionStorage.getItem("tempServices");
                          if (stored) {
                            const services = JSON.parse(stored);
                            const index = services.findIndex((s: Service) => s.id === service.id);
                            if (index !== -1) {
                              services[index] = {
                                ...services[index],
                                webhookConnections: editedWebhooks,
                                emailDestinations: editedEmails,
                              };
                              sessionStorage.setItem("tempServices", JSON.stringify(services));
                            }
                          }

                          // Update onboardingFlowState to persist changes to main page
                          const flowState = sessionStorage.getItem("onboardingFlowState");
                          if (flowState) {
                            try {
                              const state = JSON.parse(flowState);
                              if (Array.isArray(state.services)) {
                                const serviceIndex = state.services.findIndex(
                                  (s: Service) => s.id === service.id
                                );
                                if (serviceIndex !== -1) {
                                  state.services[serviceIndex] = {
                                    ...state.services[serviceIndex],
                                    webhookConnections: editedWebhooks,
                                    emailDestinations: editedEmails,
                                  };
                                  sessionStorage.setItem(
                                    "onboardingFlowState",
                                    JSON.stringify(state)
                                  );
                                }
                              }
                            } catch (e) {
                              console.error("Failed to update onboardingFlowState", e);
                            }
                          }
                        }
                        setIsEditing(false);
                        // Update local state to reflect changes immediately
                        // This will cause the service object (via useMemo) to recompute with new data
                        setTempServices((prev) => {
                          const updated = [...prev];
                          const index = updated.findIndex((s) => s.id === service.id);
                          if (index !== -1) {
                            updated[index] = {
                              ...updated[index],
                              webhookConnections: editedWebhooks,
                              emailDestinations: editedEmails,
                            };
                          }
                          return updated;
                        });
                      }}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  {/* Webhook Connections Form */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3" id="webhooks">
                      <Network className="h-4 w-4 text-cyan-400" />
                      <Label className="text-base font-semibold text-slate-200">
                        Webhook Connections
                      </Label>
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                        {editedWebhooks.length}
                      </Badge>
                    </div>
                    {editedWebhooks.map((webhook, index) => (
                      <div
                        key={webhook.id}
                        className="p-4 rounded-lg bg-slate-950/50 border border-slate-700/30 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold text-slate-200">
                            Webhook {index + 1}
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditedWebhooks(editedWebhooks.filter((_, i) => i !== index));
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`webhook-name-${index}`} className="text-xs text-slate-400 mb-1 block">
                              Name
                            </Label>
                            <Input
                              id={`webhook-name-${index}`}
                              value={webhook.name}
                              onChange={(e) => {
                                const updated = [...editedWebhooks];
                                updated[index] = { ...updated[index], name: e.target.value };
                                setEditedWebhooks(updated);
                              }}
                              className="bg-slate-900/50 border-slate-700/50 text-slate-100"
                              placeholder="Webhook name"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`webhook-url-${index}`} className="text-xs text-slate-400 mb-1 block">
                              URL <span className="text-red-400">*</span>
                            </Label>
                            <Input
                              id={`webhook-url-${index}`}
                              value={webhook.url}
                              onChange={(e) => {
                                const updated = [...editedWebhooks];
                                updated[index] = { ...updated[index], url: e.target.value };
                                setEditedWebhooks(updated);
                              }}
                              className="bg-slate-900/50 border-slate-700/50 text-slate-100 font-mono text-sm"
                              placeholder="https://example.com/webhook"
                              type="url"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditedWebhooks([
                          ...editedWebhooks,
                          {
                            id: `webhook-${Date.now()}`,
                            name: "",
                            url: "",
                            createdAt: new Date().toISOString(),
                          },
                        ]);
                      }}
                      className="w-full border-dashed border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Webhook Connection
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-700/50 my-4" />

                  {/* Email Destinations Form */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3" id="emails">
                      <Mail className="h-4 w-4 text-purple-400" />
                      <Label className="text-base font-semibold text-slate-200">
                        Email Destinations
                      </Label>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {editedEmails.length}
                      </Badge>
                    </div>
                    {editedEmails.map((email, index) => (
                      <div
                        key={email.id}
                        className="p-4 rounded-lg bg-slate-950/50 border border-slate-700/30 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold text-slate-200">
                            Email {index + 1}
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditedEmails(editedEmails.filter((_, i) => i !== index));
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`email-name-${index}`} className="text-xs text-slate-400 mb-1 block">
                              Name
                            </Label>
                            <Input
                              id={`email-name-${index}`}
                              value={email.name}
                              onChange={(e) => {
                                const updated = [...editedEmails];
                                updated[index] = { ...updated[index], name: e.target.value };
                                setEditedEmails(updated);
                              }}
                              className="bg-slate-900/50 border-slate-700/50 text-slate-100"
                              placeholder="Email destination name"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`email-address-${index}`} className="text-xs text-slate-400 mb-1 block">
                              Email Address <span className="text-red-400">*</span>
                            </Label>
                            <Input
                              id={`email-address-${index}`}
                              value={email.email}
                              onChange={(e) => {
                                const updated = [...editedEmails];
                                updated[index] = { ...updated[index], email: e.target.value };
                                setEditedEmails(updated);
                              }}
                              className="bg-slate-900/50 border-slate-700/50 text-slate-100 font-mono text-sm"
                              placeholder="recipient@example.com"
                              type="email"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditedEmails([
                          ...editedEmails,
                          {
                            id: `email-${Date.now()}`,
                            name: "",
                            email: "",
                            createdAt: new Date().toISOString(),
                          },
                        ]);
                      }}
                      className="w-full border-dashed border-slate-700/50 hover:border-purple-500/50 hover:bg-purple-500/10 text-slate-400 hover:text-purple-400"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Email Destination
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* View Mode */}
                  <div className="space-y-4">
                    {/* Webhook Connections */}
                    <div id="webhooks">
                      <div className="flex items-center gap-2 mb-3">
                        <Network className="h-4 w-4 text-cyan-400" />
                        <Label className="text-base font-semibold text-slate-200">
                          Webhook Connections
                        </Label>
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                          {service.webhookConnections?.length || 0}
                        </Badge>
                      </div>
                      {service.webhookConnections && service.webhookConnections.length > 0 ? (
                        <div className="space-y-2">
                          {service.webhookConnections.map((webhook) => (
                            <div
                              key={webhook.id}
                              className="p-3 rounded-lg bg-slate-950/50 border border-slate-700/30"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-slate-200">{webhook.name}</p>
                                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                                    {webhook.id}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-cyan-400 font-mono break-all mt-1">{webhook.url}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-3">
                          No webhook connections configured
                        </p>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-700/50 my-4" />

                    {/* Email Destinations */}
                    <div id="emails">
                      <div className="flex items-center gap-2 mb-3">
                        <Mail className="h-4 w-4 text-purple-400" />
                        <Label className="text-base font-semibold text-slate-200">
                          Email Destinations
                        </Label>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {service.emailDestinations?.length || 0}
                        </Badge>
                      </div>
                      {service.emailDestinations && service.emailDestinations.length > 0 ? (
                        <div className="space-y-2">
                          {service.emailDestinations.map((email) => (
                            <div
                              key={email.id}
                              className="p-3 rounded-lg bg-slate-950/50 border border-slate-700/30"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-slate-200">{email.name}</p>
                                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                    {email.id}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-purple-400 font-mono break-all mt-1">{email.email}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-3">
                          No email destinations configured
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
                </div>

        {/* Developer Tools Section */}
        <Card className="mt-8 rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50" id="developer-tools">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Terminal className="h-6 w-6 text-cyan-400" />
              <CardTitle className="text-2xl text-slate-200">Developer Tools</CardTitle>
                        </div>
            <p className="text-slate-400 mt-2">
              API integration details for {service.name}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* API Endpoint */}
            <div className="border border-slate-700/50 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleDevSection("apiEndpoint")}
                className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-900/70 transition-colors"
              >
                <div className="flex items-center gap-2" id="api-endpoint">
                  <Code className="h-4 w-4 text-cyan-400" />
                  <span className="font-semibold text-slate-200">API Endpoint</span>
                      </div>
                {expandedDevSections.apiEndpoint ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>
              {expandedDevSections.apiEndpoint && (
                <div className="p-4 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700/50 rounded-lg font-mono text-sm text-cyan-300">
                      <span className="text-purple-400">POST</span>{" "}
                      https://api.example.com/v1/services/{service.id}/process
                    </div>
                <CopyButton
                  text={`https://api.example.com/v1/services/${service.id}/process`}
                />
              </div>
                </div>
              )}
            </div>

            {/* API Key */}
            {service.tokenConnections && service.tokenConnections.length > 0 && (
              <div className="border border-slate-700/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleDevSection("apiKeys")}
                  className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-900/70 transition-colors"
                >
                  <div className="flex items-center gap-2" id="api-keys">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <span className="font-semibold text-slate-200">API Keys</span>
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      {service.tokenConnections.length}
                    </Badge>
                  </div>
                  {expandedDevSections.apiKeys ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                {expandedDevSections.apiKeys && (
                  <div className="p-4 border-t border-slate-700/50">
                <div className="space-y-2">
                  {service.tokenConnections.map((token) => {
                        const mockTokenSuffix = "abcd";
                    const maskedToken = `${token.tokenPrefix}${"•".repeat(20)}${mockTokenSuffix}`;
                    return (
                      <div
                        key={token.id}
                            className="flex items-center justify-between p-4 bg-slate-950 border border-slate-700/50 rounded-lg hover:border-yellow-500/30 transition-colors"
                      >
                        <div>
                              <p className="font-semibold text-slate-200 mb-1">
                                {token.name}
                              </p>
                              <p className="text-sm text-yellow-300 font-mono">
                            {maskedToken}
                          </p>
                        </div>
                        <CopyButton text={maskedToken} />
                      </div>
                    );
                  })}
                </div>
                  </div>
                )}
              </div>
            )}

            {/* Request Body */}
            <div className="border border-slate-700/50 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleDevSection("requestBody")}
                className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-900/70 transition-colors"
              >
                <div className="flex items-center gap-2" id="request-body">
                  <FileCode className="h-4 w-4 text-purple-400" />
                  <span className="font-semibold text-slate-200">Request Body</span>
                </div>
                {expandedDevSections.requestBody ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>
              {expandedDevSections.requestBody && (
                <div className="p-4 border-t border-slate-700/50">
                  <div className="relative">
                    <div className="border border-slate-700/50 rounded-lg bg-slate-950 p-4 overflow-x-auto">
                      <pre className="text-sm text-slate-300 font-mono">
                  <code>
                    {JSON.stringify(
                      generateRequestBody(service.workflowNames),
                      null,
                      2
                    )}
                  </code>
                </pre>
              </div>
                    <div className="absolute top-6 right-6">
              <CopyButton
                text={JSON.stringify(
                  generateRequestBody(service.workflowNames),
                  null,
                  2
                )}
              />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Field Rules */}
            <div className="border border-slate-700/50 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleDevSection("fieldRules")}
                className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-900/70 transition-colors"
              >
                        <div className="flex items-center gap-2" id="field-rules">
                  <Code className="h-4 w-4 text-blue-400" />
                  <span className="font-semibold text-slate-200">Field Rules</span>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {getFieldRules(service.workflowNames).length}
                  </Badge>
                </div>
                {expandedDevSections.fieldRules ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>
              {expandedDevSections.fieldRules && (
                <div className="p-6 border-t border-slate-700/50">
                  <div className="space-y-4">
                    {getFieldRules(service.workflowNames).map((rule, index) => (
                      <div
                        key={index}
                        className="p-5 bg-slate-950 border border-slate-700/50 rounded-lg hover:border-blue-500/30 transition-colors"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            <code className="px-4 py-2 bg-slate-800 border border-slate-700/50 rounded text-sm font-mono text-cyan-300">
                            {rule.field}
                          </code>
                          {rule.required && (
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/30 px-3 py-1">
                                Required
                              </Badge>
                          )}
                          {rule.type && (
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
                                {rule.type}
                              </Badge>
                          )}
                        </div>
                          <p className="text-base text-slate-300 leading-relaxed">
                          {rule.description}
                        </p>
                        {rule.examples && rule.examples.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                              <p className="text-sm font-medium text-slate-400 mb-3">
                                Examples:
                              </p>
                              <div className="flex flex-wrap gap-2">
                              {rule.examples.map((example, i) => (
                                <code
                                  key={i}
                                    className="px-3 py-1.5 bg-slate-800 border border-slate-700/50 rounded text-sm font-mono text-purple-300"
                                >
                                  {example}
                                </code>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      </div>
                ))}
              </div>
                </div>
              )}
            </div>

            {/* Destination Payload Previews */}
            {(service.webhookConnections &&
              service.webhookConnections.length > 0) ||
            (service.emailDestinations &&
              service.emailDestinations.length > 0) ? (
              <div className="border border-slate-700/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleDevSection("payloads")}
                  className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-900/70 transition-colors"
                >
                  <div className="flex items-center gap-2" id="payloads">
                    <Network className="h-4 w-4 text-cyan-400" />
                    <span className="font-semibold text-slate-200">
                  Destination Payload Previews
                    </span>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                      {(service.webhookConnections?.length || 0) +
                        (service.emailDestinations?.length || 0)}
                    </Badge>
                  </div>
                  {expandedDevSections.payloads ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                {expandedDevSections.payloads && (
                  <div className="p-4 border-t border-slate-700/50 space-y-3">
                {/* Webhook Payloads */}
                {service.webhookConnections &&
                  service.webhookConnections.map((webhook) => (
                        <div
                          key={webhook.id}
                          className="p-4 rounded-lg bg-slate-950/50 border border-slate-700/30 hover:border-cyan-500/30 transition-colors"
                        >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Network className="h-4 w-4 text-cyan-400" />
                                <span className="font-semibold text-slate-200">
                                  {webhook.name}
                                </span>
                                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                                  Webhook
                                </Badge>
                        </div>
                              <p className="text-sm text-slate-400 font-mono break-all">
                          {webhook.url}
                        </p>
                          </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPayload({
                                  type: "webhook",
                                  name: webhook.name,
                                  url: webhook.url,
                                });
                                setIsPayloadModalOpen(true);
                              }}
                              className="ml-4 border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Payload
                            </Button>
                        </div>
                        </div>
                  ))}

                {/* Email Payloads */}
                {service.emailDestinations &&
                  service.emailDestinations.map((email) => (
                        <div
                          key={email.id}
                          className="p-4 rounded-lg bg-slate-950/50 border border-slate-700/30 hover:border-purple-500/30 transition-colors"
                        >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <FileCode className="h-4 w-4 text-purple-400" />
                                <span className="font-semibold text-slate-200">
                                  {email.name}
                                </span>
                                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                  Email
                                </Badge>
                        </div>
                              <p className="text-sm text-slate-400 font-mono break-all">
                          {email.email}
                        </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPayload({
                                  type: "email",
                                  name: email.name,
                                  email: email.email,
                                });
                                setIsPayloadModalOpen(true);
                              }}
                              className="ml-4 border-slate-700/50 hover:border-purple-500/50 hover:bg-purple-500/10 text-slate-300"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Payload
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-slate-700/50 rounded-lg overflow-hidden">
                <div className="p-4 bg-slate-900/50 text-center">
                  <Network className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-slate-400">No destinations configured</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Configure webhooks or email destinations to see payload previews
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </div>
      </main>

      {/* Payload Preview Modal */}
      <Dialog open={isPayloadModalOpen} onOpenChange={setIsPayloadModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
              <Network className="h-6 w-6" />
              Payload Preview
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedPayload && (
                <>
                  <span className="text-cyan-400">{selectedPayload.name}</span>
                  {selectedPayload.type === "webhook" && (
                    <span className="text-slate-500"> • Webhook</span>
                  )}
                  {selectedPayload.type === "email" && (
                    <span className="text-slate-500"> • Email</span>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedPayload && (
            <div className="space-y-6">
              {selectedPayload.type === "webhook" && selectedPayload.url && (
                <>
                        <div>
                    <Label className="text-sm font-medium text-slate-300 mb-2 block">
                      Endpoint URL
                          </Label>
                    <p className="text-sm text-cyan-400 font-mono break-all">
                      {selectedPayload.url}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium text-slate-300">
                        JSON Payload
                      </Label>
                      <CopyButton
                        text={JSON.stringify(
                          generateWebhookPayload(service, selectedPayload.url),
                          null,
                          2
                        )}
                      />
                    </div>
                    <div className="border border-slate-700/50 rounded-lg bg-slate-950 p-4 overflow-x-auto">
                      <pre className="text-sm text-slate-300 font-mono">
                              <code>
                                {JSON.stringify(
                            generateWebhookPayload(service, selectedPayload.url),
                                  null,
                                  2
                                )}
                              </code>
                            </pre>
                          </div>
                  </div>
                </>
              )}
              {selectedPayload.type === "email" && selectedPayload.email && (
                <>
                  <div>
                    <Label className="text-sm font-medium text-slate-300 mb-2 block">
                      Email Address
                    </Label>
                    <p className="text-sm text-purple-400 font-mono break-all">
                      {selectedPayload.email}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium text-slate-300">
                        Email Payload
                      </Label>
                          <CopyButton
                            text={JSON.stringify(
                          generateEmailPayload(service, selectedPayload.email!),
                              null,
                              2
                            )}
                      />
                    </div>
                    <div className="border border-slate-700/50 rounded-lg bg-slate-950 p-4 overflow-x-auto">
                      <pre className="text-sm text-slate-300 font-mono">
                        <code>
                          {JSON.stringify(
                            generateEmailPayload(service, selectedPayload.email!),
                            null,
                            2
                          )}
                        </code>
                      </pre>
                    </div>
                        </div>
                        <div>
                    <Label className="text-sm font-medium text-slate-300 mb-2 block">
                            HTML Report Preview
                          </Label>
                    <div className="border border-slate-700/50 rounded-lg bg-slate-950 p-4">
                      <p className="text-sm text-slate-400 mb-3">
                              A formatted HTML report will be included as an
                              attachment. The report includes:
                            </p>
                      <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                              <li>Service execution summary</li>
                              <li>Workflow results for each step</li>
                              <li>Verification status and details</li>
                              <li>Timestamps and metadata</li>
                            </ul>
                          </div>
                        </div>
                </>
            )}
          </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

