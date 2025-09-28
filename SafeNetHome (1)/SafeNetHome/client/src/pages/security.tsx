import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/main-layout";
import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { SecurityEvent, NetworkSettings } from "@shared/schema";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Clock
} from "lucide-react";

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "critical":
    case "high":
      return <AlertTriangle className="text-destructive w-5 h-5" />;
    case "medium":
      return <AlertTriangle className="text-warning w-5 h-5" />;
    case "low":
      return <Info className="text-primary w-5 h-5" />;
    default:
      return <CheckCircle className="text-success w-5 h-5" />;
  }
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "critical":
      return <Badge className="bg-destructive text-destructive-foreground">Critical</Badge>;
    case "high":
      return <Badge className="bg-destructive/80 text-destructive-foreground">High</Badge>;
    case "medium":
      return <Badge className="bg-warning text-warning-foreground">Medium</Badge>;
    case "low":
      return <Badge className="bg-primary text-primary-foreground">Low</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
}

export default function SecurityAlerts() {
  const { data: securityEvents = [] } = useQuery<SecurityEvent[]>({
    queryKey: ["/api/security/events"],
  });

  const { data: networkSettings } = useQuery<NetworkSettings>({
    queryKey: ["/api/network/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<NetworkSettings>) => {
      return apiRequest("PATCH", "/api/network/settings", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network/settings"] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/security/events/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/events"] });
    },
  });

  // WebSocket for real-time updates
  useWebSocket({
    onMessage: (data) => {
      if (data.type === "security_event") {
        queryClient.invalidateQueries({ queryKey: ["/api/security/events"] });
      }
      if (data.type === "settings_updated") {
        queryClient.invalidateQueries({ queryKey: ["/api/network/settings"] });
      }
    },
  });

  const unreadEvents = securityEvents.filter(event => !event.isRead);
  const criticalEvents = securityEvents.filter(event => event.severity === "critical" || event.severity === "high");
  const systemStatus = criticalEvents.length > 0 ? "critical" : "secure";

  const handleFirewallToggle = (enabled: boolean) => {
    updateSettingsMutation.mutate({ firewallEnabled: enabled });
  };

  const handleDdosToggle = (enabled: boolean) => {
    updateSettingsMutation.mutate({ ddosProtection: enabled });
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  return (
    <MainLayout title="Security & Alerts">
      <div className="space-y-6">
        {/* Security Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card data-testid="intrusion-detection">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Intrusion Detection</h3>
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-lg border ${
                  systemStatus === "critical" 
                    ? "bg-destructive/10 border-destructive/20" 
                    : "bg-success/10 border-success/20"
                }`}>
                  <div className="flex items-center space-x-3">
                    <Shield className={systemStatus === "critical" ? "text-destructive" : "text-success"} />
                    <div>
                      <p className="font-medium">System Status</p>
                      <p className="text-sm text-muted-foreground">
                        {systemStatus === "critical" ? "Critical issues detected" : "All systems secure"}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${systemStatus === "critical" ? "text-destructive" : "text-success"}`}>
                    {systemStatus === "critical" ? "CRITICAL" : "SECURE"}
                  </div>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Last security scan</p>
                  <p className="font-medium">
                    {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="recent-alerts">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Recent Alerts 
                {unreadEvents.length > 0 && (
                  <Badge className="ml-2 bg-destructive text-destructive-foreground">
                    {unreadEvents.length} new
                  </Badge>
                )}
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {securityEvents.slice(0, 5).map((event) => (
                  <div 
                    key={event.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                      !event.isRead ? "bg-muted/30 border-primary/20" : "bg-muted/10 border-border"
                    }`}
                    onClick={() => !event.isRead && markAsReadMutation.mutate(event.id)}
                    data-testid={`security-event-${event.id}`}
                  >
                    {getSeverityIcon(event.severity)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        {getSeverityBadge(event.severity)}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{event.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {event.timestamp ? formatTimestamp(event.timestamp) : "Unknown time"}
                      </p>
                    </div>
                  </div>
                ))}
                
                {securityEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No security events found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Firewall Settings */}
        <Card data-testid="firewall-settings">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Firewall Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <label className="text-sm font-medium">Firewall Status</label>
                  <p className="text-xs text-muted-foreground">
                    {networkSettings?.firewallEnabled ? "Protection active" : "Protection disabled"}
                  </p>
                </div>
                <Switch 
                  checked={networkSettings?.firewallEnabled || false}
                  onCheckedChange={handleFirewallToggle}
                  data-testid="switch-firewall"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <label className="text-sm font-medium">DDoS Protection</label>
                  <p className="text-xs text-muted-foreground">
                    {networkSettings?.ddosProtection ? "Active monitoring" : "Disabled"}
                  </p>
                </div>
                <Switch 
                  checked={networkSettings?.ddosProtection || false}
                  onCheckedChange={handleDdosToggle}
                  data-testid="switch-ddos"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Statistics */}
        <Card data-testid="security-statistics">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Security Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <p className="text-2xl font-bold text-success">
                  {securityEvents.filter(e => e.severity === "low").length}
                </p>
                <p className="text-sm text-muted-foreground">Low Priority</p>
              </div>
              <div className="text-center p-4 bg-warning/10 rounded-lg">
                <p className="text-2xl font-bold text-warning">
                  {securityEvents.filter(e => e.severity === "medium").length}
                </p>
                <p className="text-sm text-muted-foreground">Medium Priority</p>
              </div>
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <p className="text-2xl font-bold text-destructive">
                  {securityEvents.filter(e => e.severity === "high").length}
                </p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
              <div className="text-center p-4 bg-destructive/20 rounded-lg">
                <p className="text-2xl font-bold text-destructive">
                  {securityEvents.filter(e => e.severity === "critical").length}
                </p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
