"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Download,
  Search,
  ArrowUpDown,
  Code,
  Zap,
  Network,
  Sparkles,
  Terminal,
  FileCode,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import type { ServiceEvent } from "@/types/service";
import { mockServices } from "@/data/mockServices";
import { mockEvents } from "@/data/mockEvents";
import { generateRequestBody } from "@/lib/services/requestBodyGenerator";
import { getFieldRules } from "@/lib/services/fieldRules";
import { generateWebhookPayload, generateEmailPayload } from "@/lib/services/payloadGenerator";
import { CopyButton } from "@/components/services/CopyButton";
import { WorkflowBadges } from "@/components/services/WorkflowBadges";
import { StatusIcon } from "@/components/services/StatusIcon";
import { formatDate, formatCurrency, formatFileSize } from "@/lib/utils/formatting";
import { getTypeBadgeVariant } from "@/lib/utils/eventHelpers";

type SortField = "timestamp" | "type" | "status";
type SortDirection = "asc" | "desc";

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedEvent, setSelectedEvent] = useState<ServiceEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);

  const service = mockServices.find((s) => s.id === serviceId);
  const serviceEvents = mockEvents.filter((e) => e.serviceId === serviceId);

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = serviceEvents;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.recordId?.toLowerCase().includes(query) ||
          event.requestId?.toLowerCase().includes(query)
      );
    }

    // Sort events
    filtered = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "timestamp":
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [serviceEvents, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleViewEvent = (event: ServiceEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDownloadReport = (event: ServiceEvent) => {
    if (event.reportDocument) {
      // In a real app, this would trigger an actual download
      const link = document.createElement("a");
      link.href = event.reportDocument.url;
      link.download = event.reportDocument.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsDeveloperModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/20 text-cyan-300"
              >
                <Terminal className="h-5 w-5" />
                Developer Tools
              </Button>
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

          {/* Service Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Webhook Connections */}
            <Card className="rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/30 transition-all">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-cyan-400" />
                  <CardTitle className="text-lg text-slate-200">
                    Webhook Connections
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {service.webhookConnections &&
                service.webhookConnections.length > 0 ? (
                  <div className="space-y-3">
                    {service.webhookConnections.map((webhook) => (
                      <div
                        key={webhook.id}
                        className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/30 hover:border-cyan-500/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-slate-200">
                            {webhook.name}
                          </p>
                          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                            {webhook.id}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 font-mono break-all mb-3">
                          {webhook.url}
                        </p>
                        {webhook.tokenService && (
                          <div className="mt-3 pt-3 border-t border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-slate-500">Auth:</span>
                              <Badge
                                className={
                                  webhook.tokenService.type === "oauth"
                                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                                    : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                }
                              >
                                {webhook.tokenService.type === "oauth"
                                  ? "OAuth 2.0"
                                  : "Custom"}
                              </Badge>
                            </div>
                            {webhook.tokenService.type === "oauth" &&
                              webhook.tokenService.oauthConfig && (
                                <div className="text-xs text-slate-400 space-y-1 font-mono">
                                  <p>
                                    <span className="text-slate-500">Client ID:</span>{" "}
                                    {webhook.tokenService.oauthConfig.clientId}
                                  </p>
                                  <p className="break-all">
                                    <span className="text-slate-500">Token URL:</span>{" "}
                                    {webhook.tokenService.oauthConfig.tokenUrl}
                                  </p>
                                  {webhook.tokenService.oauthConfig.scope && (
                                    <p>
                                      <span className="text-slate-500">Scope:</span>{" "}
                                      {webhook.tokenService.oauthConfig.scope}
                                    </p>
                                  )}
                                </div>
                              )}
                            {webhook.tokenService.type === "custom" &&
                              webhook.tokenService.customConfig && (
                                <div className="text-xs text-slate-400 space-y-1 font-mono">
                                  <p>
                                    <span className="text-slate-500">Client ID:</span>{" "}
                                    {webhook.tokenService.customConfig.clientId}
                                  </p>
                                  <p className="break-all">
                                    <span className="text-slate-500">Token URL:</span>{" "}
                                    {webhook.tokenService.customConfig.tokenServiceUrl}
                                  </p>
                                  <p>
                                    <span className="text-slate-500">Header:</span>{" "}
                                    {webhook.tokenService.customConfig.headerName}
                                  </p>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No webhook connections configured
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Email Destinations */}
            <Card className="rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-purple-400" />
                  <CardTitle className="text-lg text-slate-200">
                    Email Destinations
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {service.emailDestinations &&
                service.emailDestinations.length > 0 ? (
                  <div className="space-y-3">
                    {service.emailDestinations.map((email) => (
                      <div
                        key={email.id}
                        className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/30 hover:border-purple-500/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-slate-200">
                            {email.name}
                          </p>
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            {email.id}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 font-mono break-all">
                          {email.email}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No email destinations configured
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Token Connections */}
          {service.tokenConnections && service.tokenConnections.length > 0 && (
            <Card className="mb-8 rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-yellow-500/30 transition-all">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  <CardTitle className="text-lg text-slate-200">
                    Token Connections
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {service.tokenConnections.map((token) => (
                    <div
                      key={token.id}
                      className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/30 hover:border-yellow-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-slate-200">
                          {token.name}
                        </p>
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                          {token.id}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 font-mono">
                        {token.tokenPrefix}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Events Section */}
        <Card className="rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="h-6 w-6 text-cyan-400" />
                  <CardTitle className="text-2xl text-slate-200">Event Stream</CardTitle>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                    {filteredAndSortedEvents.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64 bg-slate-900/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50"
                    />
                  </div>
                  <Select
                    value={sortField}
                    onValueChange={(value) => setSortField(value as SortField)}
                  >
                    <SelectTrigger className="w-40 bg-slate-900/50 border-slate-700/50 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="timestamp">Timestamp</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {filteredAndSortedEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">
                    {searchQuery
                      ? "No events found matching your search"
                      : "No events found"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAndSortedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="group relative p-4 rounded-xl bg-slate-900/50 border border-slate-700/30 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge
                              variant={getTypeBadgeVariant(event.type)}
                              className="font-semibold"
                            >
                              {event.type}
                            </Badge>
                            <div className="flex items-center gap-2 text-slate-400">
                              <StatusIcon status={event.status} />
                              <span className="text-sm capitalize">
                                {event.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-xs">
                              <Clock className="h-3 w-3" />
                              {formatDate(event.timestamp)}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-500">Record ID:</span>
                              <p className="font-mono text-cyan-400 mt-1 truncate">
                                {event.recordId || "-"}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-500">Request ID:</span>
                              <p className="font-mono text-purple-400 mt-1 truncate">
                                {event.requestId || "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.reportDocument && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReport(event)}
                              className="border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewEvent(event)}
                            className="border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300"
                          >
                            <Code className="h-4 w-4 mr-2" />
                            Inspect
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
      </main>

      {/* Event Details Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Event Inspector
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedEvent && (
                <span className="font-mono text-cyan-400">{selectedEvent.id}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              {/* Basic Event Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div>
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">
                    Timestamp
                  </Label>
                  <p className="mt-2 text-slate-200 font-mono text-sm">
                    {formatDate(selectedEvent.timestamp)}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">
                    Type
                  </Label>
                  <p className="mt-2">
                    <Badge variant={getTypeBadgeVariant(selectedEvent.type)}>
                      {selectedEvent.type}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">
                    Record ID
                  </Label>
                  <p className="mt-2 font-mono text-sm text-cyan-400">
                    {selectedEvent.recordId || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">
                    Request ID
                  </Label>
                  <p className="mt-2 font-mono text-sm text-purple-400">
                    {selectedEvent.requestId || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">
                    Status
                  </Label>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusIcon status={selectedEvent.status} />
                    <span className="capitalize text-slate-200">
                      {selectedEvent.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              {selectedEvent.errorDetails && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <Label className="text-lg font-semibold text-slate-200">
                      Error Details
                    </Label>
                  </div>
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-300 mb-1 block">
                          Message
                        </Label>
                        <p className="text-sm text-red-300 font-medium">
                          {selectedEvent.errorDetails.message}
                        </p>
                      </div>
                      {selectedEvent.errorDetails.code && (
                        <div>
                          <Label className="text-sm font-medium text-slate-300 mb-1 block">
                            Error Code
                          </Label>
                          <code className="px-3 py-1.5 bg-slate-900/50 border border-slate-700/50 rounded text-sm text-red-400 font-mono">
                            {selectedEvent.errorDetails.code}
                          </code>
                        </div>
                      )}
                      {selectedEvent.errorDetails.stack && (
                        <div>
                          <Label className="text-sm font-medium text-slate-300 mb-2 block">
                            Stack Trace
                          </Label>
                          <pre className="text-xs bg-slate-950 border border-slate-700/50 p-4 rounded-lg overflow-auto max-h-60 text-slate-300 font-mono">
                            {selectedEvent.errorDetails.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Destination Details */}
              {selectedEvent.destinationDetails && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Network className="h-5 w-5 text-cyan-400" />
                    <Label className="text-lg font-semibold text-slate-200">
                      Destination Details
                    </Label>
                  </div>
                  <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-300 mb-1 block">
                            Type
                          </Label>
                          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 capitalize">
                            {selectedEvent.destinationDetails.type}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-300 mb-1 block">
                            Destination
                          </Label>
                          <p className="font-mono text-sm text-cyan-400 break-all">
                            {selectedEvent.destinationDetails.destination}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium text-slate-300">
                            Payload
                          </Label>
                          <CopyButton
                            text={JSON.stringify(
                              selectedEvent.destinationDetails.payload,
                              null,
                              2
                            )}
                          />
                        </div>
                        <pre className="text-xs bg-slate-950 border border-slate-700/50 p-4 rounded-lg overflow-auto max-h-80 text-slate-300 font-mono">
                          {JSON.stringify(
                            selectedEvent.destinationDetails.payload,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                      {selectedEvent.destinationDetails.response && (
                        <div className="pt-4 border-t border-slate-700/50">
                          <Label className="text-sm font-medium text-slate-300 mb-3 block">
                            Webhook Response
                          </Label>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-400">Status:</span>
                              <Badge
                                className={
                                  selectedEvent.destinationDetails.response.status >=
                                    200 &&
                                  selectedEvent.destinationDetails.response.status < 300
                                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                                    : "bg-red-500/20 text-red-300 border-red-500/30"
                                }
                              >
                                {selectedEvent.destinationDetails.response.status}{" "}
                                {selectedEvent.destinationDetails.response.statusText}
                              </Badge>
                            </div>
                            {selectedEvent.destinationDetails.response.body && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="text-xs text-slate-400">
                                    Response Body
                                  </Label>
                                  <CopyButton
                                    text={selectedEvent.destinationDetails.response.body}
                                  />
                                </div>
                                <pre className="text-xs bg-slate-950 border border-slate-700/50 p-3 rounded-lg overflow-auto max-h-40 text-slate-300 font-mono">
                                  {selectedEvent.destinationDetails.response.body}
                                </pre>
                              </div>
                            )}
                            {selectedEvent.destinationDetails.response.headers && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="text-xs text-slate-400">
                                    Response Headers
                                  </Label>
                                  <CopyButton
                                    text={JSON.stringify(
                                      selectedEvent.destinationDetails.response.headers,
                                      null,
                                      2
                                    )}
                                  />
                                </div>
                                <pre className="text-xs bg-slate-950 border border-slate-700/50 p-3 rounded-lg overflow-auto max-h-40 text-slate-300 font-mono">
                                  {JSON.stringify(
                                    selectedEvent.destinationDetails.response.headers,
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Report Document */}
              {selectedEvent.reportDocument && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileCode className="h-5 w-5 text-purple-400" />
                    <Label className="text-lg font-semibold text-slate-200">
                      Report Document
                    </Label>
                  </div>
                  <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-300 mb-1 block">
                          Filename
                        </Label>
                        <p className="text-sm text-purple-300 font-mono">
                          {selectedEvent.reportDocument.filename}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-300 mb-1 block">
                            Content Type
                          </Label>
                          <Badge className="bg-slate-800/50 text-slate-300 border-slate-700/50">
                            {selectedEvent.reportDocument.contentType}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-300 mb-1 block">
                            Size
                          </Label>
                          <p className="text-sm text-purple-300 font-semibold">
                            {formatFileSize(selectedEvent.reportDocument.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDownloadReport(selectedEvent)}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white border-0 shadow-lg shadow-purple-500/25"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Developer Details Modal */}
      <Dialog open={isDeveloperModalOpen} onOpenChange={setIsDeveloperModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
              <Terminal className="h-6 w-6" />
              Developer Tools
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              API integration details for{" "}
              <span className="text-cyan-400">{service.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* API Endpoint */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-cyan-400" />
                <Label className="text-base font-semibold text-slate-200">
                  API Endpoint
                </Label>
              </div>
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

            {/* API Key */}
            {service.tokenConnections && service.tokenConnections.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  <Label className="text-base font-semibold text-slate-200">
                    API Keys
                  </Label>
                </div>
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

            {/* Request Body */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-purple-400" />
                <Label className="text-base font-semibold text-slate-200">
                  Request Body
                </Label>
              </div>
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
                <div className="absolute top-2 right-2">
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

            {/* Field Rules */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-400" />
                <Label className="text-base font-semibold text-slate-200">
                  Field Rules
                </Label>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {getFieldRules(service.workflowNames).map((rule, index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-950 border border-slate-700/50 rounded-lg hover:border-blue-500/30 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="px-3 py-1.5 bg-slate-800 border border-slate-700/50 rounded text-sm font-mono text-cyan-300">
                          {rule.field}
                        </code>
                        {rule.required && (
                          <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                            Required
                          </Badge>
                        )}
                        {rule.type && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            {rule.type}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-300">
                        {rule.description}
                      </p>
                      {rule.examples && rule.examples.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-700/50">
                          <p className="text-xs font-medium text-slate-400 mb-2">
                            Examples:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {rule.examples.map((example, i) => (
                              <code
                                key={i}
                                className="px-2 py-1 bg-slate-800 border border-slate-700/50 rounded text-xs font-mono text-purple-300"
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

            {/* Destination Payload Previews */}
            {(service.webhookConnections &&
              service.webhookConnections.length > 0) ||
            (service.emailDestinations &&
              service.emailDestinations.length > 0) ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-cyan-400" />
                  <Label className="text-base font-semibold text-slate-200">
                    Destination Payload Previews
                  </Label>
                </div>

                {/* Webhook Payloads */}
                {service.webhookConnections &&
                  service.webhookConnections.map((webhook) => (
                    <div
                      key={webhook.id}
                      className="rounded-lg bg-slate-800/50 border border-slate-700/50 overflow-hidden"
                    >
                      <div className="p-4 bg-slate-900/50 border-b border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-lg text-slate-200">
                            {webhook.name}
                          </CardTitle>
                          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                            Webhook
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 font-mono break-all">
                          {webhook.url}
                        </p>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="relative">
                          <Label className="text-sm font-medium text-slate-300 mb-2 block">
                            JSON Payload
                          </Label>
                          <div className="border border-slate-700/50 rounded-lg bg-slate-950 p-4 overflow-x-auto">
                            <pre className="text-sm text-slate-300 font-mono">
                              <code>
                                {JSON.stringify(
                                  generateWebhookPayload(service, webhook.url),
                                  null,
                                  2
                                )}
                              </code>
                            </pre>
                          </div>
                          <div className="absolute top-8 right-4">
                            <CopyButton
                              text={JSON.stringify(
                                generateWebhookPayload(service, webhook.url),
                                null,
                                2
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Email Payloads */}
                {service.emailDestinations &&
                  service.emailDestinations.map((email) => (
                    <div
                      key={email.id}
                      className="rounded-lg bg-slate-800/50 border border-slate-700/50 overflow-hidden"
                    >
                      <div className="p-4 bg-slate-900/50 border-b border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-lg text-slate-200">
                            {email.name}
                          </CardTitle>
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            Email
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 font-mono break-all">
                          {email.email}
                        </p>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="relative">
                          <Label className="text-sm font-medium text-slate-300 mb-2 block">
                            Email Payload
                          </Label>
                          <div className="border border-slate-700/50 rounded-lg bg-slate-950 p-4 overflow-x-auto">
                            <pre className="text-sm text-slate-300 font-mono">
                              <code>
                                {JSON.stringify(
                                  generateEmailPayload(service, email.email),
                                  null,
                                  2
                                )}
                              </code>
                            </pre>
                          </div>
                          <div className="absolute top-8 right-4">
                            <CopyButton
                              text={JSON.stringify(
                                generateEmailPayload(service, email.email),
                                null,
                                2
                              )}
                            />
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
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Network className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                <p>No destinations configured</p>
                <p className="text-sm text-slate-500 mt-1">
                  Configure webhooks or email destinations to see payload previews
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

