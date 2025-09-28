import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MainLayout } from "@/components/layout/main-layout";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { NetworkSettings, PortForwardRule, InsertPortForwardRule } from "@shared/schema";
import { 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw
} from "lucide-react";

export default function Settings() {
  const [showPassword, setShowPassword] = useState(false);
  const [showGuestPassword, setShowGuestPassword] = useState(false);
  const [isPortForwardDialogOpen, setIsPortForwardDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: networkSettings } = useQuery<NetworkSettings>({
    queryKey: ["/api/network/settings"],
  });

  const { data: portForwardRules = [] } = useQuery<PortForwardRule[]>({
    queryKey: ["/api/network/port-forward"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<NetworkSettings>) => {
      return apiRequest("PATCH", "/api/network/settings", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network/settings"] });
      toast({
        title: "Settings saved",
        description: "Network settings have been updated successfully.",
      });
    },
  });

  const createPortForwardMutation = useMutation({
    mutationFn: async (rule: InsertPortForwardRule) => {
      return apiRequest("POST", "/api/network/port-forward", rule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network/port-forward"] });
      setIsPortForwardDialogOpen(false);
      toast({
        title: "Rule created",
        description: "Port forwarding rule has been created successfully.",
      });
    },
  });

  const deletePortForwardMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/network/port-forward/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network/port-forward"] });
      toast({
        title: "Rule deleted",
        description: "Port forwarding rule has been deleted successfully.",
      });
    },
  });

  // WebSocket for real-time updates
  useWebSocket({
    onMessage: (data) => {
      if (data.type === "settings_updated") {
        queryClient.invalidateQueries({ queryKey: ["/api/network/settings"] });
      }
    },
  });

  const handleSaveSettings = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const updates: Partial<NetworkSettings> = {
      ssid: formData.get("ssid") as string,
      password: formData.get("password") as string,
      security: formData.get("security") as string,
      channel: formData.get("channel") as string,
      guestEnabled: formData.get("guestEnabled") === "on",
      guestSsid: formData.get("guestSsid") as string,
      guestPassword: formData.get("guestPassword") as string,
      vpnEnabled: formData.get("vpnEnabled") === "on",
    };

    updateSettingsMutation.mutate(updates);
  };

  const handleCreatePortForward = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const rule: InsertPortForwardRule = {
      name: formData.get("name") as string,
      externalPort: parseInt(formData.get("externalPort") as string),
      internalIp: formData.get("internalIp") as string,
      internalPort: parseInt(formData.get("internalPort") as string),
      protocol: formData.get("protocol") as string,
      isEnabled: true,
    };

    createPortForwardMutation.mutate(rule);
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      ssid: "MyHomeNetwork",
      password: "SecurePassword123",
      security: "WPA3",
      channel: "Auto",
      guestEnabled: false,
      guestSsid: "MyHomeNetwork_Guest", 
      guestPassword: "Welcome123",
      vpnEnabled: false,
    };

    updateSettingsMutation.mutate(defaultSettings);
  };

  if (!networkSettings) {
    return (
      <MainLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <p>Loading settings...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Settings">
      <div className="space-y-6">
        <form onSubmit={handleSaveSettings}>
          {/* Wi-Fi Configuration */}
          <Card data-testid="wifi-configuration">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-6">Wi-Fi Configuration</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="ssid">Network Name (SSID)</Label>
                    <Input 
                      id="ssid" 
                      name="ssid" 
                      defaultValue={networkSettings.ssid}
                      data-testid="input-ssid"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        name="password" 
                        type={showPassword ? "text" : "password"}
                        defaultValue={networkSettings.password}
                        className="pr-10"
                        data-testid="input-password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 px-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="security">Security</Label>
                    <Select name="security" defaultValue={networkSettings.security}>
                      <SelectTrigger data-testid="select-security">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WPA3">WPA3 (Recommended)</SelectItem>
                        <SelectItem value="WPA2">WPA2</SelectItem>
                        <SelectItem value="WEP">WEP (Not Recommended)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="channel">Channel</Label>
                    <Select name="channel" defaultValue={networkSettings.channel}>
                      <SelectTrigger data-testid="select-channel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Auto">Auto</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="11">11</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Guest Network */}
          <Card data-testid="guest-network">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-6">Guest Network</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Enable Guest Network</p>
                    <p className="text-sm text-muted-foreground">Allow visitors to connect without main network access</p>
                  </div>
                  <Switch 
                    name="guestEnabled" 
                    defaultChecked={networkSettings.guestEnabled}
                    data-testid="switch-guest-network"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guestSsid">Guest SSID</Label>
                    <Input 
                      id="guestSsid" 
                      name="guestSsid" 
                      defaultValue={networkSettings.guestSsid}
                      data-testid="input-guest-ssid"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="guestPassword">Guest Password</Label>
                    <div className="relative">
                      <Input 
                        id="guestPassword" 
                        name="guestPassword" 
                        type={showGuestPassword ? "text" : "password"}
                        defaultValue={networkSettings.guestPassword}
                        className="pr-10"
                        data-testid="input-guest-password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 px-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowGuestPassword(!showGuestPassword)}
                        data-testid="button-toggle-guest-password"
                      >
                        {showGuestPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Advanced Settings */}
          <Card data-testid="advanced-settings">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-6">Advanced Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Port Forwarding</h4>
                  <div className="space-y-3">
                    {portForwardRules.map((rule) => (
                      <div 
                        key={rule.id} 
                        className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg"
                        data-testid={`port-forward-rule-${rule.id}`}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{rule.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Port {rule.externalPort} → {rule.internalIp}:{rule.internalPort} ({rule.protocol})
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => deletePortForwardMutation.mutate(rule.id)}
                          data-testid={`button-delete-rule-${rule.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Dialog open={isPortForwardDialogOpen} onOpenChange={setIsPortForwardDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          type="button"
                          variant="outline" 
                          className="w-full"
                          data-testid="button-add-port-forward"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Port Forward Rule
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Port Forward Rule</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreatePortForward} className="space-y-4">
                          <div>
                            <Label htmlFor="rule-name">Rule Name</Label>
                            <Input id="rule-name" name="name" required />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="external-port">External Port</Label>
                              <Input id="external-port" name="externalPort" type="number" required />
                            </div>
                            <div>
                              <Label htmlFor="protocol">Protocol</Label>
                              <Select name="protocol" defaultValue="TCP">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="TCP">TCP</SelectItem>
                                  <SelectItem value="UDP">UDP</SelectItem>
                                  <SelectItem value="Both">Both</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="internal-ip">Internal IP</Label>
                              <Input id="internal-ip" name="internalIp" required />
                            </div>
                            <div>
                              <Label htmlFor="internal-port">Internal Port</Label>
                              <Input id="internal-port" name="internalPort" type="number" required />
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsPortForwardDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">
                              Create Rule
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">VPN Settings</h4>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">VPN Server</p>
                      <p className="text-sm text-muted-foreground">Allow remote access to your network</p>
                    </div>
                    <Switch 
                      name="vpnEnabled" 
                      defaultChecked={networkSettings.vpnEnabled}
                      data-testid="switch-vpn"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button 
              type="submit" 
              disabled={updateSettingsMutation.isPending}
              data-testid="button-save-settings"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={handleResetSettings}
              data-testid="button-reset-settings"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
