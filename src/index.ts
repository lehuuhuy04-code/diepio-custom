/*
    DiepCustom - custom tank game server that shares diep.io's WebSocket protocol
    Copyright (C) 2022 ABCxFF (github.com/ABCxFF)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>
*/

import * as fs from "fs";
import { App, SHARED_COMPRESSOR, WebSocket, WebSocketBehavior } from "uWebSockets.js";
import Client, { ClientWrapper } from "./Client";
import * as config from "./config"
import * as util from "./util";
import GameServer from "./Game";
import TankDefinitions from "./Const/TankDefinitions";
import { commandDefinitions } from "./Const/Commands";
import { ColorsHexCode } from "./Const/Enums";

import FFAArena from "./Gamemodes/FFA";
import SandboxArena from "./Gamemodes/Sandbox";

import { appConfigStore } from "./Cloud/AppConfigStore";

const PORT = config.serverPort;
const ENABLE_API = config.enableApi && config.apiLocation;
const ENABLE_CLIENT = config.enableClient && config.clientLocation && fs.existsSync(config.clientLocation);

const app = App({});

// Fetch non-secret runtime configs from Azure App Configuration on startup
appConfigStore.getNumber("max-players-per-room", config.maxPlayersPerRoom).then((maxPlayers) => {
    util.log(`[AppConfig] Fetched max-players-per-room from Azure App Configuration: ${maxPlayers}`);
});
appConfigStore.getValue("arena-type", config.arenaType).then((arenaType) => {
    util.log(`[AppConfig] Fetched arena-type from Azure App Configuration: ${arenaType}`);
});

if (ENABLE_API) util.log(`Rest API hosting is enabled and is now being hosted at /${config.apiLocation}`);
if (ENABLE_CLIENT) util.log(`Client hosting is enabled and is now being hosted from ${config.clientLocation}`);

export const bannedClients = new Set<string>();
const connections = new Map<string, number>();
const allClients = new Set<Client>();
export const games: GameServer[] = [];

app.ws("/*", {
    compression: SHARED_COMPRESSOR,
    sendPingsAutomatically: true,
    maxPayloadLength: config.wssMaxMessageSize,
    idleTimeout: 60,
    upgrade: (res, req, context) => {
        res.upgrade({ client: null, ipAddress: "", gamemode: req.getUrl().slice(1) } as ClientWrapper,
            req.getHeader('sec-websocket-key'),
            req.getHeader('sec-websocket-protocol'),
            req.getHeader('sec-websocket-extensions'),
            context);
    },
    open: (ws: WebSocket<ClientWrapper>) => {
        const ipAddress = Buffer.from(ws.getRemoteAddressAsText()).toString();
        let conns = 0;
        if (connections.has(ipAddress)) conns = connections.get(ipAddress) as number;
        if (conns >= config.connectionsPerIp || bannedClients.has(ipAddress)) {
            return ws.close();
        }
        connections.set(ipAddress, conns + 1);
        let requestedGamemode = ws.getUserData().gamemode;
        let game = games.find(({ gamemode }) => gamemode === requestedGamemode);
        if (!game) {
            util.warn(`[WSS] Gamemode '${requestedGamemode}' not found, falling back to default game '${games[0]?.gamemode}'`);
            game = games[0];
        }
        if (!game) {
            return ws.close();
        }
        const client = new Client(ws, game);
        allClients.add(client);
        ws.getUserData().ipAddress = ipAddress;
        ws.getUserData().client = client;
    },
    message: (ws: WebSocket<ClientWrapper>, message, isBinary) => {
        const {client} = ws.getUserData();
        if (!client) throw new Error("Unexistant client for websocket");
        client.onMessage(message, isBinary);
    },
    close: (ws: WebSocket<ClientWrapper>, code, message) => {
        const {client, ipAddress} = ws.getUserData();
        if (client) {
            connections.set(ipAddress, connections.get(ipAddress) as number - 1);
            client.onClose(code, message);
            allClients.delete(client);
        }
    }
} as WebSocketBehavior<ClientWrapper>);

