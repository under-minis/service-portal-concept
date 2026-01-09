"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Plus,
  Eye,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Zap,
  Network,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { Service } from "@/types/service";
import { mockServices } from "@/data/mockServices";
import { mockWorkflows } from "@/data/mockWorkflows";
import { formatCurrency } from "@/lib/utils/formatting";
import { calculateCostPerRun } from "@/lib/utils/costCalculation";

type Destination = {
  id: string;
  type: "webhook" | "email";
  url?: string;
  email?: string;
  name?: string;
  tokenService?: {
    type: "oauth" | "custom";
    oauthConfig?: {
      clientId: string;
      clientSecret: string;
      tokenUrl: string;
      scope?: string;
    };
    customConfig?: {
      clientId: string;
      tokenServiceUrl: string;
      headerName: string;
    };
  };
};

type CurrentDestination = {
  type: "webhook" | "email";
  url?: string;
  email?: string;
  name?: string;
  tokenServiceType?: "none" | "oauth" | "custom";
  oauthConfig?: {
    clientId: string;
    clientSecret: string;
    tokenUrl: string;
    scope?: string;
  };
  customConfig?: {
    clientId: string;
    tokenServiceUrl: string;
    headerName: string;
  };
};

export default function Home() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>(mockServices);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [createStep, setCreateStep] = useState(1);
  const [newService, setNewService] = useState({ name: "" });
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [currentDestination, setCurrentDestination] =
    useState<CurrentDestination>({
      type: "webhook",
      tokenServiceType: "none",
    });

  const calculatedCost = useMemo(
    () => calculateCostPerRun(selectedWorkflows.length),
    [selectedWorkflows.length]
  );

  const workflowNames = useMemo(
    () =>
      mockWorkflows
        .filter((wf) => selectedWorkflows.includes(wf.id))
        .map((wf) => wf.name),
    [selectedWorkflows]
  );

  const handleViewDetails = (service: Service) => {
    router.push(`/services/${service.id}`);
  };

  const handleWorkflowToggle = (workflowId: string) => {
    setSelectedWorkflows((prev) =>
      prev.includes(workflowId)
        ? prev.filter((id) => id !== workflowId)
        : [...prev, workflowId]
    );
  };

  const buildTokenService = (dest: CurrentDestination) => {
    if (
      dest.type !== "webhook" ||
      !dest.tokenServiceType ||
      dest.tokenServiceType === "none"
    ) {
      return undefined;
    }
    return {
      type: dest.tokenServiceType as "oauth" | "custom",
      oauthConfig:
        dest.tokenServiceType === "oauth" ? dest.oauthConfig : undefined,
      customConfig:
        dest.tokenServiceType === "custom" ? dest.customConfig : undefined,
    };
  };

  const buildWebhookConnections = (serviceName: string, baseIndex: number) => {
    return destinations
      .filter((d) => d.type === "webhook" && d.url)
      .map((d, index) => ({
        id: `wh-${baseIndex}-${index}`,
        url: d.url!,
        name: d.name || `${serviceName} Webhook ${index + 1}`,
        createdAt: new Date().toISOString(),
        tokenService: d.tokenService,
      }));
  };

  const buildEmailDestinations = (serviceName: string, baseIndex: number) => {
    return destinations
      .filter((d) => d.type === "email" && d.email)
      .map((d, index) => ({
        id: `email-${baseIndex}-${index}`,
        email: d.email!,
        name: d.name || `${serviceName} Email ${index + 1}`,
        createdAt: new Date().toISOString(),
      }));
  };

  const handleCreateService = () => {
    if (!newService.name || selectedWorkflows.length === 0) {
      return;
    }

    const baseIndex = services.length + 1;
    const webhookConnections = buildWebhookConnections(
      newService.name,
      baseIndex
    );
    const emailDestinations = buildEmailDestinations(
      newService.name,
      baseIndex
    );

    const newServiceData: Service = {
      id: `svc-${String(baseIndex).padStart(3, "0")}`,
      name: newService.name,
      workflowNames,
      estimatedCostPerRun: calculatedCost,
      webhookConnections:
        webhookConnections.length > 0 ? webhookConnections : undefined,
      emailDestinations:
        emailDestinations.length > 0 ? emailDestinations : undefined,
      tokenConnections: [],
    };

    setServices([...services, newServiceData]);
    setIsCreateModalOpen(false);
    resetCreateModal();
  };

  const resetCreateModal = () => {
    setCreateStep(1);
    setNewService({ name: "" });
    setSelectedWorkflows([]);
    setDestinations([]);
    setCurrentDestination({ type: "webhook", tokenServiceType: "none" });
  };

  const handleAddDestination = () => {
    const isValid =
      (currentDestination.type === "webhook" && currentDestination.url) ||
      (currentDestination.type === "email" && currentDestination.email);

    if (!isValid) return;

    const tokenService = buildTokenService(currentDestination);

    setDestinations([
      ...destinations,
      {
        id: `dest-${Date.now()}`,
        type: currentDestination.type,
        url: currentDestination.url,
        email: currentDestination.email,
        name: currentDestination.name,
        tokenService,
      },
    ]);

    setCurrentDestination({ type: "webhook", tokenServiceType: "none" });
  };

  const handleRemoveDestination = (id: string) => {
    setDestinations(destinations.filter((d) => d.id !== id));
  };

  return (
    <>
      {/* Futuristic Background Grid */}
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

      {/* Main Content */}
      <main className="relative min-h-screen container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Service Network
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl">
            Orchestrate intelligent verification workflows across distributed
            systems
          </p>
        </div>

        {/* Action Bar */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
              <span className="text-slate-400 text-sm">Active Services</span>
              <span className="ml-3 text-cyan-400 font-semibold text-xl">
                {services.length}
              </span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
              <span className="text-slate-400 text-sm">Total Workflows</span>
              <span className="ml-3 text-purple-400 font-semibold text-xl">
                {services.reduce((acc, s) => acc + s.workflowNames.length, 0)}
              </span>
            </div>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            Initialize Service
          </Button>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className="relative mt-20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-6 p-12 rounded-2xl bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 max-w-md">
                <div className="relative mx-auto w-24 h-24">
                  <Network className="w-24 h-24 text-slate-600" />
                  <div className="absolute inset-0 bg-cyan-500/20 blur-2xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-300 mb-2">
                    No Active Services
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Initialize your first service to begin orchestrating
                    workflows
                  </p>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Service
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500" />
                <div className="relative h-full rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
                  {/* Service Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                        {service.name}
                      </h3>
                      <div className="px-2 py-1 rounded-md bg-slate-900/50 border border-slate-700/50">
                        <span className="text-xs font-mono text-slate-400">
                          {service.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Workflows */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span className="text-xs text-slate-400 uppercase tracking-wider">
                        Workflows
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {service.workflowNames.map((workflow, idx) => (
                        <Badge
                          key={idx}
                          className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/50 transition-colors"
                        >
                          {workflow}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mb-6 grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
                      <div className="text-xs text-slate-500 mb-1">
                        Cost/Run
                      </div>
                      <div className="text-lg font-semibold text-cyan-400">
                        {formatCurrency(service.estimatedCostPerRun)}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
                      <div className="text-xs text-slate-500 mb-1">
                        Connections
                      </div>
                      <div className="text-lg font-semibold text-purple-400">
                        {(service.webhookConnections?.length || 0) +
                          (service.emailDestinations?.length || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    onClick={() => handleViewDetails(service)}
                    className="w-full group/btn border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300"
                  >
                    <Eye className="h-4 w-4 mr-2 group-hover/btn:text-cyan-400" />
                    <span className="group-hover/btn:text-cyan-400">
                      Analyze Service
                    </span>
                    <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Service Modal */}
      <Dialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) resetCreateModal();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Initialize Service
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {createStep === 1 && "Configure core service parameters"}
              {createStep === 2 && "Establish connection endpoints"}
            </DialogDescription>
          </DialogHeader>

          {/* Futuristic Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  createStep >= 1
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                    : "bg-slate-800 text-slate-500 border border-slate-700"
                }`}
              >
                {createStep > 1 ? (
                  <div className="w-2 h-2 rounded-full bg-white" />
                ) : (
                  "1"
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors ${
                  createStep >= 1 ? "text-cyan-400" : "text-slate-500"
                }`}
              >
                Configuration
              </span>
            </div>
            <div
              className={`h-px flex-1 transition-all duration-300 ${
                createStep >= 2
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                  : "bg-slate-700"
              }`}
            />
            <div className="flex items-center gap-3">
              <div
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  createStep >= 2
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                    : "bg-slate-800 text-slate-500 border border-slate-700"
                }`}
              >
                2
              </div>
              <span
                className={`text-sm font-medium transition-colors ${
                  createStep >= 2 ? "text-cyan-400" : "text-slate-500"
                }`}
              >
                Connections
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Basic Information */}
            {createStep === 1 && (
              <>
                <div className="space-y-3">
                  <Label htmlFor="service-name" className="text-slate-300">
                    Service Identifier
                  </Label>
                  <Input
                    id="service-name"
                    placeholder="Enter service name"
                    value={newService.name}
                    onChange={(e) =>
                      setNewService({ ...newService, name: e.target.value })
                    }
                    className="bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <Label className="text-slate-300">Workflow Selection</Label>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto rounded-lg bg-slate-800/30 border border-slate-700/50 p-4">
                    {mockWorkflows.map((workflow) => (
                      <div
                        key={workflow.id}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700/30 transition-colors"
                      >
                        <Checkbox
                          id={workflow.id}
                          checked={selectedWorkflows.includes(workflow.id)}
                          onCheckedChange={() =>
                            handleWorkflowToggle(workflow.id)
                          }
                          className="border-slate-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                        />
                        <Label
                          htmlFor={workflow.id}
                          className="font-normal cursor-pointer text-slate-300 flex-1"
                        >
                          {workflow.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedWorkflows.length > 0 && (
                    <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">
                          {selectedWorkflows.length} workflow(s) active
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-300">
                            Estimated Cost:
                          </span>
                          <span className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            {formatCurrency(calculatedCost)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        $0.05 per workflow execution
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Destination Connection */}
            {createStep === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Network className="h-5 w-5 text-purple-400" />
                    <Label className="text-base font-semibold text-slate-300">
                      Connection Endpoints
                    </Label>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Configure webhook and email destinations. Webhooks support
                    optional token-based authentication.
                  </p>
                </div>

                {/* Existing Destinations */}
                {destinations.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                      Active Connections
                    </Label>
                    <div className="space-y-2">
                      {destinations.map((dest) => (
                        <div
                          key={dest.id}
                          className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30">
                                  {dest.type === "webhook"
                                    ? "Webhook"
                                    : "Email"}
                                </Badge>
                                {dest.name && (
                                  <span className="font-medium text-slate-200">
                                    {dest.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-400 font-mono">
                                {dest.type === "webhook"
                                  ? dest.url
                                  : dest.email}
                              </p>
                              {dest.tokenService && (
                                <p className="text-xs text-purple-400 mt-2">
                                  Auth:{" "}
                                  {dest.tokenService.type === "oauth"
                                    ? "OAuth"
                                    : "Custom"}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDestination(dest.id)}
                              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Destination Form */}
                <div className="rounded-lg bg-slate-800/30 border border-slate-700/50 p-5 space-y-4">
                  <Label className="text-base font-semibold text-slate-300">
                    New Connection
                  </Label>

                  <div className="space-y-3">
                    <Label className="text-slate-300">Connection Type</Label>
                    <RadioGroup
                      value={currentDestination.type}
                      onValueChange={(value) =>
                        setCurrentDestination({
                          ...currentDestination,
                          type: value as "webhook" | "email",
                          tokenServiceType:
                            value === "webhook" ? "none" : undefined,
                        })
                      }
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2 flex-1 p-3 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 transition-colors cursor-pointer">
                        <RadioGroupItem
                          value="webhook"
                          id="webhook"
                          className="border-slate-600 data-[state=checked]:border-cyan-500"
                        />
                        <Label
                          htmlFor="webhook"
                          className="font-normal cursor-pointer text-slate-300 flex-1"
                        >
                          Webhook
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 flex-1 p-3 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 transition-colors cursor-pointer">
                        <RadioGroupItem
                          value="email"
                          id="email"
                          className="border-slate-600 data-[state=checked]:border-cyan-500"
                        />
                        <Label
                          htmlFor="email"
                          className="font-normal cursor-pointer text-slate-300 flex-1"
                        >
                          Email
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {currentDestination.type === "webhook" && (
                    <>
                      <div className="space-y-2">
                        <Label
                          htmlFor="webhook-name"
                          className="text-slate-300"
                        >
                          Connection Name (Optional)
                        </Label>
                        <Input
                          id="webhook-name"
                          placeholder="Production Webhook"
                          value={currentDestination.name || ""}
                          onChange={(e) =>
                            setCurrentDestination({
                              ...currentDestination,
                              name: e.target.value,
                            })
                          }
                          className="bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="webhook-url" className="text-slate-300">
                          Endpoint URL
                        </Label>
                        <Input
                          id="webhook-url"
                          type="url"
                          placeholder="https://api.example.com/webhook"
                          value={currentDestination.url || ""}
                          onChange={(e) =>
                            setCurrentDestination({
                              ...currentDestination,
                              url: e.target.value,
                            })
                          }
                          className="bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100 font-mono text-sm"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-slate-300">
                          Authentication (Optional)
                        </Label>
                        <RadioGroup
                          value={currentDestination.tokenServiceType || "none"}
                          onValueChange={(value) =>
                            setCurrentDestination({
                              ...currentDestination,
                              tokenServiceType: value as
                                | "none"
                                | "oauth"
                                | "custom",
                            })
                          }
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-700/30 transition-colors cursor-pointer">
                            <RadioGroupItem
                              value="none"
                              id="token-none"
                              className="border-slate-600 data-[state=checked]:border-cyan-500"
                            />
                            <Label
                              htmlFor="token-none"
                              className="font-normal cursor-pointer text-slate-300 flex-1"
                            >
                              None
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-700/30 transition-colors cursor-pointer">
                            <RadioGroupItem
                              value="oauth"
                              id="token-oauth"
                              className="border-slate-600 data-[state=checked]:border-cyan-500"
                            />
                            <Label
                              htmlFor="token-oauth"
                              className="font-normal cursor-pointer text-slate-300 flex-1"
                            >
                              OAuth 2.0
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-700/30 transition-colors cursor-pointer">
                            <RadioGroupItem
                              value="custom"
                              id="token-custom"
                              className="border-slate-600 data-[state=checked]:border-cyan-500"
                            />
                            <Label
                              htmlFor="token-custom"
                              className="font-normal cursor-pointer text-slate-300 flex-1"
                            >
                              Custom Token Service
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {currentDestination.tokenServiceType === "oauth" && (
                        <div className="space-y-4 rounded-lg border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-4">
                          <Label className="text-sm font-semibold text-cyan-300">
                            OAuth 2.0 Configuration
                          </Label>
                          <div className="space-y-3">
                            <div>
                              <Label
                                htmlFor="oauth-client-id"
                                className="text-xs text-slate-400 mb-1 block"
                              >
                                Client ID
                              </Label>
                              <Input
                                id="oauth-client-id"
                                placeholder="your-client-id"
                                value={
                                  currentDestination.oauthConfig?.clientId || ""
                                }
                                onChange={(e) =>
                                  setCurrentDestination({
                                    ...currentDestination,
                                    oauthConfig: {
                                      ...(currentDestination.oauthConfig || {}),
                                      clientId: e.target.value,
                                      clientSecret:
                                        currentDestination.oauthConfig
                                          ?.clientSecret || "",
                                      tokenUrl:
                                        currentDestination.oauthConfig
                                          ?.tokenUrl || "",
                                      scope:
                                        currentDestination.oauthConfig?.scope ||
                                        "",
                                    },
                                  })
                                }
                                className="bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="oauth-client-secret"
                                className="text-xs text-slate-400 mb-1 block"
                              >
                                Client Secret
                              </Label>
                              <Input
                                id="oauth-client-secret"
                                type="password"
                                placeholder="your-client-secret"
                                value={
                                  currentDestination.oauthConfig
                                    ?.clientSecret || ""
                                }
                                onChange={(e) =>
                                  setCurrentDestination({
                                    ...currentDestination,
                                    oauthConfig: {
                                      ...(currentDestination.oauthConfig || {}),
                                      clientId:
                                        currentDestination.oauthConfig
                                          ?.clientId || "",
                                      clientSecret: e.target.value,
                                      tokenUrl:
                                        currentDestination.oauthConfig
                                          ?.tokenUrl || "",
                                      scope:
                                        currentDestination.oauthConfig?.scope ||
                                        "",
                                    },
                                  })
                                }
                                className="bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="oauth-token-url"
                                className="text-xs text-slate-400 mb-1 block"
                              >
                                Token URL
                              </Label>
                              <Input
                                id="oauth-token-url"
                                type="url"
                                placeholder="https://auth.example.com/oauth/token"
                                value={
                                  currentDestination.oauthConfig?.tokenUrl || ""
                                }
                                onChange={(e) =>
                                  setCurrentDestination({
                                    ...currentDestination,
                                    oauthConfig: {
                                      ...(currentDestination.oauthConfig || {}),
                                      clientId:
                                        currentDestination.oauthConfig
                                          ?.clientId || "",
                                      clientSecret:
                                        currentDestination.oauthConfig
                                          ?.clientSecret || "",
                                      tokenUrl: e.target.value,
                                      scope:
                                        currentDestination.oauthConfig?.scope ||
                                        "",
                                    },
                                  })
                                }
                                className="bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100 font-mono text-sm"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="oauth-scope"
                                className="text-xs text-slate-400 mb-1 block"
                              >
                                Scope (Optional)
                              </Label>
                              <Input
                                id="oauth-scope"
                                placeholder="read write"
                                value={
                                  currentDestination.oauthConfig?.scope || ""
                                }
                                onChange={(e) =>
                                  setCurrentDestination({
                                    ...currentDestination,
                                    oauthConfig: {
                                      ...(currentDestination.oauthConfig || {}),
                                      clientId:
                                        currentDestination.oauthConfig
                                          ?.clientId || "",
                                      clientSecret:
                                        currentDestination.oauthConfig
                                          ?.clientSecret || "",
                                      tokenUrl:
                                        currentDestination.oauthConfig
                                          ?.tokenUrl || "",
                                      scope: e.target.value,
                                    },
                                  })
                                }
                                className="bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {currentDestination.tokenServiceType === "custom" && (
                        <div className="space-y-4 rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4">
                          <Label className="text-sm font-semibold text-purple-300">
                            Custom Token Service
                          </Label>
                          <div className="space-y-3">
                            <div>
                              <Label
                                htmlFor="custom-client-id"
                                className="text-xs text-slate-400 mb-1 block"
                              >
                                Client ID
                              </Label>
                              <Input
                                id="custom-client-id"
                                placeholder="your-client-id"
                                value={
                                  currentDestination.customConfig?.clientId ||
                                  ""
                                }
                                onChange={(e) =>
                                  setCurrentDestination({
                                    ...currentDestination,
                                    customConfig: {
                                      ...(currentDestination.customConfig ||
                                        {}),
                                      clientId: e.target.value,
                                      tokenServiceUrl:
                                        currentDestination.customConfig
                                          ?.tokenServiceUrl || "",
                                      headerName:
                                        currentDestination.customConfig
                                          ?.headerName || "",
                                    },
                                  })
                                }
                                className="bg-slate-800/50 border-slate-700/50 focus:border-purple-500/50 focus:ring-purple-500/20 text-slate-100"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="custom-token-service-url"
                                className="text-xs text-slate-400 mb-1 block"
                              >
                                Token Service URL
                              </Label>
                              <Input
                                id="custom-token-service-url"
                                type="url"
                                placeholder="https://api.example.com/token"
                                value={
                                  currentDestination.customConfig
                                    ?.tokenServiceUrl || ""
                                }
                                onChange={(e) =>
                                  setCurrentDestination({
                                    ...currentDestination,
                                    customConfig: {
                                      ...(currentDestination.customConfig ||
                                        {}),
                                      clientId:
                                        currentDestination.customConfig
                                          ?.clientId || "",
                                      tokenServiceUrl: e.target.value,
                                      headerName:
                                        currentDestination.customConfig
                                          ?.headerName || "",
                                    },
                                  })
                                }
                                className="bg-slate-800/50 border-slate-700/50 focus:border-purple-500/50 focus:ring-purple-500/20 text-slate-100 font-mono text-sm"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="custom-header-name"
                                className="text-xs text-slate-400 mb-1 block"
                              >
                                Header Name
                              </Label>
                              <Input
                                id="custom-header-name"
                                placeholder="X-Client-Id"
                                value={
                                  currentDestination.customConfig?.headerName ||
                                  ""
                                }
                                onChange={(e) =>
                                  setCurrentDestination({
                                    ...currentDestination,
                                    customConfig: {
                                      ...(currentDestination.customConfig ||
                                        {}),
                                      clientId:
                                        currentDestination.customConfig
                                          ?.clientId || "",
                                      tokenServiceUrl:
                                        currentDestination.customConfig
                                          ?.tokenServiceUrl || "",
                                      headerName: e.target.value,
                                    },
                                  })
                                }
                                className="bg-slate-800/50 border-slate-700/50 focus:border-purple-500/50 focus:ring-purple-500/20 text-slate-100"
                              />
                              <p className="text-xs text-slate-500 mt-1">
                                Header name to send client ID when requesting
                                token
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {currentDestination.type === "email" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email-name" className="text-slate-300">
                          Connection Name (Optional)
                        </Label>
                        <Input
                          id="email-name"
                          placeholder="Admin Email"
                          value={currentDestination.name || ""}
                          onChange={(e) =>
                            setCurrentDestination({
                              ...currentDestination,
                              name: e.target.value,
                            })
                          }
                          className="bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email-address"
                          className="text-slate-300"
                        >
                          Email Address
                        </Label>
                        <Input
                          id="email-address"
                          type="email"
                          placeholder="recipient@example.com"
                          value={currentDestination.email || ""}
                          onChange={(e) =>
                            setCurrentDestination({
                              ...currentDestination,
                              email: e.target.value,
                            })
                          }
                          className="bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100"
                        />
                      </div>
                    </>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddDestination}
                    disabled={
                      (currentDestination.type === "webhook" &&
                        !currentDestination.url) ||
                      (currentDestination.type === "email" &&
                        !currentDestination.email)
                    }
                    className="w-full border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-400 transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Connection
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetCreateModal();
              }}
              className="border-slate-700/50 hover:border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              {createStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCreateStep(createStep - 1)}
                  className="border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-400"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              {createStep < 2 ? (
                <Button
                  onClick={() => {
                    if (createStep === 1) {
                      if (!newService.name || selectedWorkflows.length === 0) {
                        return;
                      }
                    }
                    setCreateStep(createStep + 1);
                  }}
                  disabled={
                    createStep === 1 &&
                    (!newService.name || selectedWorkflows.length === 0)
                  }
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreateService}
                  disabled={
                    !newService.name ||
                    selectedWorkflows.length === 0 ||
                    destinations.length === 0
                  }
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Initialize Service
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
