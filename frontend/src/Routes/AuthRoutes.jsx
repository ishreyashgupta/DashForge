import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";

const LoginPage = lazy(() => import("../Pages/LoginPage"));
const RegisterPage = lazy(() => import("../Pages/RegisterPage"));

export default function AuthRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path ="register" element ={<RegisterPage/>} />
    </Routes>
  );
}
