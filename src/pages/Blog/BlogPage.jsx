import React, { useEffect, useState, useContext, useCallback } from "react";
import api from "../../hooks/api";
import ThemeContext from "../../components/layout/ThemeContext";
import { useToast } from "../../components/ui/toast";
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiPlus,
  FiCalendar,
  FiImage,
  FiSearch,
  FiBookOpen,
  FiClock,
  FiUploadCloud,
  FiLink,
  FiX,
  FiCheckCircle,
} from "react-icons/fi";

const getApiOrigin = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  return envUrl.replace(/\/api\/?$/, "");
};

const API_ORIGIN = getApiOrigin();

// Helper to format image URLs correctly for display & convert webpage links to direct image URLs
const resolveImageUrl = (url) => {
  if (!url) return null;
  let str = String(url).trim();

  // Auto-convert Unsplash webpage page URLs (e.g. https://unsplash.com/photos/slug-id) to direct image stream
  if (str.includes("unsplash.com/photos/")) {
    const slug = str.split("unsplash.com/photos/")[1]?.split("?")[0]?.split("/")[0];
    if (slug) {
      const parts = slug.split("-");
      const photoId = parts[parts.length - 1];
      if (photoId) {
        return `https://unsplash.com/photos/${photoId}/download?w=1000`;
      }
    }
  }

  // Auto-convert Imgur webpage page URLs (e.g. https://imgur.com/id -> https://i.imgur.com/id.jpg)
  if (str.includes("imgur.com/") && !str.includes("i.imgur.com/")) {
    const id = str.split("imgur.com/")[1]?.split("?")[0]?.split("/")[0];
    if (id && !id.includes(".")) {
      return `https://i.imgur.com/${id}.jpg`;
    }
  }

  if (str.startsWith("http://") || str.startsWith("https://") || str.startsWith("data:")) {
    return str;
  }

  const cleanPath = str.startsWith("/") ? str : `/${str}`;
  return `${API_ORIGIN}${cleanPath}`;
};

// Robust Blog Image Component supporting public URLs & uploaded local files
const BlogImage = ({ src, alt, className = "w-full h-full object-cover" }) => {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = resolveImageUrl(src);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!resolvedUrl || hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 gap-1 text-xs p-2 text-center">
        <FiImage size={24} className="text-gray-400 opacity-60" />
        <span className="font-medium text-[11px] truncate max-w-full">
          {src ? "Image Link Unavailable" : "No Header Image"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt || "Blog image"}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};

const BlogPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";
  const { success, error } = useToast();

  // State
  const [blogs, setBlogs] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [viewingBlog, setViewingBlog] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    blogDetail: "",
    date: new Date().toISOString().split("T")[0],
    image: "",
  });
  const [imageMode, setImageMode] = useState("file"); // "file" | "url"
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch blogs list with pagination
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/blogs", {
        params: { page: currentPage, limit: pageSize },
      });
      if (res.data?.items) {
        setBlogs(res.data.items);
        setTotalCount(res.data.total || res.data.items.length);
      } else if (Array.isArray(res.data)) {
        setBlogs(res.data);
        setTotalCount(res.data.length);
      } else {
        setBlogs([]);
        setTotalCount(0);
      }
    } catch (err) {
      error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, error]);

  // Fetch recent blogs (limit 3)
  const fetchRecentBlogs = useCallback(async () => {
    try {
      const res = await api.get("/blogs/recent", { params: { limit: 3 } });
      setRecentBlogs(Array.isArray(res.data) ? res.data : []);
    } catch {
      // Ignore recent fetch error
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
    fetchRecentBlogs();
  }, [fetchBlogs, fetchRecentBlogs]);

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setFormError("Please select a valid image file (JPG, PNG, WEBP, GIF).");
        return;
      }
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, image: "" }));
      setFormError("");
    }
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingBlog(null);
    setFormData({
      blogDetail: "",
      date: new Date().toISOString().split("T")[0],
      image: "",
    });
    setImageMode("file");
    clearFileSelection();
    setFormError("");
    setShowFormModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);
    const hasPublicUrl = blog.image && (blog.image.startsWith("http://") || blog.image.startsWith("https://"));
    setFormData({
      blogDetail: blog.blogDetail || "",
      date: blog.date ? blog.date.split("T")[0] : new Date().toISOString().split("T")[0],
      image: hasPublicUrl ? blog.image : "",
    });
    setImageMode(hasPublicUrl ? "url" : "file");
    clearFileSelection();
    setFormError("");
    setShowFormModal(true);
  };

  // Submit Create / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.blogDetail || formData.blogDetail.trim().length < 3) {
      setFormError("Blog detail must be at least 3 characters.");
      return;
    }
    if (!formData.date) {
      setFormError("Date is required.");
      return;
    }

    try {
      setSubmitting(true);
      const postData = new FormData();
      postData.append("blogDetail", formData.blogDetail.trim());
      postData.append("date", formData.date);

      // Smart submission logic: send local file if attached, or public image URL string
      if (selectedFile) {
        postData.append("imageFile", selectedFile);
      } else if (formData.image.trim()) {
        postData.append("image", formData.image.trim());
      } else {
        postData.append("image", "");
      }

      if (editingBlog) {
        await api.put(`/blogs/${editingBlog.id}`, postData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        success("Blog post updated successfully");
      } else {
        await api.post("/blogs", postData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        success("Blog post created successfully");
      }

      setShowFormModal(false);
      setEditingBlog(null);
      clearFileSelection();
      fetchBlogs();
      fetchRecentBlogs();
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to save blog post"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Blog
  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await api.delete(`/blogs/${confirmDeleteId}`);
      success("Blog post deleted successfully");
      setConfirmDeleteId(null);
      fetchBlogs();
      fetchRecentBlogs();
    } catch {
      error("Failed to delete blog post");
    }
  };

  // Filtered blogs for local search
  const filteredBlogs = blogs.filter((b) =>
    (b.blogDetail || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // UI Colors
  const cardBg = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const subTextColor = isDark ? "text-gray-400" : "text-gray-500";
  const inputBg = isDark
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
    : "bg-white border-gray-300 text-gray-900";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div
        className={`p-6 rounded-xl shadow border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${cardBg}`}
      >
        <div>
          <div className="flex items-center gap-2">
            <FiBookOpen className="text-blue-500 text-xl" />
            <h2 className={`text-xl font-bold ${textColor}`}>Blogs & Announcements</h2>
          </div>
          <p className={`text-xs mt-1 ${subTextColor}`}>
            Publish, manage, and read school news, announcements, and blog articles
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className={`${theme.primary} text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow flex items-center gap-2 hover:opacity-90 transition`}
        >
          <FiPlus size={18} />
          <span>New Blog Post</span>
        </button>
      </div>

      {/* Recent Posts Showcase (Top 3) */}
      {recentBlogs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FiClock className="text-purple-500" />
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${subTextColor}`}>
              Recent Announcements
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentBlogs.map((item) => (
              <div
                key={item.id}
                onClick={() => setViewingBlog(item)}
                className={`p-4 rounded-xl border shadow-sm cursor-pointer transition hover:shadow-md hover:border-blue-400 flex flex-col justify-between ${cardBg}`}
              >
                <div>
                  {item.image && (
                    <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-gray-100 dark:bg-gray-700">
                      <BlogImage src={item.image} alt="Recent post header" />
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-blue-500 font-medium mb-2">
                    <FiCalendar size={14} />
                    <span>
                      {new Date(item.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className={`text-sm font-medium line-clamp-3 ${textColor}`}>
                    {item.blogDetail}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-blue-500 hover:underline">
                  <span>Read Full Post &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Blog List Section */}
      <div className={`p-6 rounded-xl shadow border space-y-4 ${cardBg}`}>
        {/* Search & Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search blog content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
            />
          </div>

          <div className="text-xs text-gray-500 flex items-center justify-between sm:justify-end gap-2">
            <span>Total Posts: <strong>{totalCount}</strong></span>
          </div>
        </div>

        {/* Blog Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading blog posts...</div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FiBookOpen size={40} className="mx-auto mb-2 opacity-50" />
            <p>No blog posts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBlogs.map((blog) => (
              <div
                key={blog.id}
                className={`rounded-xl border p-5 flex flex-col justify-between shadow-sm hover:shadow transition ${
                  isDark ? "bg-gray-800/80 border-gray-700" : "bg-gray-50/50 border-gray-200"
                }`}
              >
                <div className="space-y-3">
                  {/* Blog Image */}
                  <div className="w-full h-44 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <BlogImage src={blog.image} alt="Blog header" />
                  </div>

                  {/* Date Badge */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700 font-medium">
                      <FiCalendar size={12} />
                      {new Date(blog.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>

                    <span className={`text-[11px] ${subTextColor}`}>
                      ID #{blog.id}
                    </span>
                  </div>

                  {/* Blog Detail Text */}
                  <p className={`text-sm whitespace-pre-wrap line-clamp-4 leading-relaxed ${textColor}`}>
                    {blog.blogDetail}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="mt-5 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <button
                    onClick={() => setViewingBlog(blog)}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1"
                  >
                    <FiEye size={14} />
                    View Details
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(blog)}
                      title="Edit Post"
                      className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 transition"
                    >
                      <FiEdit size={16} />
                    </button>

                    <button
                      onClick={() => setConfirmDeleteId(blog.id)}
                      title="Delete Post"
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className={subTextColor}>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className={`px-2 py-1 rounded border ${inputBg}`}
            >
              {[6, 10, 20, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={`px-3 py-1.5 rounded border disabled:opacity-40 ${
                isDark ? "border-gray-700 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              Previous
            </button>

            <span className={textColor}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`px-3 py-1.5 rounded border disabled:opacity-40 ${
                isDark ? "border-gray-700 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-lg rounded-xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh] ${
              isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            {/* Header */}
            <div
              className={`px-6 py-4 border-b flex justify-between items-center ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <h3 className={`text-base font-semibold ${textColor}`}>
                {editingBlog ? `Edit Blog Post (ID #${editingBlog.id})` : "Create Blog Post"}
              </h3>
              <button
                onClick={() => {
                  setShowFormModal(false);
                  clearFileSelection();
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
              {formError && (
                <div className="bg-red-50 border border-red-300 text-red-700 text-xs rounded px-3 py-2 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300">
                  {formError}
                </div>
              )}

              {/* Date */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${subTextColor}`}>
                  Publication Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
                />
              </div>

              {/* Image Source Mode Selector */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={`block text-xs font-medium ${subTextColor}`}>
                    Header Image (Optional)
                  </label>

                  <div className="flex gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setImageMode("file")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                        imageMode === "file"
                          ? "bg-blue-600 text-white"
                          : isDark
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <FiUploadCloud size={12} /> Upload File
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                        imageMode === "url"
                          ? "bg-blue-600 text-white"
                          : isDark
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <FiLink size={12} /> Public Image URL
                      </span>
                    </button>
                  </div>
                </div>

                {imageMode === "file" ? (
                  <div className="space-y-2">
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center ${
                        isDark ? "border-gray-700 bg-gray-800/40" : "border-gray-300 bg-gray-50"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        id="blog-image-file"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="blog-image-file"
                        className="cursor-pointer flex flex-col items-center justify-center gap-1 text-xs text-blue-500 hover:underline"
                      >
                        <FiUploadCloud size={24} className="text-blue-500 mb-1" />
                        <span className="font-semibold">Click to upload image from machine</span>
                        <span className="text-[11px] text-gray-400">JPG, PNG, WEBP, GIF up to 10MB</span>
                      </label>
                    </div>

                    {/* Preview of selected local file */}
                    {filePreview && (
                      <div className="relative rounded-lg overflow-hidden border border-blue-300 dark:border-blue-700 h-28 bg-gray-100 dark:bg-gray-800">
                        <img src={filePreview} alt="Selected preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={clearFileSelection}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow"
                        >
                          <FiX size={14} />
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate flex items-center gap-1">
                          <FiCheckCircle className="text-green-400" />
                          <span>{selectedFile?.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or https://unsplash.com/photos/..."
                      value={formData.image}
                      onChange={(e) => {
                        clearFileSelection();
                        setFormData({ ...formData, image: e.target.value });
                      }}
                      className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
                    />
                    <p className={`text-[11px] ${subTextColor}`}>
                      Paste any public web image URL or Unsplash photo link
                    </p>

                    {/* Live Preview for Public URL */}
                    {formData.image.trim() && (
                      <div className="rounded-lg overflow-hidden border border-blue-300 dark:border-blue-700 h-28 bg-gray-100 dark:bg-gray-800 relative">
                        <BlogImage src={formData.image.trim()} alt="Public URL Live Preview" />
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate flex items-center gap-1">
                          <FiCheckCircle className="text-green-400" />
                          <span>URL Image Live Preview</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Blog Detail / Content */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${subTextColor}`}>
                  Blog Content / Announcement Detail
                </label>
                <textarea
                  rows={6}
                  required
                  minLength={3}
                  placeholder="Write the full announcement or blog post details here..."
                  value={formData.blogDetail}
                  onChange={(e) => setFormData({ ...formData, blogDetail: e.target.value })}
                  className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
                />
              </div>

              {/* Footer */}
              <div
                className={`pt-4 border-t flex justify-end gap-3 ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false);
                    clearFileSelection();
                  }}
                  className={`px-4 py-2 rounded border ${
                    isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`${theme.primary} text-white px-5 py-2 rounded font-medium disabled:opacity-50`}
                >
                  {submitting ? (editingBlog ? "Saving..." : "Publishing...") : editingBlog ? "Update Post" : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW BLOG DETAIL MODAL */}
      {viewingBlog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-lg rounded-xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh] ${
              isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`px-6 py-4 border-b flex justify-between items-center ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <h3 className={`text-base font-semibold ${textColor}`}>
                Blog Announcement (ID #{viewingBlog.id})
              </h3>
              <button
                onClick={() => setViewingBlog(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
              {viewingBlog.image && (
                <div className="w-full h-56 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <BlogImage src={viewingBlog.image} alt="Blog main" />
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-blue-500 font-medium">
                <FiCalendar size={14} />
                <span>
                  {new Date(viewingBlog.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div
                className={`p-4 rounded-lg border leading-relaxed whitespace-pre-wrap ${
                  isDark ? "bg-gray-800/60 border-gray-700 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-800"
                }`}
              >
                {viewingBlog.blogDetail}
              </div>
            </div>

            <div
              className={`px-6 py-3 border-t flex justify-end ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => setViewingBlog(null)}
                className={`px-4 py-2 rounded border text-xs ${
                  isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`p-6 rounded-xl shadow-xl border w-full max-w-sm ${
              isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <h3 className={`text-lg font-semibold mb-2 ${textColor}`}>Delete Blog Post</h3>
            <p className={`text-xs mb-5 ${subTextColor}`}>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className={`px-4 py-2 text-xs rounded border ${
                  isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-xs rounded bg-red-600 hover:bg-red-700 text-white font-medium shadow transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
