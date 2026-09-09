import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      )
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      )
    }

    // Log the contact message (ready for email provider integration like Resend/SendGrid)
    console.log("[Contact Submission Received]", {
      name,
      email,
      subject: subject || "No Subject",
      messageLength: message.length,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Your message has been received! Johan will get back to you shortly.",
    })
  } catch (error) {
    console.error("Contact API error:", error)
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    )
  }
}
