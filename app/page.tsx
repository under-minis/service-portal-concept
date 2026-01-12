"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Sparkles, ArrowRight, Network, Plus, Eye } from "lucide-react";
import type { Service } from "@/types/service";
import { mockWorkflows } from "@/data/mockWorkflows";
import { formatCurrency } from "@/lib/utils/formatting";
import { calculateCostPerRun } from "@/lib/utils/costCalculation";
import { OnboardingModal } from "@/components/services/OnboardingModal";
import { QuickStartModal } from "@/components/services/QuickStartModal";
import { TrialCreditsDisplay } from "@/components/services/TrialCreditsDisplay";
import { EventStream, type Event } from "@/components/services/EventStream";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  // New state for onboarding flow
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [trialCredits] = useState(50); // Fixed trial credits

  // Event logging helper
  const addEvent = (
    type: Event["type"],
    message: string,
    details?: string,
    data?: Record<string, unknown>
  ) => {
    const event: Event = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      message,
      details,
      data,
    };
    setEvents((prev) => [...prev, event]);
  };

  // Persist onboarding flow state to sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Don't persist while restoring to avoid overwriting
    if (isRestoring) return;

    const state = {
      isQuickStartOpen,
      services,
      events: events.map((event) => ({
        ...event,
        timestamp: event.timestamp.toISOString(),
      })),
    };

    sessionStorage.setItem("onboardingFlowState", JSON.stringify(state));
  }, [isQuickStartOpen, services, events, isRestoring]);

  // Restore onboarding flow state from sessionStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Don't restore if onboarding is being forced (reset demo scenario)
    const forceOnboarding = searchParams?.get("onboarding") === "true";
    if (forceOnboarding) {
      // Clear the saved state when reset is forced
      sessionStorage.removeItem("onboardingFlowState");
      setTimeout(() => setIsRestoring(false), 0);
      return;
    }

    const saved = sessionStorage.getItem("onboardingFlowState");
    if (saved) {
      try {
        const state = JSON.parse(saved);
        // Always restore services, even if empty array (check for array existence)
        // Defer state updates to avoid cascading renders
        setTimeout(() => {
          if (Array.isArray(state.services)) {
            setServices(state.services);
          }
          // Always restore events, converting timestamp strings back to Date objects
          if (Array.isArray(state.events)) {
            setEvents(
              state.events.map(
                (event: Omit<Event, "timestamp"> & { timestamp: string }) => ({
                  ...event,
                  timestamp: new Date(event.timestamp),
                })
              )
            );
          }
          if (state.isQuickStartOpen)
            setIsQuickStartOpen(state.isQuickStartOpen);
        }, 0);
      } catch (e) {
        console.error("Failed to restore onboarding flow state", e);
      }
    }

    // Mark restoration as complete after a brief delay to ensure all state is set
    setTimeout(() => setIsRestoring(false), 100);
  }, [searchParams]); // Run when searchParams change

  // Check for onboarding URL param and first-time user
  useEffect(() => {
    const checkOnboarding = () => {
      try {
        const forceOnboarding = searchParams?.get("onboarding") === "true";
        const skipOnboarding =
          localStorage.getItem("skipOnboarding") === "true";
        const isFirstTime = services.length === 0;

        // Only show onboarding if explicitly forced or if it's truly first time AND no flow state exists
        const hasFlowState =
          typeof window !== "undefined" &&
          sessionStorage.getItem("onboardingFlowState") !== null;

        if (
          (isFirstTime && !skipOnboarding && !hasFlowState) ||
          forceOnboarding
        ) {
          // Use setTimeout to avoid synchronous setState in effect
          setTimeout(() => setIsOnboardingOpen(true), 0);
        }
      } catch {
        // Handle case where searchParams might not be available
        const skipOnboarding =
          localStorage.getItem("skipOnboarding") === "true";
        const isFirstTime = services.length === 0;
        const hasFlowState =
          typeof window !== "undefined" &&
          sessionStorage.getItem("onboardingFlowState") !== null;
        if (isFirstTime && !skipOnboarding && !hasFlowState) {
          setTimeout(() => setIsOnboardingOpen(true), 0);
        }
      }
    };

    checkOnboarding();
  }, [searchParams, services.length]);

  const handleViewDetails = (service: Service) => {
    router.push(`/services/${service.id}`);
  };

  // Quick Start handlers
  const handleQuickStartCreate = async (
    serviceName: string,
    selectedWorkflows: string[],
    emailDestinations: Array<{ email: string; name: string }>
  ) => {
    setIsCreatingService(true);

    addEvent(
      "progress",
      "Starting quick start service creation...",
      `Service: ${serviceName}`
    );

    // Allow UI to update with loading state
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const baseIndex = services.length + 1;
    const workflowNames = mockWorkflows
      .filter((wf) => selectedWorkflows.includes(wf.id))
      .map((wf) => wf.name);
    const defaultCost = calculateCostPerRun(selectedWorkflows.length);

    addEvent(
      "info",
      "Configuring workflows",
      `${workflowNames.join(", ")} (Cost: ${formatCurrency(defaultCost)}/run)`
    );

    const newServiceData: Service = {
      id: `svc-${String(baseIndex).padStart(3, "0")}`,
      name: serviceName,
      workflowNames: workflowNames,
      estimatedCostPerRun: defaultCost,
      emailDestinations: emailDestinations.map((dest, idx) => ({
        id: `email-${Date.now()}-${idx}`,
        email: dest.email,
        name: dest.name,
        createdAt: new Date().toISOString(),
      })),
      tokenConnections: [],
    };

    addEvent(
      "success",
      `Service "${serviceName}" created successfully`,
      `Service ID: ${newServiceData.id}`,
      {
        serviceId: newServiceData.id,
        workflows: workflowNames,
        costPerRun: defaultCost,
      }
    );

    // Add service to list
    setServices([...services, newServiceData]);

    // Store in sessionStorage so service details page can find it
    if (typeof window !== "undefined") {
      const existingServices = JSON.parse(
        sessionStorage.getItem("tempServices") || "[]"
      );
      existingServices.push(newServiceData);
      sessionStorage.setItem("tempServices", JSON.stringify(existingServices));
    }

    setIsCreatingService(false);
    setIsQuickStartOpen(false);

    // Navigate directly to service details
    router.push(`/services/${newServiceData.id}`);
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
              Snap Verify
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl">
            Identity verification made easy
          </p>
        </div>

        {/* Action Bar */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
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
            <TrialCreditsDisplay credits={trialCredits} />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={() => setIsQuickStartOpen(true)}
              className="flex-1 sm:flex-initial gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white border-0 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-300"
            >
              <Sparkles className="h-4 w-4" />
              Quick Start
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Services Section */}
          <div
            className={
              services.length === 0 ? "lg:col-span-2" : "lg:col-span-2"
            }
          >
            {services.length === 0 ? (
              <div className="flex items-center justify-center min-h-[400px] py-12">
                <div className="text-center space-y-6 p-12 rounded-2xl bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 max-w-md w-full">
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
                      onClick={() => setIsQuickStartOpen(true)}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Service
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          {/* Event Stream Section */}
          <div className="lg:col-span-1">
            <EventStream events={events} />
          </div>
        </div>
      </main>

      {/* Onboarding Modal */}
      <OnboardingModal
        open={isOnboardingOpen}
        onOpenChange={setIsOnboardingOpen}
        onGetStarted={() => {
          setIsOnboardingOpen(false);
          setIsQuickStartOpen(true);
        }}
      />

      {/* Quick Start Modal */}
      <QuickStartModal
        open={isQuickStartOpen}
        onOpenChange={setIsQuickStartOpen}
        onCreate={handleQuickStartCreate}
        isCreating={isCreatingService}
      />
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="text-slate-400">Loading...</div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
