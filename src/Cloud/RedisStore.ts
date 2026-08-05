import Redis from 'ioredis';

export interface DisconnectedSessionData {
  sessionId?: string;
  camera: any;
  expireAt: number;
  partyCode?: string;
  createdAt?: string;
}

export class RedisStore {
  private redis: Redis | null = null;
  private fallbackMap: Map<string, DisconnectedSessionData> = new Map();
  private isConnected = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const redisUrl = process.env.REDIS_CONNECTION_STRING || process.env.REDIS_URL;
      if (!redisUrl) {
        return;
      }
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: () => null
      });

      this.redis.on('connect', () => {
        this.isConnected = true;
        console.log('[RedisStore] Connected to Azure Cache for Redis.');
      });

      this.redis.on('error', (err) => {
        this.isConnected = false;
        console.warn('[RedisStore] Redis error (using fallback in-memory store):', err.message);
      });
    } catch (err) {
      this.redis = null;
      this.isConnected = false;
    }
  }

  public set(sessionId: string, data: DisconnectedSessionData): void {
    const sessionData: DisconnectedSessionData = { ...data, sessionId };
    this.fallbackMap.set(sessionId, sessionData);
    if (this.redis && this.isConnected) {
      try {
        const payload = JSON.stringify({
          sessionId: sessionData.sessionId,
          expireAt: sessionData.expireAt,
          partyCode: sessionData.partyCode || '',
          createdAt: new Date().toISOString()
        });
        this.redis.set(`session:${sessionId}`, payload, 'EX', 60).catch(() => {});
      } catch (_) {}
    }
  }

  public get(sessionId: string): DisconnectedSessionData | undefined {
    return this.fallbackMap.get(sessionId);
  }

  public async getFromRedis(sessionId: string): Promise<any> {
    if (this.redis && this.isConnected) {
      try {
        const data = await this.redis.get(`session:${sessionId}`);
        return data ? JSON.parse(data) : null;
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  public has(sessionId: string): boolean {
    return this.fallbackMap.has(sessionId);
  }

  public delete(sessionId: string): boolean {
    if (this.redis && this.isConnected) {
      try {
        this.redis.del(`session:${sessionId}`).catch(() => {});
      } catch (_) {}
    }
    return this.fallbackMap.delete(sessionId);
  }

  public entries(): IterableIterator<[string, DisconnectedSessionData]> {
    return this.fallbackMap.entries();
  }
}

export const redisStore = new RedisStore();
