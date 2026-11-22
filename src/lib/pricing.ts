export interface AdminQuoteInput {
  baseCostPaise: number
  markupPercent: number
  taxPercent: number
  discountPaise?: number
}

export interface AdminQuoteResult {
  baseCostPaise: number
  markupPercent: number
  subtotalPaise: number
  taxPercent: number
  taxPaise: number
  discountPaise: number
  finalPricePaise: number
  vendorPayoutPaise: number
  agencyMarginPaise: number
}

export const calculateAdminQuote = (input: AdminQuoteInput): AdminQuoteResult => {
  const base = Math.max(0, Math.round(input.baseCostPaise))
  const markupPct = Math.max(0, input.markupPercent)
  const subtotal = Math.round(base * (1 + markupPct / 100))
  const taxPct = Math.max(0, input.taxPercent)
  const tax = Math.round(subtotal * (taxPct / 100))
  const discount = Math.max(0, Math.round(input.discountPaise ?? 0))
  const finalPrice = Math.max(0, subtotal + tax - discount)
  const margin = finalPrice - base - tax
  const vendorPayout = base

  return {
    baseCostPaise: base,
    markupPercent: markupPct,
    subtotalPaise: subtotal,
    taxPercent: taxPct,
    taxPaise: tax,
    discountPaise: discount,
    finalPricePaise: finalPrice,
    vendorPayoutPaise: vendorPayout,
    agencyMarginPaise: margin,
  }
}
