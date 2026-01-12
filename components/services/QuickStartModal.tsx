"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Zap,
  Sparkles,
  Mail,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { mockWorkflows } from "@/data/mockWorkflows";
import { formatCurrency } from "@/lib/utils/formatting";
import { calculateCostPerRun } from "@/lib/utils/costCalculation";

interface QuickStartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (
    serviceName: string,
    selectedWorkflows: string[],
    emailDestinations: Array<{ email: string; name: string }>
  ) => void;
  isCreating?: boolean;
}

const DEFAULT_WORKFLOWS = ["wf-001"]; // Email Verification as default

export function QuickStartModal({
  open,
  onOpenChange,
  onCreate,
  isCreating = false,
}: QuickStartModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceName, setServiceName] = useState("");
  const [selectedWorkflows, setSelectedWorkflows] =
    useState<string[]>(DEFAULT_WORKFLOWS);
  const [emailDestinations, setEmailDestinations] = useState<
    Array<{ email: string; name: string }>
  >([{ email: "", name: "" }]);

  const calculatedCost = calculateCostPerRun(selectedWorkflows.length);
  const workflowNames = mockWorkflows
    .filter((wf) => selectedWorkflows.includes(wf.id))
    .map((wf) => wf.name);

  const handleWorkflowToggle = (workflowId: string) => {
    setSelectedWorkflows((prev) =>
      prev.includes(workflowId)
        ? prev.filter((id) => id !== workflowId)
        : [...prev, workflowId]
    );
  };

  const handleCreate = () => {
    if (!serviceName.trim() || selectedWorkflows.length === 0) {
      return;
    }

    // Filter out empty emails and validate
    const validEmails = emailDestinations
      .filter((dest) => dest.email.trim())
      .map((dest) => ({
        email: dest.email.trim(),
        name: dest.name.trim() || "Email Destination",
      }));

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = validEmails.filter(
      (dest) => !emailRegex.test(dest.email)
    );
    if (invalidEmails.length > 0) {
      alert("Please enter valid email addresses");
      return;
    }

    onCreate(serviceName.trim(), selectedWorkflows, validEmails);
  };

  const handleClose = (open: boolean) => {
    if (!isCreating) {
      if (!open) {
        setServiceName("");
        setSelectedWorkflows(DEFAULT_WORKFLOWS);
        setEmailDestinations([{ email: "", name: "" }]);
        setCurrentStep(1);
      }
      onOpenChange(open);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !serviceName.trim()) {
      alert("Please enter a service name");
      return;
    }
    if (currentStep === 2 && selectedWorkflows.length === 0) {
      alert("Please select at least one workflow");
      return;
    }
    if (currentStep === 3) {
      // Validate emails before proceeding to review
      const validEmails = emailDestinations.filter((dest) => dest.email.trim());
      if (validEmails.length === 0) {
        alert("Please add at least one email destination");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = validEmails.filter(
        (dest) => !emailRegex.test(dest.email.trim())
      );
      if (invalidEmails.length > 0) {
        alert("Please enter valid email addresses");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleEmailChange = (
    index: number,
    field: "email" | "name",
    value: string
  ) => {
    setEmailDestinations((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddEmail = () => {
    setEmailDestinations((prev) => [...prev, { email: "", name: "" }]);
  };

  const handleRemoveEmail = (index: number) => {
    setEmailDestinations((prev) => prev.filter((_, i) => i !== index));
  };

  const isFormValid =
    serviceName.trim().length > 0 && selectedWorkflows.length > 0;

  // Step indicator
  const steps = [
    { number: 1, label: "Service Name" },
    { number: 2, label: "Workflows" },
    { number: 3, label: "Email Setup" },
    { number: 4, label: "Review" },
  ];

  return (
    <Dialog open={open} onOpenChange={(open) => handleClose(open)}>
      <DialogContent className="max-w-2xl bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-6 w-6 text-cyan-400" />
            <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Quick Start
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            Create your service step by step. You&apos;ll get a form to collect
            data and receive reports via email.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      currentStep > step.number
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                        : currentStep === step.number
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900"
                        : "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium mt-2 transition-colors ${
                      currentStep >= step.number
                        ? "text-cyan-400"
                        : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-px flex-1 mx-2 transition-all duration-300 ${
                      currentStep > step.number
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                        : "bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 py-4 min-h-[400px]">
          {/* Step 1: Service Name */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="service-name"
                  className="text-slate-300 text-lg"
                >
                  What would you like to name your service?
                </Label>
                <Input
                  id="service-name"
                  placeholder="My First Service"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100 text-lg py-6"
                  disabled={isCreating}
                  autoFocus
                />
                <p className="text-sm text-slate-500">
                  Choose a name to identify this service. You can change this
                  later.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Workflow Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <Label className="text-slate-300 text-lg">
                    Select Workflows
                  </Label>
                </div>
                <p className="text-sm text-slate-500">
                  Choose which workflows you want to include in this service.
                </p>
                <div className="space-y-2 max-h-80 overflow-y-auto rounded-lg bg-slate-800/30 border border-slate-700/50 p-4">
                  {mockWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="flex items-center space-x-3 p-3 rounded-md hover:bg-slate-700/30 transition-colors"
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
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-slate-400">
                        {selectedWorkflows.length} workflow(s) selected
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
                    <div className="flex flex-wrap gap-2">
                      {workflowNames.map((name) => (
                        <Badge
                          key={name}
                          className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30"
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Email Destinations */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-cyan-400" />
                  <Label className="text-slate-300 text-lg">
                    Email Destinations
                  </Label>
                </div>
                <p className="text-sm text-slate-500">
                  Where should we send your service reports? You can add
                  multiple email addresses.
                </p>
                <div className="space-y-2">
                  {emailDestinations.map((dest, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-start p-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
                    >
                      <div className="flex-1 space-y-2">
                        <Input
                          type="text"
                          placeholder="Name (optional)"
                          value={dest.name}
                          onChange={(e) =>
                            handleEmailChange(index, "name", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100 text-sm"
                          disabled={isCreating}
                        />
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          value={dest.email}
                          onChange={(e) =>
                            handleEmailChange(index, "email", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100 text-sm"
                          disabled={isCreating}
                          required
                        />
                      </div>
                      {emailDestinations.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEmail(index)}
                          disabled={isCreating}
                          className="mt-1 h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddEmail}
                    disabled={isCreating}
                    className="w-full border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Add Another Email
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Reports will be sent to all configured email addresses
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200">
                  Review Your Service
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <Label className="text-sm text-slate-400">
                      Service Name
                    </Label>
                    <p className="text-lg text-slate-200 mt-1">{serviceName}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <Label className="text-sm text-slate-400">Workflows</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {workflowNames.map((name) => (
                        <Badge
                          key={name}
                          className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30"
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <Label className="text-sm text-slate-400">
                      Email Destinations
                    </Label>
                    <div className="space-y-2 mt-2">
                      {emailDestinations
                        .filter((dest) => dest.email.trim())
                        .map((dest, index) => (
                          <div key={index} className="text-slate-200">
                            {dest.name ? (
                              <>
                                <span className="font-medium">{dest.name}</span>
                                <span className="text-slate-400 mx-2">•</span>
                              </>
                            ) : null}
                            <span className="text-slate-300">{dest.email}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          Estimated Cost per Run
                        </p>
                        <p className="text-2xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                          {formatCurrency(calculatedCost)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400 mb-1">Workflows</p>
                        <p className="text-lg font-semibold text-cyan-400">
                          {selectedWorkflows.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isCreating}
            className="border-slate-700/50 hover:border-slate-600 text-slate-300"
          >
            Cancel
          </Button>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isCreating}
              className="border-slate-700/50 hover:border-slate-600 text-slate-300"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={isCreating}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/25"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={!isFormValid || isCreating}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
            >
              {isCreating ? (
                <>Creating...</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Service
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
