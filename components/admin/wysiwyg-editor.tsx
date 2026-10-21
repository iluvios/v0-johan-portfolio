"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  RemoveFormatting,
  Paperclip,
  ExternalLink,
  Trash2,
  FileText,
  Upload,
  Plus,
  Loader2,
  CheckSquare,
} from "lucide-react"
import {
  createId,
  uploadWorkspaceFile,
  type WorkspaceAttachment,
} from "@/lib/workspace"
import { extractImageFiles } from "@/components/admin/admin-utils"

interface WysiwygEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
  onAttachmentUploaded?: (attachment: WorkspaceAttachment) => void
}

export function WysiwygEditor({
  value,
  onChange,
  placeholder = "Write notes, specs, checklists, or paste screenshots directly...",
  minHeight = "180px",
  onAttachmentUploaded,
}: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isFocusedRef = useRef(false)
  const lastEmittedRef = useRef(value)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const savedSelectionRef = useRef<Range | null>(null)

  // Sync external value changes (e.g. switching selected task/project) without resetting cursor while typing
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (value !== lastEmittedRef.current && !isFocusedRef.current) {
      el.innerHTML = value || ""
      lastEmittedRef.current = value || ""
    } else if (!value && el.innerHTML !== "" && !isFocusedRef.current) {
      el.innerHTML = ""
      lastEmittedRef.current = ""
    }
  }, [value])

  // Initial mount populate
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || ""
      lastEmittedRef.current = value || ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const emitChange = () => {
    if (!editorRef.current) return
    const html = editorRef.current.innerHTML
    const normalized = html === "<br>" ? "" : html
    lastEmittedRef.current = normalized
    onChange(normalized)
  }

  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, arg)
    emitChange()
  }

  const insertChecklistItem = () => {
    editorRef.current?.focus()
    const html = `<div class="flex items-start gap-2 my-1"><input type="checkbox" class="mt-1 accent-blue-500 cursor-pointer" /><span>Checklist item</span></div><p><br/></p>`
    document.execCommand("insertHTML", false, html)
    emitChange()
  }

  const insertCodeBlock = () => {
    editorRef.current?.focus()
    const sel = window.getSelection()?.toString() || "// code snippet"
    const html = `<pre class="bg-slate-950 border border-slate-800 rounded-md p-3 font-mono text-xs text-cyan-300 my-2 overflow-x-auto"><code>${sel
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</code></pre><p><br/></p>`
    document.execCommand("insertHTML", false, html)
    emitChange()
  }

  const openLinkPrompt = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange()
    }
    setLinkUrl("https://")
    setShowLinkInput(true)
  }

  const applyLink = () => {
    const trimmed = linkUrl.trim()
    setShowLinkInput(false)
    if (!trimmed || trimmed === "https://") return
    editorRef.current?.focus()
    if (savedSelectionRef.current) {
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(savedSelectionRef.current)
    }
    document.execCommand("createLink", false, trimmed)
    emitChange()
  }

  const handleImageFiles = async (files: File[]) => {
    if (!files.length) return
    setIsUploadingImage(true)
    try {
      for (const file of files) {
        const attachment = await uploadWorkspaceFile(file)
        onAttachmentUploaded?.(attachment)
        editorRef.current?.focus()
        const imgHtml = `<img src="${attachment.url}" alt="${attachment.name}" class="max-w-full rounded-lg border border-slate-700 my-2 max-h-96 object-contain" /><p><br/></p>`
        document.execCommand("insertHTML", false, imgHtml)
        emitChange()
      }
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const images = extractImageFiles(e)
    if (images.length > 0) {
      e.preventDefault()
      handleImageFiles(images)
    }
  }

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.tagName === "INPUT" && (target as HTMLInputElement).type === "checkbox") {
      const input = target as HTMLInputElement
      if (input.checked) {
        input.setAttribute("checked", "checked")
      } else {
        input.removeAttribute("checked")
      }
      emitChange()
    }
  }

  return (
    <div className="rounded-lg border border-slate-700/80 bg-slate-900/70 overflow-hidden focus-within:border-blue-500/60 transition-colors">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-300">
        <ToolbarButton title="Heading 1" onClick={() => exec("formatBlock", "H1")}>
          <Heading1 size={14} />
        </ToolbarButton>
        <ToolbarButton title="Heading 2" onClick={() => exec("formatBlock", "H2")}>
          <Heading2 size={14} />
        </ToolbarButton>
        <ToolbarButton title="Heading 3" onClick={() => exec("formatBlock", "H3")}>
          <Heading3 size={14} />
        </ToolbarButton>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <ToolbarButton title="Bold (Ctrl+B)" onClick={() => exec("bold")}>
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton title="Italic (Ctrl+I)" onClick={() => exec("italic")}>
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton title="Underline (Ctrl+U)" onClick={() => exec("underline")}>
          <Underline size={14} />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" onClick={() => exec("strikeThrough")}>
          <Strikethrough size={14} />
        </ToolbarButton>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <ToolbarButton title="Bullet List" onClick={() => exec("insertUnorderedList")}>
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton title="Numbered List" onClick={() => exec("insertOrderedList")}>
          <ListOrdered size={14} />
        </ToolbarButton>
        <ToolbarButton title="Interactive Checklist Item" onClick={insertChecklistItem}>
          <CheckSquare size={14} />
        </ToolbarButton>
        <ToolbarButton title="Quote / Callout" onClick={() => exec("formatBlock", "BLOCKQUOTE")}>
          <Quote size={14} />
        </ToolbarButton>
        <ToolbarButton title="Code Block" onClick={insertCodeBlock}>
          <Code size={14} />
        </ToolbarButton>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <ToolbarButton title="Insert Link" onClick={openLinkPrompt}>
          <LinkIcon size={14} />
        </ToolbarButton>
        <ToolbarButton
          title="Insert / Upload Image"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingImage}
        >
          {isUploadingImage ? <Loader2 size={14} className="animate-spin text-cyan-400" /> : <ImageIcon size={14} />}
        </ToolbarButton>
        <ToolbarButton title="Horizontal Divider" onClick={() => exec("insertHorizontalRule")}>
          <Minus size={14} />
        </ToolbarButton>
        <ToolbarButton title="Clear Formatting" onClick={() => exec("removeFormat")}>
          <RemoveFormatting size={14} />
        </ToolbarButton>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            if (files.length) handleImageFiles(files)
            e.target.value = ""
          }}
        />
      </div>

      {/* Inline Link Input */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-950/90 border-b border-slate-800">
          <Input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="h-7 text-xs bg-slate-900 border-slate-700 text-white"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                applyLink()
              } else if (e.key === "Escape") {
                setShowLinkInput(false)
              }
            }}
            autoFocus
          />
          <Button size="sm" className="h-7 px-2.5 text-xs" onClick={applyLink}>
            Insert
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-slate-400"
            onClick={() => setShowLinkInput(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Editable Rich Text Area */}
      <div className="relative">
        {!value && (
          <div className="pointer-events-none absolute top-3 left-3.5 text-xs text-slate-500 select-none">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => {
            isFocusedRef.current = true
          }}
          onBlur={() => {
            isFocusedRef.current = false
            emitChange()
          }}
          onInput={emitChange}
          onPaste={handlePaste}
          onClick={handleEditorClick}
          style={{ minHeight }}
          className="px-3.5 py-3 text-sm text-slate-200 focus:outline-none prose prose-invert prose-sm max-w-none [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-2 [&_h1]:mb-1 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-100 [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-200 [&_h3]:mt-1.5 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-cyan-500 [&_blockquote]:pl-3 [&_blockquote]:text-slate-300 [&_blockquote]:italic [&_a]:text-cyan-400 [&_a]:underline [&_hr]:border-slate-800 [&_hr]:my-3"
        />
      </div>
    </div>
  )
}

