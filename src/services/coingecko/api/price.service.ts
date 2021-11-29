import { CoingeckoClient } from '../coingecko.client';
import {
  CoingeckoService,
  getNativeAssetId,
  getPlatformId
} from '../coingecko.service';
import { TOKENS } from '@/constants/tokens';
import { configService as _configService } from '@/services/config/config.service';
import { groupBy, invert, last } from 'lodash';
import { returnChecksum } from '@/lib/decorators/return-checksum.decorator';
import { retryPromiseWithDelay } from '@/lib/utils/promise';
import { twentyFourHoursInSecs } from '@/composables/useTime';
import { fromUnixTime, getUnixTime, startOfHour } from 'date-fns';

/**
 * TYPES
 */
export type Price = { [fiat: string]: number };
export type PriceResponse = { [id: string]: Price };
export type TokenPrices = { [address: string]: Price };
export interface HistoricalPriceResponse {
  market_caps: number[][];
  prices: number[][];
  total_volumes: number[][];
}
export type HistoricalPrices = { [timestamp: string]: number[] };

export class PriceService {
  client: CoingeckoClient;
  fiatParam: string;
  appNetwork: string;
  platformId: string;
  nativeAssetId: string;
  nativeAssetAddress: string;
  appAddresses: { [key: string]: string };

  constructor(
    service: CoingeckoService,
    private readonly configService = _configService
  ) {
    this.client = service.client;
    this.fiatParam = service.supportedFiat;
    this.appNetwork = this.configService.network.key;
    this.platformId = getPlatformId(this.appNetwork);
    this.nativeAssetId = getNativeAssetId(this.appNetwork);
    this.nativeAssetAddress = this.configService.network.nativeAsset.address;
    this.appAddresses = this.configService.network.addresses;
  }

  async getNativeAssetPrice(): Promise<Price> {
    try {
      const response = await this.client.get<PriceResponse>(
        `/simple/price?ids=${this.nativeAssetId}&vs_currencies=${this.fiatParam}`
      );
      return response[this.nativeAssetId];
    } catch (error) {
      console.error('Unable to fetch Ether price', error);
      throw error;
    }
  }

  /**
   *  Rate limit for the CoinGecko API is 10 calls each second per IP address.
   */
  async getTokens(
    addresses: string[],
    addressesPerRequest = 100
  ): Promise<TokenPrices> {
    try {
      if (addresses.length / addressesPerRequest > 10)
        throw new Error('To many requests for rate limit.');

      // TODO - remove once wsteth is supported
      addresses = addresses.filter(
        address => address !== this.appAddresses.wstETH
      );

      addresses = addresses.map(address => this.addressMapIn(address));
      const pageCount = Math.ceil(addresses.length / addressesPerRequest);
      const pages = Array.from(Array(pageCount).keys());
      const requests: Promise<PriceResponse>[] = [];

      pages.forEach(page => {
        const addressString = addresses.slice(
          addressesPerRequest * page,
          addressesPerRequest * (page + 1)
        );
        const endpoint = `/simple/token_price/${this.platformId}?contract_addresses=${addressString}&vs_currencies=${this.fiatParam}`;
        const request = retryPromiseWithDelay(
          this.client.get<PriceResponse>(endpoint),
          3,
          2000
        );
        requests.push(request);
      });

      const paginatedResults = await Promise.all(requests);
      const results = this.parsePaginatedTokens(paginatedResults);

      // Inject native asset price if included in requested addresses
      if (addresses.includes(this.nativeAssetAddress)) {
        results[this.nativeAssetAddress] = await this.getNativeAssetPrice();
      }

      return results;
    } catch (error) {
      console.error('Unable to fetch token prices', addresses, error);
      throw error;
    }
  }

  async getTokensHistorical(
    addresses: string[],
    days: number,
    addressesPerRequest = 1,
    aggregateBy: 'hour' | 'day' = 'day'
  ) {
    if (addresses.length / addressesPerRequest > 10)
      throw new Error('To many requests for rate limit.');

    const now = Math.floor(Date.now() / 1000);
    const end =
      aggregateBy === 'hour' ? now : now - (now % twentyFourHoursInSecs);
    const start = end - days * twentyFourHoursInSecs;

    // TODO - remove once wsteth is supported
    addresses = addresses.filter(
      address => address !== this.appAddresses.wstETH
    );

    addresses = addresses.map(address => this.addressMapIn(address));
    const requests: Promise<HistoricalPriceResponse>[] = [];

    addresses.forEach(address => {
      const endpoint = `/coins/${this.platformId}/contract/${this.swapAddress(
        address.toLowerCase()
      )}/market_chart/range?vs_currency=${
        this.fiatParam
      }&from=${start}&to=${end}`;
      const request = retryPromiseWithDelay(
        this.client.get<HistoricalPriceResponse>(endpoint),
        3, // retryCount
        2000 // delayTime
      );
      requests.push(request);
    });

    const paginatedResults = await Promise.all(requests);
    const results = this.parseHistoricalPrices(
      paginatedResults,
      addresses,
      start,
      aggregateBy
    );
    return results;
  }

