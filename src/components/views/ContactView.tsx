import React, { useState, useEffect } from 'react'
import {
  Archive,
  ArchiveRestore,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  Phone,
  Search,
  Send,
  Trash2,
  User,
} from 'lucide-react'
import {
  useContactMessageDetailQuery,
  useContactMessagesQuery,
  useDeleteContactMessageMutation,
  useSendContactReplyMutation,
  useUpdateContactMessageStatusMutation,
  type ContactMessageItem,
} from '../../api/contacts'
import { useTheme } from '../../context/ThemeContext'
import { DeleteConfirmModal } from '../common/DeleteConfirmModal'

type StatusFilter = 'all' | 'unread' | 'read' | 'replied' | 'archived'

export const ContactView: React.FC = () => {
  const { theme } = useTheme()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all')
  const [replyText, setReplyText] = useState('')
  const [replySentSuccess, setReplySentSuccess] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: messagesResponse, isLoading } = useContactMessagesQuery({
    q: debouncedSearch || undefined,
    status: activeFilter,
  })

  const messages = messagesResponse?.data ?? []
  const unreadCount = messagesResponse?.meta?.unreadCount ?? 0

  useEffect(() => {
    if (messages.length > 0 && (!selectedId || !messages.some((m) => m.id === selectedId))) {
      setSelectedId(messages[0].id)
    } else if (messages.length === 0) {
      setSelectedId(null)
    }
  }, [messages, selectedId])

  const { data: selectedMessage, isLoading: isDetailLoading } =
    useContactMessageDetailQuery(selectedId)

  const updateStatusMutation = useUpdateContactMessageStatusMutation()
  const sendReplyMutation = useSendContactReplyMutation()
  const deleteMutation = useDeleteContactMessageMutation()

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !selectedId) return

    try {
      await sendReplyMutation.mutateAsync({
        id: selectedId,
        body: replyText.trim(),
      })
      setReplySentSuccess(true)
      setReplyText('')
      setTimeout(() => setReplySentSuccess(false), 4000)
    } catch {
    }
  }

  const handleToggleArchive = async () => {
    if (!selectedMessage) return
    const nextStatus = selectedMessage.status === 'archived' ? 'read' : 'archived'
    await updateStatusMutation.mutateAsync({
      id: selectedMessage.id,
      status: nextStatus,
    })
  }

  const handleDeleteConfirm = async () => {
    if (!selectedMessage) return
    const idToDelete = selectedMessage.id
    await deleteMutation.mutateAsync(idToDelete)
    setIsDeleteModalOpen(false)
    setSelectedId(null)
  }

  const getStatusBadge = (status: ContactMessageItem['status']) => {
    switch (status) {
      case 'unread':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
            Unread
          </span>
        )
      case 'read':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Read
          </span>
        )
      case 'replied':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
            Replied
          </span>
        )
      case 'archived':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
            Archived
          </span>
        )
    }
  }

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return ''
    const d = new Date(isoString)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {(['all', 'unread', 'read', 'replied', 'archived'] as StatusFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] capitalize transition-colors cursor-pointer ${
                activeFilter === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : theme === 'dark'
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab}
              {tab === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[580px]">
        <div
          className={`lg:col-span-5 rounded-[4px] border flex flex-col overflow-hidden ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-[4px] border outline-none ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                }`}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[620px]">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
                <span className="text-xs">Loading contact messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium">No contact messages found</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelected = selectedId === msg.id
                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedId(msg.id)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? theme === 'dark'
                          ? 'bg-slate-800/90 border-l-4 border-blue-500'
                          : 'bg-blue-50/80 border-l-4 border-blue-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white truncate max-w-[200px]">
                        {msg.name}
                      </span>
                      <span className="text-[11px] text-slate-400">{formatDate(msg.createdAt)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {msg.subject}
                      </h4>
                      {getStatusBadge(msg.status)}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {msg.message}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div
          className={`lg:col-span-7 rounded-[4px] border flex flex-col justify-between ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {isDetailLoading ? (
            <div className="p-10 text-center text-slate-400 flex flex-col items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
              <span className="text-xs">Loading message conversation...</span>
            </div>
          ) : selectedMessage ? (
            <div className="flex flex-col h-full justify-between">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Received {formatDate(selectedMessage.createdAt)}
                    </span>
                    {getStatusBadge(selectedMessage.status)}
                  </div>
                  <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                    {selectedMessage.subject}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {selectedMessage.name}
                    </span>
                    <span>•</span>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {selectedMessage.email}
                    </a>
                    <span>•</span>
                    <a
                      href={`tel:${selectedMessage.phoneCountryCode}${selectedMessage.phone}`}
                      className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {selectedMessage.phoneCountryCode} {selectedMessage.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleToggleArchive}
                    disabled={updateStatusMutation.isPending}
                    className="p-1.5 rounded-[4px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title={selectedMessage.status === 'archived' ? 'Unarchive' : 'Archive'}
                  >
                    {selectedMessage.status === 'archived' ? (
                      <ArchiveRestore className="w-4 h-4" />
                    ) : (
                      <Archive className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="p-1.5 rounded-[4px] text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 flex-1 text-sm space-y-4 leading-relaxed overflow-y-auto max-h-[380px]">
                <div className="p-4 rounded-[4px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-500 mb-1.5">Customer Message</div>
                  <div className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Correspondence History ({selectedMessage.replies.length})
                    </div>
                    {selectedMessage.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="p-4 rounded-[4px] bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-slate-800 dark:text-slate-200"
                      >
                        <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 mb-1.5 font-medium">
                          <span>Admin Response (Sent by email)</span>
                          <span>{formatDate(reply.createdAt)}</span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{reply.body}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                {replySentSuccess && (
                  <div className="mb-2.5 p-2 rounded-[4px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Reply sent directly and queued to {selectedMessage.email}</span>
                  </div>
                )}
                <form onSubmit={handleSendReply} className="space-y-2.5">
                  <textarea
                    rows={3}
                    placeholder={`Write your email reply to ${selectedMessage.name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className={`w-full p-3 text-sm rounded-[4px] border outline-none ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600'
                    }`}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={sendReplyMutation.isPending || !replyText.trim()}
                      className="flex items-center gap-2 px-4 py-2 rounded-[4px] text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {sendReplyMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Send Reply</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-400 flex flex-col items-center justify-center h-full">
              <Mail className="w-10 h-10 mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Select a contact message to view
              </p>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemType="Contact Message"
        itemName={selectedMessage ? `${selectedMessage.name} (${selectedMessage.subject})` : undefined}
        warningMessage="This contact message thread and all correspondence will be removed."
      />
    </div>
  )
}
