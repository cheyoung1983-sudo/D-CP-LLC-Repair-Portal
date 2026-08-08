/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceTier } from '../types';

export const TAX_RATES = {
  SPOKANE_CITY: { code: '3202', rate: 0.091, zips: ['99201', '99202', '99203', '99204', '99205', '99207', '99208'] },
  SPOKANE_VALLEY: { code: '3213', rate: 0.090, zips: ['99206', '99212', '99216'] },
  DEFAULT: { code: 'WA-GEN', rate: 0.085, zips: [] }
};

export interface PricingBreakdown {
  partsCost: number;
  laborCost: number;
  overhead: number;
  subtotal: number;
  tax: number;
  total: number;
}

const TIER_DEFAULTS = {
  [ServiceTier.TIER_1_POWER]: { parts: 25, labor: 0.5 },
  [ServiceTier.TIER_2_DISPLAY]: { parts: 85, labor: 0.75 },
  [ServiceTier.TIER_3_BOARD]: { parts: 15, labor: 2.5 }
};

/**
 * P_retail = C_parts + (H_labor * $50.00) + (C_parts * 0.8)
 */
export function calculateQuote(tier: ServiceTier, zip: string): PricingBreakdown {
  const defaults = TIER_DEFAULTS[tier];
  const laborRate = 50.00;
  const markupRate = 0.8;

  const partsCost = defaults.parts;
  const laborCost = defaults.labor * laborRate;
  const overhead = partsCost * markupRate;

  const subtotal = partsCost + laborCost + overhead;
  
  // Resolve Tax
  let taxRate = TAX_RATES.DEFAULT.rate;
  if (TAX_RATES.SPOKANE_CITY.zips.includes(zip)) taxRate = TAX_RATES.SPOKANE_CITY.rate;
  else if (TAX_RATES.SPOKANE_VALLEY.zips.includes(zip)) taxRate = TAX_RATES.SPOKANE_VALLEY.rate;

  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    partsCost,
    laborCost,
    overhead,
    subtotal,
    tax,
    total
  };
}
