import React, { useEffect, useState } from "react";
import { getAllUDFForms, getUDFResponses } from "../../../services/udfservice";

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#BB447B"];

export default function UDFResponsesDashboard() {
  const [forms, setForms] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);

  // Fetch all forms and their responses
  const fetchData = async () => {
    setLoading(true);
    
    try {
      const allForms = await getAllUDFForms();
      setForms(allForms);
      const responseData = {};
      await Promise.all(
        allForms.map(async (form) => {
          try {
            const res = await getUDFResponses(form._id);
            responseData[form._id] = res || [];
          } catch {
            responseData[form._id] = [];
          }
        })
      );
      setResponses(responseData);
    } catch (err) {
      console.error(err);
      alert("Error fetching forms or responses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Download responses as Excel
  const handleExcelDownload = (formId) => {
    const data = responses[formId] || [];
    if (!data.length) return alert("No responses to download");

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Responses");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `Form_${formId}_Responses.xlsx`
    );
  };

  if (loading) return <CircularProgress />;

  return (
    <TableContainer component={Paper} sx={{ maxWidth: 1200, margin: "0 auto", padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        UDF Responses Dashboard
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Form Name</TableCell>
            <TableCell>Assigned Users</TableCell>
            <TableCell>Total Responses</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {forms.map((f) => {
            const formResponses = responses[f._id] || [];
            return (
              <TableRow key={f._id}>
                <TableCell>{f.name || "Untitled Form"}</TableCell>
                <TableCell>{f.assignedUsers?.length || 0}</TableCell>
                <TableCell>{formResponses.length}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => setSelectedForm(f)}>
                    View Responses
                  </Button>
                  <Button size="small" onClick={() => handleExcelDownload(f._id)}>
                    Download Excel
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedForm && (
        <Paper sx={{ marginTop: 4, padding: 2 }}>
          <Typography variant="h6">{selectedForm.name} - Responses</Typography>

          {/* Pie Chart of responses per user */}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={(responses[selectedForm._id] || []).map((r, i) => ({
                  name: r.user || `User ${i + 1}`,
                  value: 1,
                }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {(responses[selectedForm._id] || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          {/* Responses Table */}
          <Table sx={{ marginTop: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                {(selectedForm.fields || []).map((field) => (
                  <TableCell key={field.name}>{field.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(responses[selectedForm._id] || []).map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.user}</TableCell>
                  {(selectedForm.fields || []).map((field) => (
                    <TableCell key={field.name}>{r[field.name] ?? "-"}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button sx={{ marginTop: 2 }} onClick={() => setSelectedForm(null)}>
            Close
          </Button>
        </Paper>
      )}
    </TableContainer>
  );
}
