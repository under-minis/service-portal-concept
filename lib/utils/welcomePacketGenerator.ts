import type { Service } from "@/types/service";
import { generateRequestBody } from "@/lib/services/requestBodyGenerator";
import { generateWebhookPayload, generateEmailPayload } from "@/lib/services/payloadGenerator";
import { getFieldRules } from "@/lib/services/fieldRules";
import { formatCurrency } from "@/lib/utils/formatting";

export interface WelcomePacket {
  // Developer files
  developerGuideHtml: string;
  requestBodyJson: string;
  webhookPayloadJson: string;
  emailPayloadJson: string;
  successExampleJson: string;
  failureExampleJson: string;
  
  // Ops team files
  opsWelcomeGuideHtml: string;
  quickStartChecklistHtml: string;
}

export function generateWelcomePacket(
  service: Service,
  emailAddress: string,
  webhookUrl?: string
): WelcomePacket {
  const requestBody = generateRequestBody(service.workflowNames);
  const webhookPayload = webhookUrl
    ? generateWebhookPayload(service, webhookUrl)
    : generateWebhookPayload(service, "https://api.example.com/webhook");
  const emailPayload = generateEmailPayload(service, emailAddress);
  const fieldRules = getFieldRules(service.workflowNames);

  const developerGuideHtml = generateDeveloperGuide(
    service,
    requestBody,
    webhookPayload,
    emailPayload,
    fieldRules
  );
  
  const opsWelcomeGuideHtml = generateOpsWelcomeGuide(service);
  const quickStartChecklistHtml = generateQuickStartChecklist(service);
  const successExample = generateSuccessExample(service, requestBody, webhookPayload, emailPayload);
  const failureExample = generateFailureExample(service, requestBody, webhookPayload, emailPayload);

  return {
    developerGuideHtml,
    requestBodyJson: JSON.stringify(requestBody, null, 2),
    webhookPayloadJson: JSON.stringify(webhookPayload, null, 2),
    emailPayloadJson: JSON.stringify(emailPayload, null, 2),
    successExampleJson: JSON.stringify(successExample, null, 2),
    failureExampleJson: JSON.stringify(failureExample, null, 2),
    opsWelcomeGuideHtml,
    quickStartChecklistHtml,
  };
}

