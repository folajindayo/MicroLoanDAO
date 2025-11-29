/**
 * Pricing Service
 * Real-time token pricing, exchange rates, and market data
 */

export interface TokenPrice {
  symbol: string;
  name: string;
  address?: string;
  priceUSD: number;
  priceETH: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
}

export interface PriceHistory {
  symbol: string;
  prices: Array<{
    timestamp: Date;
    price: number;
  }>;
  interval: '1h' | '24h' | '7d' | '30d' | '1y';
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
}

export interface GasPrice {
  slow: bigint;
  standard: bigint;
  fast: bigint;
  instant: bigint;
  baseFee: bigint;
  lastUpdated: Date;
}

// Price cache
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const priceCache: Map<string, CacheEntry<TokenPrice>> = new Map();
const historyCache: Map<string, CacheEntry<PriceHistory>> = new Map();
const CACHE_TTL = 30000; // 30 seconds
const HISTORY_CACHE_TTL = 300000; // 5 minutes

// Common token symbols to CoinGecko IDs
const TOKEN_IDS: Record<string, string> = {
  ETH: 'ethereum',
  WETH: 'weth',
  BTC: 'bitcoin',
  WBTC: 'wrapped-bitcoin',
  USDC: 'usd-coin',
  USDT: 'tether',
  DAI: 'dai',
  LINK: 'chainlink',
  UNI: 'uniswap',
  AAVE: 'aave',
  MATIC: 'matic-network',
  ARB: 'arbitrum',
  OP: 'optimism',
};

class PricingService {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get current price for a token
   */
  async getPrice(symbol: string): Promise<TokenPrice | null> {
    const upperSymbol = symbol.toUpperCase();
    
    // Check cache
    const cached = priceCache.get(upperSymbol);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    const tokenId = TOKEN_IDS[upperSymbol];
    if (!tokenId) {
      console.warn(`Unknown token symbol: ${symbol}`);
      return this.getMockPrice(upperSymbol);
    }

    try {
      const url = `https://api.coingecko.com/api/v3/coins/${tokenId}?localization=false&tickers=false&community_data=false&developer_data=false`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const price: TokenPrice = {
        symbol: upperSymbol,
        name: data.name,
        priceUSD: data.market_data?.current_price?.usd || 0,
        priceETH: data.market_data?.current_price?.eth || 0,
        change24h: data.market_data?.price_change_percentage_24h || 0,
        volume24h: data.market_data?.total_volume?.usd || 0,
        marketCap: data.market_data?.market_cap?.usd || 0,
        lastUpdated: new Date(),
      };

      // Cache the result
      priceCache.set(upperSymbol, { data: price, expiry: Date.now() + CACHE_TTL });
      return price;
    } catch (error) {
      console.error('Price fetch error:', error);
      return this.getMockPrice(upperSymbol);
    }
  }

