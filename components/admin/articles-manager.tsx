"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Save,
  Edit,
  Trash2,
  Upload,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react"
import {
  type BlogPost,
  saveBlogPost,
  getAllBlogPosts,
  deleteBlogPost,
  uploadBlogImage,
} from "@/lib/blog"
import { extractImageFiles, type AdminNotify } from "@/components/admin/admin-utils"

interface ArticlesManagerProps {
  notify: AdminNotify
  onPostsCountChange?: (count: number) => void
  createTrigger?: number
}

const emptyPost: BlogPost = {
  id: "",
  title: "",
  excerpt: "",
  content: "",
  category: "Innovation",
  date: new Date().toISOString().split("T")[0],
  readTime: "5 min read",
  image: "",
  tags: [],
  published: false,
}

export function ArticlesManager({
  notify,
  onPostsCountChange,
  createTrigger,
}: ArticlesManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [articleImageUploading, setArticleImageUploading] = useState(false)
  const [newArticleTagInput, setNewArticleTagInput] = useState("")
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)

  const loadPosts = async () => {
    setIsLoadingPosts(true)
    try {
      const allPosts = await getAllBlogPosts()
      setPosts(allPosts)
      onPostsCountChange?.(allPosts.length)
    } catch (error) {
      console.error("Error loading posts:", error)
      notify("error", "Failed to load articles.")
    } finally {
      setIsLoadingPosts(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  useEffect(() => {
    if (createTrigger && createTrigger > 0) {
      handleCreateNewArticle()
    }
  }, [createTrigger])

  const handleCreateNewArticle = () => {
    setEditingPost({ ...emptyPost, id: Date.now().toString() })
    setIsCreatingPost(true)
  }

  const handleEditArticle = (post: BlogPost) => {
    setEditingPost({ ...post, tags: [...(post.tags || [])] })
    setIsCreatingPost(false)
  }

  const handleSaveArticle = async () => {
    if (!editingPost) return
    if (!editingPost.title?.trim()) {
      notify("error", "Article title is required.")
      return
    }

    try {
      await saveBlogPost(editingPost)
      await loadPosts()
      setEditingPost(null)
      setIsCreatingPost(false)
      notify("success", `Article "${editingPost.title}" saved successfully!`)
    } catch (error) {
      console.error("Error saving post:", error)
      notify("error", "Failed to save article.")
    }
  }

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete article "${title}"?`)) return
    try {
      await deleteBlogPost(id)
      await loadPosts()
      if (editingPost?.id === id) {
        setEditingPost(null)
      }
      notify("success", `Article "${title}" deleted.`)
    } catch (error) {
      console.error("Error deleting article:", error)
      notify("error", "Failed to delete article.")
    }
  }

  const uploadArticleImageFile = async (file: File) => {
    if (!editingPost) return
    setArticleImageUploading(true)
    notify("info", "Uploading article image...")
    try {
      const ext = file.type ? file.type.split("/")[1] || "png" : "png"
      const hasExtension = file.name && /\.[a-z0-9]+$/i.test(file.name)
      const cleanName =
        hasExtension && file.name !== "image.png"
          ? file.name
          : `article-${Date.now()}.${ext}`
      const fileToUpload = new File([file], cleanName, {
        type: file.type || `image/${ext}`,
      })
      const imageUrl = await uploadBlogImage(fileToUpload)
      setEditingPost((prev) => (prev ? { ...prev, image: imageUrl } : prev))
      notify("success", "Article image uploaded successfully.")
    } catch (error: any) {
      console.error("Error uploading image:", error)
      notify("error", error?.message || "Failed to upload image.")
    } finally {
      setArticleImageUploading(false)
    }
  }

  const handleArticleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await uploadArticleImageFile(file)
    event.target.value = ""
  }

  const handleArticleImagePaste = async (e: React.ClipboardEvent) => {
    const files = extractImageFiles(e)
    if (files.length > 0) {
      e.preventDefault()
      e.stopPropagation()
      await uploadArticleImageFile(files[0])
    }
  }

  const handleAddArticleTag = () => {
    const trimmed = newArticleTagInput.trim()
    if (!trimmed || !editingPost) return
    const currentTags = editingPost.tags || []
    if (!currentTags.includes(trimmed)) {
      setEditingPost({ ...editingPost, tags: [...currentTags, trimmed] })
    }
    setNewArticleTagInput("")
  }

  const handleRemoveArticleTag = (tag: string) => {
    if (!editingPost) return
    setEditingPost({ ...editingPost, tags: (editingPost.tags || []).filter((t) => t !== tag) })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Articles List */}
      <div className={editingPost ? "lg:col-span-5" : "lg:col-span-12"}>
        <Card className="bg-slate-800/50 border-slate-700">
          <div className="mx-6 mt-6 rounded-md border border-amber-500/30 bg-amber-950/40 p-3 text-xs text-amber-300">
            Articles are saved in this browser only and are not visible to visitors yet. The public Notes
            section stays hidden until articles are stored in the database.
          </div>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Articles ({posts.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateNewArticle}
                className="border-slate-700 hover:border-blue-400 text-slate-300 text-xs h-8"
              >
                <Plus size={14} className="mr-1" /> New Article
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadPosts}
                disabled={isLoadingPosts}
                className="text-slate-400 hover:text-white h-8 w-8 p-0"
              >
                <RefreshCw size={14} className={isLoadingPosts ? "animate-spin" : ""} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
              {posts.map((post) => {
                const isSelected = editingPost?.id === post.id
                return (
                  <div
                    key={post.id}
                    className={`p-3 sm:p-4 rounded-lg border transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                      isSelected
                        ? "bg-blue-950/40 border-blue-500/50 ring-1 ring-blue-500/30"
                        : "bg-slate-900/40 border-slate-700/60 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-16 h-12 rounded object-cover border border-slate-700 bg-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-12 rounded border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-500 text-xs shrink-0">
                          No img
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white truncate text-sm sm:text-base">
                          {post.title || "Untitled"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={post.published ? "default" : "secondary"}
                            className="text-[10px] py-0"
                          >
                            {post.published ? "Published" : "Draft"}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] text-slate-400 py-0">
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditArticle(post)}
                        className="border-slate-700 hover:border-blue-400 hover:text-blue-400 h-8 px-2.5"
                        title="Edit article"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteArticle(post.id, post.title)}
                        className="border-slate-700 hover:border-red-400 hover:text-red-400 h-8 px-2.5"
                        title="Delete article"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Article Editor */}
      {editingPost && (
        <div className="lg:col-span-7">
          <Card className="bg-slate-800/60 border-slate-700 ai-glow">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xl">
                {isCreatingPost ? "Create New Article" : "Edit Article"}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingPost(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[750px] overflow-y-auto pr-2">
              <div>
                <Label htmlFor="post-title" className="text-slate-200">
                  Title *
                </Label>
                <Input
                  id="post-title"
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="bg-slate-900/80 border-slate-700 text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="post-excerpt" className="text-slate-200">
                  Excerpt
                </Label>
                <Textarea
                  id="post-excerpt"
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  className="bg-slate-900/80 border-slate-700 text-white mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="post-category" className="text-slate-200">
                    Category
                  </Label>
                  <Select
                    value={editingPost.category}
                    onValueChange={(value) =>
                      setEditingPost({ ...editingPost, category: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-900/80 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                      <SelectItem value="Innovation">Innovation</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Philosophy">Philosophy</SelectItem>
                      <SelectItem value="Automation">Automation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="post-readtime" className="text-slate-200">
                    Read Time
                  </Label>
                  <Input
                    id="post-readtime"
                    value={editingPost.readTime}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, readTime: e.target.value })
                    }
                    className="bg-slate-900/80 border-slate-700 text-white mt-1"
                    placeholder="e.g. 5 min read"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-slate-200">Featured Image</Label>
                  <span className="text-[11px] text-slate-400">
                    Paste with <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Ctrl+V</kbd>
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={editingPost.image || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, image: e.target.value })}
                    onPaste={handleArticleImagePaste}
                    onDrop={async (e) => {
                      e.preventDefault()
                      const files = Array.from(e.dataTransfer.files).filter(
                        (f) =>
                          f.type.startsWith("image/") ||
                          /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(f.name)
                      )
                      if (files.length > 0) {
                        await uploadArticleImageFile(files[0])
                      }
                    }}
                    onDragOver={(e) => {
                      if (e.dataTransfer.types.includes("Files")) {
                        e.preventDefault()
                      }
                    }}
                    placeholder="Paste image (Ctrl+V) or enter URL"
                    disabled={articleImageUploading}
                    className="bg-slate-900/80 border-slate-700 text-white flex-1 focus-visible:ring-cyan-500"
                  />
                  <label className={`cursor-pointer ${articleImageUploading ? "pointer-events-none opacity-50" : ""}`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleArticleImageUpload}
                      className="hidden"
                      disabled={articleImageUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-700 hover:border-blue-400 text-slate-300"
                      disabled={articleImageUploading}
                      asChild
                    >
                      <span>
                        {articleImageUploading ? (
                          <>
                            <Loader2 size={14} className="mr-1.5 animate-spin" /> Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={14} className="mr-1.5" /> Upload
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
                {editingPost.image && (
                  <div className="mt-2 relative w-32 h-20 rounded border border-slate-700 overflow-hidden bg-slate-950">
                    <img
                      src={editingPost.image}
                      alt="Article preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <Label className="text-slate-200">Tags</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newArticleTagInput}
                    onChange={(e) => setNewArticleTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddArticleTag()
                      }
                    }}
                    placeholder="e.g. AI, Growth"
                    className="bg-slate-900/80 border-slate-700 text-white flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddArticleTag}
                    className="border-slate-700 hover:border-blue-400 text-slate-300"
                  >
                    Add Tag
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(editingPost.tags || []).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-slate-800 text-slate-300 border border-slate-700 pr-1 text-xs"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveArticleTag(tag)}
                        className="ml-1.5 hover:text-red-400 text-slate-400"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="post-content" className="text-slate-200">
                  Content (Markdown)
                </Label>
                <Textarea
                  id="post-content"
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="bg-slate-900/80 border-slate-700 text-white font-mono text-sm mt-1"
                  rows={10}
                  placeholder="Write your article in Markdown..."
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Switch
                  id="post-published"
                  checked={editingPost.published}
                  onCheckedChange={(checked) =>
                    setEditingPost({ ...editingPost, published: checked })
                  }
                />
                <Label htmlFor="post-published" className="text-slate-200 cursor-pointer">
                  Published
                </Label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <Button
                  onClick={handleSaveArticle}
                  className="ai-glow flex-1 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Article
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingPost(null)}
                  className="border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
