import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertDeviceSchema, insertSecurityEventSchema, insertParentalProfileSchema, insertNetworkSettingsSchema, insertPortForwardRuleSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store connected WebSocket clients
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('WebSocket client connected');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast function for real-time updates
  function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Device routes
  app.get("/api/devices", async (req, res) => {
    try {
      const devices = await storage.getDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.post("/api/devices", async (req, res) => {
    try {
      const deviceData = insertDeviceSchema.parse(req.body);
      const device = await storage.createDevice(deviceData);
      broadcast({ type: 'device_added', device });
      res.json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid device data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create device" });
      }
    }
  });

  app.patch("/api/devices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const device = await storage.updateDevice(id, updates);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      broadcast({ type: 'device_updated', device });
      res.json(device);
    } catch (error) {
      res.status(500).json({ message: "Failed to update device" });
    }
  });

  app.delete("/api/devices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDevice(id);
      if (!success) {
        return res.status(404).json({ message: "Device not found" });
      }
      broadcast({ type: 'device_deleted', id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete device" });
    }
  });

  // Security event routes
  app.get("/api/security/events", async (req, res) => {
    try {
      const events = await storage.getSecurityEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch security events" });
    }
  });

  app.post("/api/security/events", async (req, res) => {
    try {
      const eventData = insertSecurityEventSchema.parse(req.body);
      const event = await storage.createSecurityEvent(eventData);
      broadcast({ type: 'security_event', event });
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid event data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create security event" });
      }
    }
  });

  app.patch("/api/security/events/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const event = await storage.markEventAsRead(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark event as read" });
    }
  });

  // Parental profile routes
  app.get("/api/parental/profiles", async (req, res) => {
    try {
      const profiles = await storage.getParentalProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parental profiles" });
    }
  });

  app.post("/api/parental/profiles", async (req, res) => {
    try {
      const profileData = insertParentalProfileSchema.parse(req.body);
      const profile = await storage.createParentalProfile(profileData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create parental profile" });
      }
    }
  });

  app.patch("/api/parental/profiles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const profile = await storage.updateParentalProfile(id, updates);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update parental profile" });
    }
  });

  app.delete("/api/parental/profiles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteParentalProfile(id);
      if (!success) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete parental profile" });
    }
  });

  // Network settings routes
  app.get("/api/network/settings", async (req, res) => {
    try {
      const settings = await storage.getNetworkSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network settings" });
    }
  });

  app.patch("/api/network/settings", async (req, res) => {
    try {
      const updates = req.body;
      const settings = await storage.updateNetworkSettings(updates);
      broadcast({ type: 'settings_updated', settings });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update network settings" });
    }
  });

  // Network stats routes
  app.get("/api/network/stats", async (req, res) => {
    try {
      const stats = await storage.getNetworkStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network stats" });
    }
  });

  // Port forward rules routes
  app.get("/api/network/port-forward", async (req, res) => {
    try {
      const rules = await storage.getPortForwardRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch port forward rules" });
    }
  });

  app.post("/api/network/port-forward", async (req, res) => {
    try {
      const ruleData = insertPortForwardRuleSchema.parse(req.body);
      const rule = await storage.createPortForwardRule(ruleData);
      res.json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid rule data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create port forward rule" });
      }
    }
  });

  app.delete("/api/network/port-forward/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePortForwardRule(id);
      if (!success) {
        return res.status(404).json({ message: "Rule not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete port forward rule" });
    }
  });

  // Simulate real-time network updates
  setInterval(() => {
    const randomUpload = (Math.random() * 50 + 10).toFixed(1);
    const randomDownload = (Math.random() * 200 + 100).toFixed(1);
    
    storage.updateNetworkStats({
      uploadSpeed: `${randomUpload} Mbps`,
      downloadSpeed: `${randomDownload} Mbps`,
    }).then(stats => {
      broadcast({ type: 'stats_updated', stats });
    });
  }, 5000); // Update every 5 seconds

  return httpServer;
}
