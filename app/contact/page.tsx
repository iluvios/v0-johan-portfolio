"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { GlowButton } from "@/components/ui/glow-button"
import { Mail, MapPin, Phone, Send, Linkedin, Github, Twitter } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function ContactPage() {
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
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
    <div className="min-h-screen bg-slate-900 text-white grid-background">
      {/* Floating orbs */}
      <div className="floating-orb floating-orb-1"></div>
      <div className="floating-orb floating-orb-2"></div>
      <div className="floating-orb floating-orb-3"></div>
      <div className="floating-orb floating-orb-4"></div>
      <div className="floating-orb floating-orb-5"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 gradient-text">
            {t.contact?.header?.title || "Get In Touch"}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
            {t.contact?.header?.alvaIntro?.line2 || "Let's discuss your next project or collaboration opportunity"}
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Form */}
          <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                {t.contact?.form?.title || "Send Message"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <Input
                    type="text"
                    name="name"
                    placeholder={t.contact?.form?.nameLabel || "Full Name"}
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 text-base sm:text-lg md:text-xl h-12 sm:h-14"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    name="email"
                    placeholder={t.contact?.form?.emailLabel || "Email Address"}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 text-base sm:text-lg md:text-xl h-12 sm:h-14"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    name="subject"
                    placeholder={t.contact?.form?.messageLabel || "Subject"}
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 text-base sm:text-lg md:text-xl h-12 sm:h-14"
                  />
                </div>
                <div>
                  <Textarea
                    name="message"
                    placeholder={t.contact?.form?.messagePlaceholder || "Your Message"}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 resize-none text-base sm:text-lg md:text-xl"
                  />
                </div>
                <GlowButton type="submit" size="lg" className="w-full">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {t.contact?.form?.submitButton || "Send Message"}
                </GlowButton>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6 sm:space-y-8">
            <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {t.contact?.info?.directTitle || "Contact Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  <div>
                    <p className="text-sm sm:text-base md:text-lg text-slate-400">Email</p>
                    <p className="text-base sm:text-lg md:text-xl text-white">johan@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  <div>
                    <p className="text-sm sm:text-base md:text-lg text-slate-400">Location</p>
                    <p className="text-base sm:text-lg md:text-xl text-white">
                      {t.contact?.info?.location || "Medellín, Colombia"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  <div>
                    <p className="text-sm sm:text-base md:text-lg text-slate-400">Availability</p>
                    <p className="text-base sm:text-lg md:text-xl text-white">Available for remote work</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Connect With Me</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 sm:gap-4">
                  <GlowButton variant="outline" size="sm" asChild>
                    <a href="https://linkedin.com/in/johan" target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  </GlowButton>
                  <GlowButton variant="outline" size="sm" asChild>
                    <a href="https://github.com/johan" target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  </GlowButton>
                  <GlowButton variant="outline" size="sm" asChild>
                    <a href="https://twitter.com/johan" target="_blank" rel="noopener noreferrer">
                      <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  </GlowButton>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
              <CardContent className="p-6 sm:p-8">
                <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed">
                  {t.contact?.info?.remoteText ||
                    "With 8+ years of experience, I'm ready for challenging remote opportunities across marketing automation, full-funnel strategies, and team leadership."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-base sm:text-lg md:text-xl text-blue-400 font-mono italic">
            {t.contact?.info?.alvaQuote || "Connection protocols active. Standby for strategic alignment. - A.S. Johan"}
          </p>
        </div>
      </div>
    </div>
  )
}
