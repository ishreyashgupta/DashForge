import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import { toast } from 'react-toastify';
import "../styles/Form.css";

function RegisterForm() {
  const navigate = useNavigate(); 

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful!");
        console.log(data);
        navigate("/login");  
      } else {
        toast.error("Registration failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>

      <input type="text" name="name" placeholder="Name" onChange={handleChange} /><br/>
      <input type="email" name="email" placeholder="Email" onChange={handleChange} /><br/>
      <input type="password" name="password" placeholder="Password" onChange={handleChange} /><br/>
      <p className = "mt-3 text-center">Dont have an account? <Link to ="/Login" className ="text-primary" style ={{ cursor: "pointer"}}>Login </Link></p>
      <button type="submit">Register</button>
    </form>
  );
}

export default RegisterForm;
