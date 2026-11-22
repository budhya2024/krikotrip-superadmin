import React, { useState, useEffect } from 'react'
import { X, Tag, Percent, IndianRupee, CheckSquare, Square, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '../../context/ThemeContext'
import {
  useCreateCouponMutation,
  useUpdateCouponMutation,
  type AdminCoupon,
  type CouponDiscountType,
  type CouponAppliesTo,
} from '../../api/coupons'
import { useAdminPackagesQuery } from '../../api/packages'

interface CouponEditorModalProps {
  isOpen: boolean
  onClose: () => void
  coupon: AdminCoupon | null
}

export const CouponEditorModal: React.FC<CouponEditorModalProps> = ({
  isOpen,
  onClose,
  coupon,
}) => {
  const { theme } = useTheme()
  const createCouponMutation = useCreateCouponMutation()
  const updateCouponMutation = useUpdateCouponMutation()

  const { data: packagesData } = useAdminPackagesQuery({ limit: 100 })
  const availablePackages = packagesData?.data ?? []

  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState<CouponDiscountType>('percent')
  const [discountValue, setDiscountValue] = useState<string>('10')
  const [maxDiscountRupees, setMaxDiscountRupees] = useState<string>('')
  const [minOrderRupees, setMinOrderRupees] = useState<string>('')
  const [validFrom, setValidFrom] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [usageLimit, setUsageLimit] = useState<string>('')
  const [perUserLimit, setPerUserLimit] = useState<string>('')
  const [isPublic, setIsPublic] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [appliesTo, setAppliesTo] = useState<CouponAppliesTo>('all')
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([])
  const [packageSearch, setPackageSearch] = useState('')

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code)
      setDescription(coupon.description ?? '')
      setDiscountType(coupon.discountType)
      setDiscountValue(String(coupon.discountValue))
      setMaxDiscountRupees(
        coupon.maxDiscountPaise !== null ? String(Math.round(coupon.maxDiscountPaise / 100)) : '',
      )
      setMinOrderRupees(
        coupon.minOrderPaise !== null ? String(Math.round(coupon.minOrderPaise / 100)) : '',
      )
      setValidFrom(coupon.validFrom ? coupon.validFrom.slice(0, 16) : '')
      setValidUntil(coupon.validUntil ? coupon.validUntil.slice(0, 16) : '')
      setUsageLimit(coupon.usageLimit !== null ? String(coupon.usageLimit) : '')
      setPerUserLimit(coupon.perUserLimit !== null ? String(coupon.perUserLimit) : '')
      setIsPublic(coupon.isPublic)
      setIsActive(coupon.isActive)
      setAppliesTo(coupon.appliesTo)
      setSelectedPackageIds(coupon.packageIds ?? [])
    } else {
      setCode('')
      setDescription('')
      setDiscountType('percent')
      setDiscountValue('10')
      setMaxDiscountRupees('')
      setMinOrderRupees('')
      setValidFrom('')
      setValidUntil('')
      setUsageLimit('')
      setPerUserLimit('')
      setIsPublic(false)
      setIsActive(true)
      setAppliesTo('all')
      setSelectedPackageIds([])
    }
    setPackageSearch('')
  }, [coupon, isOpen])

  if (!isOpen) return null

  const handleTogglePackage = (pkgId: string) => {
    setSelectedPackageIds((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId],
    )
  }

  const handleSelectAllPackages = () => {
    if (selectedPackageIds.length === availablePackages.length) {
      setSelectedPackageIds([])
    } else {
      setSelectedPackageIds(availablePackages.map((p) => p.id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) {
      toast.error('Coupon code is required')
      return
    }

    const numDiscountValue = Number(discountValue)
    if (isNaN(numDiscountValue) || numDiscountValue <= 0) {
      toast.error('Discount value must be a positive number')
      return
    }

    if (discountType === 'percent' && numDiscountValue > 100) {
      toast.error('Percentage discount cannot exceed 100%')
      return
    }

    if (appliesTo === 'selected_packages' && selectedPackageIds.length === 0) {
      toast.error('Please select at least one package for package-restricted coupons')
      return
    }

    const payload = {
      code: cleanCode,
      description: description.trim() || null,
      discountType,
      discountValue: numDiscountValue,
      maxDiscountPaise:
        discountType === 'percent' && maxDiscountRupees.trim()
          ? Math.round(Number(maxDiscountRupees) * 100)
          : null,
      minOrderPaise: minOrderRupees.trim() ? Math.round(Number(minOrderRupees) * 100) : null,
      validFrom: validFrom ? new Date(validFrom).toISOString() : null,
      validUntil: validUntil ? new Date(validUntil).toISOString() : null,
      usageLimit: usageLimit.trim() ? Number(usageLimit) : null,
      perUserLimit: perUserLimit.trim() ? Number(perUserLimit) : null,
      isPublic,
      isActive,
      appliesTo,
      packageIds: appliesTo === 'selected_packages' ? selectedPackageIds : [],
    }

    if (coupon) {
      updateCouponMutation.mutate(
        { id: coupon.id, input: payload },
        {
          onSuccess: () => {
            toast.success(`Coupon ${cleanCode} updated successfully`)
            onClose()
          },
          onError: (err: unknown) => {
            const message = err instanceof Error ? err.message : 'Failed to update coupon'
            toast.error(message)
          },
        },
      )
    } else {
      createCouponMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(`Coupon ${cleanCode} created successfully`)
          onClose()
        },
        onError: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Failed to create coupon'
          toast.error(message)
        },
      })
    }
  }

  const filteredPackages = availablePackages.filter((pkg) =>
    pkg.title.toLowerCase().includes(packageSearch.toLowerCase()) ||
    pkg.destinationName.toLowerCase().includes(packageSearch.toLowerCase()),
  )

  const isPending = createCouponMutation.isPending || updateCouponMutation.isPending

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[4px] border shadow-2xl p-6 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base sm:text-lg font-bold">
              {coupon ? `Edit Coupon: ${coupon.code}` : 'Create Discount Coupon'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[4px] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. KRIKO10, FESTIVE2000"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border font-mono font-bold tracking-wider outline-none ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Discount Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountType('percent')}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-[4px] text-xs font-semibold border cursor-pointer transition-colors ${
                    discountType === 'percent'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-slate-300'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>Percentage (%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('fixed')}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-[4px] text-xs font-semibold border cursor-pointer transition-colors ${
                    discountType === 'fixed'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-slate-300'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>Fixed (₹)</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Description / Promotion Note
            </label>
            <input
              type="text"
              placeholder="e.g. 10% instant discount on all beach getaways"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Discount Value * {discountType === 'percent' ? '(%)' : '(₹)'}
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                placeholder={discountType === 'percent' ? '10' : '2000'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Max Cap (₹) {discountType === 'percent' ? '' : '(N/A)'}
              </label>
              <input
                type="number"
                min="1"
                step="1"
                disabled={discountType !== 'percent'}
                placeholder={discountType === 'percent' ? 'e.g. 1000' : 'No cap for fixed'}
                value={maxDiscountRupees}
                onChange={(e) => setMaxDiscountRupees(e.target.value)}
                className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold disabled:opacity-40 ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Min Order (₹)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 10000"
                value={minOrderRupees}
                onChange={(e) => setMinOrderRupees(e.target.value)}
                className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Valid From
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Valid Until (Expiration)
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Overall Usage Limit
              </label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Leave blank for unlimited"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Per-User Limit
              </label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Leave blank for unlimited"
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(e.target.value)}
                className={`w-full p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none font-semibold ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Package Applicability
            </label>
            <div className="flex items-center gap-4 mb-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold">
                <input
                  type="radio"
                  name="appliesTo"
                  value="all"
                  checked={appliesTo === 'all'}
                  onChange={() => setAppliesTo('all')}
                  className="w-4 h-4 text-blue-600"
                />
                <span>All Tour Packages</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold">
                <input
                  type="radio"
                  name="appliesTo"
                  value="selected_packages"
                  checked={appliesTo === 'selected_packages'}
                  onChange={() => setAppliesTo('selected_packages')}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Selected Packages Only</span>
              </label>
            </div>

            {appliesTo === 'selected_packages' && (
              <div
                className={`p-3 rounded-[4px] border space-y-2 ${
                  theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search packages..."
                      value={packageSearch}
                      onChange={(e) => setPackageSearch(e.target.value)}
                      className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-[4px] border outline-none ${
                        theme === 'dark'
                          ? 'bg-slate-900 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAllPackages}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                  >
                    {selectedPackageIds.length === availablePackages.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredPackages.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500">No packages found</div>
                  ) : (
                    filteredPackages.map((pkg) => {
                      const isSelected = selectedPackageIds.includes(pkg.id)
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => handleTogglePackage(pkg.id)}
                          className={`flex items-center justify-between p-2 rounded-[3px] text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-700/40'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className="font-semibold truncate">{pkg.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                            {pkg.destinationName}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="text-[11px] text-slate-500">
                  {selectedPackageIds.length} of {availablePackages.length} packages selected
                </div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-[4px] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-[3px]"
              />
              <div>
                <span className="text-xs sm:text-sm font-semibold block">Public Coupon</span>
                <span className="text-[10px] text-slate-500 block">
                  Show in site promotions, marketing banners & public settings
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-[3px]"
              />
              <div>
                <span className="text-xs sm:text-sm font-semibold block">Active Status</span>
                <span className="text-[10px] text-slate-500 block">
                  Allow redemption during checkout
                </span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-[4px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isPending ? 'Saving...' : coupon ? 'Save Changes' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
