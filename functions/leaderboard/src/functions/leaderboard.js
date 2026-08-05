const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

let cachedConnectionString = null;
let cosmosClient = null;

async function getConnectionString() {
    if (cachedConnectionString) return cachedConnectionString;

    const envValue = process.env.COSMOS_CONNECTION_STRING;
    if (envValue && !envValue.startsWith("@Microsoft.KeyVault")) {
        cachedConnectionString = envValue;
        return cachedConnectionString;
    }

    const vaultUrl = "https://kv-diepcustom.vault.azure.net";
    const credential = new DefaultAzureCredential();
    const secretClient = new SecretClient(vaultUrl, credential);
    const secret = await secretClient.getSecret("cosmos-connection-string");
    cachedConnectionString = secret.value;
    return cachedConnectionString;
}

async function getCosmosClient() {
    if (!cosmosClient) {
        const connectionString = await getConnectionString();
        cosmosClient = new CosmosClient(connectionString);
    }
    return cosmosClient;
}

app.http('leaderboard', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const limitParam = request.query.get('limit') || '10';
            const limit = parseInt(limitParam, 10);
            const topLimit = isNaN(limit) || limit <= 0 ? 10 : Math.min(limit, 50);

            const client = await getCosmosClient();
            const database = client.database("diepcustom-db");
            const container = database.container("players");

            const querySpec = {
                query: "SELECT TOP @limit c.playerId, c.displayName, c.highScore, c.avatarUrl, c.lastPlayedAt FROM c WHERE IS_DEFINED(c.highScore) ORDER BY c.highScore DESC",
                parameters: [{ name: "@limit", value: topLimit }]
            };

            const { resources } = await container.items.query(querySpec).fetchAll();

            return {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                jsonBody: {
                    success: true,
                    count: resources.length,
                    leaderboard: resources,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            context.error("Leaderboard function error:", error);
            return {
                status: 500,
                headers: { "Content-Type": "application/json" },
                jsonBody: {
                    success: false,
                    error: "Failed to fetch leaderboard data",
                    message: error.message || String(error)
                }
            };
        }
    }
});
