import React, { useEffect, useState } from "react";
import {
  getAllUDFForms,
  getUDFResponses,
} from "../../../../services/udfservice";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Button,
} from "@mui/material";

export default function ViewResponses({ onBack }) {
  const [responsesData, setResponsesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllResponses = async () => {
      try {
        const forms = await getAllUDFForms();
        const allResponses = [];

        for (const form of forms) {
          const responses = await getUDFResponses(form._id);
          responses.forEach((r) => {
            allResponses.push({
              formName: form.name || "Untitled Form",
              formId: form._id,
              ...r,
            });
          });
        }

        setResponsesData(allResponses);
      } catch (error) {
        alert("Error fetching responses: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllResponses();
  }, []);

  if (loading)
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="60vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography>Loading all responses...</Typography>
      </Box>
    );

  return (
    <Box sx={{ maxWidth: "95%", margin: "0 auto", padding: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight={600}>
          All Form Responses
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={onBack}
          sx={{ textTransform: "none" }}
        >
          ← Back to Forms
        </Button>
      </Box>

      {responsesData.length === 0 ? (
        <Typography>No responses found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell><strong>Form Name</strong></TableCell>
                <TableCell><strong>Response ID</strong></TableCell>
                <TableCell><strong>Submitted At</strong></TableCell>
                <TableCell><strong>Response Data</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {responsesData.map((res, i) => (
                <TableRow key={i} hover>
                  <TableCell>{res.formName}</TableCell>
                  <TableCell>{res._id}</TableCell>
                  <TableCell>
                    {new Date(res.createdAt || "").toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        fontSize: 13,
                        background: "#fafafa",
                        padding: 1,
                        borderRadius: 1,
                        border: "1px solid #eee",
                        maxHeight: 200,
                        overflowY: "auto",
                      }}
                    >
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {JSON.stringify(res.responses || res, null, 2)}
                      </pre>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