function ToolbarButton({
  children,
  onClick,
  title,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        // Keep focus inside contentEditable
        e.preventDefault()
        onClick()
      }}
      className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
    >
      {children}
    </button>
  )
}

// ============================================================================
// Attachments & Files Manager (for both Projects and Tasks)
// ============================================================================

interface AttachmentsSectionProps {
  attachments: WorkspaceAttachment[]
  onChange: (next: WorkspaceAttachment[]) => void
}

export function AttachmentsSection({ attachments, onChange }: AttachmentsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showAddLink, setShowAddLink] = useState(false)
  const [linkName, setLinkName] = useState("")
  const [linkUrl, setLinkUrl] = useState("")

  const handleFilesSelected = async (files: File[]) => {
    if (!files.length) return
    setIsUploading(true)
    try {
      const uploaded: WorkspaceAttachment[] = []
      for (const file of files) {
        uploaded.push(await uploadWorkspaceFile(file))
      }
      onChange([...attachments, ...uploaded])
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddExternalLink = () => {
    const trimmedUrl = linkUrl.trim()
    if (!trimmedUrl) return
    const item: WorkspaceAttachment = {
      id: createId(),
      name: linkName.trim() || trimmedUrl,
      url: trimmedUrl,
      kind: "link",
      createdAt: new Date().toISOString(),
    }
    onChange([...attachments, item])
    setLinkName("")
    setLinkUrl("")
    setShowAddLink(false)
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return null
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Paperclip size={13} />
          Files & Links ({attachments.length})
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="h-7 px-2.5 text-xs border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white"
          >
            {isUploading ? (
              <Loader2 size={12} className="mr-1.5 animate-spin text-cyan-400" />
            ) : (
              <Upload size={12} className="mr-1.5" />
            )}
            Upload File
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowAddLink((v) => !v)}
            className="h-7 px-2.5 text-xs border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white"
          >
            <Plus size={12} className="mr-1" />
            Add Link / Path
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              if (files.length) handleFilesSelected(files)
              e.target.value = ""
            }}
          />
        </div>
      </div>

      {showAddLink && (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-lg border border-slate-800 bg-slate-900/80">
          <Input
            placeholder="Label (e.g. Figma spec, Drive folder, Local doc)"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            className="sm:col-span-4 h-8 text-xs bg-slate-950 border-slate-700 text-white"
          />
          <Input
            placeholder="https://... or C:\Users\..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="sm:col-span-6 h-8 text-xs bg-slate-950 border-slate-700 text-white"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddExternalLink()
              }
            }}
          />
          <div className="sm:col-span-2 flex gap-1">
            <Button size="sm" className="h-8 flex-1 text-xs" onClick={handleAddExternalLink}>
              Add
            </Button>
          </div>
        </div>
      )}

      {attachments.length === 0 ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const files = Array.from(e.dataTransfer.files || [])
            if (files.length) handleFilesSelected(files)
          }}
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-lg border border-dashed border-slate-800 bg-slate-900/30 px-4 py-3 text-center text-xs text-slate-500 hover:border-slate-700 hover:text-slate-400 transition-colors"
        >
          Drop files/screenshots here or click to attach
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const files = Array.from(e.dataTransfer.files || [])
            if (files.length) handleFilesSelected(files)
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        >
          {attachments.map((att) => (
            <div
              key={att.id}
              className="group flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/70 p-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {att.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={att.url}
                    alt={att.name}
                    className="h-9 w-9 rounded object-cover border border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="h-9 w-9 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                    {att.kind === "link" ? <ExternalLink size={15} /> : <FileText size={15} />}
                  </div>
                )}
                <div className="min-w-0">
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    download={att.url.startsWith("data:") ? att.name : undefined}
                    className="block truncate text-xs font-medium text-slate-200 hover:text-cyan-400 transition-colors"
                  >
                    {att.name}
                  </a>
                  <span className="text-[10px] text-slate-500">
                    {formatSize(att.size) ?? (att.kind === "link" ? "External link" : "Attachment")}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChange(attachments.filter((a) => a.id !== att.id))}
                className="opacity-60 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                title="Remove attachment"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
