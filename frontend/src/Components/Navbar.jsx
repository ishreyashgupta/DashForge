// frontend/src/Components/Navbar.jsx - Updated Links
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import "../styles/Navbar.css";

function Navbar() {
  const { token, role } = useAuth();
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
          {isLoggedIn && (
  <>
    <li><Link to="/personal-form">Personal Form</Link></li>
    <li><Link to="/form-builder">Form Builder</Link></li>
    <li><Link to="/my-forms">My Forms</Link></li>
  </>
)}
          {isLoggedIn && <li><Link to="/responses">Responses</Link></li>}
          {isAdmin && <li><Link to="/admin-dashboard">Admin Panel</Link></li>}
        </ul>
      </nav>
    </>
  );
}

export default Navbar;