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
      html,
      requestBodyJson,
      webhookPayloadJson,
      emailPayloadJson,
    } = body;

    // Validate required fields
    if (!to || !serviceName || !html) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Send email with attachments
    const { data, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Service Network <onboarding@resend.dev>",
      to: [to],
      subject: `Your ${serviceName} Preview Packet & Developer Guide`,
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
              <h1 style="color: #06b6d4; font-size: 2em; margin-bottom: 10px;">Preview Packet Ready</h1>
              <p style="color: #64748b; font-size: 1.1em;">Your complete developer guide for ${serviceName}</p>
            </div>
            
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #0f172a; font-size: 1.3em; margin-bottom: 15px;">What's Included</h2>
              <ul style="color: #475569; line-height: 2;">
                <li><strong>service-guide.html</strong> - Complete developer documentation</li>
                <li><strong>request-body.json</strong> - API request examples</li>
                <li><strong>webhook-payload.json</strong> - Webhook payload structure</li>
                <li><strong>email-payload.json</strong> - Email payload structure</li>
              </ul>
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
              <p style="color: #92400e; margin: 0;">
                <strong>Service ID:</strong> <code style="background: #fbbf24; padding: 2px 6px; border-radius: 4px;">${serviceId}</code>
              </p>
            </div>

            <p style="color: #64748b; margin-bottom: 20px;">
              All files are attached to this email. Download them to get started with your integration.
            </p>

            <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 0.9em;">
                Need help? Visit the Service Network portal for support.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: "service-guide.html",
          content: Buffer.from(html).toString("base64"),
          contentType: "text/html",
        },
        {
          filename: "request-body.json",
          content: Buffer.from(requestBodyJson).toString("base64"),
          contentType: "application/json",
        },
        {
          filename: "webhook-payload.json",
          content: Buffer.from(webhookPayloadJson).toString("base64"),
          contentType: "application/json",
        },
        {
          filename: "email-payload.json",
          content: Buffer.from(emailPayloadJson).toString("base64"),
          contentType: "application/json",
        },
      ],
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
