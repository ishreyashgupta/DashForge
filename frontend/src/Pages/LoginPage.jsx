import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

// styles
import "../../styles/Form.css";

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("🔐 Login response from server:", data); // ✅ Debug raw response

      if (response.ok && data.token && data.user) {
        // ✅ Combine user info and token
        const userWithToken = {
          ...data.user,       // name, email, role, _id or id
          token: data.token,  // JWT
        };

        // ✅ Save everything in one "user" key
        localStorage.setItem("user", JSON.stringify(userWithToken));

        // ✅ Debug: Check if useAuth will get the token
        console.log("✅ Token stored:", userWithToken.token);
        console.log("✅ Full user object stored:", userWithToken);

        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error("Login failed: " + (data.message || "Invalid credentials"));
      }
    } catch (error) {
      console.error("❌ Fetch error during login:", error);
      toast.error("Something went wrong during login.");
    }
  };

  return (
    <div className="login-container">
      <form
        onSubmit={handleSubmit}
        className="p-4 border rounded shadow bg-white"
        style={{ maxWidth: "400px", margin: "auto", marginTop: "100px" }}
      >
        <h2 className="mb-3">Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="form-control mb-3"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="form-control mb-3"
          required
        />

        <p className="mt-3 text-center">
          Don’t have an account?{" "}
          <Link to="/register" className="text-primary" style={{ cursor: "pointer" }}>
            Register
          </Link>
        </p>

        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginForm;