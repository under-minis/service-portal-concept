export interface Service {
  id: string;
  name: string;
  workflowNames: string[];
  estimatedCostPerRun: number;
  webhookConnections?: WebhookConnection[];
  emailDestinations?: EmailDestination[];
  tokenConnections?: TokenConnection[];
}

export interface WebhookConnection {
  id: string;
  url: string;
  name: string;
  createdAt: string;
  tokenService?: TokenServiceConnection;
}

export interface TokenServiceConnection {
  type: "oauth" | "custom";
  // OAuth configuration
  oauthConfig?: {
    clientId: string;
    clientSecret: string;
    tokenUrl: string;
    scope?: string;
  };
  // Custom token service configuration
  customConfig?: {
    clientId: string;
    tokenServiceUrl: string;
    headerName: string;
  };
}

export interface EmailDestination {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface TokenConnection {
  id: string;
  name: string;
  tokenPrefix: string;
  createdAt: string;
}

export interface Workflow {
  id: string;
  name: string;
}

export type EventType = "success" | "error" | "destination" | "report";

export interface ServiceEvent {
  id: string;
  serviceId: string;
  recordId?: string;
  requestId?: string;
  type: EventType;
  timestamp: string;
  status: "completed" | "failed" | "pending";
  errorDetails?: {
    message: string;
    code?: string;
    stack?: string;
  };
  destinationDetails?: {
    type: "webhook" | "email";
    destination: string;
    payload: Record<string, unknown>;
    response?: {
      status: number;
      statusText: string;
      body?: string;
      headers?: Record<string, string>;
    };
  };
  reportDocument?: {
    filename: string;
    contentType: string;
    size: number;
    url: string;
  };
}