  private swapAddress(address: string): string {
    switch (address) {
      case '0xcbb327140e91039a3f4e8ecf144b0f12238d6fdd':
        return '0x78ea17559b3d2cf85a7f9c2c704eda119db5e6de';
      case '0xfb8fa9f5f0bd47591ba6f7c75fe519e3e8fde429':
        return '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664';
      case '0x4b20b17bdb9991a8549f5ceb8bd813419e537209':
        return '0xd586e7f844cea2f87f50152665bcbc2c279d8d70';
      case '0xd00ae08403b9bbb9124bb305c09058e32c39a48c':
        return '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7';
      case '0xe7a282da986f01de6677250c90ce22a819ce9a9d':
        return '0x78ea17559b3d2cf85a7f9c2c704eda119db5e6de';
      default:
        return address;
    }
  }

  private parsePaginatedTokens(paginatedResults: TokenPrices[]): TokenPrices {
    const results = paginatedResults.reduce(
      (result, page) => ({ ...result, ...page }),
      {}
    );
    const entries = Object.entries(results);
    const parsedEntries = entries
      .filter(result => Object.keys(result[1]).length > 0)
      .map(result => [this.addressMapOut(result[0]), result[1]]);
    return Object.fromEntries(parsedEntries);
  }

  private parseHistoricalPrices(
    results: HistoricalPriceResponse[],
    addresses: string[],
    start: number,
    aggregateBy: 'day' | 'hour' = 'day'
  ): HistoricalPrices {
    const assetPrices = Object.fromEntries(
      addresses.map((address, index) => {
        address = this.addressMapOut(address);
        const result = results[index].prices;
        const prices = {};
        let dayTimestamp = start;
        if (aggregateBy === 'hour') {
          const pricesByHour = groupBy(result, r =>
            getUnixTime(startOfHour(fromUnixTime(r[0] / 1000)))
          );
          for (const key of Object.keys(pricesByHour)) {
            const price = (last(pricesByHour[key]) || [])[1] || 0;
            // TODO - remove this conditional once coingecko supports wstETH
            prices[Number(key) * 1000] =
              address === this.appAddresses.stETH
                ? price * TOKENS.Prices.ExchangeRates.wstETH.stETH
                : price;
          }
        } else if (aggregateBy === 'day') {
          for (const key in result) {
            const value = result[key];
            const [timestamp, price] = value;
            if (timestamp > dayTimestamp * 1000) {
              // TODO - remove this conditional once coingecko supports wstETH
              prices[dayTimestamp * 1000] =
                address === this.appAddresses.stETH
                  ? price * TOKENS.Prices.ExchangeRates.wstETH.stETH
                  : price;
              dayTimestamp += twentyFourHoursInSecs;
            }
          }
        }
        return [address, prices];
      })
    );

    const prices = {};
    for (const asset in assetPrices) {
      const assetPrice = assetPrices[asset];
      for (const timestamp in assetPrice) {
        const price = assetPrice[timestamp];
        if (!(timestamp in prices)) {
          prices[timestamp] = [];
        }
        prices[timestamp].push(price);
      }
    }
    return prices;
  }

  /**
   * Map address to mainnet address if app network is a testnet
   */
  @returnChecksum()
  public addressMapIn(address: string): string {
    const addressMap = TOKENS.Prices.ChainMap[this.appNetwork];
    if (!addressMap) return address;
    return addressMap[address.toLowerCase()] || address;
  }

  /**
   * Map mainnet address back to testnet address
   */
  @returnChecksum()
  public addressMapOut(address: string): string {
    const addressMap = TOKENS.Prices.ChainMap[this.appNetwork];
    if (!addressMap) return address;
    return invert(addressMap)[address.toLowerCase()] || address;
  }
}
