import type { Service } from "@/types/service";
import { generateRequestBody } from "@/lib/services/requestBodyGenerator";
import { generateWebhookPayload, generateEmailPayload } from "@/lib/services/payloadGenerator";
import { getFieldRules } from "@/lib/services/fieldRules";
import { formatCurrency } from "@/lib/utils/formatting";

export interface PreviewPacket {
  html: string;
  requestBodyJson: string;
  webhookPayloadJson: string;
  emailPayloadJson: string;
}

export function generatePreviewPacket(
  service: Service,
  emailAddress: string,
  webhookUrl?: string
): PreviewPacket {
  const requestBody = generateRequestBody(service.workflowNames);
  const webhookPayload = webhookUrl
    ? generateWebhookPayload(service, webhookUrl)
    : generateWebhookPayload(service, "https://api.example.com/webhook");
  const emailPayload = generateEmailPayload(service, emailAddress);
  const fieldRules = getFieldRules(service.workflowNames);

  const html = generateHTMLReport(service, requestBody, webhookPayload, emailPayload, fieldRules);

  return {
    html,
    requestBodyJson: JSON.stringify(requestBody, null, 2),
    webhookPayloadJson: JSON.stringify(webhookPayload, null, 2),
    emailPayloadJson: JSON.stringify(emailPayload, null, 2),
  };
}

function generateHTMLReport(
  service: Service,
  requestBody: Record<string, unknown>,
  webhookPayload: Record<string, unknown>,
  emailPayload: Record<string, unknown>,
  fieldRules: Array<{ field: string; description: string; required: boolean; type?: string; examples?: string[] }>
): string {
  const apiEndpoint = `https://api.example.com/v1/services/${service.id}/process`;
  const timestamp = new Date().toISOString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Setup Guide - ${service.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: #f8fafc;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .header p {
      opacity: 0.9;
      font-size: 1.1em;
    }
    .content {
      padding: 40px;
    }
    section {
      margin-bottom: 40px;
    }
    h2 {
      color: #0f172a;
      font-size: 1.8em;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    h3 {
      color: #1e293b;
      font-size: 1.3em;
      margin-top: 25px;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 25px;
    }
    .info-item {
      padding: 15px;
      background: #f1f5f9;
      border-radius: 8px;
      border-left: 4px solid #06b6d4;
    }
    .info-item strong {
      display: block;
      color: #0f172a;
      margin-bottom: 5px;
    }
    .info-item code {
      color: #3b82f6;
      font-size: 0.9em;
    }
    code {
      background: #1e293b;
      color: #06b6d4;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
    }
    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 15px 0;
      font-size: 0.9em;
      line-height: 1.5;
    }
    pre code {
      background: none;
      color: inherit;
      padding: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background: #f1f5f9;
      font-weight: 600;
      color: #0f172a;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: 600;
      margin-left: 8px;
    }
    .badge-required {
      background: #fee2e2;
      color: #991b1b;
    }
    .badge-optional {
      background: #dbeafe;
      color: #1e40af;
    }
    .badge-type {
      background: #e0e7ff;
      color: #3730a3;
    }
    ol {
      margin-left: 20px;
      margin-top: 15px;
    }
    ol li {
      margin-bottom: 10px;
      color: #475569;
    }
    .highlight {
      background: #fef3c7;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
      margin: 20px 0;
    }
    .footer {
      background: #f1f5f9;
      padding: 30px 40px;
      text-align: center;
      color: #64748b;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Service Setup Guide</h1>
      <p>Complete integration documentation for ${service.name}</p>
    </div>

    <div class="content">
      <section>
        <h2>Service Overview</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Service ID</strong>
            <code>${service.id}</code>
          </div>
          <div class="info-item">
            <strong>Service Name</strong>
            ${service.name}
          </div>
          <div class="info-item">
            <strong>Cost per Run</strong>
            ${formatCurrency(service.estimatedCostPerRun)}
          </div>
          <div class="info-item">
            <strong>Generated</strong>
            ${new Date(timestamp).toLocaleString()}
          </div>
        </div>

        <h3>Active Workflows</h3>
        <ul style="list-style: none; padding: 0;">
          ${service.workflowNames.map(wf => `<li style="padding: 8px 0; color: #475569;">• ${wf}</li>`).join('')}
        </ul>
      </section>

      <section>
        <h2>API Integration</h2>
        
        <h3>Endpoint</h3>
        <pre><code>POST ${apiEndpoint}</code></pre>

        <h3>Request Body</h3>
        <p style="color: #64748b; margin-bottom: 10px;">Send this JSON payload to process a request:</p>
        <pre><code>${JSON.stringify(requestBody, null, 2)}</code></pre>

        <h3>Field Rules</h3>
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Required</th>
              <th>Description</th>
              <th>Examples</th>
            </tr>
          </thead>
          <tbody>
            ${fieldRules.map(rule => `
              <tr>
                <td><code>${rule.field}</code></td>
                <td>${rule.type || 'N/A'}</td>
                <td>
                  ${rule.required 
                    ? '<span class="badge badge-required">Required</span>' 
                    : '<span class="badge badge-optional">Optional</span>'}
                </td>
                <td>${rule.description}</td>
                <td>
                  ${rule.examples && rule.examples.length > 0
                    ? rule.examples.map(ex => `<code style="display: block; margin: 2px 0;">${ex}</code>`).join('')
                    : 'N/A'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Webhook Payloads</h2>
        <p style="color: #64748b; margin-bottom: 15px;">
          When your workflows complete, webhook destinations will receive this payload:
        </p>
        <pre><code>${JSON.stringify(webhookPayload, null, 2)}</code></pre>
      </section>

      <section>
        <h2>Email Payloads</h2>
        <p style="color: #64748b; margin-bottom: 15px;">
          Email destinations will receive this payload structure:
        </p>
        <pre><code>${JSON.stringify(emailPayload, null, 2)}</code></pre>
      </section>

      <section>
        <h2>Next Steps</h2>
        <div class="highlight">
          <strong style="color: #0f172a; display: block; margin-bottom: 10px;">Ready to integrate?</strong>
          <ol>
            <li>Review the field rules and examples above</li>
            <li>Test your service using the test runner in the portal</li>
            <li>Set up production webhooks in the service configuration</li>
            <li>Integrate the API endpoint into your application</li>
            <li>Monitor results in the Events page</li>
          </ol>
        </div>
      </section>

      <section>
        <h2>Trial Credits</h2>
        <p style="color: #64748b;">
          You have <strong style="color: #0f172a;">$50 in free trial credits</strong> to test your service. 
          This covers approximately <strong style="color: #0f172a;">500 test runs</strong> at the current rate.
        </p>
      </section>
    </div>

    <div class="footer">
      <p>This guide was generated automatically for ${service.name}</p>
      <p style="margin-top: 5px;">For support, visit the Service Network portal</p>
    </div>
  </div>
</body>
</html>`;
}

