import { type Device, type InsertDevice, type SecurityEvent, type InsertSecurityEvent, type ParentalProfile, type InsertParentalProfile, type NetworkSettings, type InsertNetworkSettings, type NetworkStats, type PortForwardRule, type InsertPortForwardRule } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Devices
  getDevices(): Promise<Device[]>;
  getDevice(id: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: string, device: Partial<Device>): Promise<Device | undefined>;
  deleteDevice(id: string): Promise<boolean>;
  
  // Security Events
  getSecurityEvents(): Promise<SecurityEvent[]>;
  createSecurityEvent(event: InsertSecurityEvent): Promise<SecurityEvent>;
  markEventAsRead(id: string): Promise<SecurityEvent | undefined>;
  
  // Parental Profiles
  getParentalProfiles(): Promise<ParentalProfile[]>;
  getParentalProfile(id: string): Promise<ParentalProfile | undefined>;
  createParentalProfile(profile: InsertParentalProfile): Promise<ParentalProfile>;
  updateParentalProfile(id: string, profile: Partial<ParentalProfile>): Promise<ParentalProfile | undefined>;
  deleteParentalProfile(id: string): Promise<boolean>;
  
  // Network Settings
  getNetworkSettings(): Promise<NetworkSettings>;
  updateNetworkSettings(settings: Partial<NetworkSettings>): Promise<NetworkSettings>;
  
  // Network Stats
  getNetworkStats(): Promise<NetworkStats>;
  updateNetworkStats(stats: Partial<NetworkStats>): Promise<NetworkStats>;
  
  // Port Forward Rules
  getPortForwardRules(): Promise<PortForwardRule[]>;
  createPortForwardRule(rule: InsertPortForwardRule): Promise<PortForwardRule>;
  deletePortForwardRule(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private devices: Map<string, Device>;
  private securityEvents: Map<string, SecurityEvent>;
  private parentalProfiles: Map<string, ParentalProfile>;
  private networkSettings: NetworkSettings;
  private networkStats: NetworkStats;
  private portForwardRules: Map<string, PortForwardRule>;

  constructor() {
    this.devices = new Map();
    this.securityEvents = new Map();
    this.parentalProfiles = new Map();
    this.portForwardRules = new Map();
    
    // Initialize with default network settings
    this.networkSettings = {
      id: "main",
      ssid: "MyHomeNetwork",
      password: "SecurePassword123",
      security: "WPA3",
      channel: "Auto",
      guestEnabled: false,
      guestSsid: "MyHomeNetwork_Guest",
      guestPassword: "Welcome123",
      firewallEnabled: true,
      ddosProtection: true,
      vpnEnabled: false,
    };
    
    // Initialize with default network stats
    this.networkStats = {
      id: "current",
      uploadSpeed: "23.4 Mbps",
      downloadSpeed: "156.8 Mbps",
      totalDevices: 0,
      dataUsage: "2.3 GB",
      lastUpdated: new Date(),
    };
    
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Add some default devices
    const defaultDevices: InsertDevice[] = [
      {
        name: "MacBook Pro",
        ip: "192.168.1.101",
        mac: "00:1B:44:11:3A:B7",
        deviceType: "laptop",
        status: "active",
        bandwidth: "45.2 Mbps",
        isBlocked: false,
      },
      {
        name: "iPhone 14",
        ip: "192.168.1.102", 
        mac: "00:1B:44:11:3A:B8",
        deviceType: "phone",
        status: "active",
        bandwidth: "12.8 Mbps",
        isBlocked: false,
      },
      {
        name: "Security Camera",
        ip: "192.168.1.150",
        mac: "00:1B:44:11:3A:B9",
        deviceType: "camera",
        status: "active",
        bandwidth: "8.5 Mbps",
        isBlocked: false,
      },
    ];

    defaultDevices.forEach(device => {
      const id = randomUUID();
      const deviceWithId: Device = {
        ...device,
        id,
        connectionTime: new Date(),
        status: device.status || "active",
        bandwidth: device.bandwidth || "0 Mbps",
        isBlocked: device.isBlocked || false,
        profile: device.profile || null
      };
      this.devices.set(id, deviceWithId);
    });

    // Add default security events
    const defaultEvents: InsertSecurityEvent[] = [
      {
        type: "system_status",
        severity: "low",
        title: "All systems secure",
        description: "Last scan completed successfully",
        isRead: false,
      },
      {
        type: "firmware_update",
        severity: "medium",
        title: "Firmware update available",
        description: "Version 2.1.3 includes security patches",
        isRead: false,
      },
    ];

    defaultEvents.forEach(event => {
      const id = randomUUID();
      const eventWithId: SecurityEvent = {
        ...event,
        id,
        timestamp: new Date(),
        isRead: event.isRead || false,
        deviceId: event.deviceId || null
      };
      this.securityEvents.set(id, eventWithId);
    });

    // Add default parental profiles
    const defaultProfiles: InsertParentalProfile[] = [
      {
        name: "Kids Profile",
        isActive: true,
        bedtime: "21:00",
        dailyTimeLimit: 120, // 2 hours
        blockedCategories: ["adult", "social_media"],
        allowedSites: ["education.com", "khan-academy.org"],
        blockedSites: [],
      },
      {
        name: "Guest Profile",
        isActive: false,
        bedtime: null,
        dailyTimeLimit: null,
        blockedCategories: ["adult"],
        allowedSites: [],
        blockedSites: [],
      },
    ];

    defaultProfiles.forEach(profile => {
      const id = randomUUID();
      const profileWithId: ParentalProfile = {
        ...profile,
        id,
        isActive: profile.isActive !== undefined ? profile.isActive : true,
        bedtime: profile.bedtime || null,
        dailyTimeLimit: profile.dailyTimeLimit || null,
        blockedCategories: profile.blockedCategories || [],
        allowedSites: profile.allowedSites || [],
        blockedSites: profile.blockedSites || []
      };
      this.parentalProfiles.set(id, profileWithId);
    });

    // Update network stats with device count
    this.networkStats.totalDevices = this.devices.size;
  }

  // Device methods
  async getDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async getDevice(id: string): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = randomUUID();
    const device: Device = {
      ...insertDevice,
      id,
      connectionTime: new Date(),
      status: insertDevice.status || "active",
      bandwidth: insertDevice.bandwidth || "0 Mbps",
      isBlocked: insertDevice.isBlocked || false,
      profile: insertDevice.profile || null
    };
    this.devices.set(id, device);
    this.networkStats.totalDevices = this.devices.size;
    return device;
  }

  async updateDevice(id: string, updates: Partial<Device>): Promise<Device | undefined> {
    const device = this.devices.get(id);
    if (!device) return undefined;

    const updatedDevice = { ...device, ...updates };
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }

  async deleteDevice(id: string): Promise<boolean> {
    const deleted = this.devices.delete(id);
    if (deleted) {
      this.networkStats.totalDevices = this.devices.size;
    }
    return deleted;
  }

  // Security Event methods
  async getSecurityEvents(): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values()).sort(
      (a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)
    );
  }

  async createSecurityEvent(insertEvent: InsertSecurityEvent): Promise<SecurityEvent> {
    const id = randomUUID();
    const event: SecurityEvent = {
      ...insertEvent,
      id,
      timestamp: new Date(),
      isRead: insertEvent.isRead || false,
      deviceId: insertEvent.deviceId || null
    };
    this.securityEvents.set(id, event);
    return event;
  }

  async markEventAsRead(id: string): Promise<SecurityEvent | undefined> {
    const event = this.securityEvents.get(id);
    if (!event) return undefined;

    const updatedEvent = { ...event, isRead: true };
    this.securityEvents.set(id, updatedEvent);
    return updatedEvent;
  }

  // Parental Profile methods
  async getParentalProfiles(): Promise<ParentalProfile[]> {
    return Array.from(this.parentalProfiles.values());
  }

  async getParentalProfile(id: string): Promise<ParentalProfile | undefined> {
    return this.parentalProfiles.get(id);
  }

  async createParentalProfile(insertProfile: InsertParentalProfile): Promise<ParentalProfile> {
    const id = randomUUID();
    const profile: ParentalProfile = {
      ...insertProfile,
      id,
      isActive: insertProfile.isActive !== undefined ? insertProfile.isActive : true,
      bedtime: insertProfile.bedtime || null,
      dailyTimeLimit: insertProfile.dailyTimeLimit || null,
      blockedCategories: insertProfile.blockedCategories || [],
      allowedSites: insertProfile.allowedSites || [],
      blockedSites: insertProfile.blockedSites || []
    };
    this.parentalProfiles.set(id, profile);
    return profile;
  }

  async updateParentalProfile(id: string, updates: Partial<ParentalProfile>): Promise<ParentalProfile | undefined> {
    const profile = this.parentalProfiles.get(id);
    if (!profile) return undefined;

    const updatedProfile = { ...profile, ...updates };
    this.parentalProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async deleteParentalProfile(id: string): Promise<boolean> {
    return this.parentalProfiles.delete(id);
  }

  // Network Settings methods
  async getNetworkSettings(): Promise<NetworkSettings> {
    return this.networkSettings;
  }

  async updateNetworkSettings(updates: Partial<NetworkSettings>): Promise<NetworkSettings> {
    this.networkSettings = { ...this.networkSettings, ...updates };
    return this.networkSettings;
  }

  // Network Stats methods
  async getNetworkStats(): Promise<NetworkStats> {
    return this.networkStats;
  }

  async updateNetworkStats(updates: Partial<NetworkStats>): Promise<NetworkStats> {
    this.networkStats = { ...this.networkStats, ...updates, lastUpdated: new Date() };
    return this.networkStats;
  }

  // Port Forward Rules methods
  async getPortForwardRules(): Promise<PortForwardRule[]> {
    return Array.from(this.portForwardRules.values());
  }

  async createPortForwardRule(insertRule: InsertPortForwardRule): Promise<PortForwardRule> {
    const id = randomUUID();
    const rule: PortForwardRule = {
      ...insertRule,
      id,
      protocol: insertRule.protocol || "TCP",
      isEnabled: insertRule.isEnabled !== undefined ? insertRule.isEnabled : true
    };
    this.portForwardRules.set(id, rule);
    return rule;
  }

  async deletePortForwardRule(id: string): Promise<boolean> {
    return this.portForwardRules.delete(id);
  }
}

export const storage = new MemStorage();
