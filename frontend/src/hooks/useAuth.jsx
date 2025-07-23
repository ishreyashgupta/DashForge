// src/hooks/useAuth.js
export default function useAuth() {
  const user = JSON.parse(localStorage.getItem("user"));

  return {
    token: user?.token || null,
    role: user?.role || null,
    userId: user?._id || user?.id || null,
    name: user?.name || null,
    email: user?.email || null,
  };
}
