import type { Service } from "@/types/service";

// Helper function to generate webhook payload
export function generateWebhookPayload(
  service: Service,
  webhookUrl: string
): Record<string, unknown> {
  const results: Record<string, unknown> = {};

  // Add workflow-specific results
  service.workflowNames.forEach((workflow) => {
    if (workflow.includes("Email")) {
      results.emailVerification = {
        verified: true,
        email: "user@example.com",
        confidence: 0.95,
      };
    }
    if (workflow.includes("Phone")) {
      results.phoneVerification = {
        verified: true,
        phone: "+1234567890",
        carrier: "Example Carrier",
      };
    }
    if (workflow.includes("ID Check") || workflow.includes("ID")) {
      results.idCheck = {
        verified: true,
        idType: "passport",
        confidence: 0.92,
      };
    }
    if (workflow.includes("OCR")) {
      results.ocr = {
        extracted: true,
        documentType: "invoice",
        fields: {
          total: "$99.99",
          date: "2024-03-15",
        },
      };
    }
    if (workflow.includes("Payment")) {
      results.payment = {
        processed: true,
        paymentId: "pay_123456",
        amount: 9999,
        currency: "USD",
      };
    }
  });

  const payload: Record<string, unknown> = {
    serviceId: service.id,
    serviceName: service.name,
    recordId: "rec-12345",
    requestId: "req-abc123",
    timestamp: new Date().toISOString(),
    status: "completed",
    workflows: service.workflowNames,
    results,
    tags: ["verified", "complete"],
    reasons: service.workflowNames.map((w) => `${w} completed successfully`),
  };

  return payload;
}

// Helper function to generate email payload
export function generateEmailPayload(
  service: Service,
  emailAddress: string
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    to: emailAddress,
    subject: `Service Report - ${service.name}`,
    body: {
      text: `Service ${service.id} has completed processing.\n\nWorkflows: ${service.workflowNames.join(", ")}\n\nAll workflows completed successfully.`,
      html: `<h1>Service Report</h1><p>Service <strong>${service.id}</strong> has completed processing.</p><p>Workflows: <strong>${service.workflowNames.join(", ")}</strong></p><p>All workflows completed successfully.</p>`,
    },
    attachments: [
      {
        filename: `report-${service.id}-${Date.now()}.html`,
        contentType: "text/html",
        content: "<html>...</html>",
        description: "HTML report with full service execution details",
      },
    ],
    metadata: {
      serviceId: service.id,
      serviceName: service.name,
      recordId: "rec-12345",
      timestamp: new Date().toISOString(),
    },
  };

  return payload;
}

