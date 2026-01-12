"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  X,
  FileText,
  Calendar,
} from "lucide-react";
import { mockServices } from "@/data/mockServices";
import { formatDate, formatFileSize } from "@/lib/utils/formatting";

type Report = {
  id: string;
  serviceId: string;
  serviceName: string;
  date: Date;
  filename: string;
  url: string;
  size: number;
};

type SortField = "date" | "filename" | "size" | "service";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 10;

// Mock reports data - in real app would fetch from API
const generateMockReports = (): Report[] => {
  const reports: Report[] = [];
  const now = Date.now();
  
  mockServices.forEach((service, serviceIdx) => {
    // Generate 2-5 reports per service
    const reportCount = 2 + (serviceIdx % 4);
    for (let i = 0; i < reportCount; i++) {
      const daysAgo = i * 2 + (serviceIdx % 3);
      const reportDate = new Date(now - daysAgo * 86400000);
      const dateStr = reportDate.toISOString().split('T')[0];
      
      reports.push({
        id: `rpt-${service.id}-${i}`,
        serviceId: service.id,
        serviceName: service.name,
        date: reportDate,
        filename: `report-${service.id}-${dateStr}.html`,
        url: `/reports/verification-report-${service.id}-${i}.html`,
        size: 150000 + Math.random() * 200000, // 150KB - 350KB
      });
    }
  });
  
  return reports;
};

const mockReports = generateMockReports();

export default function ReportsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedReports = useMemo(() => {
    let filtered = [...mockReports];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.filename.toLowerCase().includes(query) ||
          report.serviceName.toLowerCase().includes(query) ||
          report.serviceId.toLowerCase().includes(query)
      );
    }

    // Service filter
    if (selectedService !== "all") {
      filtered = filtered.filter((report) => report.serviceId === selectedService);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "date":
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case "filename":
          comparison = a.filename.localeCompare(b.filename);
          break;
        case "size":
          comparison = a.size - b.size;
          break;
        case "service":
          comparison = a.serviceName.localeCompare(b.serviceName);
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [searchQuery, selectedService, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedReports.length / ITEMS_PER_PAGE);
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedReports.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedReports, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleDownload = (report: Report) => {
    // Create a blob with mock report content
    const reportContent = `<!DOCTYPE html>
<html>
<head>
  <title>${report.filename}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #e2e8f0; }
    h1 { color: #22d3ee; }
    .info { background: #1e293b; padding: 15px; border-radius: 8px; margin: 10px 0; }
  </style>
</head>
<body>
  <h1>Service Report</h1>
  <div class="info">
    <p><strong>Service:</strong> ${report.serviceName}</p>
    <p><strong>Service ID:</strong> ${report.serviceId}</p>
    <p><strong>Date:</strong> ${formatDate(report.date)}</p>
    <p><strong>Filename:</strong> ${report.filename}</p>
    <p><strong>Size:</strong> ${formatFileSize(report.size)}</p>
  </div>
  <div class="info">
    <h2>Report Data</h2>
    <p>This is a sample report generated for ${report.serviceName}.</p>
    <p>Report ID: ${report.id}</p>
  </div>
</body>
</html>`;
    
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = report.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedService("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedService !== "all";

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
    >
      {children}
      {sortField === field && (
        <ArrowUpDown
          className={`h-3 w-3 ${sortDirection === "asc" ? "rotate-180" : ""}`}
        />
      )}
    </button>
  );

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
            Reports
          </h1>
          <p className="text-slate-400 text-lg">
            Download and manage all service reports
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-cyan-400" />
                <CardTitle className="text-lg text-slate-200">Filters & Search</CardTitle>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label className="text-slate-300">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Search by filename or service..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 bg-slate-900/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Service Filter */}
              <div className="space-y-2">
                <Label className="text-slate-300">Service</Label>
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
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {mockServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card className="rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-green-400" />
                <CardTitle className="text-2xl text-slate-200">Reports</CardTitle>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  {filteredAndSortedReports.length}
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
                      <SortButton field="date">
                        <span className="text-slate-300">Date</span>
                      </SortButton>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <SortButton field="service">
                        <span className="text-slate-300">Service</span>
                      </SortButton>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <SortButton field="filename">
                        <span className="text-slate-300">Filename</span>
                      </SortButton>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <SortButton field="size">
                        <span className="text-slate-300">Size</span>
                      </SortButton>
                    </th>
                    <th className="px-6 py-4 text-right text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-slate-400">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                          <p className="text-lg">No reports found</p>
                          {hasActiveFilters && (
                            <p className="text-sm mt-2">Try adjusting your filters</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedReports.map((report) => (
                      <tr
                        key={report.id}
                        className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <div className="text-sm text-slate-400">
                              {formatDate(report.date)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="text-sm text-cyan-400 cursor-pointer hover:text-cyan-300 transition-colors"
                            onClick={() => router.push(`/services/${report.serviceId}`)}
                          >
                            {report.serviceName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-slate-200 font-mono">
                              {report.filename}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-400">
                            {formatFileSize(report.size)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(report)}
                            className="border-slate-700/50 hover:border-green-500/50 hover:bg-green-500/10 text-slate-300"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedReports.length)} of{" "}
                  {filteredAndSortedReports.length} reports
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
    </>
  );
}
