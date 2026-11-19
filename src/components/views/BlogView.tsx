import React, { useState } from 'react';
import {
  Search,
  Plus,
  Calendar,
  User,
  Trash2,
  Edit3,
  Globe,
  Clock,
  Link as LinkIcon,
  BookOpen,
  RotateCcw,
  LayoutGrid,
  List,
} from 'lucide-react';
import type { BlogPost } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { ArticleEditorModal } from './ArticleEditorModal';

interface BlogViewProps {
  blogs: BlogPost[];
  onAddBlog: (blog: BlogPost) => void;
  onUpdateBlog?: (blog: BlogPost) => void;
  onDeleteBlog: (id: string) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
  blogs,
  onAddBlog,
  onUpdateBlog,
  onDeleteBlog,
}) => {
  const { theme } = useTheme();

  // Search & View Mode States
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Article Editor Modal State (Used for both Write & Edit)
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<BlogPost | null>(null);
  const [deleteTargetBlog, setDeleteTargetBlog] = useState<BlogPost | null>(null);

  // Filtering Logic
  const filteredBlogs = blogs.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      (b.destination && b.destination.toLowerCase().includes(q)) ||
      (b.tags && b.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  // Handlers for Write & Edit
  const handleOpenWrite = () => {
    setEditingArticle(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (article: BlogPost) => {
    setEditingArticle(article);
    setIsEditorOpen(true);
  };

  const handleSaveArticle = (savedArticle: BlogPost) => {
    if (editingArticle) {
      if (onUpdateBlog) {
        onUpdateBlog(savedArticle);
      } else {
        onAddBlog(savedArticle);
      }
    } else {
      onAddBlog(savedArticle);
    }
  };

  const handleTogglePostStatus = (post: BlogPost) => {
    const nextStatus: BlogPost['status'] = post.status === 'Published' ? 'Draft' : 'Published';
    if (onUpdateBlog) {
      onUpdateBlog({ ...post, status: nextStatus });
    }
  };

  // If user clicked "Write New Article" or "Edit Article", open the dedicated full page
  if (isEditorOpen) {
    return (
      <ArticleEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingArticle(null);
        }}
        article={editingArticle}
        onSave={handleSaveArticle}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Travel Blog & Article Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Write and publish destination guides, manage tags, slug links, and Google search SEO metadata.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenWrite}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[4px] text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Search & View Switcher Bar */}
      <div
        className={`p-4 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by article title, tag e.g. #Kashmir, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                }`}
            />
          </div>

          {/* View Mode Toggle: Grid vs List & Clear Search */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition-colors cursor-pointer"
                title="Clear search"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}

            {/* View Mode Toggle: Grid vs List */}
            <div
              className={`flex items-center p-1 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                }`}
            >
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[3px] transition-colors cursor-pointer ${viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                title="Grid View (Cards)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-[3px] transition-colors cursor-pointer ${viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                title="List View (Table)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODE OUTPUT: LIST VIEW VS GRID VIEW */}
      {viewMode === 'list' ? (
        <div
          className={`rounded-[4px] border overflow-hidden shadow-xs ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
        >
          {/* Table Top Header Bar */}
          <div
            className={`px-4 py-3 border-b flex items-center justify-between gap-3 text-xs ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Travel Articles Directory
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">{filteredBlogs.length} articles</span>
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <span className="hidden sm:inline">Desktop High Density</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Live SEO Synced</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr
                  className={`border-b text-[11px] font-bold uppercase tracking-wider ${theme === 'dark'
                    ? 'border-slate-800 bg-slate-800/60 text-slate-400'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                >
                  <th className="py-3.5 pl-4 pr-3 font-bold whitespace-nowrap text-left w-14">SL. NO.</th>
                  <th className="py-3.5 px-3 font-bold whitespace-nowrap text-left">ARTICLE / TITLE</th>
                  <th className="py-3.5 px-3 font-bold whitespace-nowrap text-left">CATEGORY</th>
                  <th className="py-3.5 px-3 font-bold whitespace-nowrap text-left">DESTINATION</th>
                  <th className="py-3.5 px-3 font-bold whitespace-nowrap text-left">AUTHOR</th>
                  <th className="py-3.5 px-3 font-bold whitespace-nowrap text-left">CREATED DATE</th>
                  <th className="py-3.5 px-3 font-bold whitespace-nowrap text-center">STATUS (TOGGLE)</th>
                  <th className="py-3.5 pl-3 pr-4 font-bold whitespace-nowrap text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {filteredBlogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                      <p className="font-semibold text-base text-slate-600 dark:text-slate-300">
                        No travel articles found
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try adjusting your search query or reset filters
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredBlogs.map((post, index) => (
                    <tr
                      key={post.id}
                      className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* 1. SL. NO. */}
                      <td className="py-3.5 pl-4 pr-3 whitespace-nowrap text-xs font-medium text-slate-400 dark:text-slate-500">
                        #{index + 1}
                      </td>

                      {/* 2. ARTICLE / TITLE */}
                      <td className="py-3.5 px-3 whitespace-nowrap max-w-[320px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-12 h-9 object-cover rounded-[4px] shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="min-w-0">
                            <div
                              onClick={() => handleOpenEdit(post)}
                              className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate cursor-pointer hover:text-blue-600 transition-colors"
                              title={post.title}
                            >
                              {post.title}
                            </div>
                            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono truncate mt-0.5">
                              /blog/{post.slug || post.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. CATEGORY */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {post.category}
                        </span>
                      </td>

                      {/* 4. DESTINATION */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {post.destination ? (
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {post.destination}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">All India</span>
                        )}
                      </td>

                      {/* 5. AUTHOR */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {post.authorAvatar ? (
                            <img
                              src={post.authorAvatar}
                              alt={post.author}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500/20"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold">
                              {post.author.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {post.author}
                          </span>
                        </div>
                      </td>

                      {/* 6. CREATED DATE */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{post.publishedDate}</span>
                        </div>
                      </td>

                      {/* 7. STATUS TOGGLE BAR / SWITCH */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePostStatus(post)}
                          className="inline-flex items-center gap-2 text-xs font-bold transition-all cursor-pointer hover:opacity-80 py-1"
                          title={`Click to switch status (Currently: ${post.status})`}
                        >
                          <span
                            className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${post.status === 'Published'
                              ? 'bg-emerald-600 justify-end'
                              : 'bg-slate-300 dark:bg-slate-700 justify-start'
                              }`}
                          >
                            <span className="w-3 h-3 bg-white rounded-full shadow-xs" />
                          </span>
                          <span
                            className={
                              post.status === 'Published'
                                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                : 'text-amber-600 dark:text-amber-400 font-medium'
                            }
                          >
                            {post.status}
                          </span>
                        </button>
                      </td>

                      {/* 8. ACTIONS */}
                      <td className="py-3.5 pl-3 pr-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(post)}
                            className="px-2 py-1 rounded-[4px] text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline transition-colors cursor-pointer"
                            title="Edit Article"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetBlog(post)}
                            className="p-1 rounded-[4px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Pagination Bar */}
          <div
            className={`px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
          >
            <div className="text-slate-500 text-xs">
              Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredBlogs.length > 0 ? 1 : 0}</span> to{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{filteredBlogs.length}</span> of{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{blogs.length}</span> articles
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled
                className="px-2.5 py-1 rounded-[4px] border border-slate-200 dark:border-slate-700 text-slate-400 opacity-60 text-xs font-semibold cursor-not-allowed"
              >
                Previous
              </button>
              <button className="px-2.5 py-1 rounded-[4px] bg-blue-600 text-white text-xs font-bold shadow-xs cursor-pointer">
                1
              </button>
              <button
                disabled
                className="px-2.5 py-1 rounded-[4px] border border-slate-200 dark:border-slate-700 text-slate-400 opacity-60 text-xs font-semibold cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Article Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredBlogs.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="font-semibold text-base text-slate-600 dark:text-slate-300">
                No travel articles found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search query or reset dropdown filters
              </p>
            </div>
          ) : (
            filteredBlogs.map((post) => (
              <article
                key={post.id}
                className={`rounded-[4px] border overflow-hidden flex flex-col justify-between transition-all ${theme === 'dark'
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
                  }`}
              >
                <div>
                  {/* Cover Photo - Clean Without Badges */}
                  <div className="relative h-44 overflow-hidden group">
                    <img
                      src={post.coverImage}
                      alt={post.coverImageAlt || post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Article Info Body */}
                  <div className="p-4 space-y-2.5">
                    {/* Category & Destination Header */}
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      <span>{post.category}</span>
                      {post.destination && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-slate-600 dark:text-slate-400 font-medium">{post.destination}</span>
                        </>
                      )}
                    </div>
                    {/* Author, Date & Reading Time */}
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        {post.authorAvatar ? (
                          <img
                            src={post.authorAvatar}
                            alt={post.author}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-blue-500/20"
                          />
                        ) : (
                          <User className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {post.author}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.publishedDate}
                        </span>
                        {post.readTime && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {post.readTime}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => handleOpenEdit(post)}
                      className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 leading-snug hover:text-blue-600 cursor-pointer"
                      title={post.title}
                    >
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Permalink Link Preview */}
                    <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-mono truncate">
                      <LinkIcon className="w-3 h-3 shrink-0" />
                      <span className="truncate">krikotrip.com/blog/{post.slug || post.id}</span>
                    </div>

                    {/* Article Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold px-1.5 py-0.2 rounded-[4px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* SEO Status Indicator */}
                    {post.seoTitle && post.metaDescription && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">
                        <Globe className="w-3 h-3" />
                        <span>Google SEO Meta Configured</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Status Bar on bottom site + Edit & Delete Actions */}
                <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {/* Status Bar / Toggle Switch */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePostStatus(post);
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold transition-all cursor-pointer hover:opacity-80 py-1"
                    title={`Click to switch status (Currently: ${post.status})`}
                  >
                    <span
                      className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${post.status === 'Published'
                        ? 'bg-emerald-600 justify-end'
                        : 'bg-slate-300 dark:bg-slate-700 justify-start'
                        }`}
                    >
                      <span className="w-3 h-3 bg-white rounded-full shadow-xs" />
                    </span>
                    <span
                      className={
                        post.status === 'Published'
                          ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-amber-600 dark:text-amber-400 font-medium'
                      }
                    >
                      {post.status}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(post)}
                      className="flex items-center gap-1  text-xs font-semibold text-blue-600      transition-colors cursor-pointer"
                      title="Edit article, tags, content & SEO meta"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Article</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTargetBlog(post)}
                      className="p-1.5 rounded-[4px] text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete Article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetBlog}
        onClose={() => setDeleteTargetBlog(null)}
        onConfirm={() => {
          if (deleteTargetBlog) {
            onDeleteBlog(deleteTargetBlog.id);
            setDeleteTargetBlog(null);
          }
        }}
        itemType="Travel Article"
        itemName={deleteTargetBlog?.title}
        warningMessage="This article, its permalink, view counts, and Google SEO tags will be permanently deleted from the blog."
      />
    </div>
  );
};
