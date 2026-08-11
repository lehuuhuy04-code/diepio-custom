const { app } = require('@azure/functions');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

let cachedWebhookUrl = null;

async function getDiscordWebhookUrl() {
    if (cachedWebhookUrl) return cachedWebhookUrl;

    const envValue = process.env.DISCORD_WEBHOOK_URL;
    if (envValue && !envValue.startsWith("@Microsoft.KeyVault")) {
        cachedWebhookUrl = envValue;
        return cachedWebhookUrl;
    }

    try {
        const vaultUrl = "https://kv-diepcustom.vault.azure.net";
        const credential = new DefaultAzureCredential();
        const secretClient = new SecretClient(vaultUrl, credential);
        const secret = await secretClient.getSecret("discord-webhook-url");
        cachedWebhookUrl = secret.value;
        return cachedWebhookUrl;
    } catch (e) {
        console.error("Failed to fetch discord-webhook-url secret from Key Vault:", e);
        return envValue || null;
    }
}

app.http('welcome', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const reqOrigin = request.headers.get('origin') || '*';
        const corsHeaders = {
            "Access-Control-Allow-Origin": reqOrigin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie"
        };

        if (request.method === 'OPTIONS') {
            return {
                status: 204,
                headers: corsHeaders
            };
        }

        try {
            let userDisplayName = null;

            // Server-Side Self-Verification via Easy Auth /.auth/me
            const cookieHeader = request.headers.get('cookie');
            if (cookieHeader) {
                try {
                    const authMeRes = await fetch("https://ca-diepcustom-server.ashypebble-5d6531bb.southeastasia.azurecontainerapps.io/.auth/me", {
                        headers: { "Cookie": cookieHeader }
                    });
                    if (authMeRes.ok) {
                        const authMeData = await authMeRes.json();
                        if (authMeData && authMeData.length > 0 && authMeData[0].user_id) {
                            const user = authMeData[0];
                            userDisplayName = user.user_id;
                            if (user.user_claims && Array.isArray(user.user_claims)) {
                                const nameClaim = user.user_claims.find(c => c.typ && (c.typ.endsWith("/name") || c.typ.endsWith("/emailaddress")));
                                if (nameClaim && nameClaim.val) {
                                    userDisplayName = nameClaim.val;
                                }
                            }
                        }
                    }
                } catch (verifyErr) {
                    context.log("Server self-verification via /.auth/me failed:", verifyErr);
                }
            }

            if (!userDisplayName) {
                userDisplayName = "Người chơi DiepCustom";
            }

            const webhookUrl = await getDiscordWebhookUrl();
            if (!webhookUrl) {
                return {
                    status: 500,
                    headers: corsHeaders,
                    jsonBody: { success: false, error: "Discord Webhook URL not configured" }
                };
            }

            // Post Welcome notification to Discord
            const discordPayload = {
                content: `🎉 **${userDisplayName}** vừa đăng nhập vào DiepCustom!`
            };

            const discordRes = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(discordPayload)
            });

            if (!discordRes.ok) {
                const errText = await discordRes.text();
                context.error("Discord Webhook post failed:", discordRes.status, errText);
            }

            return {
                status: 200,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json"
                },
                jsonBody: {
                    success: true,
                    message: "Welcome notification sent to Discord",
                    user: userDisplayName
                }
            };
        } catch (error) {
            context.error("Welcome function error:", error);
            return {
                status: 500,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json"
                },
                jsonBody: {
                    success: false,
                    error: "Failed to send welcome notification",
                    message: error.message || String(error)
                }
            };
        }
    }
});
