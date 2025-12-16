import { LoginForm } from "@/components/LoginForm";
import { useState } from "react";
import { useLocation } from "wouter";
import { login } from "@/lib/auth";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const setUser = useAuth((state) => state.setUser);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await login(email, password);
      setUser(user);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.name}`,
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
}
