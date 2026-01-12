"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;

  const [expandedSections, setExpandedSections] = useState({
    webhooks: true,
    emails: true,
  });

  const [expandedDevSections, setExpandedDevSections] = useState({
    apiEndpoint: true,
    apiKeys: true,
    requestBody: true,
    fieldRules: true,
    payloads: false,
  });

  const [selectedPayload, setSelectedPayload] = useState<{
    type: "webhook" | "email";
    name: string;
    url?: string;
    email?: string;
  } | null>(null);
  const [isPayloadModalOpen, setIsPayloadModalOpen] = useState(false);

  const toggleSection = (section: "webhooks" | "emails") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleDevSection = (
    section: "apiEndpoint" | "apiKeys" | "requestBody" | "fieldRules" | "payloads"
  ) => {
    setExpandedDevSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const service = mockServices.find((s) => s.id === serviceId);


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
          <div className="mb-8">
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

          {/* Connections & Destinations - Collapsible */}
          <Card className="mb-8 rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                <Network className="h-5 w-5 text-cyan-400" />
                Connections & Destinations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Webhook Connections */}
              <div className="border border-slate-700/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("webhooks")}
                  className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-900/70 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-cyan-400" />
                    <span className="font-semibold text-slate-200">
                      Webhook Connections
                    </span>
                    {service.webhookConnections && service.webhookConnections.length > 0 && (
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                        {service.webhookConnections.length}
                      </Badge>
                    )}
                  </div>
                  {expandedSections.webhooks ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                {expandedSections.webhooks && (
                  <div className="p-4 border-t border-slate-700/50">
                {service.webhookConnections &&
                service.webhookConnections.length > 0 ? (
                      <div className="space-y-4">
                        {service.webhookConnections.map((webhook) => {
                          return (
                            <div
                              key={webhook.id}
                              className="p-5 rounded-lg bg-slate-950/50 border border-slate-700/30 hover:border-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-lg text-slate-200">
                                      {webhook.name}
                                    </p>
                                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                                      {webhook.id}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-cyan-400 font-mono break-all">
                                    {webhook.url}
                                  </p>
                                </div>
                              </div>

                              {/* Token Service Configuration */}
                              {webhook.tokenService && (
                                <div className="mt-4 pt-4 border-t border-slate-700/50">
                                  <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="h-4 w-4 text-yellow-400" />
                                    <span className="text-sm font-semibold text-slate-300">
                                      Token Service Configuration
                                    </span>
                                    <Badge
                                      className={
                                        webhook.tokenService.type === "oauth"
                                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                                          : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                      }
                                    >
                                      {webhook.tokenService.type === "oauth"
                                        ? "OAuth 2.0"
                                        : "Custom Token Service"}
                                    </Badge>
                                  </div>
                                  
                                  {webhook.tokenService.type === "oauth" &&
                                    webhook.tokenService.oauthConfig && (
                                      <div className="space-y-4 p-4 rounded-lg bg-slate-900/30 border border-slate-700/30">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <Label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">
                                              Grant Type
                                            </Label>
                                            <p className="text-sm text-purple-300 font-semibold bg-slate-950/50 p-2 rounded border border-slate-700/30">
                                              client_credentials
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">
                                              Token URL
                                            </Label>
                                            <div className="flex items-center gap-2">
                                              <p className="text-sm text-cyan-300 font-mono break-all bg-slate-950/50 p-2 rounded border border-slate-700/30 flex-1">
                                                {webhook.tokenService.oauthConfig.tokenUrl}
                                              </p>
                                              <CopyButton
                                                text={webhook.tokenService.oauthConfig.tokenUrl}
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">
                                              Client ID
                                            </Label>
                                            <div className="flex items-center gap-2">
                                              <p className="text-sm text-cyan-300 font-mono break-all bg-slate-950/50 p-2 rounded border border-slate-700/30 flex-1">
                                                {webhook.tokenService.oauthConfig.clientId}
                                              </p>
                                              <CopyButton
                                                text={webhook.tokenService.oauthConfig.clientId}
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">
                                              Client Secret
                                            </Label>
                                            <div className="flex items-center gap-2">
                                              <p className="text-sm text-yellow-300 font-mono bg-slate-950/50 p-2 rounded border border-slate-700/30 flex-1">
                                                {webhook.tokenService.oauthConfig.clientSecret}
                                              </p>
                                              <CopyButton
                                                text={webhook.tokenService.oauthConfig.clientSecret}
                                              />
                                            </div>
                                          </div>
                                          {webhook.tokenService.oauthConfig.scope && (
                                            <div>
                                              <Label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">
                                                Scope
                                              </Label>
                                              <p className="text-sm text-purple-300 font-mono bg-slate-950/50 p-2 rounded border border-slate-700/30">
                                                {webhook.tokenService.oauthConfig.scope}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-700/30">
                                          <p className="text-xs text-slate-400 mb-2">
                                            <strong className="text-slate-300">Usage:</strong> This token service is used to authenticate webhook requests. The system will automatically obtain an access token using these credentials via <code className="text-cyan-300">client_credentials</code> grant type, then include it in the <code className="text-cyan-300">Authorization: Bearer &lt;token&gt;</code> header when sending payloads to the webhook endpoint.
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  
                                  {webhook.tokenService.type === "custom" &&
                                    webhook.tokenService.customConfig && (
                                      <div className="space-y-4 p-4 rounded-lg bg-slate-900/30 border border-slate-700/30">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="md:col-span-2">
                                            <Label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">
                                              Token Service URL
                                            </Label>
                                            <div className="flex items-center gap-2">
                                              <p className="text-sm text-cyan-300 font-mono break-all bg-slate-950/50 p-2 rounded border border-slate-700/30 flex-1">
                                                {webhook.tokenService.customConfig.tokenServiceUrl}
                                              </p>
                                              <CopyButton
                                                text={webhook.tokenService.customConfig.tokenServiceUrl}
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">
                                              Header Name
                                            </Label>
                                            <p className="text-sm text-purple-300 font-mono bg-slate-950/50 p-2 rounded border border-slate-700/30">
                                              {webhook.tokenService.customConfig.headerName}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">
                                              Client ID
                                            </Label>
                                            <div className="flex items-center gap-2">
                                              <p className="text-sm text-cyan-300 font-mono break-all bg-slate-950/50 p-2 rounded border border-slate-700/30 flex-1">
                                                {webhook.tokenService.customConfig.clientId}
                                              </p>
                                              <CopyButton
                                                text={webhook.tokenService.customConfig.clientId}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-700/30">
                                          <p className="text-xs text-slate-400 mb-2">
                                            <strong className="text-slate-300">Usage:</strong> The Client ID will be sent in the <code className="text-purple-300">{webhook.tokenService.customConfig.headerName}</code> header when requesting a token from the token service URL. The obtained token will then be used to authenticate webhook requests (typically in the <code className="text-cyan-300">Authorization</code> header).
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                </div>
                              )}
                              
                              {!webhook.tokenService && (
                                <div className="mt-4 pt-4 border-t border-slate-700/50">
                                  <p className="text-xs text-slate-500 italic">
                                    No token service configured. Webhook requests will be sent without authentication.
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                  </div>
                ) : (
                      <p className="text-sm text-slate-500 text-center py-4">
                        No webhook connections configured
                  </p>
                )}
              </div>
                )}
            </div>

              {/* Email Destinations */}
              <div className="border border-slate-700/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("emails")}
                  className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-900/70 transition-colors"
                >
                        <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-purple-400" />
                    <span className="font-semibold text-slate-200">
                      Email Destinations
                    </span>
                    {service.emailDestinations && service.emailDestinations.length > 0 && (
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {service.emailDestinations.length}
                      </Badge>
                    )}
                        </div>
                  {expandedSections.emails ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                {expandedSections.emails && (
                  <div className="p-4 border-t border-slate-700/50">
                    {service.emailDestinations &&
                    service.emailDestinations.length > 0 ? (
                      <div className="space-y-4">
                        {service.emailDestinations.map((email) => (
                          <div
                            key={email.id}
                            className="p-5 rounded-lg bg-slate-950/50 border border-slate-700/30 hover:border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/10"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-lg text-slate-200 mb-1">
                                  {email.name}
                                </p>
                                <p className="text-sm text-purple-400 font-mono break-all">
                                  {email.email}
                  </p>
                </div>
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                {email.id}
                    </Badge>
                </div>
                </div>
                        ))}
                </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">
                        No email destinations configured
                      </p>
                    )}
                          </div>
                        )}
                      </div>

                    </CardContent>
                  </Card>
                </div>

        {/* Developer Tools Section */}
        <Card className="mt-8 rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50">
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
                <div className="flex items-center gap-2">
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
                  <div className="flex items-center gap-2">
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
                <div className="flex items-center gap-2">
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
                        <div className="flex items-center gap-2">
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
                  <div className="flex items-center gap-2">
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

