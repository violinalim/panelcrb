import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import LoginPage from "@/components/LoginPage";
import Dashboard from "@/components/Dashboard";
import SuccessModal from "@/components/SuccessModal";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    setShowSuccessModal(true);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cosmic-dark">
        <div className="animate-pulse text-neon-purple text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard userEmail={user.email || ""} />
      )}
      
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
      />
    </>
  );
};

export default Index;
