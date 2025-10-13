import { useState, useEffect } from "react";

export default function useAuth() {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  // Update localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const setToken = (token) => setUser((prev) => ({ ...prev, token }));
  const setRole = (role) => setUser((prev) => ({ ...prev, role }));
  const setUserInfo = (newUser) => setUser(newUser);

  const logout = () => setUser(null); // clears user and localStorage

  return {
    user,
    token: user?.token || null,
    role: user?.role || null,
    userId: user?._id || user?.id || null,
    name: user?.name || null,
    email: user?.email || null,
    setToken,
    setRole,
    setUserInfo,
    logout,
  };
}
