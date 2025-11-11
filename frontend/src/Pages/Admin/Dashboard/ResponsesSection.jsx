import React, { useEffect, useState } from "react";
import { getAllUDFForms, getUDFResponses } from "../../../services/udfservice";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Typography,
  Button,
  TableContainer,
  Box,
} from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DynamicResponsesViewer from "./UDF/DynamicReponsesViewer";

export default function UDFResponsesDashboard() {
  const [forms, setForms] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [open, setOpen] = useState(false);

  // ✅ Fetch all forms + their responses
  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Excel Export Function
  const handleExcelDownload = (formId) => {
    const form = forms.find((f) => f._id === formId);
    const data = responses[formId] || [];

    if (!data.length) {
      alert("No responses to download.");
      return;
    }

    // Build a flat JSON for Excel
    const formatted = data.map((r) => {
      const answers = r.data || r.answers || {};
      const row = {
        "User Name": r.userId?.name || "Unknown",
        "User Email": r.userId?.email || "Unknown",
        "Submitted At": r.createdAt
          ? new Date(r.createdAt).toLocaleString()
          : "-",
      };
      (form?.fields || []).forEach((f) => {
        row[f.label || f.name] = answers[f.name] ?? "-";
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Responses");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `${form?.name || "Form"}_Responses.xlsx`
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <TableContainer
      component={Paper}
      sx={{ maxWidth: 1200, margin: "0 auto", padding: 2 }}
    >
     
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Form Name</TableCell>
            <TableCell>Total Responses</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {forms.map((f) => (
            <TableRow key={f._id}>
              <TableCell>{f.name}</TableCell>
              <TableCell>{responses[f._id]?.length || 0}</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleExcelDownload(f._id)}
                  >
                    Download Excel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setSelectedForm(f);
                      setOpen(true);
                    }}
                  >
                    View Responses
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ✅ Modal Viewer */}
      {open && selectedForm && (
        <DynamicResponsesViewer
          form={selectedForm}
          formId={selectedForm._id}
          onClose={() => {
            setOpen(false);
            setSelectedForm(null);
          }}
        />
      )}
    </TableContainer>
  );
}
