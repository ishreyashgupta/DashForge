import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, Typography } from "@mui/material";

import useAuth from "../../../hooks/useAuth";
import UDFBuilder from "./UDF/UDFBuilder";
import SavedUDFForms from "./UDF/SavedUDFForms";
import AssignFormSection from "./AssignFormSection";
import ResponsesSection from "./ResponsesSection";
import SendMailSection from "./SendMailSection";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { role, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
    }
  }, [role, navigate]);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        Admin Dashboard
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Manage Forms" />
        <Tab label="Create Form" />
        <Tab label="Assign Form" />
        <Tab label="View Responses" />
        <Tab label="Send Mail" />
      </Tabs>

      <Box>
        {activeTab === 0 && (
          <Box>
            <Typography variant="h5" mb={2}>
              Manage Forms
            </Typography>
            <SavedUDFForms />
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" mb={2}>
              Create New Form
            </Typography>
            <UDFBuilder />
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h5" mb={2}>
              Assign Form to User
            </Typography>
            <AssignFormSection token={token} />
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="h5" mb={2}>
              View Responses
            </Typography>
            <ResponsesSection onBack={() => setActiveTab(0)} />
          </Box>
        )}

        {activeTab === 4 && (
          <Box>
            <Typography variant="h5" mb={2}>
              Send Mail
            </Typography>
            <SendMailSection />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
