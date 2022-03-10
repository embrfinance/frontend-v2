import axios from 'axios';
import { configService as _configService } from '@/services/config/config.service';

export default class XEmbrSubgraphClient {
  url: string;

  constructor(private readonly configService = _configService) {
    this.url = configService.network.xembrSubgraph || '';
  }

  public async getXembr() {
    const query = `
    query {
      xembrs(
        first: 1
        skip: 0
        orderBy: "id"
        orderDirection: "desc"
      ) {
        id
        tokenCount
        activeTokenCount
        totalStaking
        totalCooling
        totalXembr
        rewards {
          id
          index
          symbol
          name
          decimals
          address
          expiry
          active
          totalClaimed
          totalUnclaimed
        }
      }
    }`;

    const data = await this.get(query);
    return data.xembrs[0];
  }

  public async getXembrUser(userAddress: string) {
    const query = `
    query {
      user: user(id: "${userAddress.toLowerCase()}") {
        id
        totalXembr
        staking
        cooling
        questsCompleted
        rewards {
          address
          claimed
        }
      }
    }
    `;

    const data = await this.get(query);
    return data;
  }

  private async get(query) {
    try {
      const {
        data: { data }
      } = await axios.post(
        this.url,
        { query },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return data;
    } catch (error) {
      console.error(error);
    }
  }
}

export const xembrSubgraphClient = new XEmbrSubgraphClient();
