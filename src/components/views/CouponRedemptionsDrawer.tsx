import React, { useState } from 'react'
import { X, Ticket, ChevronLeft, ChevronRight, CheckCircle2, Clock, Ban } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import {
  useCouponRedemptionsQuery,
  type AdminCoupon,
  type CouponRedemptionStatus,
} from '../../api/coupons'

interface CouponRedemptionsDrawerProps {
  isOpen: boolean
  onClose: () => void
  coupon: AdminCoupon | null
}

const statusBadge = (status: CouponRedemptionStatus) => {
  switch (status) {
    case 'committed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle2 className="w-3 h-3" />
          <span>Committed</span>
        </span>
      )
    case 'reserved':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <Clock className="w-3 h-3" />
          <span>Reserved</span>
        </span>
      )
    case 'released':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Ban className="w-3 h-3" />
          <span>Released</span>
        </span>
      )
  }
}

export const CouponRedemptionsDrawer: React.FC<CouponRedemptionsDrawerProps> = ({
  isOpen,
  onClose,
  coupon,
}) => {
  const { theme } = useTheme()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useCouponRedemptionsQuery(coupon?.id, page, 15)
  const redemptions = data?.data ?? []
  const meta = data?.meta

  if (!isOpen || !coupon) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          className={`w-screen max-w-md sm:max-w-xl md:max-w-2xl flex flex-col border-l shadow-2xl transition-transform duration-300 ease-out transform translate-x-0 ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold font-mono tracking-wider">
                    {coupon.code}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase ${
                      coupon.isActive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {coupon.discountType === 'percent'
                    ? `${coupon.discountValue}% off`
                    : `₹${Number(coupon.discountValue).toLocaleString('en-IN')} off`}{' '}
                  • {coupon.usedCount} total usages
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[4px] cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Total Uses</span>
              <span className="text-sm sm:text-base font-extrabold">{coupon.usedCount}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Overall Limit</span>
              <span className="text-sm sm:text-base font-extrabold">
                {coupon.usageLimit ? coupon.usageLimit : 'Unlimited'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Per User</span>
              <span className="text-sm sm:text-base font-extrabold">
                {coupon.perUserLimit ? coupon.perUserLimit : 'Unlimited'}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading redemptions...</div>
            ) : redemptions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-[4px] border-slate-300 dark:border-slate-700">
                No redemptions recorded yet for coupon {coupon.code}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-2.5">Date & Time</th>
                      <th className="p-2.5">Enquiry / Customer</th>
                      <th className="p-2.5">Discount</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {redemptions.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="font-semibold block">
                            {new Date(r.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {new Date(r.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          {r.enquiryId ? (
                            <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold block truncate max-w-[120px]">
                              {r.enquiryId.slice(0, 8)}...
                            </span>
                          ) : (
                            <span className="text-slate-400 block">—</span>
                          )}
                          <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">
                            {r.customerUserId ? `User: ${r.customerUserId.slice(0, 8)}...` : 'Guest'}
                          </span>
                        </td>
                        <td className="p-2.5 whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{(r.discountPaise / 100).toLocaleString('en-IN')}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">{statusBadge(r.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Page {meta.page} of {meta.totalPages} ({meta.total} redemptions)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={meta.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  className="p-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
