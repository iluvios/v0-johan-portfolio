"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  X,
  ChevronUp,
  ChevronDown,
  Layers,
  Award,
  User,
  Wrench,
} from "lucide-react"
import { type CVProfile, type WorkExperience } from "@/lib/profile-data"
import Link from "next/link"

interface CVManagerProps {
  cvData: CVProfile
  onChange: (updated: CVProfile) => void
  onSave: () => void
  isSaving: boolean
}

export function CVManager({ cvData, onChange, onSave, isSaving }: CVManagerProps) {
  const [activeSection, setActiveSection] = useState<"basics" | "experience" | "skills" | "education">(
    "experience"
  )

  // Local inputs for adding tools and achievements
  const [toolInputs, setToolInputs] = useState<{ [expIndex: number]: string }>({})
  const [achInputs, setAchInputs] = useState<{ [expIndex: number]: string }>({})
  const [skillInput, setSkillInput] = useState("")
  const [selectedCatIdx, setSelectedCatIdx] = useState(0)

  // --- Basic Info Handlers ---
  const handleBasicChange = (field: keyof CVProfile, value: string) => {
    onChange({ ...cvData, [field]: value })
  }

  // --- Work Experience Handlers ---
  const handleAddExperience = () => {
    const newExp: WorkExperience = {
      role: "New Role",
      company: "Company Name",
      period: "2025 - Present",
      location: "Remote",
      type: "Full-time",
      description: "",
      achievements: ["Key achievement or responsibility with metric impact."],
      tools: ["HubSpot", "n8n"],
    }
    onChange({
      ...cvData,
      experiences: [newExp, ...cvData.experiences],
    })
  }

  const handleUpdateExperience = (index: number, updatedField: Partial<WorkExperience>) => {
    const updated = [...cvData.experiences]
    updated[index] = { ...updated[index], ...updatedField }
    onChange({ ...cvData, experiences: updated })
  }

  const handleDeleteExperience = (index: number) => {
    if (!confirm(`Delete experience at ${cvData.experiences[index].company}?`)) return
    const updated = cvData.experiences.filter((_, idx) => idx !== index)
    onChange({ ...cvData, experiences: updated })
  }

  const handleMoveExperience = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= cvData.experiences.length) return
    const updated = [...cvData.experiences]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    onChange({ ...cvData, experiences: updated })
  }

  // Tool tags
  const handleAddTool = (expIndex: number) => {
    const tool = (toolInputs[expIndex] || "").trim()
    if (!tool) return
    const currentTools = cvData.experiences[expIndex].tools || []
    if (!currentTools.includes(tool)) {
      handleUpdateExperience(expIndex, { tools: [...currentTools, tool] })
    }
    setToolInputs({ ...toolInputs, [expIndex]: "" })
  }

  const handleRemoveTool = (expIndex: number, toolToRemove: string) => {
    const currentTools = cvData.experiences[expIndex].tools || []
    handleUpdateExperience(expIndex, {
      tools: currentTools.filter((t) => t !== toolToRemove),
    })
  }

  // Achievements bullets
  const handleAddAchievement = (expIndex: number) => {
    const ach = (achInputs[expIndex] || "").trim()
    if (!ach) return
    const current = cvData.experiences[expIndex].achievements || []
    handleUpdateExperience(expIndex, { achievements: [...current, ach] })
    setAchInputs({ ...achInputs, [expIndex]: "" })
  }

  const handleRemoveAchievement = (expIndex: number, achIndex: number) => {
    const current = cvData.experiences[expIndex].achievements || []
    handleUpdateExperience(expIndex, {
      achievements: current.filter((_, idx) => idx !== achIndex),
    })
  }

  // --- Skills Handlers ---
  const handleAddSkill = () => {
    const skill = skillInput.trim()
    if (!skill) return
    const updatedCategories = [...cvData.skillCategories]
    const targetCat = updatedCategories[selectedCatIdx]
    if (targetCat && !targetCat.skills.includes(skill)) {
      targetCat.skills = [...targetCat.skills, skill]
      onChange({ ...cvData, skillCategories: updatedCategories })
    }
    setSkillInput("")
  }

  const handleRemoveSkill = (catIdx: number, skillToRemove: string) => {
    const updatedCategories = [...cvData.skillCategories]
    updatedCategories[catIdx].skills = updatedCategories[catIdx].skills.filter(
      (s) => s !== skillToRemove
    )
    onChange({ ...cvData, skillCategories: updatedCategories })
  }

  return (
    <div className="space-y-6">
      {/* Subnav & Actions Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={activeSection === "experience" ? "default" : "outline"}
            onClick={() => setActiveSection("experience")}
            className="flex items-center gap-1.5 text-xs"
          >
            <Briefcase size={14} />
            Experience ({cvData.experiences.length})
          </Button>

          <Button
            type="button"
            size="sm"
            variant={activeSection === "skills" ? "default" : "outline"}
            onClick={() => setActiveSection("skills")}
            className="flex items-center gap-1.5 text-xs"
          >
            <Sparkles size={14} />
            Skills & Tools
          </Button>

          <Button
            type="button"
            size="sm"
            variant={activeSection === "education" ? "default" : "outline"}
            onClick={() => setActiveSection("education")}
            className="flex items-center gap-1.5 text-xs"
          >
            <GraduationCap size={14} />
            Education
          </Button>

          <Button
            type="button"
            size="sm"
            variant={activeSection === "basics" ? "default" : "outline"}
            onClick={() => setActiveSection("basics")}
            className="flex items-center gap-1.5 text-xs"
          >
            <User size={14} />
            Header & Bio
          </Button>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <Link
            href="/cv"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:border-blue-400 transition-colors"
          >
            <ExternalLink size={13} />
            <span>View & Print PDF</span>
          </Link>

          <Button
            onClick={onSave}
            disabled={isSaving}
            className="ai-glow flex items-center gap-1.5 text-xs font-semibold"
          >
            <Save size={14} />
            <span>{isSaving ? "Saving to DB..." : "Save CV to DB"}</span>
          </Button>
        </div>
      </div>

      {/* SECTION 1: WORK EXPERIENCE */}
      {activeSection === "experience" && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Briefcase size={20} className="text-blue-400" />
                Work Experience Timeline
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Every role includes explicit tools used per recruiter feedback.
              </p>
            </div>
            <Button size="sm" onClick={handleAddExperience} className="ai-glow flex items-center gap-1">
              <Plus size={14} /> Add Role
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {cvData.experiences.map((exp, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-lg border border-slate-700 bg-slate-900/60 space-y-4 relative"
              >
                {/* Role Header Controls */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/30">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-white text-sm sm:text-base">
                      {exp.role || "Untitled"} @ {exp.company || "Company"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveExperience(idx, -1)}
                      className="p-1 text-slate-400 hover:text-blue-400 disabled:opacity-20"
                      title="Move up"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === cvData.experiences.length - 1}
                      onClick={() => handleMoveExperience(idx, 1)}
                      className="p-1 text-slate-400 hover:text-blue-400 disabled:opacity-20"
                      title="Move down"
                    >
                      <ChevronDown size={15} />
                    </button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteExperience(idx)}
                      className="text-slate-400 hover:text-red-400 h-8 px-2"
                      title="Delete role"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {/* Role Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs text-slate-300">Job Title / Role</Label>
                    <Input
                      value={exp.role}
                      onChange={(e) => handleUpdateExperience(idx, { role: e.target.value })}
                      className="bg-slate-950 border-slate-700 text-xs text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-300">Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(idx, { company: e.target.value })}
                      className="bg-slate-950 border-slate-700 text-xs text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-300">Period (e.g. Apr 2025 - Mar 2026)</Label>
                    <Input
                      value={exp.period}
                      onChange={(e) => handleUpdateExperience(idx, { period: e.target.value })}
                      className="bg-slate-950 border-slate-700 text-xs text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-300">Location & Type</Label>
                    <Input
                      value={exp.location}
                      onChange={(e) => handleUpdateExperience(idx, { location: e.target.value })}
                      placeholder="Medellin, Colombia (Remote)"
                      className="bg-slate-950 border-slate-700 text-xs text-white mt-1"
                    />
                  </div>
                </div>

                {/* Explicit Tool Stack for This Role */}
                <div className="p-3 rounded-md bg-blue-950/20 border border-blue-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 mb-2">
                    <Wrench size={13} />
                    <span>Tools & Tech Used in this Role</span>
                  </div>

                  {/* Add Tool Input */}
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={toolInputs[idx] || ""}
                      onChange={(e) => setToolInputs({ ...toolInputs, [idx]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTool(idx)
                        }
                      }}
                      placeholder="Add tool (e.g. n8n, Triple Whale, HubSpot) and press Enter"
                      className="bg-slate-950 border-slate-700 text-xs text-white flex-1 h-8"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddTool(idx)}
                      className="border-slate-700 hover:border-cyan-400 text-xs h-8"
                    >
                      Add Tool
                    </Button>
                  </div>

                  {/* Tools Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {(exp.tools || []).map((tool, tIdx) => (
                      <Badge
                        key={tIdx}
                        variant="secondary"
                        className="bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs pr-1 font-mono"
                      >
                        {tool}
                        <button
                          type="button"
                          onClick={() => handleRemoveTool(idx, tool)}
                          className="ml-1.5 hover:text-red-400 text-slate-400"
                        >
                          <X size={11} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Bullet Points / Achievements */}
                <div>
                  <Label className="text-xs text-slate-300">Metric-Driven Achievements & Bullets</Label>
                  <div className="space-y-2 mt-2">
                    {exp.achievements.map((ach, aIdx) => (
                      <div key={aIdx} className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold text-xs mt-2">•</span>
                        <Textarea
                          value={ach}
                          rows={2}
                          onChange={(e) => {
                            const current = [...exp.achievements]
                            current[aIdx] = e.target.value
                            handleUpdateExperience(idx, { achievements: current })
                          }}
                          className="bg-slate-950 border-slate-700 text-xs text-white flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAchievement(idx, aIdx)}
                          className="text-slate-500 hover:text-red-400 p-1 mt-1"
                          title="Remove bullet"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add bullet input */}
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={achInputs[idx] || ""}
                      onChange={(e) => setAchInputs({ ...achInputs, [idx]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddAchievement(idx)
                        }
                      }}
                      placeholder="Type a new bullet achievement and press Enter"
                      className="bg-slate-950 border-slate-700 text-xs text-white flex-1 h-8"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddAchievement(idx)}
                      className="border-slate-700 hover:border-blue-400 text-xs h-8"
                    >
                      Add Bullet
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* SECTION 2: SKILLS */}
      {activeSection === "skills" && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles size={20} className="text-cyan-400" />
              Categorized Skills & Platforms
            </CardTitle>
            <p className="text-xs text-slate-400">
              Manage the 3 primary pillars from your original CV.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Add Skill to Category */}
            <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-700 flex flex-col sm:flex-row gap-3">
              <div className="sm:w-48">
                <Label className="text-xs text-slate-300">Target Category</Label>
                <select
                  value={selectedCatIdx}
                  onChange={(e) => setSelectedCatIdx(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded p-2 mt-1"
                >
                  {cvData.skillCategories.map((cat, idx) => (
                    <option key={idx} value={idx}>
                      {cat.category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <Label className="text-xs text-slate-300">Skill Name</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddSkill()
                      }
                    }}
                    placeholder="e.g. Next.js, n8n, Meta Ads, Triple Whale"
                    className="bg-slate-950 border-slate-700 text-xs text-white flex-1"
                  />
                  <Button type="button" size="sm" onClick={handleAddSkill} className="ai-glow text-xs">
                    Add Skill
                  </Button>
                </div>
              </div>
            </div>

            {/* Render categories */}
            <div className="space-y-5">
              {cvData.skillCategories.map((cat, cIdx) => (
                <div key={cIdx} className="p-4 rounded-lg border border-slate-700/80 bg-slate-900/40">
                  <h3 className="font-semibold text-cyan-300 text-sm mb-2.5 flex items-center gap-2">
                    <Layers size={14} />
                    {cat.category} ({cat.skills.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.skills.map((skill, sIdx) => (
                      <Badge
                        key={sIdx}
                        variant="secondary"
                        className="bg-slate-800 text-slate-200 border border-slate-700 text-xs pr-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(cIdx, skill)}
                          className="ml-1.5 hover:text-red-400 text-slate-400"
                        >
                          <X size={11} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 3: EDUCATION & CERTS */}
      {activeSection === "education" && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <GraduationCap size={20} className="text-blue-400" />
              Education & Languages
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Degrees */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Degrees & Institutions
              </h3>
              {cvData.education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-slate-900/60 border border-slate-700 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs text-slate-300">Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => {
                          const current = [...cvData.education]
                          current[idx].degree = e.target.value
                          onChange({ ...cvData, education: current })
                        }}
                        className="bg-slate-950 border-slate-700 text-xs text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-300">Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => {
                          const current = [...cvData.education]
                          current[idx].institution = e.target.value
                          onChange({ ...cvData, education: current })
                        }}
                        className="bg-slate-950 border-slate-700 text-xs text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-300">Period</Label>
                      <Input
                        value={edu.period}
                        onChange={(e) => {
                          const current = [...cvData.education]
                          current[idx].period = e.target.value
                          onChange({ ...cvData, education: current })
                        }}
                        className="bg-slate-950 border-slate-700 text-xs text-white mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Languages */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Award size={15} className="text-cyan-400" />
                Languages & Certifications
              </h3>
              <div className="space-y-2">
                {cvData.languages.map((lang, idx) => (
                  <Input
                    key={idx}
                    value={lang}
                    onChange={(e) => {
                      const current = [...cvData.languages]
                      current[idx] = e.target.value
                      onChange({ ...cvData, languages: current })
                    }}
                    className="bg-slate-950 border-slate-700 text-xs text-white"
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 4: HEADER & BIO */}
      {activeSection === "basics" && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <User size={20} className="text-blue-400" />
              Header Information & Summary
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-300">Full Name</Label>
                <Input
                  value={cvData.name}
                  onChange={(e) => handleBasicChange("name", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-xs text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-300">Professional Title</Label>
                <Input
                  value={cvData.title}
                  onChange={(e) => handleBasicChange("title", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-xs text-white mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-slate-300">Phone</Label>
                <Input
                  value={cvData.phone}
                  onChange={(e) => handleBasicChange("phone", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-xs text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-300">Email</Label>
                <Input
                  value={cvData.email}
                  onChange={(e) => handleBasicChange("email", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-xs text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-300">Location</Label>
                <Input
                  value={cvData.location}
                  onChange={(e) => handleBasicChange("location", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-xs text-white mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-300">Website URL</Label>
              <Input
                value={cvData.website}
                onChange={(e) => handleBasicChange("website", e.target.value)}
                className="bg-slate-950 border-slate-700 text-xs text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-300">Executive Summary (Top Box)</Label>
              <Textarea
                value={cvData.summary}
                onChange={(e) => handleBasicChange("summary", e.target.value)}
                rows={4}
                className="bg-slate-950 border-slate-700 text-xs text-white mt-1 leading-relaxed"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
