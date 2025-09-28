import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/main-layout";
import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Device } from "@shared/schema";
import { 
  Laptop, 
  Smartphone, 
  Camera, 
  Router, 
  RefreshCw,
  Edit,
  Ban,
  Trash2
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

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
    case "inactive":
      return <Badge variant="secondary">Inactive</Badge>;
    case "blocked":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Blocked</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
}

export default function DeviceManagement() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: devices = [], isLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const updateDeviceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Device> }) => {
      return apiRequest("PATCH", `/api/devices/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
    },
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/devices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
    },
  });

  // WebSocket for real-time updates
  useWebSocket({
    onMessage: (data) => {
      if (data.type === "device_added" || data.type === "device_updated" || data.type === "device_deleted") {
        queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      }
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleBlockDevice = (device: Device) => {
    updateDeviceMutation.mutate({
      id: device.id,
      updates: { 
        status: device.status === "blocked" ? "active" : "blocked",
        isBlocked: device.status !== "blocked"
      }
    });
  };

  const handleDeleteDevice = (id: string) => {
    deleteDeviceMutation.mutate(id);
  };

  return (
    <MainLayout title="Device Management">
      <div className="space-y-6">
        <Card data-testid="device-management-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Device Management</h3>
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                data-testid="button-refresh-devices"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bandwidth</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading devices...
                      </TableCell>
                    </TableRow>
                  ) : devices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No devices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    devices.map((device) => {
                      const IconComponent = getDeviceIcon(device.deviceType);
                      
                      return (
                        <TableRow 
                          key={device.id} 
                          className="hover:bg-muted/50"
                          data-testid={`device-row-${device.id}`}
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <IconComponent className="text-primary text-sm" />
                              </div>
                              <div>
                                <p className="font-medium" data-testid={`device-name-${device.id}`}>
                                  {device.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Connected {Math.floor(Math.random() * 5 + 1)}h ago
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm" data-testid={`device-ip-${device.id}`}>
                            {device.ip}
                          </TableCell>
                          <TableCell data-testid={`device-status-${device.id}`}>
                            {getStatusBadge(device.status)}
                          </TableCell>
                          <TableCell className="text-sm" data-testid={`device-bandwidth-${device.id}`}>
                            {device.bandwidth}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                data-testid={`button-edit-${device.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${device.status === "blocked" ? "text-success hover:text-success/80" : "text-warning hover:text-warning/80"}`}
                                onClick={() => handleBlockDevice(device)}
                                data-testid={`button-block-${device.id}`}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive/80"
                                onClick={() => handleDeleteDevice(device.id)}
                                data-testid={`button-delete-${device.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
