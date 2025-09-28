import { Device, SecurityEvent, ParentalProfile, NetworkSettings, NetworkStats, PortForwardRule } from "@shared/schema";

// Mock device data with realistic router management scenarios
export const mockDevices: Device[] = [
  {
    id: "device-1",
    name: "MacBook Pro",
    ip: "192.168.1.101",
    mac: "00:1B:44:11:3A:B7",
    deviceType: "laptop",
    status: "active",
    bandwidth: "45.2 Mbps",
    connectionTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isBlocked: false,
    profile: null,
  },
  {
    id: "device-2",
    name: "iPhone 14",
    ip: "192.168.1.102",
    mac: "00:1B:44:11:3A:B8",
    deviceType: "phone",
    status: "active",
    bandwidth: "12.8 Mbps",
    connectionTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isBlocked: false,
    profile: "kids-profile",
  },
  {
    id: "device-3",
    name: "Security Camera",
    ip: "192.168.1.150",
    mac: "00:1B:44:11:3A:B9",
    deviceType: "camera",
    status: "active",
    bandwidth: "8.5 Mbps",
    connectionTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isBlocked: false,
    profile: null,
  },
  {
    id: "device-4",
    name: "Samsung Smart TV",
    ip: "192.168.1.125",
    mac: "00:1B:44:11:3A:C0",
    deviceType: "iot",
    status: "active",
    bandwidth: "25.3 Mbps",
    connectionTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isBlocked: false,
    profile: null,
  },
  {
    id: "device-5",
    name: "iPad Air",
    ip: "192.168.1.103",
    mac: "00:1B:44:11:3A:C1",
    deviceType: "phone", // Using phone icon for tablets
    status: "active",
    bandwidth: "18.7 Mbps",
    connectionTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    isBlocked: false,
    profile: "kids-profile",
  },
  {
    id: "device-6",
    name: "Gaming Console",
    ip: "192.168.1.120",
    mac: "00:1B:44:11:3A:C2",
    deviceType: "iot",
    status: "blocked",
    bandwidth: "0 Mbps",
    connectionTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    isBlocked: true,
    profile: "kids-profile",
  },
  {
    id: "device-7",
    name: "Work Laptop",
    ip: "192.168.1.104",
    mac: "00:1B:44:11:3A:C3",
    deviceType: "laptop",
    status: "inactive",
    bandwidth: "0 Mbps",
    connectionTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    isBlocked: false,
    profile: null,
  },
];

// Mock security events with different severity levels
export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: "event-1",
    type: "system_status",
    severity: "low",
    title: "All systems secure",
    description: "Last security scan completed successfully with no issues detected",
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    isRead: false,
    deviceId: null,
  },
  {
    id: "event-2",
    type: "firmware_update",
    severity: "medium",
    title: "Firmware update available",
    description: "Version 2.1.3 includes security patches and performance improvements",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: false,
    deviceId: null,
  },
  {
    id: "event-3",
    type: "new_device",
    severity: "medium",
    title: "New device connected",
    description: "Unknown device 'Samsung TV' connected at 192.168.1.125",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    deviceId: "device-4",
  },
  {
    id: "event-4",
    type: "intrusion_attempt",
    severity: "high",
    title: "Multiple failed login attempts",
    description: "5 failed admin login attempts detected from IP 192.168.1.999",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isRead: true,
    deviceId: null,
  },
  {
    id: "event-5",
    type: "bandwidth_exceeded",
    severity: "low",
    title: "Bandwidth threshold exceeded",
    description: "Device 'Gaming Console' exceeded daily bandwidth limit",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    isRead: true,
    deviceId: "device-6",
  },
];

// Mock parental control profiles
export const mockParentalProfiles: ParentalProfile[] = [
  {
    id: "kids-profile",
    name: "Kids Profile",
    isActive: true,
    bedtime: "21:00",
    dailyTimeLimit: 120, // 2 hours in minutes
    blockedCategories: ["adult", "social_media", "gambling"],
    allowedSites: ["education.com", "khan-academy.org", "scratch.mit.edu"],
    blockedSites: ["facebook.com", "instagram.com", "tiktok.com"],
  },
  {
    id: "guest-profile",
    name: "Guest Profile",
    isActive: false,
    bedtime: null,
    dailyTimeLimit: null,
    blockedCategories: ["adult", "gambling", "torrents"],
    allowedSites: [],
    blockedSites: ["torrents.com", "piratebay.org"],
  },
  {
    id: "teen-profile",
    name: "Teen Profile",
    isActive: true,
    bedtime: "23:00",
    dailyTimeLimit: 240, // 4 hours in minutes
    blockedCategories: ["adult", "gambling"],
    allowedSites: ["youtube.com", "spotify.com", "netflix.com"],
    blockedSites: [],
  },
];

