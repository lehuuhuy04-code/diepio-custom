import { ServiceBusClient, ServiceBusSender, ServiceBusReceiver } from "@azure/service-bus";
import { EventEmitter } from "events";

export interface AnnouncementMessage {
  text: string;
  color?: number;
  time?: number;
  id?: string;
}

class AnnouncementBus {
  private client: ServiceBusClient | null = null;
  private sender: ServiceBusSender | null = null;
  private receiver: ServiceBusReceiver | null = null;
  private emitter = new EventEmitter();
  private isInitialized = false;
  private isReceiving = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const connectionString = process.env.SERVICEBUS_CONNECTION_STRING;
      if (!connectionString) {
        return;
      }

      this.client = new ServiceBusClient(connectionString);
      this.sender = this.client.createSender("global-announcements");
      this.receiver = this.client.createReceiver("global-announcements", "sub-global-broadcast");
      this.isInitialized = true;

      this.startListening();
    } catch (error) {
      console.warn("[AnnouncementBus] Failed to initialize Service Bus client:", error);
      this.isInitialized = false;
    }
  }

  private startListening() {
    if (!this.receiver || this.isReceiving) return;

    try {
      this.isReceiving = true;
      this.receiver.subscribe({
        processMessage: async (message) => {
          if (message.body) {
            const data = typeof message.body === "string" ? JSON.parse(message.body) : message.body;
            this.emitter.emit("announcement", data as AnnouncementMessage);
          }
        },
        processError: async (args) => {
          console.warn("[AnnouncementBus] Error receiving message:", args.error);
        }
      });
    } catch (error) {
      console.warn("[AnnouncementBus] Failed to start Service Bus listener:", error);
      this.isReceiving = false;
    }
  }

  public async publish(announcement: AnnouncementMessage): Promise<void> {
    try {
      if (!this.isInitialized || !this.sender) {
        this.init();
      }
      if (!this.sender) return;

      await this.sender.sendMessages({
        body: announcement,
        contentType: "application/json"
      });
    } catch (error) {
      console.warn("[AnnouncementBus] Error publishing announcement:", error);
    }
  }

  public subscribe(onAnnouncement: (announcement: AnnouncementMessage) => void): void {
    this.emitter.on("announcement", onAnnouncement);
  }
}

export const announcementBus = new AnnouncementBus();
