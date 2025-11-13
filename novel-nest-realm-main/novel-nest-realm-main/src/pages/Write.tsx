import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/auth";

const Write = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [content, setContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You must be logged in to save a draft.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    if (!title) {
      toast({
        title: "Title required",
        description: "Please enter a title to save as draft.",
        variant: "destructive",
      });
      return;
    }
    try {
      await api.books.create({ title, genre, content, description: content ? content.slice(0, 160) : undefined, isDraft: true });
      toast({
        title: "Story saved!",
        description: "Your story has been saved as a draft.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save draft";
      toast({ title: "Save failed", description: message, variant: "destructive" });
    }
  };

  const handlePublish = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You must be logged in to publish a story.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    if (!title || !genre || !content) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields before publishing.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsPublishing(true);
      await api.books.create({ title, genre, content, description: content.slice(0, 160) });
      toast({
        title: "Story published!",
        description: "Your story is now live and visible to readers.",
      });
      navigate("/library");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to publish";
      toast({ title: "Publish failed", description: message, variant: "destructive" });
    }
    finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/library")} className="font-inter">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSave} className="font-inter">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handlePublish} className="font-inter" disabled={isPublishing}>
              <Send className="w-4 h-4 mr-2" />
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-[var(--shadow-elevated)] animate-fade-in">
          <CardHeader>
            <CardTitle className="font-playfair text-3xl">Write Your Story</CardTitle>
            <CardDescription className="font-inter">
              Share your creativity with the world
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="font-inter text-base">Title</Label>
              <Input
                id="title"
                placeholder="Enter your story title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-playfair text-lg h-12"
              />
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <Label htmlFor="genre" className="font-inter text-base">Genre</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger id="genre" className="font-inter">
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="fantasy" className="font-inter">Fantasy</SelectItem>
                  <SelectItem value="romance" className="font-inter">Romance</SelectItem>
                  <SelectItem value="scifi" className="font-inter">Sci-Fi</SelectItem>
                  <SelectItem value="mystery" className="font-inter">Mystery</SelectItem>
                  <SelectItem value="thriller" className="font-inter">Thriller</SelectItem>
                  <SelectItem value="adventure" className="font-inter">Adventure</SelectItem>
                  <SelectItem value="horror" className="font-inter">Horror</SelectItem>
                  <SelectItem value="drama" className="font-inter">Drama</SelectItem>
                  <SelectItem value="other" className="font-inter">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="font-inter text-base">Story Content</Label>
              <Textarea
                id="content"
                placeholder="Once upon a time..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[500px] font-inter text-base leading-relaxed resize-none"
              />
              <p className="text-sm text-muted-foreground font-inter">
                {content.split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Write;