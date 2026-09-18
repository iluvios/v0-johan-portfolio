import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * Outbound Email Dispatcher Route
 * Sends an email through Resend. Only callable from a logged-in admin session.
 *
 * Set RESEND_API_KEY in your Vercel Environment Variables or .env.local
 */
export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { 
          error: "RESEND_API_KEY environment variable is not configured on Vercel.",
          hint: "Add RESEND_API_KEY in Vercel Project Settings > Environment Variables."
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { to, subject, html, text, replyTo } = body;

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: "Fields 'to', 'subject', and either 'html' or 'text' are required." },
        { status: 400 }
      );
    }

    // Call Resend REST API (zero external npm dependencies required)
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Johan Alvarez <contact@asjohan.com>",
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html,
        text: text,
        reply_to: replyTo || "contact@asjohan.com",
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("[Resend API Error]", resendData);
      return NextResponse.json(
        { error: resendData.message || "Failed to send email via Resend" },
        { status: resendResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      id: resendData.id,
      recipient: to,
      message: "Outreach email successfully dispatched.",
    });

  } catch (error) {
    console.error("[Send-Email API Error]", error);
    return NextResponse.json(
      { error: "Internal server error while dispatching email." },
      { status: 500 }
    );
  }
}
