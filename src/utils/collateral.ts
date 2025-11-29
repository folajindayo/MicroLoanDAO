/**
 * Collateral Utilities
 * Functions for collateral valuation and management
 */

export interface CollateralAsset {
  address: string;
  symbol: string;
  amount: bigint;
  decimals: number;
  priceUSD: number;
}

export interface CollateralRatio {
  ratio: number;
  isHealthy: boolean;
  level: 'safe' | 'moderate' | 'warning' | 'danger';
}

// Collateral thresholds
const COLLATERAL_THRESHOLDS = {
  safe: 200,
  moderate: 150,
  warning: 130,
  danger: 100,
};

/**
 * Calculate collateral value in USD
 */
export function calculateCollateralValueUSD(assets: CollateralAsset[]): number {
  return assets.reduce((total, asset) => {
    const amount = Number(asset.amount) / Math.pow(10, asset.decimals);
    return total + amount * asset.priceUSD;
  }, 0);
}

/**
 * Calculate collateral value in a specific token
 */
export function calculateCollateralValueInToken(
  assets: CollateralAsset[],
  tokenPriceUSD: number
): number {
  const totalUSD = calculateCollateralValueUSD(assets);
  return tokenPriceUSD > 0 ? totalUSD / tokenPriceUSD : 0;
}

/**
 * Calculate collateral ratio
 */
export function calculateCollateralRatio(
  collateralValueUSD: number,
  loanValueUSD: number
): CollateralRatio {
  if (loanValueUSD <= 0) {
    return { ratio: Infinity, isHealthy: true, level: 'safe' };
  }

  const ratio = (collateralValueUSD / loanValueUSD) * 100;

  let level: CollateralRatio['level'];
  if (ratio >= COLLATERAL_THRESHOLDS.safe) {
    level = 'safe';
  } else if (ratio >= COLLATERAL_THRESHOLDS.moderate) {
    level = 'moderate';
  } else if (ratio >= COLLATERAL_THRESHOLDS.warning) {
    level = 'warning';
  } else {
    level = 'danger';
  }

  return {
    ratio: Math.round(ratio * 100) / 100,
    isHealthy: ratio >= COLLATERAL_THRESHOLDS.warning,
    level,
  };
}

/**
 * Calculate required collateral for loan amount
 */
export function calculateRequiredCollateral(
  loanValueUSD: number,
  requiredRatio: number = COLLATERAL_THRESHOLDS.moderate
): number {
  return (loanValueUSD * requiredRatio) / 100;
}

/**
 * Calculate maximum borrowable with given collateral
 */
export function calculateMaxBorrowable(
  collateralValueUSD: number,
  maxLTV: number = 75
): number {
  return (collateralValueUSD * maxLTV) / 100;
}

/**
 * Calculate liquidation price
 */
export function calculateLiquidationPrice(
  collateralAmount: number,
  loanValueUSD: number,
  liquidationRatio: number = COLLATERAL_THRESHOLDS.warning
): number {
  if (collateralAmount <= 0) return 0;
  return (loanValueUSD * liquidationRatio) / (100 * collateralAmount);
}

/**
 * Calculate health factor
 */
export function calculateHealthFactor(
  collateralValueUSD: number,
  loanValueUSD: number,
  liquidationRatio: number = COLLATERAL_THRESHOLDS.warning
): number {
  if (loanValueUSD <= 0) return Infinity;
  return (collateralValueUSD * 100) / (loanValueUSD * liquidationRatio);
}

/**
 * Check if position is liquidatable
 */
export function isLiquidatable(
  collateralValueUSD: number,
  loanValueUSD: number,
  liquidationRatio: number = COLLATERAL_THRESHOLDS.warning
): boolean {
  const ratio = calculateCollateralRatio(collateralValueUSD, loanValueUSD);
  return ratio.ratio < liquidationRatio;
}

/**
 * Calculate liquidation penalty
 */
export function calculateLiquidationPenalty(
  collateralValueUSD: number,
  penaltyPercent: number = 10
): number {
  return (collateralValueUSD * penaltyPercent) / 100;
}

/**
 * Calculate additional collateral needed
 */
export function calculateAdditionalCollateralNeeded(
  currentCollateralUSD: number,
  loanValueUSD: number,
  targetRatio: number = COLLATERAL_THRESHOLDS.moderate
): number {
  const requiredCollateral = calculateRequiredCollateral(loanValueUSD, targetRatio);
  return Math.max(0, requiredCollateral - currentCollateralUSD);
}

/**
 * Calculate collateral buffer
 */
export function calculateCollateralBuffer(
  collateralValueUSD: number,
  loanValueUSD: number,
  liquidationRatio: number = COLLATERAL_THRESHOLDS.warning
): number {
  const liquidationValue = (loanValueUSD * liquidationRatio) / 100;
  return Math.max(0, collateralValueUSD - liquidationValue);
}

/**
 * Get collateral level color
 */
export function getCollateralLevelColor(level: CollateralRatio['level']): string {
  const colors: Record<CollateralRatio['level'], string> = {
    safe: '#22C55E',
    moderate: '#EAB308',
    warning: '#F97316',
    danger: '#EF4444',
  };
  return colors[level];
}

/**
 * Get collateral level class
 */
export function getCollateralLevelClass(level: CollateralRatio['level']): string {
  const classes: Record<CollateralRatio['level'], string> = {
    safe: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return classes[level];
}

/**
 * Format collateral ratio for display
 */
export function formatCollateralRatio(ratio: number): string {
  if (!isFinite(ratio)) return '∞';
  return `${ratio.toFixed(2)}%`;
}

/**
 * Validate collateral meets requirements
 */
export function validateCollateral(
  collateralValueUSD: number,
  loanValueUSD: number,
  minRatio: number = COLLATERAL_THRESHOLDS.moderate
): { valid: boolean; message: string } {
  const ratio = calculateCollateralRatio(collateralValueUSD, loanValueUSD);

  if (ratio.ratio >= minRatio) {
    return { valid: true, message: 'Collateral meets requirements' };
  }

  const needed = calculateAdditionalCollateralNeeded(collateralValueUSD, loanValueUSD, minRatio);
  return {
    valid: false,
    message: `Additional collateral of $${needed.toFixed(2)} needed`,
  };
}

export { COLLATERAL_THRESHOLDS };

