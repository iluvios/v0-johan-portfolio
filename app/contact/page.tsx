"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GlowButton } from "@/components/ui/glow-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Linkedin, Send, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">INITIATE CONNECTION</h1>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-md p-6 max-w-2xl mx-auto ai-glow border border-blue-500/20">
            <div className="text-blue-400 text-sm font-mono">
              Initiate Connection.
              <br />
              Ready to discuss your next initiative?
              <br />
              <span className="text-green-400">Remote opportunities welcome • C2 English proficiency</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
            <CardHeader>
              <CardTitle className="gradient-text">Send a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-gray-300">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-slate-700 border-slate-600 text-white mt-1 rounded-md"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-slate-700 border-slate-600 text-white mt-1 rounded-md"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-gray-300">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="bg-slate-700 border-slate-600 text-white mt-1 rounded-md"
                    placeholder="Tell me about your project or initiative..."
                    required
                  />
                </div>

                <GlowButton type="submit" className="w-full">
                  Send Message <Send className="ml-2" size={16} />
                </GlowButton>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold gradient-text mb-4">Direct Contact</h3>
                <div className="space-y-4">
                  <Link
                    href="mailto:jdsub16@gmail.com"
                    className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <Mail size={20} />
                    <span>jdsub16@gmail.com</span>
                  </Link>

                  <Link
                    href="tel:+573184064960"
                    className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <Phone size={20} />
                    <span>+57 3184064960</span>
                  </Link>

                  <div className="flex items-center space-x-3 text-gray-300">
                    <MapPin size={20} />
                    <span>Medellín, Colombia</span>
                  </div>

                  <Link
                    href="https://linkedin.com/in/johan-alvarez"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <Linkedin size={20} />
                    <span>LinkedIn Profile</span>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold gradient-text mb-4">Response Time</h3>
                <p className="text-gray-300 text-sm">
                  I typically respond to inquiries within 24 hours. For urgent matters, please indicate the priority
                  level in your message.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold gradient-text mb-4">Remote Collaboration</h3>
                <p className="text-gray-300 text-sm mb-4">
                  With 8+ years of experience and C2 English proficiency, I'm ready for challenging remote opportunities
                  across marketing automation, full-funnel strategies, and team leadership.
                </p>
                <div className="text-blue-400 text-xs font-mono italic">
                  "Connection protocols active. Standby for strategic alignment." - ALVA
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