app.get("/*", (res, req) => {
    util.saveToVLog("Incoming request to " + req.getUrl());
    res.onAborted(() => {});
    if (ENABLE_API && req.getUrl().startsWith(`/${config.apiLocation}`)) {
        res.writeHeader("Access-Control-Allow-Origin", config.corsAllowedOrigins);
        res.writeHeader("Access-Control-Allow-Headers", "*");
        res.writeHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        switch (req.getUrl().slice(config.apiLocation.length + 1)) {
            case "/":
                res.writeStatus("200 OK").end();
                return;
            case "/auth-done": {
                const principalHeader = req.getHeader('x-ms-client-principal');
                let displayName = "Game Player";
                if (principalHeader) {
                    try {
                        const jsonStr = Buffer.from(principalHeader, 'base64').toString('utf-8');
                        const parsed = JSON.parse(jsonStr);
                        if (parsed.claims && Array.isArray(parsed.claims)) {
                            const nameClaim = parsed.claims.find((c: any) => c.typ && (c.typ.endsWith('/name') || c.typ.endsWith('/emailaddress')));
                            if (nameClaim && nameClaim.val) displayName = nameClaim.val;
                        } else if (parsed.user_id) {
                            displayName = parsed.user_id;
                        }
                    } catch (e) {
                        util.warn("[Auth] Failed to parse x-ms-client-principal header: " + e);
                    }
                }
                const redirectUrl = "https://stdiepcustomclient.z23.web.core.windows.net/#user=" + encodeURIComponent(displayName);
                res.writeStatus("302 Found")
                   .writeHeader("Location", redirectUrl)
                   .end();
                return;
            }
            case "/tanks":
                res.writeStatus("200 OK").end(JSON.stringify(TankDefinitions));
                return;
            case "/servers":
                res.writeStatus("200 OK").end(JSON.stringify(games.map(({ gamemode, name }) => ({ gamemode, name }))));
                return;
            case "/commands":
                res.writeStatus("200 OK").end(JSON.stringify(config.enableCommands ? Object.values(commandDefinitions) : []));
                return;
            case "/colors":
                res.writeStatus("200 OK").end(JSON.stringify(ColorsHexCode));
                return;
        }
    }

    if (ENABLE_CLIENT) {
        let file: string | null = null;
        let contentType = "text/html"
        switch (req.getUrl()) {
            case "/":
                file = config.clientLocation + "/index.html";
                contentType = "text/html";
                break;
            case "/loader.js":
                file = config.clientLocation + "/loader.js";
                contentType = "application/javascript";
                break;
            case "/input.js":
                file = config.clientLocation + "/input.js";
                contentType = "application/javascript";
                break;
            case "/dma.js":
                file = config.clientLocation + "/dma.js";
                contentType = "application/javascript";
                break;
            case "/config.js":
                file = config.clientLocation + "/config.js";
                contentType = "application/javascript";
                break;
        }

        res.writeHeader("Content-Type", contentType + "; charset=utf-8");

        if (file && fs.existsSync(file)) {
            res.writeStatus("200 OK").end(fs.readFileSync(file));
            return;
        }

        res.writeStatus("404 Not Found").end(fs.readFileSync(config.clientLocation + "/404.html"));
        return;
    } 
});

app.listen(PORT, (success) => {
    if (!success) throw new Error("Server failed");

    util.log(`Listening on port ${PORT}`);

    if (config.arenaType) {
        let arenaClass;
        let name;
        switch (config.arenaType.toLowerCase()) {
            case "ffa":
                arenaClass = FFAArena;
                name = "FFA";
                break;
            case "sandbox":
                arenaClass = SandboxArena;
                name = "Sandbox";
                break;
            default:
                throw new Error(`Unknown ARENA_TYPE: ${config.arenaType}. Supported types: ffa, sandbox.`);
        }
        util.log(`Booting up dedicated ${name} server instance...`);
        const primaryGame = new GameServer(arenaClass, name);
        primaryGame.isDefaultRoom = true;
        games.push(primaryGame);
    } else {
        // RULES(0): No two game servers should share the same endpoint
        // NOTES(0): Running all default servers for local testing
        util.log(`Booting up all default server instances (Local Mode)...`);
        const ffa = new GameServer(FFAArena, "FFA");
        ffa.isDefaultRoom = true;

        const sbx = new GameServer(SandboxArena, "Sandbox");
        sbx.isDefaultRoom = true;
        
        games.push(ffa, sbx);
    }

    util.saveToLog("Servers up", "All servers booted up.", 0x37F554);
    util.log("Dumping endpoint -> gamemode routing table");
    for (const game of games) console.log("> " + `localhost:${config.serverPort}/${game.gamemode}`.padEnd(40, " ") + " -> " + game.name);
});

process.on("uncaughtException", (error) => {
    util.saveToLog("Uncaught Exception", '```\n' + error.stack + '\n```', 0xFF0000);

    throw error;
});
