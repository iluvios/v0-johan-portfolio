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
import { useLanguage } from "@/contexts/language-context"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const { t } = useLanguage()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(t('contact.form.submitMessage'), formData)
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
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">{t('contact.header.title')}</h1>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-md p-6 max-w-2xl mx-auto ai-glow border border-blue-500/20">
            <div className="text-blue-400 text-sm font-mono">
              {t('contact.header.alvaIntro.line1')}
              <br />
              {t('contact.header.alvaIntro.line2')}
              <br />
              <span className="text-green-400">{t('contact.header.alvaIntro.line3')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
            <CardHeader>
              <CardTitle className="gradient-text">{t('contact.form.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-gray-300">
                    {t('contact.form.nameLabel')}
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
                    {t('contact.form.emailLabel')}
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
                    {t('contact.form.messageLabel')}
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="bg-slate-700 border-slate-600 text-white mt-1 rounded-md"
                    placeholder={t('contact.form.messagePlaceholder')}
                    required
                  />
                </div>

                <GlowButton type="submit" className="w-full">
                  {t('contact.form.submitButton')} <Send className="ml-2" size={16} />
                </GlowButton>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold gradient-text mb-4">{t('contact.info.directTitle')}</h3>
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
                    <span>{t('contact.info.location')}</span>
                  </div>

                  <Link
                    href="https://linkedin.com/in/johan-alvarez"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <Linkedin size={20} />
                    <span>{t('contact.info.linkedin')}</span>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold gradient-text mb-4">{t('contact.info.responseTitle')}</h3>
                <p className="text-gray-300 text-sm">{t('contact.info.responseText')}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold gradient-text mb-4">{t('contact.info.remoteTitle')}</h3>
                <p className="text-gray-300 text-sm mb-4">
                  {t('contact.info.remoteText')}
                </p>
                <div className="text-blue-400 text-xs font-mono italic">
                  {t('contact.info.alvaQuote')}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
