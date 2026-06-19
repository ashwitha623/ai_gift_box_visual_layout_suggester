import React, { createContext, useContext, useState } from "react";
import AuthRequiredModal from "./AuthRequiredModal";

const AuthModalContext = createContext();

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState("");

  const openAuthModal = (target) => {
    setRedirectTarget(target);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
  };

  const withAuth = (action, targetPath) => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      action();
    } else {
      openAuthModal(targetPath);
    }
  };

  React.useEffect(() => {
    window.openAuthModal = openAuthModal;
    return () => {
      delete window.openAuthModal;
    };
  }, []);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, withAuth }}>
      {children}
      <AuthRequiredModal
        isOpen={isOpen}
        onClose={closeAuthModal}
        redirectTarget={redirectTarget}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthAction() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthAction must be used within an AuthModalProvider");
  }
  return context;
}

export function ProtectedAction({ children, action, redirectTarget, className = "" }) {
  const { withAuth } = useAuthAction();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    withAuth(action, redirectTarget);
  };

  return (
    <span onClick={handleClick} className={`cursor-pointer ${className}`}>
      {children}
    </span>
  );
}
