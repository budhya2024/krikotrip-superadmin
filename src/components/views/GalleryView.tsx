import React, { useState } from 'react';
import {
  UploadCloud,
  MapPin,
  Trash2,
  Maximize2,
  X,
} from 'lucide-react';
import type { GalleryItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { ImageUploadField } from '../common/ImageUploadField';

interface GalleryViewProps {
  gallery: GalleryItem[];
  onAddImage: (item: Omit<GalleryItem, 'id' | 'uploadDate'>) => void;
  onDeleteImage: (id: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  gallery,
  onAddImage,
  onDeleteImage,
}) => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePreview, setActivePreview] = useState<GalleryItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteTargetImage, setDeleteTargetImage] = useState<GalleryItem | null>(null);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<GalleryItem['category']>('Destinations');
  const [imageUrl, setImageUrl] = useState('');

  const categories = ['All', 'Destinations', 'Hotels', 'Activities', 'Cruises'];

  const filtered = gallery.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    onAddImage({
      title,
      location: location || 'Destination',
      category,
      imageUrl,
    });

    setTitle('');
    setLocation('');
    setImageUrl('');
    setIsUploadOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Control Bar */}
      <div
        className={`p-4 rounded-[4px] border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${theme === 'dark'
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200'
          }`}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-[4px] text-sm font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : theme === 'dark'
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-[4px] text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Photo</span>
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`group relative rounded-[4px] overflow-hidden border ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
              }`}
          >
            <div className="relative h-56 w-full overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-[4px] text-xs font-semibold bg-blue-600 text-white">
                  {item.category}
                </span>
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <button
                  onClick={() => setActivePreview(item)}
                  className="p-1.5 rounded-[4px] bg-black/60 hover:bg-black/80 text-white"
                  title="Preview"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTargetImage(item)}
                  className="p-1.5 rounded-[4px] bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors"
                  title="Delete Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h4 className="font-semibold text-sm leading-snug">{item.title}</h4>
                <div className="flex items-center justify-between text-xs text-slate-300 mt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {item.location}
                  </span>
                  <span className="text-xs text-slate-400">{item.uploadDate}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div
            className={`w-full max-w-md rounded-[4px] border p-6 ${theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-base">Upload Photo</h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 rounded-[4px] text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-sm font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Photo Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                >
                  <option value="Destinations">Destinations</option>
                  <option value="Hotels">Hotels</option>
                  <option value="Activities">Activities</option>
                  <option value="Cruises">Cruises</option>
                </select>
              </div>

              <ImageUploadField
                label="Choose Photo *"
                value={imageUrl}
                onChange={setImageUrl}
                aspectRatio="16/9"
                placeholder="Choose Photo File or Drag & Drop"
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px]"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
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
                <p className="text-xs text-slate-400 mt-0.5">{activePreview.location}</p>
              </div>
              <button
                onClick={() => setActivePreview(null)}
                className="px-4 py-1.5 rounded-[4px] bg-slate-800 text-xs font-semibold hover:bg-slate-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetImage}
        onClose={() => setDeleteTargetImage(null)}
        onConfirm={() => {
          if (deleteTargetImage) {
            onDeleteImage(deleteTargetImage.id);
            setDeleteTargetImage(null);
          }
        }}
        itemType="Gallery Photo"
        itemName={deleteTargetImage?.title}
        warningMessage="This photo will be permanently removed from the agency media library and any linked marketing galleries."
      />
    </div>
  );
};
