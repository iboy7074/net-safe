import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const devices = pgTable("devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ip: text("ip").notNull(),
  mac: text("mac").notNull(),
  deviceType: text("device_type").notNull(), // laptop, phone, iot, camera, etc.
  status: text("status").notNull().default("active"), // active, inactive, blocked
  bandwidth: text("bandwidth").default("0 Mbps"),
  connectionTime: timestamp("connection_time").defaultNow(),
  isBlocked: boolean("is_blocked").default(false),
  profile: text("profile"), // reference to parental control profile
});

export const securityEvents = pgTable("security_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // intrusion, firmware_update, new_device, etc.
  severity: text("severity").notNull(), // low, medium, high, critical
  title: text("title").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  isRead: boolean("is_read").default(false),
  deviceId: text("device_id"), // optional reference to device
});

export const parentalProfiles = pgTable("parental_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true),
  bedtime: text("bedtime"), // time string like "21:00"
  dailyTimeLimit: integer("daily_time_limit"), // minutes
  blockedCategories: jsonb("blocked_categories").$type<string[]>().default([]),
  allowedSites: jsonb("allowed_sites").$type<string[]>().default([]),
  blockedSites: jsonb("blocked_sites").$type<string[]>().default([]),
});

export const networkSettings = pgTable("network_settings", {
  id: varchar("id").primaryKey().default("main"),
  ssid: text("ssid").notNull().default("MyHomeNetwork"),
  password: text("password").notNull(),
  security: text("security").notNull().default("WPA3"),
  channel: text("channel").default("Auto"),
  guestEnabled: boolean("guest_enabled").default(false),
  guestSsid: text("guest_ssid").default("MyHomeNetwork_Guest"),
  guestPassword: text("guest_password").default("Welcome123"),
  firewallEnabled: boolean("firewall_enabled").default(true),
  ddosProtection: boolean("ddos_protection").default(true),
  vpnEnabled: boolean("vpn_enabled").default(false),
});

export const networkStats = pgTable("network_stats", {
  id: varchar("id").primaryKey().default("current"),
  uploadSpeed: text("upload_speed").default("0 Mbps"),
  downloadSpeed: text("download_speed").default("0 Mbps"),
  totalDevices: integer("total_devices").default(0),
  dataUsage: text("data_usage").default("0 GB"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const portForwardRules = pgTable("port_forward_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  externalPort: integer("external_port").notNull(),
  internalIp: text("internal_ip").notNull(),
  internalPort: integer("internal_port").notNull(),
  protocol: text("protocol").notNull().default("TCP"),
  isEnabled: boolean("is_enabled").default(true),
});

// Insert schemas
export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  connectionTime: true,
});

export const insertSecurityEventSchema = createInsertSchema(securityEvents).omit({
  id: true,
  timestamp: true,
});

export const insertParentalProfileSchema = createInsertSchema(parentalProfiles).omit({
  id: true,
});

export const insertNetworkSettingsSchema = createInsertSchema(networkSettings);

export const insertPortForwardRuleSchema = createInsertSchema(portForwardRules).omit({
  id: true,
});

// Types
export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;

export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = z.infer<typeof insertSecurityEventSchema>;

export type ParentalProfile = typeof parentalProfiles.$inferSelect;
export type InsertParentalProfile = z.infer<typeof insertParentalProfileSchema>;

export type NetworkSettings = typeof networkSettings.$inferSelect;
export type InsertNetworkSettings = z.infer<typeof insertNetworkSettingsSchema>;

export type NetworkStats = typeof networkStats.$inferSelect;

export type PortForwardRule = typeof portForwardRules.$inferSelect;
export type InsertPortForwardRule = z.infer<typeof insertPortForwardRuleSchema>;
