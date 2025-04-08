import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  TablePagination,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { googleService } from "../../services/googleService";

const ViewPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!googleService.getSheetId()) {
        setError("Please select a Google Sheet first");
        navigate("/select-file");
        return;
      }

      const response = await googleService.getValues("Patients!A2:O");
      if (response && response.values) {
        const formattedPatients = response.values.map((row) => ({
          patientId: row[0] || "",
          name: row[1] || "",
          age: row[2] || "",
          gender: row[3] || "",
          phone: row[4] || "",
          location: row[5] || "",
          address: row[6] || "",
          prescription: row[7] || "",
          dose: row[8] || "",
          visitDate: row[9] || "",
          nextVisit: row[10] || "",
          physicianName: row[11] || "",
          physicianId: row[12] || "",
          physicianPhone: row[13] || "",
          bill: row[14] || "",
        }));
        setPatients(formattedPatients);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError("Failed to fetch patients: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (patientId) => {
    navigate(`/edit-patient/${patientId}`);
  };

  const handleDelete = async (patientId) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        setLoading(true);
        // Find the row index of the patient to delete
        const rowIndex = patients.findIndex((p) => p.patientId === patientId);
        if (rowIndex === -1) throw new Error("Patient not found");

        // Delete the row from the spreadsheet
        await googleService.deleteRow("Patients", rowIndex + 2); // +2 because row 1 is header and sheets are 1-indexed

        // Refresh the patient list
        await fetchPatients();
      } catch (error) {
        setError("Failed to delete patient: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Patient List
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/add-patient")}
        >
          Add New Patient
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Visit Date</TableCell>
              <TableCell>Next Visit</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((patient) => (
                <TableRow key={patient.patientId}>
                  <TableCell>{patient.patientId}</TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.location}</TableCell>
                  <TableCell>{patient.visitDate}</TableCell>
                  <TableCell>{patient.nextVisit}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(patient.patientId)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(patient.patientId)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {patients.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No patients found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={patients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default ViewPatients;
