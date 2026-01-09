import type { Service } from "@/types/service";

// Mock data - Demo services showcasing all functionality
export const mockServices: Service[] = [
  {
    id: "svc-001",
    name: "🔍 Complete Verification Demo",
    workflowNames: ["Email Verification", "Phone Verification", "ID Check"],
    estimatedCostPerRun: 0.15,
    webhookConnections: [
      {
        id: "wh-001",
        url: "https://api.example.com/webhooks/verify",
        name: "Production Webhook",
        createdAt: "2024-01-15T10:30:00Z",
      },
    ],
    emailDestinations: [
      {
        id: "email-001",
        email: "admin@example.com",
        name: "Admin Notifications",
        createdAt: "2024-01-15T10:30:00Z",
      },
    ],
    tokenConnections: [
      {
        id: "tok-001",
        name: "API Token",
        tokenPrefix: "sk_live_",
        createdAt: "2024-01-15T10:30:00Z",
      },
    ],
  },
  {
    id: "svc-002",
    name: "📧 Email Destination Demo",
    workflowNames: ["Email Verification", "Validation"],
    estimatedCostPerRun: 0.1,
    webhookConnections: [],
    emailDestinations: [
      {
        id: "email-002",
        email: "notifications@example.com",
        name: "Primary Email",
        createdAt: "2024-01-16T09:00:00Z",
      },
      {
        id: "email-003",
        email: "backup@example.com",
        name: "Backup Email",
        createdAt: "2024-01-16T09:05:00Z",
      },
    ],
    tokenConnections: [],
  },
  {
    id: "svc-003",
    name: "🔗 Multiple Webhooks Demo",
    workflowNames: ["Payment Processing", "Refund Handling"],
    estimatedCostPerRun: 0.1,
    webhookConnections: [
      {
        id: "wh-002",
        url: "https://api.example.com/webhooks/payments",
        name: "Payment Webhook",
        createdAt: "2024-01-20T14:20:00Z",
      },
      {
        id: "wh-003",
        url: "https://api.example.com/webhooks/backup",
        name: "Backup Webhook",
        createdAt: "2024-01-25T09:00:00Z",
      },
    ],
    tokenConnections: [],
  },
  {
    id: "svc-004",
    name: "🔐 OAuth Webhook Demo",
    workflowNames: ["OCR", "Validation", "Storage"],
    estimatedCostPerRun: 0.15,
    webhookConnections: [
      {
        id: "wh-005",
        url: "https://api.example.com/webhooks/secure",
        name: "OAuth Secured Webhook",
        createdAt: "2024-02-01T09:15:00Z",
        tokenService: {
          type: "oauth",
          oauthConfig: {
            clientId: "oauth_client_12345",
            clientSecret: "secret_***",
            tokenUrl: "https://auth.example.com/oauth/token",
            scope: "read write",
          },
        },
      },
    ],
    tokenConnections: [
      {
        id: "tok-002",
        name: "Document Token",
        tokenPrefix: "doc_live_",
        createdAt: "2024-02-01T09:15:00Z",
      },
    ],
  },
  {
    id: "svc-005",
    name: "⚙️ Custom Token Service Demo",
    workflowNames: ["Email Verification", "Phone Verification"],
    estimatedCostPerRun: 0.1,
    webhookConnections: [
      {
        id: "wh-006",
        url: "https://api.example.com/webhooks/custom-auth",
        name: "Custom Auth Webhook",
        createdAt: "2024-02-10T11:30:00Z",
        tokenService: {
          type: "custom",
          customConfig: {
            clientId: "custom_client_789",
            tokenServiceUrl: "https://token.example.com/api/token",
            headerName: "X-Client-Id",
          },
        },
      },
    ],
    tokenConnections: [],
  },
  {
    id: "svc-006",
    name: "📄 Report Generation Demo",
    workflowNames: ["OCR", "Validation"],
    estimatedCostPerRun: 0.1,
    webhookConnections: [],
    emailDestinations: [
      {
        id: "email-004",
        email: "reports@example.com",
        name: "Report Recipient",
        createdAt: "2024-02-12T10:00:00Z",
      },
    ],
    tokenConnections: [],
  },
  {
    id: "svc-007",
    name: "⚠️ Error Handling Demo",
    workflowNames: ["Email Verification", "Phone Verification"],
    estimatedCostPerRun: 0.1,
    webhookConnections: [
      {
        id: "wh-007",
        url: "https://api.example.com/webhooks/errors",
        name: "Error Webhook",
        createdAt: "2024-02-10T11:30:00Z",
      },
    ],
    tokenConnections: [],
  },
  {
    id: "svc-008",
    name: "🔑 Multiple Tokens Demo",
    workflowNames: ["Payment Processing"],
    estimatedCostPerRun: 0.05,
    webhookConnections: [],
    tokenConnections: [
      {
        id: "tok-003",
        name: "Payment Token",
        tokenPrefix: "pk_live_",
        createdAt: "2024-02-15T14:00:00Z",
      },
      {
        id: "tok-004",
        name: "Admin Token",
        tokenPrefix: "admin_",
        createdAt: "2024-02-15T14:05:00Z",
      },
    ],
  },
];

