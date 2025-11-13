import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BookOpen, User, Trash2, Edit } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const Settings = () => {
  const { user, refresh, logout } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [myStories, setMyStories] = useState<Array<any>>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [drafts, setDrafts] = useState<Array<any>>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingStories(true);
        const data = await api.books.mine(false);
        setMyStories(data);
      } finally {
        setLoadingStories(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingDrafts(true);
        const data = await api.books.mine(true);
        setDrafts(data);
      } finally {
        setLoadingDrafts(false);
      }
    };
    load();
  }, []);

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      await api.auth.updateProfile({ name: name || undefined });
      await refresh();
      toast({ title: "Profile updated" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast({ title: "Missing fields", description: "Enter both passwords", variant: "destructive" });
      return;
    }
    try {
      setIsSaving(true);
      await api.auth.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      toast({ title: "Password changed" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to change password";
      toast({ title: "Change failed", description: message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-playfair font-bold">Settings</h1>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8">
        <Card className="shadow-[var(--shadow-elevated)] border-border/50">
          <CardHeader>
            <CardTitle className="font-playfair text-2xl">Account</CardTitle>
            <CardDescription className="font-inter">Manage your profile and stories</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="profile" className="font-inter">Profile</TabsTrigger>
                <TabsTrigger value="stories" className="font-inter">My Stories</TabsTrigger>
                <TabsTrigger value="drafts" className="font-inter">Drafts</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-inter">Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="font-inter" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-inter">Email</Label>
                      <Input id="email" value={email} readOnly className="font-inter" />
                    </div>
                    <Button onClick={saveProfile} disabled={isSaving} className="font-inter">
                      {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="font-inter">Current Password</Label>
                      <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="font-inter" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="font-inter">New Password</Label>
                      <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="font-inter" />
                    </div>
                    <Button variant="outline" onClick={changePassword} disabled={isSaving} className="font-inter">
                      {isSaving ? "Updating..." : "Change password"}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stories">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <p className="font-inter text-muted-foreground">Stories authored by {user?.name || user?.email}</p>
                  </div>
                  {loadingStories && <p className="font-inter text-muted-foreground">Loading your stories...</p>}
                  {!loadingStories && myStories.length === 0 && (
                    <p className="font-inter text-sm text-muted-foreground">No stories yet. Use the "Write Story" button to create one.</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myStories.map((story: any) => (
                      <div key={story._id} className="p-4 border rounded-md">
                        <div className="flex items-center justify-between">
                          <h3 className="font-playfair text-xl">{story.title}</h3>
                          <span className="text-xs uppercase tracking-wide text-muted-foreground">{story.genre || 'other'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">{story.description}</p>
                        <div className="flex items-center gap-2 self-end mt-3">
                          <Button variant="outline" size="sm" onClick={() => window.location.assign(`/read/${story._id}`)}>
                            <Edit className="w-4 h-4 mr-1" /> View
                          </Button>
                          <Button variant="destructive" size="sm" onClick={async () => {
                            try {
                              await api.books.remove(story._id);
                              setMyStories((prev) => prev.filter((s) => s._id !== story._id));
                              toast({ title: 'Deleted' });
                            } catch (err) {
                              const message = err instanceof Error ? err.message : 'Failed to delete';
                              toast({ title: 'Delete failed', description: message, variant: 'destructive' });
                            }
                          }}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="drafts">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <p className="font-inter text-muted-foreground">Draft stories by {user?.name || user?.email}</p>
                  </div>
                  {loadingDrafts && <p className="font-inter text-muted-foreground">Loading drafts...</p>}
                  {!loadingDrafts && drafts.length === 0 && (
                    <p className="font-inter text-sm text-muted-foreground">No drafts yet. Use "Save Draft" when writing to create one.</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {drafts.map((draft: any) => (
                      <div key={draft._id} className="p-4 border rounded-md">
                        <div className="flex items-center justify-between">
                          <h3 className="font-playfair text-xl">{draft.title}</h3>
                          <span className="text-xs uppercase tracking-wide text-muted-foreground">{draft.genre || 'other'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">{draft.description || 'No description'}</p>
                        <div className="flex items-center gap-2 self-end mt-3">
                          <Button variant="outline" size="sm" onClick={() => window.location.assign(`/write?edit=${draft._id}`)}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={async () => {
                            try {
                              await api.books.remove(draft._id);
                              setDrafts((prev) => prev.filter((s) => s._id !== draft._id));
                              toast({ title: 'Deleted' });
                            } catch (err) {
                              const message = err instanceof Error ? err.message : 'Failed to delete';
                              toast({ title: 'Delete failed', description: message, variant: 'destructive' });
                            }
                          }}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Settings;
