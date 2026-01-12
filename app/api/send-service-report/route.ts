import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Check if API key is configured first
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Email service not configured. Please set RESEND_API_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const {
      to,
      serviceName,
      serviceId,
      reportHtml,
      recordId,
    } = body;

    // Validate required fields
    if (!to || !serviceName || !serviceId) {
      return NextResponse.json(
        {
          error: "Missing required fields: to, serviceName, and serviceId are required",
        },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const reportFilename = `report-${serviceId}-${Date.now()}.html`;

    // Send email with report attachment
    const { data, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Service Network <onboarding@resend.dev>",
      to: [to],
      subject: `Service Report - ${serviceName}`,
      html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #06b6d4; font-size: 2em; margin-bottom: 10px;">Service Report</h1>
                <p style="color: #64748b; font-size: 1.1em;">Processing completed for ${serviceName}</p>
              </div>
              
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
                <p style="color: #92400e; margin: 0;">
                  <strong>Service ID:</strong> <code style="background: #fbbf24; padding: 2px 6px; border-radius: 4px;">${serviceId}</code>
                </p>
                ${recordId ? `<p style="color: #92400e; margin: 10px 0 0 0;"><strong>Record ID:</strong> <code style="background: #fbbf24; padding: 2px 6px; border-radius: 4px;">${recordId}</code></p>` : ''}
              </div>

              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
                <h2 style="color: #1e40af; font-size: 1.3em; margin-bottom: 15px; margin-top: 0;">Report Attached</h2>
                <p style="color: #1e3a8a; margin: 0;">
                  Your service report has been generated and is attached to this email. Download the attachment to view the complete results.
                </p>
              </div>

              <p style="color: #64748b; margin-bottom: 20px;">
                The report contains detailed information about the processing results. You can also view and download reports in the Service Network portal.
              </p>

              <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 0.9em;">
                  Generated at ${new Date(timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      attachments: reportHtml
        ? [
            {
              filename: reportFilename,
              content: Buffer.from(reportHtml).toString("base64"),
              contentType: "text/html",
            },
          ]
        : [],
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, messageId: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

