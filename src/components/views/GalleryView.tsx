import React, { useState } from 'react'
import {
  UploadCloud,
  MapPin,
  Trash2,
  Maximize2,
  X,
  Edit2,
  FolderPlus,
  Eye,
  EyeOff,
  Loader2,
  Search,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { DeleteConfirmModal } from '../common/DeleteConfirmModal'
import { ImageUploadField } from '../common/ImageUploadField'
import {
  useGalleryCategoriesQuery,
  useCreateGalleryCategoryMutation,
  useUpdateGalleryCategoryMutation,
  useDeleteGalleryCategoryMutation,
  useGalleryItemsQuery,
  useCreateGalleryItemMutation,
  useUpdateGalleryItemMutation,
  useToggleGalleryItemStatusMutation,
  useDeleteGalleryItemMutation,
  type AdminGalleryCategory,
  type AdminGalleryItem,
} from '../../api/gallery'

export interface GalleryViewProps {}

export const GalleryView: React.FC<GalleryViewProps> = () => {
  const { theme } = useTheme()

  const { data: categories = [], isLoading: isLoadingCategories } = useGalleryCategoriesQuery()
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const activeCategory = categories.find((c) => c.slug === selectedCategorySlug)

  const { data: galleryResult, isLoading: isLoadingPhotos } = useGalleryItemsQuery({
    categoryId: activeCategory?.id,
    q: searchQuery.trim() || undefined,
    limit: 100,
  })

  const photos = galleryResult?.data ?? []

  const createItemMutation = useCreateGalleryItemMutation()
  const updateItemMutation = useUpdateGalleryItemMutation()
  const toggleStatusMutation = useToggleGalleryItemStatusMutation()
  const deleteItemMutation = useDeleteGalleryItemMutation()

  const createCategoryMutation = useCreateGalleryCategoryMutation()
  const updateCategoryMutation = useUpdateGalleryCategoryMutation()
  const deleteCategoryMutation = useDeleteGalleryCategoryMutation()

  const [activePreview, setActivePreview] = useState<AdminGalleryItem | null>(null)
  const [deleteTargetImage, setDeleteTargetImage] = useState<AdminGalleryItem | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState<AdminGalleryItem | null>(null)

  const [photoTitle, setPhotoTitle] = useState('')
  const [photoLocation, setPhotoLocation] = useState('')
  const [photoCategoryId, setPhotoCategoryId] = useState('')
  const [photoAspect, setPhotoAspect] = useState<'landscape' | 'portrait' | 'wide'>('landscape')
  const [photoDisplayOrder, setPhotoDisplayOrder] = useState(0)
  const [photoImageUrl, setPhotoImageUrl] = useState('')
  const [photoImageMediaId, setPhotoImageMediaId] = useState('')
  const [photoError, setPhotoError] = useState<string | null>(null)

  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminGalleryCategory | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [categoryDisplayOrder, setCategoryDisplayOrder] = useState(0)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [deleteTargetCategory, setDeleteTargetCategory] = useState<AdminGalleryCategory | null>(null)

  const openUploadModal = (item?: AdminGalleryItem) => {
    setPhotoError(null)
    if (item) {
      setEditingPhoto(item)
      setPhotoTitle(item.title)
      setPhotoLocation(item.location || '')
      setPhotoCategoryId(item.categoryId)
      setPhotoAspect(item.aspect)
      setPhotoDisplayOrder(item.displayOrder)
      setPhotoImageUrl(item.imageUrl)
      setPhotoImageMediaId(item.imageMediaId)
    } else {
      setEditingPhoto(null)
      setPhotoTitle('')
      setPhotoLocation('')
      setPhotoCategoryId(categories[0]?.id || '')
      setPhotoAspect('landscape')
      setPhotoDisplayOrder(0)
      setPhotoImageUrl('')
      setPhotoImageMediaId('')
    }
    setIsUploadOpen(true)
  }

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPhotoError(null)

    if (!photoTitle.trim()) {
      setPhotoError('Title is required')
      return
    }
    if (!photoCategoryId) {
      setPhotoError('Please select a category')
      return
    }
    if (!photoImageUrl || !photoImageMediaId) {
      setPhotoError('Please upload an image')
      return
    }

    try {
      if (editingPhoto) {
        await updateItemMutation.mutateAsync({
          id: editingPhoto.id,
          input: {
            title: photoTitle.trim(),
            location: photoLocation.trim() || null,
            categoryId: photoCategoryId,
            imageMediaId: photoImageMediaId,
            aspect: photoAspect,
            displayOrder: photoDisplayOrder,
            isActive: editingPhoto.isActive,
          },
        })
      } else {
        await createItemMutation.mutateAsync({
          title: photoTitle.trim(),
          location: photoLocation.trim() || null,
          categoryId: photoCategoryId,
          imageMediaId: photoImageMediaId,
          aspect: photoAspect,
          displayOrder: photoDisplayOrder,
          isActive: true,
        })
      }
      setIsUploadOpen(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save photo'
      setPhotoError(msg)
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCategoryError(null)

    if (!categoryName.trim()) {
      setCategoryError('Category name is required')
      return
    }

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          input: {
            name: categoryName.trim(),
            displayOrder: categoryDisplayOrder,
          },
        })
      } else {
        await createCategoryMutation.mutateAsync({
          name: categoryName.trim(),
          displayOrder: categoryDisplayOrder,
        })
      }
      setEditingCategory(null)
      setCategoryName('')
      setCategoryDisplayOrder(0)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save category'
      setCategoryError(msg)
    }
  }

  const handleDeleteCategory = async () => {
    if (!deleteTargetCategory) return
    setCategoryError(null)
    try {
      await deleteCategoryMutation.mutateAsync(deleteTargetCategory.id)
      setDeleteTargetCategory(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cannot delete category with associated photos'
      setCategoryError(msg)
    }
  }

  return (
    <div className="space-y-5">
      <div
        className={`p-4 rounded-[4px] border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategorySlug('all')}
            className={`px-3.5 py-1.5 rounded-[4px] text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategorySlug === 'all'
                ? 'bg-blue-600 text-white'
                : theme === 'dark'
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            All Photos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategorySlug(cat.slug)}
              className={`px-3.5 py-1.5 rounded-[4px] text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategorySlug === cat.slug
                  ? 'bg-blue-600 text-white'
                  : theme === 'dark'
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setEditingCategory(null)
              setCategoryName('')
              setCategoryDisplayOrder(categories.length + 1)
              setCategoryError(null)
              setIsManageCategoriesOpen(true)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold whitespace-nowrap border transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Manage Categories</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] border text-sm ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search title, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-36 sm:w-48 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => openUploadModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-[4px] text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Photo</span>
          </button>
        </div>
      </div>

      {isLoadingPhotos || isLoadingCategories ? (
        <div
          className={`flex items-center justify-center p-16 rounded-[4px] border ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <div
          className={`p-16 text-center rounded-[4px] border ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          <UploadCloud className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No photos found</h3>
          <p className="text-xs mt-1">Upload a photo to get started with KrikoTrip gallery.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((item) => (
            <div
              key={item.id}
              className={`group relative rounded-[4px] overflow-hidden border transition-all ${
                theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                    !item.isActive ? 'opacity-60 grayscale-[40%]' : ''
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  <span className="px-2.5 py-1 rounded-[4px] text-xs font-semibold bg-blue-600 text-white shadow-xs">
                    {item.category.name}
                  </span>
                  {!item.isActive && (
                    <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase bg-amber-500 text-white shadow-xs">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  <button
                    type="button"
                    onClick={() =>
                      toggleStatusMutation.mutate({
                        id: item.id,
                        isActive: !item.isActive,
                      })
                    }
                    className={`p-1.5 rounded-[4px] text-white transition-colors cursor-pointer ${
                      item.isActive
                        ? 'bg-black/60 hover:bg-emerald-600'
                        : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                    title={item.isActive ? 'Hide from customer site' : 'Show on customer site'}
                  >
                    {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreview(item)}
                    className="p-1.5 rounded-[4px] bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                    title="Preview Lightbox"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openUploadModal(item)}
                    className="p-1.5 rounded-[4px] bg-black/60 hover:bg-blue-600 text-white transition-colors cursor-pointer"
                    title="Edit Photo"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetImage(item)}
                    className="p-1.5 rounded-[4px] bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                  <h4 className="font-semibold text-sm leading-snug line-clamp-1">{item.title}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-300 mt-1">
                    {item.location ? (
                      <span className="flex items-center gap-1.5 font-medium line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{item.location}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">No location</span>
                    )}
                    <span className="text-xs text-slate-400 shrink-0">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 overflow-y-auto">
          <div
            className={`w-full max-w-lg rounded-[4px] border p-6 my-8 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-base">
                {editingPhoto ? 'Edit Photo' : 'Upload Photo'}
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 rounded-[4px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {photoError && (
              <div className="mt-3 p-3 rounded-[4px] bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {photoError}
              </div>
            )}

            <form onSubmit={handlePhotoSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-sm font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sundarban Mangrove Safari"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Gosaba, West Bengal"
                  value={photoLocation}
                  onChange={(e) => setPhotoLocation(e.target.value)}
                  className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Category *</label>
                  <select
                    value={photoCategoryId}
                    onChange={(e) => setPhotoCategoryId(e.target.value)}
                    required
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Aspect Ratio</label>
                  <select
                    value={photoAspect}
                    onChange={(e) => setPhotoAspect(e.target.value as 'landscape' | 'portrait' | 'wide')}
                    className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="landscape">Landscape (4:3 / 16:9)</option>
                    <option value="portrait">Portrait (3:4)</option>
                    <option value="wide">Wide (21:9)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Display Order</label>
                <input
                  type="number"
                  value={photoDisplayOrder}
                  onChange={(e) => setPhotoDisplayOrder(Number(e.target.value) || 0)}
                  className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <ImageUploadField
                label="Choose Photo *"
                value={photoImageUrl}
                purpose="gallery"
                onChange={(url, mediaId) => {
                  setPhotoImageUrl(url)
                  if (mediaId) {
                    setPhotoImageMediaId(mediaId)
                  }
                }}
                aspectRatio="16/9"
                placeholder="Choose Photo File or Drag & Drop"
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createItemMutation.isPending || updateItemMutation.isPending}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {(createItemMutation.isPending || updateItemMutation.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <span>Save Photo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isManageCategoriesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 overflow-y-auto">
          <div
            className={`w-full max-w-xl rounded-[4px] border p-6 my-8 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-base">Manage Gallery Categories</h3>
              <button
                type="button"
                onClick={() => {
                  setIsManageCategoriesOpen(false)
                  setEditingCategory(null)
                  setCategoryError(null)
                }}
                className="p-1.5 rounded-[4px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {categoryError && (
              <div className="mt-3 p-3 rounded-[4px] bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {categoryError}
              </div>
            )}

            <form onSubmit={handleCategorySubmit} className="mt-4 p-4 rounded-[4px] border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {editingCategory ? `Edit: ${editingCategory.name}` : 'Add New Category'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wildlife & Safaris"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className={`w-full p-2 text-sm rounded-[4px] border outline-none ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Display Order</label>
                  <input
                    type="number"
                    value={categoryDisplayOrder}
                    onChange={(e) => setCategoryDisplayOrder(Number(e.target.value) || 0)}
                    className={`w-full p-2 text-sm rounded-[4px] border outline-none ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null)
                      setCategoryName('')
                      setCategoryDisplayOrder(categories.length + 1)
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>{editingCategory ? 'Update Category' : 'Add Category'}</span>
                </button>
              </div>
            </form>

            <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800 max-h-60 overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                    <span className="text-xs text-slate-400 ml-2">({cat.slug})</span>
                    <span className="text-xs text-slate-400 ml-2">order: {cat.displayOrder}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(cat)
                        setCategoryName(cat.name)
                        setCategoryDisplayOrder(cat.displayOrder)
                        setCategoryError(null)
                      }}
                      className="p-1 rounded text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetCategory(cat)}
                      className="p-1 rounded text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activePreview && (
        <div
          onClick={() => setActivePreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl max-h-[90vh] overflow-hidden rounded-[4px] border border-slate-700 bg-slate-900"
          >
            <img
              src={activePreview.imageUrl}
              alt={activePreview.title}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800">
              <div>
                <h4 className="font-semibold text-sm">{activePreview.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activePreview.location ? `${activePreview.location} • ` : ''}
                  {activePreview.category.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="px-4 py-1.5 rounded-[4px] bg-slate-800 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTargetImage}
        onClose={() => setDeleteTargetImage(null)}
        onConfirm={async () => {
          if (deleteTargetImage) {
            await deleteItemMutation.mutateAsync(deleteTargetImage.id)
            setDeleteTargetImage(null)
          }
        }}
        itemType="Gallery Photo"
        itemName={deleteTargetImage?.title}
        warningMessage="This photo will be permanently removed from the agency media library and any customer gallery views."
      />

      <DeleteConfirmModal
        isOpen={!!deleteTargetCategory}
        onClose={() => setDeleteTargetCategory(null)}
        onConfirm={handleDeleteCategory}
        itemType="Gallery Category"
        itemName={deleteTargetCategory?.name}
        warningMessage="Categories with associated photos cannot be deleted. Ensure all photos are re-assigned or removed first."
      />
    </div>
  )
}
