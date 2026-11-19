import React, { useState } from 'react';
import {
  Mail,
  Search,
  CheckCircle,
  Send,
  Trash2,
} from 'lucide-react';
import type { ContactMessage } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface ContactViewProps {
  messages: ContactMessage[];
  onToggleReplied: (id: string) => void;
  onDeleteMessage: (id: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({
  messages,
  onToggleReplied,
  onDeleteMessage,
}) => {
  const { theme } = useTheme();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage>(messages[0]);
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replySentSuccess, setReplySentSuccess] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const filtered = messages.filter((m) => {
    return (
      m.senderName.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.senderEmail.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    if (selectedMessage) {
      onToggleReplied(selectedMessage.id);
    }
    setReplySentSuccess(true);
    setReplyText('');
    setTimeout(() => setReplySentSuccess(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[550px]">
        {/* Left Column: Messages List (5 cols) */}
        <div
          className={`lg:col-span-5 rounded-[4px] border flex flex-col overflow-hidden ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
            }`}
        >
          {/* Header & Search */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages by name, email, or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
              />
            </div>
          </div>

          {/* List items with larger fonts */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filtered.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`p-3.5 cursor-pointer transition-colors ${isSelected
                      ? theme === 'dark'
                        ? 'bg-slate-800/90 border-l-4 border-blue-500'
                        : 'bg-blue-50/80 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      {msg.senderName}
                    </span>
                    <span className="text-xs text-slate-400">{msg.receivedAt}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {msg.subject}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                    {msg.message}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Reader & Reply Box (7 cols) */}
        <div
          className={`lg:col-span-7 rounded-[4px] border flex flex-col justify-between ${theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
            }`}
        >
          {selectedMessage ? (
            <div className="flex flex-col h-full justify-between">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-500">
                      Received {selectedMessage.receivedAt}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                    {selectedMessage.subject}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      From: {selectedMessage.senderName}
                    </span>
                    <span>•</span>
                    <a
                      href={`mailto:${selectedMessage.senderEmail}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {selectedMessage.senderEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="p-1.5 rounded-[4px] text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Body with comfortable line-height and readable font size */}
              <div className="p-5 flex-1 text-sm text-slate-800 dark:text-slate-200 leading-relaxed overflow-y-auto">
                <div className="p-4 rounded-[4px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                {replySentSuccess && (
                  <div className="mb-2.5 p-2 rounded-[4px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Reply sent directly to {selectedMessage.senderEmail}</span>
                  </div>
                )}
                <form onSubmit={handleSendReply} className="space-y-2.5">
                  <textarea
                    rows={3}
                    placeholder={`Write your response to ${selectedMessage.senderName}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className={`w-full p-3 text-sm rounded-[4px] border outline-none ${theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600'
                      }`}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 rounded-[4px] text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-400 flex flex-col items-center justify-center h-full">
              <Mail className="w-10 h-10 mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Select a customer message to view</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (selectedMessage) {
            onDeleteMessage(selectedMessage.id);
            setIsDeleteModalOpen(false);
          }
        }}
        itemType="Contact Message"
        itemName={selectedMessage ? `${selectedMessage.senderName} (${selectedMessage.subject})` : undefined}
        warningMessage="This message thread and all correspondence notes will be permanently deleted."
      />
    </div>
  );
};
