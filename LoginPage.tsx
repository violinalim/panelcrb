import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import backgroundImage from "@/assets/background.jpg";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError("Login gagal. Periksa email dan password Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cosmic-dark/60 via-cosmic-dark/70 to-cosmic-dark/80" />
      
      {/* Glow effects */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-neon-pink/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-cosmic-panel/95 backdrop-blur-xl rounded-3xl shadow-card border border-border/50 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="https://api2-crb.imgnxb.com/images/POd13iqh6aE/logo_mobile_96c00afb-2339-4071-aabc-5685e6905423_1764399286050.gif"
              alt="CERIABET"
              className="h-16 object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-center text-xl font-bold tracking-widest mb-8 text-neon-pink">
            ADMIN PANEL
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground text-xs uppercase tracking-wider">
                Username / Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Silahkan di isi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border/50 text-foreground rounded-full h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground text-xs uppercase tracking-wider">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-border/50 text-foreground rounded-full h-11"
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-destructive text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full gradient-neon shadow-neon hover:shadow-[0_0_40px_hsl(280_80%_70%/0.7)] transition-all duration-300 font-semibold tracking-wide"
            >
              {loading ? "MASUK..." : "MASUK PANEL"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-8">
            All Right Reserved © CERIABET
          </p>
        </div>
      </motion.div>
    </div>
  );
}
