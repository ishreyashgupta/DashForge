import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth"; // ✅ Use your hook
import "../styles/Navbar.css";

function Navbar() {
  const { token, role } = useAuth(); // ✅ Pull from localStorage
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      setIsAdmin(role === "admin");
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  }, [token, role]);

  return (
    <>
      <h2 className="Logo" style={{ textAlign: "center" }}>MERN Auth App</h2>
      <nav className="navbar">
        <ul>
          <li><Link to="/">Home</Link></li>
          {isLoggedIn && <li><Link to="/dashboard">Dashboard</Link></li>}
          {isLoggedIn && <li><Link to="/form">Form</Link></li>}
          {isAdmin && <li><Link to="/admin-dashboard">Admin Panel</Link></li>}
        </ul>
      </nav>
    </>
  );
}

export default Navbar;
