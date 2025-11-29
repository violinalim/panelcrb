import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Trophy, 
  Gift, 
  Calendar, 
  Shield, 
  LogOut,
  Menu,
  X 
} from "lucide-react";
import backgroundImage from "@/assets/background.jpg";
import DashboardStats from "./DashboardStats";
import KlasemenSection from "./KlasemenSection";
import HadiahSection from "./HadiahSection";
import EventSection from "./EventSection";
import AdminSection from "./AdminSection";

interface DashboardProps {
  userEmail: string;
}

export default function Dashboard({ userEmail }: DashboardProps) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "klasemen", label: "Klasemen", icon: Trophy },
    { id: "hadiah", label: "Hadiah", icon: Gift },
    { id: "event", label: "Event", icon: Calendar },
    { id: "admin", label: "Admin", icon: Shield },
  ];

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Darker overlay for dashboard */}
      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-dark/85 via-cosmic-dark/90 to-cosmic-dark/95" />
      
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen || window.innerWidth >= 768 ? 0 : -300 }}
          className="fixed md:sticky top-0 left-0 h-screen w-64 bg-cosmic-panel/95 backdrop-blur-xl border-r border-border/50 flex flex-col z-50"
        >
          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Logo */}
          <div className="p-6 border-b border-border/30">
            <img
              src="https://api2-crb.imgnxb.com/images/POd13iqh6aE/logo_mobile_96c00afb-2339-4071-aabc-5685e6905423_1764399286050.gif"
              alt="CERIABET"
              className="h-12 mx-auto object-contain"
            />
            <p className="text-center text-xs font-bold tracking-widest mt-3 text-neon-pink">
              ADMIN PANEL
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 text-foreground shadow-neon border border-neon-purple/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User info & Logout */}
          <div className="p-4 border-t border-border/30 space-y-3">
            <div className="px-4 py-2 bg-secondary/50 rounded-xl">
              <p className="text-xs text-muted-foreground">Logged in as</p>
              <p className="text-sm font-medium truncate">{userEmail}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full rounded-xl border-border/50 hover:bg-destructive/20 hover:text-destructive hover:border-destructive/50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile header */}
          <div className="md:hidden sticky top-0 bg-cosmic-panel/95 backdrop-blur-xl border-b border-border/50 p-4 flex items-center gap-3 z-40">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold">CERIABET Admin</h1>
          </div>

          {/* Content Area */}
          <main className="flex-1 p-6 md:p-8">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                  {navItems.find(item => item.id === activeSection)?.label}
                </h1>
                <p className="text-muted-foreground">
                  Kelola sistem CERIABET dengan mudah
                </p>
              </div>

              {/* Dynamic Content */}
              <div>
                {activeSection === "dashboard" && <DashboardStats />}
                {activeSection === "klasemen" && <KlasemenSection />}
                {activeSection === "hadiah" && <HadiahSection />}
                {activeSection === "event" && <EventSection />}
                {activeSection === "admin" && <AdminSection />}
              </div>
            </motion.div>
          </main>
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}
    </div>
  );
}
