"use client";

import React, { createContext, useContext, useState } from "react";

export interface GoogleUserProfile {
  google_id: string;
  email: string;
  name: string;
  picture: string;
  access_token?: string;
  expires_at?: number;
  authenticated: boolean;
}

interface GoogleAuthContextType {
  user: GoogleUserProfile | null;
  loading: boolean;
  signInWithGoogle: (customEmail?: string) => Promise<GoogleUserProfile>;
  signOut: () => void;
}

const DEFAULT_USER: GoogleUserProfile = {
  google_id: "google_108273918239",
  email: "lannatc@gmail.com",
  name: "Master Admin User",
  picture: "https://lh3.googleusercontent.com/a/default-user",
  authenticated: true
};

const GoogleAuthContext = createContext<GoogleAuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => DEFAULT_USER,
  signOut: () => {}
});

export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GoogleUserProfile | null>(() => {
    if (typeof window === "undefined") return null;
    const savedUser = localStorage.getItem("little_bro_user_profile");
    const savedEmail = localStorage.getItem("little_bro_email");

    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        if (savedEmail) {
          return {
            google_id: "google_saved",
            email: savedEmail,
            name: savedEmail.split("@")[0] || "Google User",
            picture: "/avatar/shan.png",
            authenticated: true
          };
        }
      }
    } else if (savedEmail) {
      return {
        google_id: "google_saved",
        email: savedEmail,
        name: savedEmail.split("@")[0] || "Google User",
        picture: "/avatar/shan.png",
        authenticated: true
      };
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(false);

  const signInWithGoogle = async (customEmail?: string): Promise<GoogleUserProfile> => {
    setLoading(true);
    const targetEmail = customEmail || localStorage.getItem("little_bro_email") || "lannatc@gmail.com";
    const namePart = targetEmail.split("@")[0] || "Google User";
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const newUser: GoogleUserProfile = {
      google_id: "google_oauth_" + Date.now(),
      email: targetEmail.trim().toLowerCase(),
      name: formattedName,
      picture: "/avatar/shan.png",
      access_token: "ya29.a0Axoo-mock-google-oauth2-token-" + Date.now(),
      expires_at: Date.now() + 3600 * 1000,
      authenticated: true
    };

    setUser(newUser);
    localStorage.setItem("little_bro_user_profile", JSON.stringify(newUser));
    localStorage.setItem("little_bro_email", newUser.email);
    localStorage.setItem("little_bro_onboarded", "true");

    // Upsert profile to backend / Supabase safely
    try {
      await fetch("/api/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUser.email,
          username: newUser.name,
          telegram_chat_id: "5581598534"
        })
      });
    } catch (err) {
      console.error("Google OAuth profile sync error:", err);
    }

    setLoading(false);
    return newUser;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("little_bro_user_profile");
    localStorage.removeItem("little_bro_email");
    localStorage.removeItem("little_bro_onboarded");
  };

  return (
    <GoogleAuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => useContext(GoogleAuthContext);
