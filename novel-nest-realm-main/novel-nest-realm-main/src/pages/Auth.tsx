import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import { api } from "@/lib/api";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refresh } = useAuth();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("signup-email") as string;
    const password = formData.get("signup-password") as string;
    const confirmPassword = formData.get("signup-confirm") as string;
    const name = formData.get("signup-name") as string;

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Email and password are required.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const signupData: { email: string; password: string; name?: string } = { email, password };
      if (name && name.trim()) {
        signupData.name = name.trim();
      }
      console.log('Signing up with:', { email, hasPassword: !!password, hasName: !!signupData.name });
      await api.auth.signup(signupData);
      await refresh();
      toast({
        title: "Account created!",
        description: "Welcome to StoryVerse.",
      });
      navigate("/library");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create account";
      toast({
        title: "Sign up failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("signin-email") as string;
    const password = formData.get("signin-password") as string;

    try {
      await api.auth.login({ email, password });
      await refresh();
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate("/library");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Invalid credentials";
      toast({
        title: "Sign in failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Reset logic will be added later
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">StoryVerse</h1>
          <p className="text-muted-foreground font-inter">Where stories come to life</p>
        </div>

        <Card className="shadow-[var(--shadow-elevated)] border-border/50">
          <CardHeader>
            <CardTitle className="font-playfair text-2xl">Welcome</CardTitle>
            <CardDescription className="font-inter">Sign in or create an account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="font-inter">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="font-inter">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="font-inter">Email</Label>
                    <Input
                      id="signin-email"
                      name="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="font-inter">Password</Label>
                    <Input
                      id="signin-password"
                      name="signin-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="font-inter"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full font-inter"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full font-inter text-sm"
                    onClick={() => {
                      const forgotTab = document.querySelector('[value="forgot"]') as HTMLElement;
                      forgotTab?.click();
                    }}
                  >
                    Forgot password?
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="font-inter">Name (Optional)</Label>
                    <Input
                      id="signup-name"
                      name="signup-name"
                      type="text"
                      placeholder="Your name"
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="font-inter">Email</Label>
                    <Input
                      id="signup-email"
                      name="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="font-inter">Password</Label>
                    <Input
                      id="signup-password"
                      name="signup-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="font-inter">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      name="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="font-inter"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full font-inter"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="forgot">
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="font-inter">Email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      className="font-inter"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full font-inter"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending reset link..." : "Reset Password"}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full font-inter text-sm"
                    onClick={() => {
                      const signinTab = document.querySelector('[value="signin"]') as HTMLElement;
                      signinTab?.click();
                    }}
                  >
                    Back to sign in
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;