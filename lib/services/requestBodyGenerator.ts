// Helper function to generate request body based on workflows
export function generateRequestBody(workflowNames: string[]): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  // Add optional recordId
  body.recordId = "rec-12345";

  workflowNames.forEach((workflow) => {
    if (workflow.includes("Email")) {
      body.email = "user@example.com";
    }
    if (workflow.includes("Phone")) {
      body.phone = "+1234567890";
    }
    if (workflow.includes("ID Check") || workflow.includes("ID")) {
      body.idNumber = "A1234567";
      body.idType = "passport";
    }
    if (workflow.includes("OCR")) {
      body.document = "data:image/jpeg;base64,/9j/4AAQSkZJRg...";
      body.documentType = "invoice";
    }
    if (workflow.includes("Payment")) {
      body.amount = 9999;
      body.currency = "USD";
      body.paymentMethod = "card_1234";
    }
    if (workflow.includes("Refund")) {
      body.refundId = "pay_123456";
      body.refundAmount = 5000;
    }
    if (workflow.includes("Validation")) {
      body.data = {
        field1: "value1",
        field2: 123,
        field3: true,
      };
    }
    if (workflow.includes("Storage")) {
      body.storageKey = "custom-key-123";
    }
  });

  return body;
}