function generateDeveloperGuide(
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
  <title>Developer Guide - ${service.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
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
    .header h1 { font-size: 2.5em; margin-bottom: 10px; }
    .header p { opacity: 0.9; font-size: 1.1em; }
    .content { padding: 40px; }
    section { margin-bottom: 40px; }
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
    .badge-success {
      background: #d1fae5;
      color: #065f46;
    }
    .badge-error {
      background: #fee2e2;
      color: #991b1b;
    }
    ol { margin-left: 20px; margin-top: 15px; }
    ol li { margin-bottom: 10px; color: #475569; }
    .highlight {
      background: #fef3c7;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
      margin: 20px 0;
    }
    .success-box {
      background: #d1fae5;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #10b981;
      margin: 20px 0;
    }
    .error-box {
      background: #fee2e2;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #ef4444;
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
      <h1>Developer Guide</h1>
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
        <h2>Success & Failure Examples</h2>
        
        <div class="success-box">
          <h3 style="color: #065f46; margin-top: 0;">✓ Success Response</h3>
          <p style="color: #047857; margin-bottom: 10px;">
            <strong>What it means:</strong> All workflows completed successfully. Your data was verified and processed correctly.
          </p>
          <p style="color: #047857; margin-bottom: 10px;">
            <strong>What to expect:</strong> You'll receive webhook/email notifications with complete results. All verification steps passed.
          </p>
          <p style="color: #047857; margin: 0;">
            <strong>Next steps:</strong> Process the successful response in your application. The data is ready to use.
          </p>
        </div>

        <div class="error-box">
          <h3 style="color: #991b1b; margin-top: 0;">✗ Failure Response</h3>
          <p style="color: #7f1d1d; margin-bottom: 10px;">
            <strong>What it means:</strong> One or more workflows failed. This could be due to invalid data, API errors, or validation failures.
          </p>
          <p style="color: #7f1d1d; margin-bottom: 10px;">
            <strong>Common causes:</strong> Invalid email format, missing required fields, phone number without country code, or service configuration issues.
          </p>
          <p style="color: #7f1d1d; margin-bottom: 10px;">
            <strong>What to do:</strong> Review the error details in the response. Fix the data issues and retry. Check the error code for specific guidance.
          </p>
          <p style="color: #7f1d1d; margin: 0;">
            <strong>When to retry:</strong> If it's a data validation error, fix and retry immediately. If it's a service error, wait a moment and retry. Check service status if failures persist.
          </p>
        </div>

        <p style="color: #64748b; margin-top: 20px;">
          See <code>success-example.json</code> and <code>failure-example.json</code> files for complete examples with request/response payloads.
        </p>
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

function generateOpsWelcomeGuide(service: Service): string {
  const timestamp = new Date().toISOString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome Guide - ${service.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: #f8fafc;
      padding: 20px;
    }
    .container {
      max-width: 800px;
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
    .header h1 { font-size: 2.5em; margin-bottom: 10px; }
    .header p { opacity: 0.9; font-size: 1.1em; }
    .content { padding: 40px; }
    section { margin-bottom: 30px; }
    h2 {
      color: #0f172a;
      font-size: 1.8em;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    h3 {
      color: #1e293b;
      font-size: 1.3em;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .info-box {
      background: #f1f5f9;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #06b6d4;
      margin: 15px 0;
    }
    .success-box {
      background: #d1fae5;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #10b981;
      margin: 15px 0;
    }
    .error-box {
      background: #fee2e2;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #ef4444;
      margin: 15px 0;
    }
    ul { margin-left: 20px; margin-top: 10px; }
    ul li { margin-bottom: 8px; color: #475569; }
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
      <h1>Welcome to Service Network</h1>
      <p>Your service "${service.name}" is ready to use!</p>
    </div>

    <div class="content">
      <section>
        <h2>What This Service Does</h2>
        <div class="info-box">
          <p style="color: #475569; margin-bottom: 10px;">
            Your service <strong>${service.name}</strong> (ID: <code>${service.id}</code>) automatically verifies and processes data using these workflows:
          </p>
          <ul>
            ${service.workflowNames.map(wf => `<li>${wf}</li>`).join('')}
          </ul>
        </div>
        <p style="color: #64748b;">
          Think of it as an automated assistant that checks and validates information for you, then sends you the results.
        </p>
      </section>

      <section>
        <h2>How to Test Your Service</h2>
        <div class="highlight">
          <ol style="margin-left: 20px;">
            <li style="margin-bottom: 10px;"><strong>Go to the Service Network portal</strong> - You're already there!</li>
            <li style="margin-bottom: 10px;"><strong>Click on your service</strong> - Find "${service.name}" in the services list</li>
            <li style="margin-bottom: 10px;"><strong>Use the Test Runner</strong> - Click "Run Your First Test" to try it out</li>
            <li style="margin-bottom: 10px;"><strong>Review the results</strong> - See what happens when your service processes data</li>
          </ol>
        </div>
      </section>

      <section>
        <h2>Understanding Results</h2>
        
        <div class="success-box">
          <h3 style="color: #065f46; margin-top: 0;">✓ Success</h3>
          <p style="color: #047857; margin-bottom: 10px;">
            <strong>What it means:</strong> Everything worked perfectly! Your data was verified and processed successfully.
          </p>
          <p style="color: #047857; margin: 0;">
            <strong>What to do:</strong> Great! Your service is working. You can now use it in your applications or share it with your development team.
          </p>
        </div>

        <div class="error-box">
          <h3 style="color: #991b1b; margin-top: 0;">✗ Failure</h3>
          <p style="color: #7f1d1d; margin-bottom: 10px;">
            <strong>What it means:</strong> Something went wrong. This usually means the test data wasn't in the right format.
          </p>
          <p style="color: #7f1d1d; margin-bottom: 10px;">
            <strong>Common reasons:</strong> Email address format is wrong, phone number is missing country code, or required information is missing.
          </p>
          <p style="color: #7f1d1d; margin: 0;">
            <strong>What to do:</strong> Try the test again with different data, or contact your development team for help. Don't worry - this is normal during testing!
          </p>
        </div>
      </section>

      <section>
        <h2>Next Steps</h2>
        <ul>
          <li><strong>Test your service</strong> - Use the test runner to see it in action</li>
          <li><strong>Review the developer guide</strong> - Share the developer files with your technical team</li>
          <li><strong>Set up production use</strong> - Work with your developers to integrate this into your applications</li>
          <li><strong>Monitor usage</strong> - Check the portal to see how your service is being used</li>
        </ul>
      </section>

      <section>
        <h2>Getting Help</h2>
        <div class="info-box">
          <p style="color: #475569; margin-bottom: 10px;">
            <strong>For technical questions:</strong> Share the developer guide files with your development team. They contain all the technical details needed for integration.
          </p>
          <p style="color: #475569; margin: 0;">
            <strong>For general questions:</strong> Visit the Service Network portal or contact your account representative.
          </p>
        </div>
      </section>

      <section>
        <h2>Trial Credits</h2>
        <p style="color: #64748b;">
          You have <strong style="color: #0f172a;">$50 in free trial credits</strong> to test your service. 
          This covers approximately <strong style="color: #0f172a;">500 test runs</strong> - plenty to explore and test!
        </p>
      </section>
    </div>

    <div class="footer">
      <p>Welcome packet generated on ${new Date(timestamp).toLocaleString()}</p>
      <p style="margin-top: 5px;">Service Network - Making verification easy</p>
    </div>
  </div>
</body>
</html>`;
}

function generateQuickStartChecklist(service: Service): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quick Start Checklist - ${service.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: #f8fafc;
      padding: 20px;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 { font-size: 2em; margin-bottom: 5px; }
    .content { padding: 30px; }
    .checklist-item {
      display: flex;
      align-items: flex-start;
      padding: 15px;
      margin: 10px 0;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #06b6d4;
    }
    .checklist-item.completed {
      background: #d1fae5;
      border-left-color: #10b981;
    }
    .checklist-item.pending {
      background: #fef3c7;
      border-left-color: #f59e0b;
    }
    .checkbox {
      width: 24px;
      height: 24px;
      margin-right: 15px;
      margin-top: 2px;
      border: 2px solid #64748b;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .checklist-item.completed .checkbox {
      background: #10b981;
      border-color: #10b981;
      position: relative;
    }
    .checklist-item.completed .checkbox::after {
      content: '✓';
      color: white;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-weight: bold;
    }
    .checklist-content {
      flex: 1;
    }
    .checklist-content h3 {
      color: #0f172a;
      font-size: 1.1em;
      margin-bottom: 5px;
    }
    .checklist-content p {
      color: #64748b;
      font-size: 0.9em;
    }
    .footer {
      background: #f1f5f9;
      padding: 20px 30px;
      text-align: center;
      color: #64748b;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Quick Start Checklist</h1>
      <p>${service.name}</p>
    </div>

    <div class="content">
      <div class="checklist-item completed">
        <div class="checkbox"></div>
        <div class="checklist-content">
          <h3>Service Created</h3>
          <p>Your service "${service.name}" has been successfully created and configured.</p>
        </div>
      </div>

      <div class="checklist-item completed">
        <div class="checkbox"></div>
        <div class="checklist-content">
          <h3>Welcome Packet Received</h3>
          <p>You've received this welcome packet with all the information you need to get started.</p>
        </div>
      </div>

      <div class="checklist-item pending">
        <div class="checkbox"></div>
        <div class="checklist-content">
          <h3>First Test Run Completed</h3>
          <p>Use the test runner in the portal to execute your first test and see the service in action.</p>
        </div>
      </div>

      <div class="checklist-item pending">
        <div class="checkbox"></div>
        <div class="checklist-content">
          <h3>Results Reviewed</h3>
          <p>Review the test results to understand what success and failure look like for your service.</p>
        </div>
      </div>

      <div class="checklist-item pending">
        <div class="checkbox"></div>
        <div class="checklist-content">
          <h3>Developer Guide Shared</h3>
          <p>Share the developer guide files with your technical team for integration into your applications.</p>
        </div>
      </div>

      <div class="checklist-item pending">
        <div class="checkbox"></div>
        <div class="checklist-content">
          <h3>Production Setup</h3>
          <p>Work with your development team to set up production webhooks and integrate the service into your systems.</p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Print this page and check off items as you complete them!</p>
    </div>
  </div>
</body>
</html>`;
}

function generateSuccessExample(
  service: Service,
  requestBody: Record<string, unknown>,
  webhookPayload: Record<string, unknown>,
  emailPayload: Record<string, unknown>
): Record<string, unknown> {
  return {
    description: "Complete success scenario - all workflows completed successfully",
    request: {
      ...requestBody,
      recordId: "rec-success-12345",
    },
    response: {
      status: "completed",
      serviceId: service.id,
      serviceName: service.name,
      requestId: "req-success-abc123",
      recordId: "rec-success-12345",
      timestamp: new Date().toISOString(),
      workflows: service.workflowNames,
      results: {
        emailVerification: {
          verified: true,
          email: requestBody.email || "user@example.com",
          confidence: 0.95,
          status: "valid",
        },
        phoneVerification: {
          verified: true,
          phone: requestBody.phone || "+1234567890",
          carrier: "Example Carrier",
          status: "valid",
        },
      },
      tags: ["verified", "complete", "success"],
      reasons: service.workflowNames.map((w) => `${w} completed successfully`),
    },
    webhookPayload: {
      ...webhookPayload,
      status: "completed",
      recordId: "rec-success-12345",
      requestId: "req-success-abc123",
    },
    emailPayload: {
      ...emailPayload,
      metadata: {
        ...emailPayload.metadata,
        status: "completed",
        recordId: "rec-success-12345",
      },
    },
    whatThisMeans: {
      summary: "All workflows completed successfully. Your data was verified and processed correctly.",
      whatToExpect: "You'll receive webhook/email notifications with complete results. All verification steps passed.",
      nextSteps: "Process the successful response in your application. The data is ready to use.",
    },
  };
}

function generateFailureExample(
  service: Service,
  requestBody: Record<string, unknown>,
  webhookPayload: Record<string, unknown>,
  emailPayload: Record<string, unknown>
): Record<string, unknown> {
  // Create invalid request data
  const invalidRequestBody: Record<string, unknown> = {
    email: "invalid-email-format", // Invalid email
    phone: "123", // Missing country code
    recordId: "rec-failure-12345",
  };

  // Add other fields that might be in the original request
  Object.keys(requestBody).forEach((key) => {
    if (key !== "email" && key !== "phone" && key !== "recordId") {
      invalidRequestBody[key] = requestBody[key];
    }
  });

  const errorDetails: Record<string, unknown> = {
    code: "VALIDATION_ERROR",
    message: "Invalid email format and phone number format",
    details: {
      email: "Must be a valid email address (e.g., user@example.com)",
      phone: "Must be in E.164 format with country code (e.g., +1234567890)",
    },
  };

  return {
    description: "Failure scenario - validation errors due to invalid input data",
    request: invalidRequestBody,
    response: {
      status: "failed",
      serviceId: service.id,
      serviceName: service.name,
      requestId: "req-failure-abc123",
      recordId: "rec-failure-12345",
      timestamp: new Date().toISOString(),
      workflows: service.workflowNames,
      error: errorDetails,
      results: null,
    },
    webhookPayload: {
      ...webhookPayload,
      status: "failed",
      recordId: "rec-failure-12345",
      requestId: "req-failure-abc123",
      error: errorDetails,
      results: null,
    },
    emailPayload: {
      ...emailPayload,
      subject: `Service Error - ${service.name}`,
      body: {
        text: `Service ${service.id} encountered an error during processing.\n\nError: ${errorDetails.message}\n\nDetails: ${JSON.stringify(errorDetails.details, null, 2)}`,
        html: `<h1>Service Error</h1><p>Service <strong>${service.id}</strong> encountered an error during processing.</p><p><strong>Error:</strong> ${errorDetails.message}</p><pre>${JSON.stringify(errorDetails.details, null, 2)}</pre>`,
      },
      metadata: {
        ...emailPayload.metadata,
        status: "failed",
        recordId: "rec-failure-12345",
        error: errorDetails,
      },
    },
    whatThisMeans: {
      summary: "One or more workflows failed. This is usually due to invalid data format or missing required fields.",
      commonCauses: [
        "Invalid email format (must be user@domain.com)",
        "Missing country code in phone number (must include +1234567890)",
        "Missing required fields",
        "Invalid data types",
      ],
      whatToDo: [
        "Review the error details in the response",
        "Fix the data issues identified in the error.details object",
        "Retry the request with corrected data",
        "Check the field rules in the developer guide for format requirements",
      ],
      whenToRetry: "If it's a data validation error, fix and retry immediately. If it's a service error, wait a moment and retry. Check service status if failures persist.",
    },
    howToFix: [
      "Ensure email is in valid format: user@domain.com",
      "Ensure phone includes country code: +1234567890",
      "Check that all required fields are present",
      "Verify data types match the expected format",
      "Review the developer guide for field requirements",
    ],
  };
}

