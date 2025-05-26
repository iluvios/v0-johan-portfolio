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
import { Plus, Save, Edit } from "lucide-react"
import { type BlogPost, saveBlogPost, getAllBlogPosts, uploadBlogImage } from "@/lib/blog"

export default function AdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)

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

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    const allPosts = await getAllBlogPosts()
    setPosts(allPosts)
  }

  const handleCreateNew = () => {
    setEditingPost({ ...emptyPost, id: Date.now().toString() })
    setIsCreating(true)
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setIsCreating(false)
  }

  const handleSave = async () => {
    if (!editingPost) return

    try {
      await saveBlogPost(editingPost)
      await loadPosts()
      setEditingPost(null)
      setIsCreating(false)
    } catch (error) {
      console.error("Error saving post:", error)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editingPost) return

    setImageUploading(true)
    try {
      const imageUrl = await uploadBlogImage(file)
      setEditingPost({ ...editingPost, image: imageUrl })
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setImageUploading(false)
    }
  }

  const handleTagAdd = (tag: string) => {
    if (!editingPost || editingPost.tags.includes(tag)) return
    setEditingPost({ ...editingPost, tags: [...editingPost.tags, tag] })
  }

  const handleTagRemove = (tag: string) => {
    if (!editingPost) return
    setEditingPost({ ...editingPost, tags: editingPost.tags.filter((t) => t !== tag) })
  }

  return (
    <div className="min-h-screen py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold gradient-text">Blog Admin</h1>
          <Button onClick={handleCreateNew} className="ai-glow">
            <Plus className="mr-2" size={16} />
            New Article
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Posts List */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle>Articles ({posts.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{post.title || "Untitled"}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={post.published ? "default" : "secondary"} className="text-xs">
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>
                      <Edit size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Editor */}
          {editingPost && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle>{isCreating ? "Create New Article" : "Edit Article"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={editingPost.excerpt}
                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={editingPost.category}
                      onValueChange={(value) => setEditingPost({ ...editingPost, category: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Innovation">Innovation</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Philosophy">Philosophy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="readTime">Read Time</Label>
                    <Input
                      id="readTime"
                      value={editingPost.readTime}
                      onChange={(e) => setEditingPost({ ...editingPost, readTime: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">Featured Image</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="bg-gray-700 border-gray-600 text-white"
                      disabled={imageUploading}
                    />
                    {imageUploading && <div className="text-blue-400 text-sm">Uploading...</div>}
                  </div>
                  {editingPost.image && (
                    <img
                      src={editingPost.image || "/placeholder.svg"}
                      alt="Preview"
                      className="mt-2 w-32 h-20 object-cover rounded"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="content">Content (Markdown)</Label>
                  <Textarea
                    id="content"
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={8}
                    placeholder="Write your article content in Markdown..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingPost.published}
                    onCheckedChange={(checked) => setEditingPost({ ...editingPost, published: checked })}
                  />
                  <Label>Published</Label>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleSave} className="ai-glow">
                    <Save className="mr-2" size={16} />
                    Save Article
                  </Button>
                  <Button variant="outline" onClick={() => setEditingPost(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 text-center">
          <div className="text-sm text-blue-400 font-mono italic">
            "Content management system active. Knowledge base expanding." - ALVA
          </div>
        </div>
      </div>
    </div>
  )
}