// Mock network settings
export const mockNetworkSettings: NetworkSettings = {
  id: "main",
  ssid: "MyHomeNetwork",
  password: "SecurePassword123!",
  security: "WPA3",
  channel: "Auto",
  guestEnabled: true,
  guestSsid: "MyHomeNetwork_Guest",
  guestPassword: "Welcome123",
  firewallEnabled: true,
  ddosProtection: true,
  vpnEnabled: false,
};

// Mock network statistics
export const mockNetworkStats: NetworkStats = {
  id: "current",
  uploadSpeed: "23.4 Mbps",
  downloadSpeed: "156.8 Mbps",
  totalDevices: mockDevices.length,
  dataUsage: "2.3 GB",
  lastUpdated: new Date(),
};

// Mock port forwarding rules
export const mockPortForwardRules: PortForwardRule[] = [
  {
    id: "rule-1",
    name: "HTTP Server",
    externalPort: 80,
    internalIp: "192.168.1.100",
    internalPort: 80,
    protocol: "TCP",
    isEnabled: true,
  },
  {
    id: "rule-2",
    name: "SSH Access",
    externalPort: 2222,
    internalIp: "192.168.1.101",
    internalPort: 22,
    protocol: "TCP",
    isEnabled: true,
  },
  {
    id: "rule-3",
    name: "Game Server",
    externalPort: 25565,
    internalIp: "192.168.1.120",
    internalPort: 25565,
    protocol: "TCP",
    isEnabled: false,
  },
];

// Helper functions for generating realistic data variations
export const generateRandomBandwidth = (): string => {
  const speed = (Math.random() * 100 + 5).toFixed(1);
  return `${speed} Mbps`;
};

export const generateRandomIP = (): string => {
  const lastOctet = Math.floor(Math.random() * 254) + 1;
  return `192.168.1.${lastOctet}`;
};

export const generateRandomMAC = (): string => {
  const hex = '0123456789ABCDEF';
  let mac = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 2 === 0) mac += ':';
    mac += hex[Math.floor(Math.random() * 16)];
  }
  return mac;
};

export const getDeviceTypeIcon = (deviceType: string): string => {
  const iconMap: Record<string, string> = {
    laptop: "laptop",
    phone: "smartphone",
    camera: "camera",
    iot: "router",
    default: "router",
  };
  return iconMap[deviceType] || iconMap.default;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    active: "success",
    inactive: "muted",
    blocked: "destructive",
    default: "muted",
  };
  return colorMap[status] || colorMap.default;
};

export const getSeverityColor = (severity: string): string => {
  const colorMap: Record<string, string> = {
    critical: "destructive",
    high: "destructive",
    medium: "warning",
    low: "primary",
    default: "muted",
  };
  return colorMap[severity] || colorMap.default;
};

// Time formatting utilities
export const formatConnectionTime = (connectionTime: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - connectionTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `Active ${diffInMinutes}m`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `Active ${hours}h ${minutes}m`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `Active ${days}d ago`;
  }
};

export const formatEventTime = (timestamp: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hours ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} days ago`;
  }
};

// Data validation helpers
export const isValidIP = (ip: string): boolean => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

export const isValidMAC = (mac: string): boolean => {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
};

export const isValidPort = (port: number): boolean => {
  return port >= 1 && port <= 65535;
};

// Mock data factory functions for creating new instances
export const createMockDevice = (overrides: Partial<Device> = {}): Device => ({
  id: `device-${Date.now()}`,
  name: "New Device",
  ip: generateRandomIP(),
  mac: generateRandomMAC(),
  deviceType: "iot",
  status: "active",
  bandwidth: generateRandomBandwidth(),
  connectionTime: new Date(),
  isBlocked: false,
  profile: null,
  ...overrides,
});

export const createMockSecurityEvent = (overrides: Partial<SecurityEvent> = {}): SecurityEvent => ({
  id: `event-${Date.now()}`,
  type: "system_status",
  severity: "low",
  title: "New Security Event",
  description: "A new security event has been detected",
  timestamp: new Date(),
  isRead: false,
  deviceId: null,
  ...overrides,
});

export const createMockParentalProfile = (overrides: Partial<ParentalProfile> = {}): ParentalProfile => ({
  id: `profile-${Date.now()}`,
  name: "New Profile",
  isActive: true,
  bedtime: null,
  dailyTimeLimit: null,
  blockedCategories: [],
  allowedSites: [],
  blockedSites: [],
  ...overrides,
});

// Export all mock data as a single object for easy importing
export const mockData = {
  devices: mockDevices,
  securityEvents: mockSecurityEvents,
  parentalProfiles: mockParentalProfiles,
  networkSettings: mockNetworkSettings,
  networkStats: mockNetworkStats,
  portForwardRules: mockPortForwardRules,
};

export default mockData;
