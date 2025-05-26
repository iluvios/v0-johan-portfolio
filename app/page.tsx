"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlowButton } from "@/components/ui/glow-button"
import { ArrowRight, Brain, Target, Zap, Code, Lightbulb } from "lucide-react"

export default function HomePage() {
  const [alvaText, setAlvaText] = useState("")
  const fullText = "Welcome. I am A.S JOHAN.\nI identify growth opportunities and turn plans into results.\nYour exploration begins now."

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setAlvaText(fullText.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
      }
    }, 50)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <div className="float-animation">
            <div className="text-sm uppercase tracking-wider text-blue-400 mb-4 font-medium">
              SENIOR MARKETING & INNOVATION STRATEGIST
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 gradient-text leading-tight">Drive Your Brand's Growth</h1>
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white/90">
              With <span className="gradient-text">Digital</span> Innovation
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Driving revenue and engagement through data-driven strategies in marketing, automation, and innovative
              design.
            </p>
          </div>

          {/* ALVA AI Welcome */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-md p-6 mb-12 ai-glow border border-blue-500/20">
            <div className="text-blue-400 text-sm font-mono whitespace-pre-line min-h-[80px]">
              {alvaText}
              <span className="animate-pulse">|</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <GlowButton size="lg" className="px-8 py-4 text-lg">
              <Link href="/projects" className="flex items-center">
                View Projects <ArrowRight className="ml-2" size={20} />
              </Link>
            </GlowButton>
            <GlowButton variant="outline" size="lg" className="px-8 py-4 text-lg">
              <Link href="/articles" className="flex items-center">
                Read Articles <ArrowRight className="ml-2" size={20} />
              </Link>
            </GlowButton>
          </div>
        </div>

        {/* Floating Tech Icons */}
        <div className="absolute top-1/4 left-10 opacity-30">
          <Brain size={60} className="text-blue-400 float-animation" style={{ animationDelay: "0s" }} />
        </div>
        <div className="absolute top-1/3 right-10 opacity-30">
          <Target size={50} className="text-cyan-400 float-animation" style={{ animationDelay: "2s" }} />
        </div>
        <div className="absolute bottom-1/4 left-1/4 opacity-30">
          <Zap size={40} className="text-blue-500 float-animation" style={{ animationDelay: "4s" }} />
        </div>
        <div className="absolute top-1/2 right-1/4 opacity-30">
          <Code size={45} className="text-cyan-500 float-animation" style={{ animationDelay: "1s" }} />
        </div>
        <div className="absolute bottom-1/3 right-1/3 opacity-30">
          <Lightbulb size={35} className="text-blue-300 float-animation" style={{ animationDelay: "3s" }} />
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-slate-800/30 backdrop-blur-sm relative">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-slate-800/50 p-8 rounded-md ai-glow border border-blue-500/20">
              <Brain className="text-blue-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-3">Smarter Marketing with AI</h3>
              <p className="text-gray-300">
                Leveraging artificial intelligence to create personalized marketing experiences at scale.
              </p>
            </div>
            <div className="bg-slate-800/50 p-8 rounded-md ai-glow border border-blue-500/20">
              <Target className="text-cyan-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-3">Effective Strategies, Real Results</h3>
              <p className="text-gray-300">
                Data-driven strategies that deliver measurable results and sustainable growth.
              </p>
            </div>
            <div className="bg-slate-800/50 p-8 rounded-md ai-glow border border-blue-500/20">
              <Zap className="text-blue-500 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-3">Fast & Flexible Execution</h3>
              <p className="text-gray-300">Rapid iteration and optimization to maximize performance and ROI.</p>
            </div>
          </div>

          <div className="text-sm text-blue-400 font-mono italic">
            "Objectives clear. Moving to specialized solutions." - A.S. Johan
          </div>
        </div>
      </section>
    </div>
  )
}
