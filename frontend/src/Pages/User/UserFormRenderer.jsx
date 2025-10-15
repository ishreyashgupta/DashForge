import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

function UserFormRenderer() {
  const navigate = useNavigate();
  const { token: jwtToken } = useAuth(); // JWT from login
  const params = new URLSearchParams(window.location.search);
  const tokenFromLink = params.get("token");

  useEffect(() => {
    if (!tokenFromLink) {
      // No token in URL → fallback
      navigate("/login");
      return;
    }

    // User is logged in → open dashboard with token query param
    if (jwtToken) {
      navigate(`/dashboard?token=${tokenFromLink}`, { replace: true });
    } else {
      // User not logged in → redirect to login and preserve redirect after login
      const redirectPath = encodeURIComponent(`/dashboard?token=${tokenFromLink}`);
      navigate(`/login?redirect=${redirectPath}`, { replace: true });
    }
  }, [jwtToken, navigate, tokenFromLink]);

  return null; // Nothing to render
}

export default UserFormRenderer;
