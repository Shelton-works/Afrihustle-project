import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase } from "lucide-react";
import { toast } from "sonner";
import { signIn, signUp } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"student" | "company">("student");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('signup-name') as string;
    const email = formData.get('signup-email') as string;
    const password = formData.get('signup-password') as string;

    let additionalData = {};
    if (userType === 'company') {
      additionalData = {
        company_name: fullName
      };
    }

    const { error } = await signUp(email, password, fullName, userType, additionalData);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created successfully!");
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('signin-email') as string;
    const password = formData.get('signin-password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl mb-4">
            <img src="/logo.png" alt="AfriHustle Logo" className="h-8 w-auto" />
            <span className="text-primary">AfriHustle</span>
          </Link>
          <h1 className="text-3xl font-bold mt-4">Welcome to AfriHustle</h1>
          <p className="text-muted-foreground mt-2">
            Start your journey to amazing opportunities
          </p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
            </TabsList>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-type">I am a...</Label>
                  <select
                    id="user-type"
                    name="user-type"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    required
                    value={userType}
                    onChange={(e) => setUserType(e.target.value as "student" | "company")}
                  >
                    <option value="student">Student</option>
                    <option value="company">Company</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input 
                    id="signup-name"
                    name="signup-name"
                    placeholder="John Doe" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email"
                    name="signup-email"
                    type="email" 
                    placeholder="you@example.com" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password"
                    name="signup-password"
                    type="password" 
                    placeholder="••••••••" 
                    required
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="hero" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </TabsContent>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input 
                    id="signin-email"
                    name="signin-email"
                    type="email" 
                    placeholder="you@example.com" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input 
                    id="signin-password"
                    name="signin-password"
                    type="password" 
                    placeholder="••••••••" 
                    required 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Button 
                  type="submit" 
                  variant="hero" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Need help? <Link to="/help" className="text-primary hover:underline">Contact support</Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;