import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Bookmark, Star, Eye, MessageCircle, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/auth";

const Read = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [book, setBook] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await api.books.get(id);
        setBook(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Bookmark removed" : "Story bookmarked!",
      description: isBookmarked ? "Removed from your reading list" : "Added to your reading list",
    });
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
    toast({
      title: "Rating submitted!",
      description: `You rated this story ${rating} stars`,
    });
  };

  const handleReviewSubmit = async () => {
    if (!reviewText.trim()) return;
    if (!id) return;
    try {
      await api.books.addReview(id, { rating: userRating || 5, text: reviewText.trim() });
      const updated = await api.books.get(id);
      setBook(updated);
      toast({ title: "Review posted!", description: "Your review is now visible to other readers" });
      setReviewText("");
      setUserRating(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to post review";
      toast({ title: "Post failed", description: message, variant: "destructive" });
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
          <Button
            variant={isBookmarked ? "default" : "outline"}
            onClick={handleBookmark}
            className="font-inter"
          >
            <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
            {isBookmarked ? "Bookmarked" : "Bookmark"}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Story Header */}
        <div className="mb-8 animate-fade-in">
          <Badge variant="secondary" className="mb-3 font-inter">{book?.genre || 'other'}</Badge>
          <h1 className="text-5xl font-playfair font-bold mb-3">{book?.title || ''}</h1>
          <div className="flex items-center gap-4 text-muted-foreground mb-4">
            <div className="flex items-center gap-2 font-inter">
              <User className="w-4 h-4" />
              {book?.author || 'Anonymous'}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span className="font-inter">0 views</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="font-inter font-semibold">{book?.reviews?.length || 0}</span>
              <span className="font-inter text-sm">reviews</span>
            </div>
          </div>
        </div>

        {/* Story Content */}
        <Card className="mb-8 shadow-[var(--shadow-elevated)]">
          <CardContent className="pt-6">
            <div className="prose prose-lg max-w-none">
              {(book?.content || '').split('\n\n').map((paragraph: string, index: number) => (
                <p key={index} className="font-inter text-foreground leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rating Section */}
        <Card className="mb-8 shadow-[var(--shadow-warm)]">
          <CardContent className="pt-6">
            <h3 className="font-playfair text-2xl font-bold mb-4">Rate this story</h3>
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-all hover:scale-110 ${
                    star <= userRating
                      ? "fill-accent text-accent"
                      : "text-muted-foreground hover:text-accent"
                  }`}
                  onClick={() => handleRating(star)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="shadow-[var(--shadow-warm)]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h3 className="font-playfair text-2xl font-bold">Reviews</h3>
            </div>

            {/* Write Review */}
            <div className="mb-6">
              <Textarea
                placeholder="Share your thoughts about this story..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="mb-3 font-inter"
              />
              <Button onClick={handleReviewSubmit} className="font-inter">
                Post Review
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Display Reviews */}
            <div className="space-y-6">
              {(book?.reviews || []).map((review: any, idx: number) => (
                <div key={review._id || idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-inter font-semibold">
                        {review.user?.name || review.user?.email || review.author || 'Reader'}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground font-inter">{new Date(review.createdAt || Date.now()).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? "fill-accent text-accent" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground font-inter">{review.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Read;