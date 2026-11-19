import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Globe,
  Tag,
  Image as ImageIcon,
  FileText,
  Clock,
  Link as LinkIcon,
  Search,
  Eye,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link2,
  Quote,
  Code,
  Minus,
  ArrowLeft,
  Plus,
  ExternalLink,
} from 'lucide-react';
import type { BlogPost } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { SUPPORTED_DESTINATIONS, getDestinationBadgeStyle } from './VendorPortalView';
import { ImageUploadField } from '../common/ImageUploadField';

interface ArticleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: BlogPost | null; // null = writing a new article, non-null = editing
  onSave: (article: BlogPost) => void;
}

export const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({
  isOpen,
  onClose,
  article,
  onSave,
}) => {
  const { theme } = useTheme();

  // Active Tab: Content & WordPress Editor vs SEO vs Live Preview
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'preview'>('content');

  // Textarea Ref for WordPress-style cursor selection formatting
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Form Fields: Core Article Info
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [author, setAuthor] = useState('Admin');
  const [authorAvatar, setAuthorAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
  );
  const [category, setCategory] = useState('Travel Guide');
  const [destination, setDestination] = useState<string>('Kashmir');
  const [status, setStatus] = useState<BlogPost['status']>('Published');
  const [readTime, setReadTime] = useState('5 min read');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80'
  );
  const [coverImageAlt, setCoverImageAlt] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  // Tags Management
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // SEO Management
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [focusKeywords, setFocusKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  // Link Inserter Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Populate or Reset when article changes
  useEffect(() => {
    if (article) {
      setTitle(article.title || '');
      setSlug(article.slug || generateSlug(article.title || ''));
      setAuthor(article.author || 'Admin');
      setAuthorAvatar(
        article.authorAvatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
      );
      setCategory(article.category || 'Travel Guide');
      setDestination(article.destination || 'Kashmir');
      setStatus(article.status || 'Published');
      setReadTime(article.readTime || '5 min read');
      setCoverImage(
        article.coverImage ||
        'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80'
      );
      setCoverImageAlt(article.coverImageAlt || '');
      setExcerpt(article.excerpt || '');
      setContent(article.content || '');
      setTags(article.tags || ['#Travel', '#Holiday']);
      setSeoTitle(article.seoTitle || article.title || '');
      setMetaDescription(article.metaDescription || article.excerpt || '');
      setCanonicalUrl(article.canonicalUrl || `https://krikotrip.com/blog/${article.slug || ''}`);
      setFocusKeywords(article.focusKeywords || ['travel guide', 'krikotrip holiday']);
    } else {
      // New Article Defaults
      setTitle('');
      setSlug('');
      setAuthor('KrikoTrip Super Admin');
      setAuthorAvatar(
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
      );
      setCategory('Travel Guide');
      setDestination('Kashmir');
      setStatus('Published');
      setReadTime('5 min read');
      setCoverImage(
        'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80'
      );
      setCoverImageAlt('Scenic travel destination view');
      setExcerpt('');
      setContent(
        '## Introduction to the Journey\n\nKashmir, rightfully crowned Paradise on Earth, welcomes travelers with emerald valleys, snow-dusted Himalayan peaks, and serene mirror-calm waters.\n\n### Key Highlights\n- Traditional Shikara ride at sunrise on Dal Lake\n- Gondola cable car ride in Gulmarg reaching 14,000 feet\n- Walk through Shalimar & Nishat Mughal Gardens\n- Savoring hot Kashmiri Kahwa with crushed almonds\n\n### Essential Travel Tips\n1. Pre-book your tourist vehicles and houseboats in advance.\n2. Keep government photo IDs handy for inner-line check posts.\n3. Pack warm woolen layers, even in early spring.\n\n> "He who has not seen Kashmir has lived in vain." — Ancient Persian proverb\n\nBook your guided packages on [KrikoTrip Tour Packages](https://krikotrip.com/tours) for the safest Himalayan experience.'
      );
      setTags(['#Kashmir', '#TravelGuide', '#Honeymoon', '#HimalayanTrek']);
      setSeoTitle('');
      setMetaDescription('');
      setCanonicalUrl('');
      setFocusKeywords(['travel guide', 'tour packages', 'kashmir trip']);
    }
    setActiveTab('content');
  }, [article, isOpen]);

  // Helper: auto-generate URL slug
  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Handle title change and auto-slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!article || !article.slug) {
      setSlug(generateSlug(val));
    }
    if (!seoTitle || seoTitle === title) {
      setSeoTitle(val ? `${val} | KrikoTrip` : '');
    }
  };

  // Tag Management Helpers
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const formattedTag = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    if (!tags.includes(formattedTag)) {
      setTags([...tags, formattedTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSuggestedTag = (tagToAdd: string) => {
    if (!tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd]);
    }
  };

  // Keyword Helpers
  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (!trimmed) return;
    if (!focusKeywords.includes(trimmed)) {
      setFocusKeywords([...focusKeywords, trimmed]);
    }
    setKeywordInput('');
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    setFocusKeywords(focusKeywords.filter((k) => k !== kwToRemove));
  };

  // WordPress-style Text Formatting Engine
  const applyFormatting = (formatType: string, customText?: string, customUrl?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let replacement = '';
    let cursorOffset = 0;

    switch (formatType) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        cursorOffset = selectedText ? replacement.length : 2;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        cursorOffset = selectedText ? replacement.length : 1;
        break;
      case 'h2':
        replacement = `\n\n## ${selectedText || 'Heading 2'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'h3':
        replacement = `\n\n### ${selectedText || 'Heading 3'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'bullet':
        if (selectedText.includes('\n')) {
          replacement =
            '\n' +
            selectedText
              .split('\n')
              .map((line) => (line.startsWith('- ') ? line : `- ${line}`))
              .join('\n') +
            '\n';
        } else {
          replacement = `\n- ${selectedText || 'Bullet point 1'}\n- Bullet point 2\n- Bullet point 3\n`;
        }
        cursorOffset = replacement.length;
        break;
      case 'number':
        if (selectedText.includes('\n')) {
          replacement =
            '\n' +
            selectedText
              .split('\n')
              .map((line, i) => `${i + 1}. ${line.replace(/^\d+\.\s*/, '')}`)
              .join('\n') +
            '\n';
        } else {
          replacement = `\n1. ${selectedText || 'First item'}\n2. Second item\n3. Third item\n`;
        }
        cursorOffset = replacement.length;
        break;
      case 'link':
        const display = customText || selectedText || 'Click here';
        const url = customUrl || 'https://krikotrip.com';
        replacement = `[${display}](${url})`;
        cursorOffset = replacement.length;
        break;
      case 'quote':
        replacement = `\n> ${selectedText || 'Write a memorable travel quote or insider recommendation here...'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'code':
        replacement = `\`${selectedText || 'code'}\``;
        cursorOffset = selectedText ? replacement.length : 1;
        break;
      case 'hr':
        replacement = `\n\n---\n\n`;
        cursorOffset = replacement.length;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + cursorOffset, start + cursorOffset);
      }
    }, 10);
  };

  const handleOpenLinkModal = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const selectedText = content.substring(textarea.selectionStart, textarea.selectionEnd);
      setLinkText(selectedText || '');
    } else {
      setLinkText('');
    }
    setLinkUrl('https://');
    setIsLinkModalOpen(true);
  };

  const handleInsertLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    applyFormatting('link', linkText.trim() || 'Link', linkUrl.trim());
    setIsLinkModalOpen(false);
  };

  // Quick Preset Photos
  const presetPhotos = [
    {
      name: 'Kashmir Shikara',
      url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Andaman Beach',
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Kerala Houseboat',
      url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Sundarban Mangrove',
      url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Gangtok Mountains',
      url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const popularSuggestedTags = [
    '#Kashmir',
    '#Andaman',
    '#Kerala',
    '#Sundarban',
    '#Gangtok',
    '#Houseboat',
    '#ScubaDiving',
    '#HimalayanTrek',
    '#Honeymoon',
    '#FamilyHoliday',
    '#TravelTips',
    '#BudgetTravel',
    '#SoloTravel',
    '#LuxuryResorts',
  ];

  const categories = [
    'Travel Guide',
    'Adventure',
    'Luxury',
    'Culture & Food',
    'Itinerary',
    'Tips & Tricks',
    'Honeymoon',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalSlug = slug.trim() || generateSlug(title);

    const savedArticle: BlogPost = {
      id: article?.id || `blog-${Date.now()}`,
      title: title.trim(),
      slug: finalSlug,
      author: author.trim() || 'Admin',
      authorAvatar,
      category,
      destination,
      publishedDate: article?.publishedDate || 'Today',
      views: article?.views || 0,
      readTime: readTime || '5 min read',
      status,
      coverImage: coverImage.trim(),
      coverImageAlt: coverImageAlt.trim() || title,
      excerpt: excerpt.trim() || title,
      content: content.trim(),
      tags: tags.length > 0 ? tags : ['#TravelGuide'],
      seoTitle: seoTitle.trim() || `${title} | KrikoTrip`,
      metaDescription: metaDescription.trim() || excerpt || title,
      canonicalUrl: canonicalUrl.trim() || `https://krikotrip.com/blog/${finalSlug}`,
      focusKeywords: focusKeywords.length > 0 ? focusKeywords : ['travel guide'],
    };

    onSave(savedArticle);
    onClose();
  };

  // Safe Inline Markdown Parser for WordPress preview
  const parseInlineMarkdown = (text: string): React.ReactNode => {
    const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      if (match[2] && match[3]) {
        parts.push(
          <a
            key={match.index}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-700 inline-flex items-center gap-0.5"
          >
            <span>{match[2]}</span>
            <ExternalLink className="w-3 h-3 inline-block opacity-70" />
          </a>
        );
      } else if (match[4]) {
        parts.push(
          <strong key={match.index} className="font-bold text-slate-900 dark:text-white">
            {match[4]}
          </strong>
        );
      } else if (match[5]) {
        parts.push(
          <em key={match.index} className="italic text-slate-800 dark:text-slate-200">
            {match[5]}
          </em>
        );
      } else if (match[6]) {
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded-[3px] bg-slate-100 dark:bg-slate-800 font-mono text-xs text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700"
          >
            {match[6]}
          </code>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Formatted content renderer for live reading view
  const renderFormattedStory = (rawText: string) => {
    if (!rawText.trim()) {
      return <p className="text-slate-400 italic">No article content written yet...</p>;
    }

    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

    const flushList = (keyPrefix: string) => {
      if (!currentList) return;
      if (currentList.type === 'ul') {
        elements.push(
          <ul
            key={`${keyPrefix}-ul`}
            className="my-3 space-y-1.5 list-disc list-inside text-slate-800 dark:text-slate-200"
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {parseInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol
            key={`${keyPrefix}-ol`}
            className="my-3 space-y-1.5 list-decimal list-inside text-slate-800 dark:text-slate-200"
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {parseInlineMarkdown(item)}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed === '---') {
        flushList(`line-${index}`);
        elements.push(<hr key={`hr-${index}`} className="my-6 border-slate-200 dark:border-slate-800" />);
        return;
      }

      if (trimmed.startsWith('## ')) {
        flushList(`line-${index}`);
        elements.push(
          <h2
            key={`h2-${index}`}
            className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-3 tracking-tight"
          >
            {trimmed.replace(/^##\s+/, '')}
          </h2>
        );
        return;
      }

      if (trimmed.startsWith('### ')) {
        flushList(`line-${index}`);
        elements.push(
          <h3
            key={`h3-${index}`}
            className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mt-5 mb-2"
          >
            {trimmed.replace(/^###\s+/, '')}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('> ')) {
        flushList(`line-${index}`);
        elements.push(
          <blockquote
            key={`quote-${index}`}
            className="my-4 pl-4 py-2 border-l-4 border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-slate-800 dark:text-slate-200 italic rounded-r-[4px]"
          >
            {parseInlineMarkdown(trimmed.replace(/^>\s+/, ''))}
          </blockquote>
        );
        return;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        const itemText = trimmed.replace(/^[-*]\s+/, '');
        if (currentList && currentList.type === 'ul') {
          currentList.items.push(itemText);
        } else {
          flushList(`line-${index}`);
          currentList = { type: 'ul', items: [itemText] };
        }
        return;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const itemText = trimmed.replace(/^\d+\.\s+/, '');
        if (currentList && currentList.type === 'ol') {
          currentList.items.push(itemText);
        } else {
          flushList(`line-${index}`);
          currentList = { type: 'ol', items: [itemText] };
        }
        return;
      }

      flushList(`line-${index}`);
      if (!trimmed) {
        elements.push(<div key={`empty-${index}`} className="h-2" />);
      } else {
        elements.push(
          <p key={`p-${index}`} className="leading-relaxed text-slate-700 dark:text-slate-300">
            {parseInlineMarkdown(trimmed)}
          </p>
        );
      }
    });

    flushList('final');
    return elements;
  };

  if (!isOpen) return null;

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* TOP BREADCRUMBS & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            {article ? `Edit Article: ${article.title}` : 'Write New Travel Article'}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-[4px] font-semibold border ${getDestinationBadgeStyle(
              destination
            )}`}
          >
            {destination}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Selector */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BlogPost['status'])}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-[4px] border outline-none cursor-pointer ${status === 'Published'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
              : status === 'Scheduled'
                ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
              }`}
          >
            <option value="Published">● Published</option>
            <option value="Draft">○ Draft</option>
            <option value="Scheduled">⏰ Scheduled</option>
          </select>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-1.5 text-xs font-semibold rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{article ? 'Save Changes' : 'Publish Article'}</span>
          </button>
        </div>
      </div>

      {/* MAIN CARD CONTAINER */}
      <div
        className={`w-full rounded-[4px] border shadow-xs overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
      >
        {/* HEADER BAR */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50/90'
            }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-blue-600 text-white flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                  {article ? `Edit Article: ${article.title}` : 'Write New Travel Article'}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-[4px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold">
                  {category}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium">
                  {wordCount} Words
                </span>
                <span className="text-xs px-2 py-0.5 rounded-[4px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-medium">
                  {readTime}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                WordPress-style rich content editor with bold, bullet points, numbers, links, interactive tag list & Google SEO
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-200 dark:border-slate-800 select-none bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`px-4 py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'content'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Story & WordPress Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'seo'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>SEO & Google Search Meta</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-[4px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold">
              Google Preview
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'preview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-500" />
            <span>Live Article Reader Preview</span>
          </button>
        </div>

        {/* TAB 1: ARTICLE CONTENT & WORDPRESS RICH TEXT EDITOR */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {activeTab === 'content' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Headline, WordPress Toolbar, Content & Cover (2 cols) */}
              <div className="lg:col-span-2 space-y-5">
                {/* Article Headline */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Article Title / Headline *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10 Secret Hidden Gems in Kashmir You Won't Find on Google"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-sm sm:text-base font-semibold rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                      }`}
                  />
                </div>

                {/* Article Slug / Permalink */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                      <span>Article Permalink Slug *</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSlug(generateSlug(title))}
                      className="text-[11px] text-blue-600 hover:underline capitalize cursor-pointer font-semibold"
                    >
                      Regenerate from Title
                    </button>
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-[4px] text-slate-500 select-none truncate">
                      krikotrip.com/blog/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="kashmir-hidden-gems-travel-guide"
                      value={slug}
                      onChange={(e) => setSlug(generateSlug(e.target.value))}
                      className={`flex-1 px-3 py-2 text-xs font-mono rounded-r-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-blue-300 focus:border-blue-500'
                        : 'bg-white border-slate-200 text-blue-700 focus:border-blue-600'
                        }`}
                    />
                  </div>
                </div>

                {/* Excerpt / Short Summary */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Article Summary / Excerpt *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Brief 2-sentence synopsis displayed on article cards, search results, and social previews..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none resize-none leading-relaxed ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                      }`}
                  />
                </div>

                {/* WORDPRESS-STYLE RICH EDITOR CONTAINER */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-[4px] overflow-hidden shadow-xs">
                  {/* WordPress Toolbar Header */}
                  <div
                    className={`p-2 border-b flex items-center justify-between gap-1 flex-wrap ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-100/90 border-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1.5 hidden sm:inline">
                        Tools:
                      </span>

                      {/* Bold Text */}
                      <button
                        type="button"
                        onClick={() => applyFormatting('bold')}
                        title="Bold Text (**text**)"
                        className="p-1.5 rounded-[3px] border border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Bold className="w-4 h-4" />
                      </button>

                      {/* Italic Text */}
                      <button
                        type="button"
                        onClick={() => applyFormatting('italic')}
                        title="Italic Text (*text*)"
                        className="p-1.5 rounded-[3px] border border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Italic className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>

                      {/* Heading 2 */}
                      <button
                        type="button"
                        onClick={() => applyFormatting('h2')}
                        title="Heading 2 (## Section Title)"
                        className="px-2 py-1 rounded-[3px] border border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Heading2 className="w-4 h-4" />
                        <span>H2</span>
                      </button>

                      {/* Heading 3 */}
                      <button
                        type="button"
                        onClick={() => applyFormatting('h3')}
                        title="Heading 3 (### Subtitle)"
                        className="px-2 py-1 rounded-[3px] border border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Heading3 className="w-4 h-4" />
                        <span>H3</span>
                      </button>

                      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>

                      {/* Bullet List */}
                      <button
                        type="button"
                        onClick={() => applyFormatting('bullet')}
                        title="Bullet Points List (- item)"
                        className="p-1.5 rounded-[3px] border border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <List className="w-4 h-4" />
                      </button>

                      {/* Numbered List */}
                      <button
                        type="button"
                        onClick={() => applyFormatting('number')}
                        title="Numbered List (1. item)"
                        className="p-1.5 rounded-[3px] border border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>

                      {/* Add Link */}
                      <button
                        type="button"
                        onClick={handleOpenLinkModal}
                        title="Insert Hyperlink ([Anchor](URL))"
                        className="px-2 py-1 rounded-[3px] border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 text-xs font-semibold text-blue-700 dark:text-blue-300 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Link2 className="w-4 h-4" />
                        <span>Link</span>
                      </button>

                      {/* Quote */}
                      <button
                        type="button"
                        onClick={() => applyFormatting('quote')}
                        title="Blockquote (> Quote)"
                        className="p-1.5 rounded-[3px] border border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Quote className="w-4 h-4" />
                      </button>

                      {/* Code */}
                      <button
                        type="button"
                        onClick={() => applyFormatting('code')}
                        title="Inline Code (`code`)"
                        className="p-1.5 rounded-[3px] border border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Code className="w-4 h-4" />
                      </button>

                      {/* Divider / HR */}
                      <button
                        type="button"
                        onClick={() => applyFormatting('hr')}
                        title="Horizontal Divider (---)"
                        className="p-1.5 rounded-[3px] border border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span>{wordCount} words</span>
                      <span>•</span>
                      <span>{charCount} chars</span>
                    </div>
                  </div>

                  {/* Textarea Editor */}
                  <textarea
                    ref={textareaRef}
                    rows={14}
                    required
                    placeholder="Write your article using WordPress tools above: Use Bold, Italic, Headings (H2/H3), Bullet points, Numbered steps, and Links..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`w-full p-4 text-xs sm:text-sm outline-none resize-y leading-relaxed font-sans ${theme === 'dark'
                      ? 'bg-slate-900 text-white focus:bg-slate-850'
                      : 'bg-white text-slate-900 focus:bg-slate-50/50'
                      }`}
                  />
                </div>

                {/* Cover Photo / Image Section */}
                <div
                  className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                      <span>Article Cover Photo & Alt Text</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Recommended: 1200x630 (16:9)</span>
                  </div>

                  <div className="space-y-3">
                    <ImageUploadField
                      value={coverImage}
                      onChange={setCoverImage}
                      aspectRatio="16/9"
                      placeholder="Choose Cover Image or Drag & Drop"
                    />

                    <input
                      type="text"
                      placeholder="Photo Alt Text (e.g. Shikara boat on Dal Lake at sunrise)"
                      value={coverImageAlt}
                      onChange={(e) => setCoverImageAlt(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                        }`}
                    />
                    {/* Quick Preset Photos */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-slate-400">Quick Presets:</span>
                      {presetPhotos.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setCoverImage(p.url);
                            setCoverImageAlt(p.name);
                          }}
                          className="px-2 py-0.5 rounded-[4px] bg-slate-200 dark:bg-slate-700 text-[10px] font-semibold hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Publishing Info & WordPress Tag List System (1 col) */}
              <div className="space-y-4">
                {/* Meta Attributes Panel */}
                <div
                  className={`p-4 rounded-[4px] border space-y-3.5 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                >
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2">
                    Publishing & Author Info
                  </h4>

                  {/* Author Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Author Byline
                    </label>
                    <div className="flex items-center gap-2">
                      <img
                        src={authorAvatar}
                        alt={author}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500/30 shrink-0"
                      />
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className={`flex-1 px-2.5 py-1.5 text-xs rounded-[4px] border outline-none ${theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-200 text-slate-900'
                          }`}
                      />
                    </div>
                  </div>

                  {/* Category Dropdown */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Article Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-xs font-semibold rounded-[4px] border outline-none cursor-pointer ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                        }`}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination Dropdown */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Target Destination Territory
                    </label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-xs font-semibold rounded-[4px] border outline-none cursor-pointer ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                        }`}
                    >
                      {SUPPORTED_DESTINATIONS.map((d) => (
                        <option key={d} value={d}>
                          {d} Territory
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Read Time */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Estimated Reading Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5 min read"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-xs rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                        }`}
                    />
                  </div>
                </div>

                {/* WORDPRESS TAG LIST MANAGEMENT SYSTEM */}
                <div
                  className={`p-4 rounded-[4px] border space-y-3 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-500" />
                      <span>Article Tag List ({tags.length})</span>
                    </h4>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                      WordPress Tags
                    </span>
                  </div>

                  {/* Tag Input Field with Enter key & Add button */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Type tag e.g. #DalLake"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className={`flex-1 px-2.5 py-1.5 text-xs rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 inline mr-1" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Active Tags List Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap min-h-[38px] p-2 bg-white dark:bg-slate-900 rounded-[4px] border border-slate-200 dark:border-slate-700">
                    {tags.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">No tags added yet. Type a tag above.</span>
                    ) : (
                      tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-xs font-semibold bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                        >
                          <span>{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="hover:text-rose-600 transition-colors cursor-pointer ml-0.5"
                            title={`Remove ${t}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Suggested Popular Tags Cloud */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                      Quick Suggested Tags:
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {popularSuggestedTags.map((pt) => {
                        const isAdded = tags.includes(pt);
                        return (
                          <button
                            key={pt}
                            type="button"
                            onClick={() => handleAddSuggestedTag(pt)}
                            className={`px-2 py-0.5 rounded-[4px] text-[10px] font-medium transition-colors cursor-pointer ${isAdded
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 cursor-default opacity-60'
                              : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-slate-600'
                              }`}
                          >
                            {pt} {isAdded && '✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEO & GOOGLE SEARCH METADATA */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              {/* Google SERP Snippet Preview */}
              <div
                className={`p-4 sm:p-5 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-3">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Live Google Search Snippet Preview
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Desktop & Mobile SERP</span>
                </div>

                {/* Google Card Simulation */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-[4px] border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-mono text-[11px] truncate">
                      {canonicalUrl || `https://krikotrip.com/blog/${slug || 'article-slug'}`}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer truncate">
                    {seoTitle || (title ? `${title} | KrikoTrip` : 'Travel Article Title | KrikoTrip')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {metaDescription ||
                      excerpt ||
                      'Discover scenic viewpoints, verified itineraries, local food recommendations, and travel guides curated by KrikoTrip.'}
                  </p>
                </div>
              </div>

              {/* SEO Title Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    SEO Meta Title *
                  </label>
                  <span
                    className={`text-[11px] font-semibold ${seoTitle.length > 60 ? 'text-amber-500' : 'text-slate-400'
                      }`}
                  >
                    {seoTitle.length} / 60 characters
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 10 Secret Hidden Gems in Kashmir You Won't Find on Google | KrikoTrip"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                    }`}
                />
              </div>

              {/* Meta Description Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    SEO Meta Description *
                  </label>
                  <span
                    className={`text-[11px] font-semibold ${metaDescription.length > 160 ? 'text-amber-500' : 'text-slate-400'
                      }`}
                  >
                    {metaDescription.length} / 160 characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Search engine summary. Include primary destination keywords, package value, and a strong call-to-action..."
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none resize-none leading-relaxed ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
                    }`}
                />
              </div>

              {/* Canonical URL & Focus Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Canonical URL Link
                  </label>
                  <input
                    type="url"
                    placeholder={`https://krikotrip.com/blog/${slug || ''}`}
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    className={`w-full px-3 py-2 text-xs font-mono rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-blue-300'
                      : 'bg-white border-slate-200 text-blue-700'
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Add Focus Keywords
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. kashmir tour packages"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                      className={`flex-1 px-3 py-2 text-xs rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="px-3 py-2 rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Focus Keywords Pills */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Active Focus Keywords ({focusKeywords.length})
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {focusKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    >
                      <span>{kw}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE ARTICLE READER PREVIEW */}
          {activeTab === 'preview' && (
            <div className="max-w-3xl mx-auto space-y-6 py-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-[4px] text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {category}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-[4px] text-xs font-semibold border ${getDestinationBadgeStyle(
                    destination
                  )}`}
                >
                  {destination} Territory
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                  <Clock className="w-3.5 h-3.5" />
                  {readTime}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                {title || 'Untitled Travel Article'}
              </h1>

              {/* Author & Date Bar */}
              <div className="flex items-center gap-3 py-2 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <img
                  src={authorAvatar}
                  alt={author}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">{author}</span>
                  <span className="text-[11px] text-slate-400">Published on {article?.publishedDate || 'Today'}</span>
                </div>
              </div>

              {/* Featured Cover Image */}
              {coverImage && (
                <div className="rounded-[4px] overflow-hidden border border-slate-200 dark:border-slate-800 h-64 sm:h-80">
                  <img
                    src={coverImage}
                    alt={coverImageAlt || title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Excerpt Lead Paragraph */}
              <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed border-l-4 border-blue-600 pl-4 bg-slate-50 dark:bg-slate-800/40 py-2 rounded-r-[4px]">
                {excerpt || 'Article summary excerpt...'}
              </p>

              {/* Rendered Body with WordPress Headings, Bullets, Numbers, Bold, Links */}
              <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans space-y-1">
                {renderFormattedStory(content)}
              </div>

              {/* Tags Section */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-400">Tags:</span>
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-[4px] bg-slate-100 dark:bg-slate-800 text-xs text-blue-600 dark:text-blue-400 font-semibold"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* BOTTOM ACTIONS BAR */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-mono text-[11px] truncate max-w-xs sm:max-w-md">
                krikotrip.com/blog/{slug || 'new-article'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] shadow-xs cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>{article ? 'Save Changes' : 'Publish Article'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* INTERACTIVE LINK INSERTION MODAL */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div
            className={`w-full max-w-md p-5 rounded-[4px] border shadow-2xl ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Insert Hyperlink (WordPress Style)</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1 rounded-[4px] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertLinkSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Anchor / Display Text
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. View Kashmir Tour Packages"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className={`w-full p-2 text-xs rounded-[4px] border outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Target Destination URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://krikotrip.com/tours/kashmir-paradise"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className={`w-full p-2 text-xs rounded-[4px] border outline-none font-mono ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-[4px] transition-colors"
                >
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
