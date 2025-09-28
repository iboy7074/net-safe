import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MainLayout } from "@/components/layout/main-layout";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ParentalProfile, InsertParentalProfile } from "@shared/schema";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Filter, 
  Gamepad2,
  Users,
  BarChart3
} from "lucide-react";

export default function ParentalControls() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ParentalProfile | null>(null);
  const { toast } = useToast();

  const { data: profiles = [] } = useQuery<ParentalProfile[]>({
    queryKey: ["/api/parental/profiles"],
  });

  const createProfileMutation = useMutation({
    mutationFn: async (profile: InsertParentalProfile) => {
      return apiRequest("POST", "/api/parental/profiles", profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parental/profiles"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Profile created",
        description: "Parental control profile has been created successfully.",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ParentalProfile> }) => {
      return apiRequest("PATCH", `/api/parental/profiles/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parental/profiles"] });
      setEditingProfile(null);
      toast({
        title: "Profile updated",
        description: "Parental control profile has been updated successfully.",
      });
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/parental/profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parental/profiles"] });
      toast({
        title: "Profile deleted",
        description: "Parental control profile has been deleted successfully.",
      });
    },
  });

  const handleCreateProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const profile: InsertParentalProfile = {
      name: formData.get("name") as string,
      isActive: formData.get("isActive") === "on",
      bedtime: formData.get("bedtime") as string || null,
      dailyTimeLimit: formData.get("dailyTimeLimit") ? parseInt(formData.get("dailyTimeLimit") as string) : null,
      blockedCategories: formData.get("blockedCategories") 
        ? (formData.get("blockedCategories") as string).split(",").map(s => s.trim())
        : [],
      allowedSites: formData.get("allowedSites")
        ? (formData.get("allowedSites") as string).split(",").map(s => s.trim())
        : [],
      blockedSites: formData.get("blockedSites")
        ? (formData.get("blockedSites") as string).split(",").map(s => s.trim())
        : [],
    };

    createProfileMutation.mutate(profile);
  };

  const handleUpdateProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingProfile) return;

    const formData = new FormData(event.currentTarget);
    
    const updates: Partial<ParentalProfile> = {
      name: formData.get("name") as string,
      isActive: formData.get("isActive") === "on",
      bedtime: formData.get("bedtime") as string || null,
      dailyTimeLimit: formData.get("dailyTimeLimit") ? parseInt(formData.get("dailyTimeLimit") as string) : null,
      blockedCategories: formData.get("blockedCategories") 
        ? (formData.get("blockedCategories") as string).split(",").map(s => s.trim())
        : [],
      allowedSites: formData.get("allowedSites")
        ? (formData.get("allowedSites") as string).split(",").map(s => s.trim())
        : [],
      blockedSites: formData.get("blockedSites")
        ? (formData.get("blockedSites") as string).split(",").map(s => s.trim())
        : [],
    };

    updateProfileMutation.mutate({ id: editingProfile.id, updates });
  };

  const formatTimeLimit = (minutes: number | null) => {
    if (!minutes) return "No limit";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <MainLayout title="Parental Controls">
      <div className="space-y-6">
        {/* Profile Management */}
        <Card data-testid="parental-profiles">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Parental Control Profiles</h3>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-profile">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Parental Profile</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProfile} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Profile Name</Label>
                      <Input id="name" name="name" required data-testid="input-profile-name" />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="isActive" name="isActive" defaultChecked />
                      <Label htmlFor="isActive">Active</Label>
                    </div>

                    <div>
                      <Label htmlFor="bedtime">Bedtime (24h format)</Label>
                      <Input id="bedtime" name="bedtime" type="time" data-testid="input-bedtime" />
                    </div>

                    <div>
                      <Label htmlFor="dailyTimeLimit">Daily Time Limit (minutes)</Label>
                      <Input id="dailyTimeLimit" name="dailyTimeLimit" type="number" data-testid="input-time-limit" />
                    </div>

                    <div>
                      <Label htmlFor="blockedCategories">Blocked Categories (comma-separated)</Label>
                      <Input 
                        id="blockedCategories" 
                        name="blockedCategories" 
                        placeholder="adult, social_media, gaming"
                        data-testid="input-blocked-categories"
                      />
                    </div>

                    <div>
                      <Label htmlFor="allowedSites">Allowed Sites (comma-separated)</Label>
                      <Textarea 
                        id="allowedSites" 
                        name="allowedSites" 
                        placeholder="education.com, khan-academy.org"
                        data-testid="input-allowed-sites"
                      />
                    </div>

                    <div>
                      <Label htmlFor="blockedSites">Blocked Sites (comma-separated)</Label>
                      <Textarea 
                        id="blockedSites" 
                        name="blockedSites" 
                        placeholder="example.com, badsite.net"
                        data-testid="input-blocked-sites"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" data-testid="button-save-profile">
                        Create Profile
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <div 
                  key={profile.id} 
                  className="bg-muted/50 border border-border rounded-lg p-4"
                  data-testid={`profile-card-${profile.id}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{profile.name}</h4>
                    <Badge 
                      className={profile.isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}
                    >
                      {profile.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Bedtime: {profile.bedtime || "No limit"}
                    </p>
                    <p className="flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      Blocked: {profile.blockedCategories?.join(", ") || "None"}
                    </p>
                    <p className="flex items-center">
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      Time limit: {formatTimeLimit(profile.dailyTimeLimit)}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setEditingProfile(profile)}
                          data-testid={`button-edit-${profile.id}`}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Profile: {profile.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                          <div>
                            <Label htmlFor="edit-name">Profile Name</Label>
                            <Input 
                              id="edit-name" 
                              name="name" 
                              defaultValue={profile.name}
                              required 
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="edit-isActive" 
                              name="isActive" 
                              defaultChecked={profile.isActive || false}
                            />
                            <Label htmlFor="edit-isActive">Active</Label>
                          </div>

                          <div>
                            <Label htmlFor="edit-bedtime">Bedtime (24h format)</Label>
                            <Input 
                              id="edit-bedtime" 
                              name="bedtime" 
                              type="time" 
                              defaultValue={profile.bedtime || ""}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-dailyTimeLimit">Daily Time Limit (minutes)</Label>
                            <Input 
                              id="edit-dailyTimeLimit" 
                              name="dailyTimeLimit" 
                              type="number" 
                              defaultValue={profile.dailyTimeLimit || ""}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-blockedCategories">Blocked Categories</Label>
                            <Input 
                              id="edit-blockedCategories" 
                              name="blockedCategories" 
                              defaultValue={profile.blockedCategories?.join(", ") || ""}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-allowedSites">Allowed Sites</Label>
                            <Textarea 
                              id="edit-allowedSites" 
                              name="allowedSites" 
                              defaultValue={profile.allowedSites?.join(", ") || ""}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-blockedSites">Blocked Sites</Label>
                            <Textarea 
                              id="edit-blockedSites" 
                              name="blockedSites" 
                              defaultValue={profile.blockedSites?.join(", ") || ""}
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setEditingProfile(null)}>
                              Cancel
                            </Button>
                            <Button type="submit">
                              Update Profile
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive border-destructive hover:bg-destructive/10"
                      onClick={() => deleteProfileMutation.mutate(profile.id)}
                      data-testid={`button-delete-${profile.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {profiles.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No parental profiles found</p>
                  <p className="text-sm">Create your first profile to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Usage Statistics */}
        <Card data-testid="usage-statistics">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Usage Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Today's Screen Time
                </h4>
                <div className="space-y-3">
                  {profiles.filter(p => p.isActive).map((profile) => (
                    <div key={profile.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{profile.name}</span>
                        <span className="text-sm font-medium">
                          {Math.floor(Math.random() * 5 + 1)}h {Math.floor(Math.random() * 59)}m
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${Math.random() * 80 + 20}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                  
                  {profiles.filter(p => p.isActive).length === 0 && (
                    <p className="text-sm text-muted-foreground">No active profiles</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Content Categories</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Educational</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entertainment</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gaming</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Social Media</span>
                    <span className="font-medium text-destructive">Blocked</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
