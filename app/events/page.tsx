"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Search,
  Download,
  Code,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  X,
  Clock,
  Network,
  FileCode,
  XCircle,
} from "lucide-react";
import type { ServiceEvent } from "@/types/service";
import { mockEvents } from "@/data/mockEvents";
import { mockServices } from "@/data/mockServices";
import { StatusIcon } from "@/components/services/StatusIcon";
import { CopyButton } from "@/components/services/CopyButton";
import { formatDate, formatFileSize } from "@/lib/utils/formatting";
import { getTypeBadgeVariant } from "@/lib/utils/eventHelpers";

type SortField = "timestamp" | "type" | "status" | "service";
type SortDirection = "asc" | "desc";
type EventType = "success" | "error" | "destination" | "report" | "all";
type EventStatus = "completed" | "failed" | "pending" | "all";

const ITEMS_PER_PAGE = 10;

export default function EventsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [selectedEventType, setSelectedEventType] = useState<EventType>("all");
  const [selectedStatus, setSelectedStatus] = useState<EventStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<ServiceEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...mockEvents];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.recordId?.toLowerCase().includes(query) ||
          event.requestId?.toLowerCase().includes(query) ||
          event.id.toLowerCase().includes(query)
      );
    }

    // Service filter
    if (selectedService !== "all") {
      filtered = filtered.filter((event) => event.serviceId === selectedService);
    }

    // Event type filter
    if (selectedEventType !== "all") {
      filtered = filtered.filter((event) => event.type === selectedEventType);
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((event) => event.status === selectedStatus);
    }

    // Sort
    filtered.sort((a, b) => {
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
        case "service":
          const serviceA = mockServices.find((s) => s.id === a.serviceId);
          const serviceB = mockServices.find((s) => s.id === b.serviceId);
          aValue = serviceA?.name || a.serviceId;
          bValue = serviceB?.name || b.serviceId;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    searchQuery,
    selectedService,
    selectedEventType,
    selectedStatus,
    sortField,
    sortDirection,
  ]);

  const totalPages = Math.ceil(filteredAndSortedEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedEvents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedEvents, currentPage]);

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
      const link = document.createElement("a");
      link.href = event.reportDocument.url;
      link.download = event.reportDocument.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedService("all");
    setSelectedEventType("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedService !== "all" ||
    selectedEventType !== "all" ||
    selectedStatus !== "all";

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Event Logs
          </h1>
          <p className="text-slate-400 text-lg">
            Monitor and analyze all service events across your network
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-cyan-400" />
                <CardTitle className="text-lg text-slate-200">Filters</CardTitle>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-slate-700/50 hover:border-red-500/50 hover:bg-red-500/10 text-slate-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search by ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 bg-slate-900/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50"
                />
              </div>
              <Select
                value={selectedService}
                onValueChange={(value) => {
                  setSelectedService(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Services</SelectItem>
                  {mockServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedEventType}
                onValueChange={(value) => {
                  setSelectedEventType(value as EventType);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="destination">Destination</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value as EventStatus);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events Table */}
        <Card className="rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-cyan-400" />
                <CardTitle className="text-2xl text-slate-200">Events</CardTitle>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  {filteredAndSortedEvents.length}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="px-6 py-4 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("timestamp")}
                        className="h-8 -ml-3 text-slate-300 hover:text-cyan-400"
                      >
                        Timestamp
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("service")}
                        className="h-8 -ml-3 text-slate-300 hover:text-cyan-400"
                      >
                        Service
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("type")}
                        className="h-8 -ml-3 text-slate-300 hover:text-cyan-400"
                      >
                        Type
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </th>
                    <th className="px-6 py-4 text-left text-slate-300">Record ID</th>
                    <th className="px-6 py-4 text-left text-slate-300">Request ID</th>
                    <th className="px-6 py-4 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("status")}
                        className="h-8 -ml-3 text-slate-300 hover:text-cyan-400"
                      >
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </th>
                    <th className="px-6 py-4 text-right text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="text-slate-400">
                          <Clock className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                          <p className="text-lg">No events found</p>
                          {hasActiveFilters && (
                            <p className="text-sm mt-2">Try adjusting your filters</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedEvents.map((event) => {
                      const service = mockServices.find((s) => s.id === event.serviceId);
                      return (
                        <tr
                          key={event.id}
                          className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-400 font-mono">
                              {formatDate(event.timestamp)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className="text-sm text-cyan-400 cursor-pointer hover:text-cyan-300 transition-colors"
                              onClick={() => router.push(`/services/${event.serviceId}`)}
                            >
                              {service?.name || event.serviceId}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={getTypeBadgeVariant(event.type)}>
                              {event.type}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-mono text-cyan-400">
                              {event.recordId || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-mono text-purple-400">
                              {event.requestId || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <StatusIcon status={event.status} />
                              <span className="text-sm capitalize text-slate-300">
                                {event.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
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
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedEvents.length)} of{" "}
                  {filteredAndSortedEvents.length} events
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, idx, arr) => (
                        <div key={page} className="flex items-center gap-1">
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="text-slate-500 px-2">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={
                              currentPage === page
                                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0"
                                : "border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300"
                            }
                          >
                            {page}
                          </Button>
                        </div>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Event Details Modal - Reuse from service details */}
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
                  <div className="mt-2">
                    <Badge variant={getTypeBadgeVariant(selectedEvent.type)}>
                      {selectedEvent.type}
                    </Badge>
                  </div>
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
                <div>
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">
                    Service
                  </Label>
                  <p
                    className="mt-2 text-sm text-cyan-400 cursor-pointer hover:text-cyan-300 transition-colors"
                    onClick={() => {
                      setIsEventModalOpen(false);
                      router.push(`/services/${selectedEvent.serviceId}`);
                    }}
                  >
                    {mockServices.find((s) => s.id === selectedEvent.serviceId)?.name ||
                      selectedEvent.serviceId}
                  </p>
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
    </>
  );
}

