import { AppConfigurationClient } from "@azure/app-configuration";
import { DefaultAzureCredential } from "@azure/identity";

class AppConfigStore {
    private client: AppConfigurationClient | null = null;
    private isInitialized = false;

    constructor() {
        this.init();
    }

    private init() {
        try {
            const connectionString = process.env.APPCONFIG_CONNECTION_STRING;
            const endpoint = process.env.APPCONFIG_ENDPOINT || "https://appconfig-diepcustom.azconfig.io";

            if (connectionString) {
                this.client = new AppConfigurationClient(connectionString);
                this.isInitialized = true;
            } else if (endpoint) {
                const credential = new DefaultAzureCredential();
                this.client = new AppConfigurationClient(endpoint, credential);
                this.isInitialized = true;
            }
        } catch (error) {
            console.warn("[AppConfigStore] Failed to initialize App Configuration client:", error);
            this.client = null;
            this.isInitialized = false;
        }
    }

    public async getValue(key: string, defaultValue: string): Promise<string> {
        try {
            if (!this.isInitialized || !this.client) {
                this.init();
            }
            if (!this.client) return defaultValue;

            const setting = await this.client.getConfigurationSetting({ key });
            if (setting && setting.value !== undefined) {
                return setting.value;
            }
        } catch (error) {
            // Fail-safe: Fallback to default value seamlessly on error or when offline
        }
        return defaultValue;
    }

    public async getNumber(key: string, defaultValue: number): Promise<number> {
        const valStr = await this.getValue(key, String(defaultValue));
        const parsed = parseInt(valStr, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }
}

export const appConfigStore = new AppConfigStore();
