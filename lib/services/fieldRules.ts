// Helper function to get field rules
export interface FieldRule {
  field: string;
  description: string;
  required: boolean;
  type?: string;
  examples?: string[];
}

export function getFieldRules(workflowNames: string[]): FieldRule[] {
  const rules: FieldRule[] = [
    {
      field: "recordId",
      description: "Optional unique identifier for tracking this request. If not provided, one will be generated.",
      required: false,
      type: "string",
      examples: ["rec-12345", "user-verification-001"],
    },
  ];

  workflowNames.forEach((workflow) => {
    if (workflow.includes("Email")) {
      rules.push({
        field: "email",
        description: "Email address to verify. Must be a valid email format.",
        required: true,
        type: "string",
        examples: ["user@example.com", "test@domain.co.uk"],
      });
    }
    if (workflow.includes("Phone")) {
      rules.push({
        field: "phone",
        description: "Phone number in E.164 format (e.g., +1234567890). Must include country code.",
        required: true,
        type: "string",
        examples: ["+1234567890", "+441234567890"],
      });
    }
    if (workflow.includes("ID Check") || workflow.includes("ID")) {
      rules.push({
        field: "idNumber",
        description: "ID number to verify. Format depends on idType.",
        required: true,
        type: "string",
        examples: ["A1234567", "123456789"],
      });
      rules.push({
        field: "idType",
        description: "Type of identification document.",
        required: true,
        type: "string",
        examples: ["passport", "drivers_license", "national_id"],
      });
    }
    if (workflow.includes("OCR")) {
      rules.push({
        field: "document",
        description: "Base64 encoded document image. Supported formats: JPEG, PNG, PDF.",
        required: true,
        type: "string (base64)",
        examples: ["data:image/jpeg;base64,/9j/4AAQ..."],
      });
      rules.push({
        field: "documentType",
        description: "Type of document being processed.",
        required: true,
        type: "string",
        examples: ["passport", "invoice", "receipt", "form"],
      });
    }
    if (workflow.includes("Payment")) {
      rules.push({
        field: "amount",
        description: "Payment amount in the smallest currency unit (e.g., cents for USD).",
        required: true,
        type: "number",
        examples: ["9999", "15000"],
      });
      rules.push({
        field: "currency",
        description: "ISO 4217 currency code.",
        required: true,
        type: "string",
        examples: ["USD", "EUR", "GBP"],
      });
      rules.push({
        field: "paymentMethod",
        description: "Identifier for the payment method to use.",
        required: true,
        type: "string",
        examples: ["card_1234", "bank_account_5678"],
      });
    }
    if (workflow.includes("Refund")) {
      rules.push({
        field: "refundId",
        description: "ID of the original payment to refund.",
        required: true,
        type: "string",
        examples: ["pay_123456", "ch_789012"],
      });
      rules.push({
        field: "refundAmount",
        description: "Amount to refund in smallest currency unit. If omitted, full refund is processed.",
        required: false,
        type: "number",
        examples: ["5000", "10000"],
      });
    }
    if (workflow.includes("Validation")) {
      rules.push({
        field: "data",
        description: "Data object to validate. Structure depends on validation rules.",
        required: true,
        type: "object",
        examples: ['{"field1": "value1", "field2": 123}'],
      });
    }
    if (workflow.includes("Storage")) {
      rules.push({
        field: "storageKey",
        description: "Optional custom key for storing results. If omitted, a key will be generated.",
        required: false,
        type: "string",
        examples: ["custom-key-123", "user-data-456"],
      });
    }
  });

  return rules;
}

