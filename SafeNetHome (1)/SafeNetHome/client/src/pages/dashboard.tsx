import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient } from "@/lib/queryClient";
import { Device, SecurityEvent, NetworkStats } from "@shared/schema";
import { 
  Laptop, 
  Smartphone, 
  Camera, 
  Router, 
  Shield, 
  TrendingUp, 
  HardDrive,
  Pause,
  Plus,
  Download,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

const deviceIcons = {
  laptop: Laptop,
  phone: Smartphone,
  camera: Camera,
  iot: Router,
  default: Router,
};

function getDeviceIcon(deviceType: string) {
  return deviceIcons[deviceType as keyof typeof deviceIcons] || deviceIcons.default;
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "muted";
    case "blocked":
      return "destructive";
    default:
      return "muted";
  }
}

export default function Dashboard() {
  const { data: devices = [] } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const { data: securityEvents = [] } = useQuery<SecurityEvent[]>({
    queryKey: ["/api/security/events"],
  });

  const { data: networkStats } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
  });

  // WebSocket for real-time updates
  useWebSocket({
    onMessage: (data) => {
      if (data.type === "device_added" || data.type === "device_updated" || data.type === "device_deleted") {
        queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      }
      if (data.type === "security_event") {
        queryClient.invalidateQueries({ queryKey: ["/api/security/events"] });
      }
      if (data.type === "stats_updated") {
        queryClient.invalidateQueries({ queryKey: ["/api/network/stats"] });
      }
    },
  });

  const activeDevices = devices.filter(device => device.status === "active");
  const recentEvents = securityEvents.slice(0, 3);
  const securityStatus = securityEvents.some(event => event.severity === "high" || event.severity === "critical") 
    ? "warning" : "success";

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="stat-connected-devices">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Connected Devices</p>
                  <p className="text-3xl font-bold">{devices.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Router className="text-primary text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="stat-security-status">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Security Status</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className={`w-3 h-3 rounded-full ${securityStatus === "success" ? "bg-success" : "bg-warning"}`} />
                    <p className={`text-sm font-medium ${securityStatus === "success" ? "text-success" : "text-warning"}`}>
                      {securityStatus === "success" ? "Secure" : "Warning"}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${securityStatus === "success" ? "bg-success/10" : "bg-warning/10"}`}>
                  <Shield className={`text-xl ${securityStatus === "success" ? "text-success" : "text-warning"}`} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="stat-network-speed">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Network Speed</p>
                  <p className="text-3xl font-bold">
                    {networkStats?.downloadSpeed?.split(' ')[0] || "0"}{" "}
                    <span className="text-lg text-muted-foreground">Mbps</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-warning text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="stat-data-usage">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Data Usage</p>
                  <p className="text-3xl font-bold">
                    {networkStats?.dataUsage?.split(' ')[0] || "0"}{" "}
                    <span className="text-lg text-muted-foreground">GB</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/50 rounded-lg flex items-center justify-center">
                  <HardDrive className="text-foreground text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card data-testid="quick-actions">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button 
                className="flex items-center justify-center space-x-2 bg-warning text-warning-foreground hover:bg-warning/90"
                data-testid="button-pause-internet"
              >
                <Pause className="w-4 h-4" />
                <span>Pause Internet</span>
              </Button>
              <Button 
                className="flex items-center justify-center space-x-2"
                data-testid="button-add-device"
              >
                <Plus className="w-4 h-4" />
                <span>Add Device</span>
              </Button>
              <Button 
                className="flex items-center justify-center space-x-2 bg-success text-success-foreground hover:bg-success/90"
                data-testid="button-update-firmware"
              >
                <Download className="w-4 h-4" />
                <span>Update Firmware</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Device Overview */}
        <Card data-testid="device-overview">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Connected Devices</h3>
            <div className="space-y-4">
              {activeDevices.slice(0, 5).map((device) => {
                const IconComponent = getDeviceIcon(device.deviceType);
                const statusColor = getStatusColor(device.status);
                
                return (
                  <div 
                    key={device.id} 
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    data-testid={`device-item-${device.id}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{device.name}</p>
                        <p className="text-sm text-muted-foreground">{device.ip}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{device.bandwidth}</p>
                        <p className="text-xs text-muted-foreground">
                          Active {Math.floor(Math.random() * 5 + 1)}h {Math.floor(Math.random() * 59)}m
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${statusColor === "success" ? "bg-success" : statusColor === "destructive" ? "bg-destructive" : "bg-muted"}`} />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {devices.length > 5 && (
              <div className="mt-4 text-center">
                <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium">
                  View All Devices
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card data-testid="security-alerts">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Security Alerts</h3>
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div 
                    key={event.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${
                      event.severity === "high" || event.severity === "critical" 
                        ? "bg-destructive/10 border-destructive/20" 
                        : event.severity === "medium"
                        ? "bg-warning/10 border-warning/20"
                        : "bg-success/10 border-success/20"
                    }`}
                    data-testid={`security-event-${event.id}`}
                  >
                    {event.severity === "high" || event.severity === "critical" ? (
                      <AlertTriangle className="text-destructive mt-0.5 w-4 h-4" />
                    ) : event.severity === "medium" ? (
                      <AlertTriangle className="text-warning mt-0.5 w-4 h-4" />
                    ) : (
                      <CheckCircle className="text-success mt-0.5 w-4 h-4" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="network-activity">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Network Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Upload</span>
                  <span className="text-sm font-medium">{networkStats?.uploadSpeed || "0 Mbps"}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "45%" }} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Download</span>
                  <span className="text-sm font-medium">{networkStats?.downloadSpeed || "0 Mbps"}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: "78%" }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
