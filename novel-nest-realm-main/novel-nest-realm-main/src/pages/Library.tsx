import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, PenTool, Eye, Star, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Library = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string | undefined>(undefined);
  const [books, setBooks] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  const GENRES = useMemo(
    () => [
      { label: "All", value: undefined },
      { label: "Fantasy", value: "fantasy" },
      { label: "Romance", value: "romance" },
      { label: "Sci-Fi", value: "scifi" },
      { label: "Mystery", value: "mystery" },
      { label: "Thriller", value: "thriller" },
      { label: "Adventure", value: "adventure" },
      { label: "Horror", value: "horror" },
      { label: "Drama", value: "drama" },
      { label: "Other", value: "other" }
    ],
    []
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params: { search?: string; genre?: string } = {};
        if (searchQuery && searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        if (genreFilter) {
          params.genre = genreFilter;
        }
        const data = await api.books.list(Object.keys(params).length > 0 ? params : undefined);
        setBooks(data);
      } catch (err) {
        console.error('Error loading books:', err);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [searchQuery, genreFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-playfair font-bold">StoryVerse</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/write")} className="font-inter">
              <PenTool className="w-4 h-4 mr-2" />
              Write Story
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="font-inter">
                    <User className="w-4 h-4 mr-2" />
                    {user.name || user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" onClick={() => navigate("/auth")} className="font-inter">
                <User className="w-4 h-4 mr-2" />
                Account
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h2 className="text-5xl font-playfair font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Discover Endless Stories
          </h2>
          <p className="text-xl text-muted-foreground font-inter mb-8">
            Explore thousands of stories, novels, and tales from writers around the world
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for stories, authors, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 font-inter"
            />
          </div>
        </div>

        {/* Genre Tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {GENRES.map((g) => (
            <Badge
              key={g.label}
              variant="outline"
              className={`cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors font-inter px-4 py-2 ${genreFilter === g.value ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => setGenreFilter(g.value)}
            >
              {g.label}
            </Badge>
          ))}
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && <p className="font-inter text-muted-foreground">Loading...</p>}
          {!loading && books.length === 0 && (
            <p className="font-inter text-muted-foreground">No stories found.</p>
          )}
          {!loading && books.map((story: any) => (
            <Card
              key={story._id}
              className="hover-scale cursor-pointer shadow-[var(--shadow-warm)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
              onClick={() => navigate(`/read/${story._id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="font-inter">{story.genre || 'other'}</Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="font-inter font-semibold">4.8</span>
                  </div>
                </div>
                <CardTitle className="font-playfair text-xl hover:text-primary transition-colors">
                  {story.title}
                </CardTitle>
                <CardDescription className="font-inter flex items-center gap-2">
                  <User className="w-3 h-3" />
                  {story.author}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-inter mb-4 line-clamp-2">{story.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 font-inter">
                    <Eye className="w-4 h-4" />
                    0
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Library;