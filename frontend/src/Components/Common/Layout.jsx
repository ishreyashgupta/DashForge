import React from "react";
import Navbar from "../Navbar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
