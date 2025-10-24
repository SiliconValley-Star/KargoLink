export interface CacheOptions {
    ttl?: number;
    tags?: string[];
}
export interface CacheItem<T = any> {
    data: T;
    createdAt: number;
    expiresAt: number;
    tags: string[];
}
declare class RedisService {
    private client;
    private isConnected;
    private defaultTTL;
    private keyPrefix;
    constructor();
    private initializeClient;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private formatKey;
    get<T = any>(key: string): Promise<T | null>;
    set<T = any>(key: string, value: T, options?: CacheOptions): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    exists(key: string): Promise<boolean>;
    invalidateByTag(tag: string): Promise<number>;
    mget<T = any>(keys: string[]): Promise<(T | null)[]>;
    mset<T = any>(entries: Array<{
        key: string;
        value: T;
        options?: CacheOptions;
    }>): Promise<boolean>;
    incr(key: string, increment?: number): Promise<number | null>;
    expire(key: string, ttl: number): Promise<boolean>;
    getStats(): Promise<{
        connected: boolean;
        memory: string | null;
        keys: number;
        hits: string | null;
        misses: string | null;
    }>;
    clear(): Promise<boolean>;
    keys(pattern: string): Promise<string[]>;
    healthCheck(): Promise<boolean>;
}
declare const redisService: RedisService;
export default redisService;
export { RedisService };
//# sourceMappingURL=redis.d.ts.map