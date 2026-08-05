import { CosmosClient, Container } from '@azure/cosmos';

export interface PlayerProfile {
  id?: string;
  playerId: string;
  displayName: string;
  avatarUrl: string;
  highScore: number;
  lastPlayedAt: string;
}

class PlayerStore {
  private container: Container | null = null;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const connectionString = process.env.COSMOS_CONNECTION_STRING || process.env.COSMOS_DB_CONNECTION_STRING;
      if (!connectionString) {
        // Cosmos DB connection string not provided yet (local mode or Task 7 Vault integration pending)
        return;
      }

      const client = new CosmosClient(connectionString);
      const database = client.database(process.env.COSMOS_DB_NAME || 'diepcustom-db');
      this.container = database.container(process.env.COSMOS_CONTAINER_NAME || 'players');
      this.isInitialized = true;
    } catch (error) {
      console.warn('[PlayerStore] Failed to initialize Cosmos DB client:', error);
      this.container = null;
      this.isInitialized = false;
    }
  }

  public async upsertPlayer(player: PlayerProfile): Promise<void> {
    try {
      if (!this.isInitialized || !this.container) {
        this.init();
      }
      if (!this.container) return;

      const itemToSave: PlayerProfile = {
        ...player,
        id: player.playerId, // Cosmos DB requires an 'id' field
        lastPlayedAt: new Date().toISOString()
      };

      await this.container.items.upsert(itemToSave);
    } catch (error) {
      console.warn('[PlayerStore] Error upserting player profile:', error);
    }
  }

  public async getPlayer(playerId: string): Promise<PlayerProfile | null> {
    try {
      if (!this.isInitialized || !this.container) {
        this.init();
      }
      if (!this.container) return null;

      const { resource } = await this.container.item(playerId, playerId).read<PlayerProfile>();
      return resource || null;
    } catch (error) {
      console.warn('[PlayerStore] Error fetching player profile:', error);
      return null;
    }
  }
}

export const playerStore = new PlayerStore();