  /**
   * Get prices for multiple tokens
   */
  async getPrices(symbols: string[]): Promise<Map<string, TokenPrice>> {
    const results = new Map<string, TokenPrice>();
    
    // Batch fetch with Promise.allSettled
    const promises = symbols.map(s => this.getPrice(s));
    const responses = await Promise.allSettled(promises);

    responses.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.set(symbols[index].toUpperCase(), result.value);
      }
    });

    return results;
  }

  /**
   * Get price history for a token
   */
  async getPriceHistory(
    symbol: string,
    interval: PriceHistory['interval'] = '7d'
  ): Promise<PriceHistory | null> {
    const cacheKey = `${symbol.toUpperCase()}_${interval}`;
    
    // Check cache
    const cached = historyCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    const tokenId = TOKEN_IDS[symbol.toUpperCase()];
    if (!tokenId) {
      return this.getMockPriceHistory(symbol.toUpperCase(), interval);
    }

    // Convert interval to days
    const daysMap: Record<string, number> = {
      '1h': 1,
      '24h': 1,
      '7d': 7,
      '30d': 30,
      '1y': 365,
    };
    const days = daysMap[interval] || 7;

    try {
      const url = `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=${days}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const history: PriceHistory = {
        symbol: symbol.toUpperCase(),
        interval,
        prices: data.prices.map((p: [number, number]) => ({
          timestamp: new Date(p[0]),
          price: p[1],
        })),
      };

      historyCache.set(cacheKey, { data: history, expiry: Date.now() + HISTORY_CACHE_TTL });
      return history;
    } catch (error) {
      console.error('Price history fetch error:', error);
      return this.getMockPriceHistory(symbol.toUpperCase(), interval);
    }
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    const fromPrice = await this.getPrice(from);
    const toPrice = await this.getPrice(to);

    if (!fromPrice || !toPrice || toPrice.priceUSD === 0) {
      return {
        from,
        to,
        rate: 0,
        lastUpdated: new Date(),
      };
    }

    return {
      from,
      to,
      rate: fromPrice.priceUSD / toPrice.priceUSD,
      lastUpdated: new Date(),
    };
  }

  /**
   * Convert amount between tokens
   */
  async convertAmount(
    amount: number,
    from: string,
    to: string
  ): Promise<number> {
    const rate = await this.getExchangeRate(from, to);
    return amount * rate.rate;
  }

  /**
   * Get current gas prices
   */
  async getGasPrice(): Promise<GasPrice> {
    try {
      const response = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle');
      
      if (!response.ok) {
        throw new Error('Gas API error');
      }

      const data = await response.json();
      const result = data.result;

      return {
        slow: BigInt(Math.round(Number(result.SafeGasPrice) * 1e9)),
        standard: BigInt(Math.round(Number(result.ProposeGasPrice) * 1e9)),
        fast: BigInt(Math.round(Number(result.FastGasPrice) * 1e9)),
        instant: BigInt(Math.round(Number(result.FastGasPrice) * 1.2 * 1e9)),
        baseFee: BigInt(Math.round(Number(result.suggestBaseFee || '30') * 1e9)),
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Gas price fetch error:', error);
      return this.getMockGasPrice();
    }
  }

  /**
   * Calculate USD value of ETH amount
   */
  async getETHValueUSD(ethAmount: number): Promise<number> {
    const ethPrice = await this.getPrice('ETH');
    return ethPrice ? ethAmount * ethPrice.priceUSD : 0;
  }

  /**
   * Calculate ETH value of USD amount
   */
  async getUSDValueETH(usdAmount: number): Promise<number> {
    const ethPrice = await this.getPrice('ETH');
    return ethPrice && ethPrice.priceUSD > 0 ? usdAmount / ethPrice.priceUSD : 0;
  }

  /**
   * Get mock price for development/fallback
   */
  private getMockPrice(symbol: string): TokenPrice {
    const mockPrices: Record<string, Partial<TokenPrice>> = {
      ETH: { priceUSD: 2000, priceETH: 1, change24h: 2.5 },
      WETH: { priceUSD: 2000, priceETH: 1, change24h: 2.5 },
      BTC: { priceUSD: 45000, priceETH: 22.5, change24h: 1.2 },
      WBTC: { priceUSD: 45000, priceETH: 22.5, change24h: 1.2 },
      USDC: { priceUSD: 1, priceETH: 0.0005, change24h: 0.01 },
      USDT: { priceUSD: 1, priceETH: 0.0005, change24h: 0.01 },
      DAI: { priceUSD: 1, priceETH: 0.0005, change24h: 0.02 },
    };

    const mock = mockPrices[symbol] || { priceUSD: 100, priceETH: 0.05, change24h: 0 };

    return {
      symbol,
      name: symbol,
      priceUSD: mock.priceUSD || 0,
      priceETH: mock.priceETH || 0,
      change24h: mock.change24h || 0,
      volume24h: 1000000,
      marketCap: 10000000000,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get mock price history
   */
  private getMockPriceHistory(symbol: string, interval: PriceHistory['interval']): PriceHistory {
    const basePrice = this.getMockPrice(symbol).priceUSD;
    const now = Date.now();
    const dataPoints = interval === '1h' ? 60 : interval === '24h' ? 24 : interval === '7d' ? 168 : 720;
    const intervalMs = interval === '1h' ? 60000 : 3600000;

    const prices = Array.from({ length: dataPoints }, (_, i) => ({
      timestamp: new Date(now - (dataPoints - i) * intervalMs),
      price: basePrice * (0.95 + Math.random() * 0.1),
    }));

    return { symbol, interval, prices };
  }

  /**
   * Get mock gas price
   */
  private getMockGasPrice(): GasPrice {
    return {
      slow: BigInt(20e9),
      standard: BigInt(30e9),
      fast: BigInt(50e9),
      instant: BigInt(70e9),
      baseFee: BigInt(25e9),
      lastUpdated: new Date(),
    };
  }

  /**
   * Clear price cache
   */
  clearCache(): void {
    priceCache.clear();
    historyCache.clear();
  }
}

// Export singleton
export const pricingService = new PricingService();
export { PricingService };
export default pricingService;

