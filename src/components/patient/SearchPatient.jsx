import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import { googleService } from "../../services/googleService";
import { useNavigate } from "react-router-dom";

const SearchPatient = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

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
          patientName: row[1] || "",
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

  const columns = [
    { field: "patientId", headerName: "Patient ID", width: 130 },
    { field: "patientName", headerName: "Patient Name", width: 180 },
    { field: "age", headerName: "Age", width: 90 },
    { field: "gender", headerName: "Gender", width: 100 },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "location", headerName: "Location", width: 130 },
    { field: "prescription", headerName: "Prescription", width: 180 },
    { field: "dose", headerName: "Dose", width: 130 },
    { field: "visitDate", headerName: "Visit Date", width: 130 },
    { field: "nextVisit", headerName: "Next Visit", width: 130 },
    { field: "physicianName", headerName: "Physician Name", width: 180 },
    {
      field: "bill",
      headerName: "Bill Amount",
      width: 120,
      //   valueFormatter: (params) => {
      //     if (!params.value) return "";
      //     return `$${params.value}`;
      //   },
    },
  ];

  const filteredPatients = patients.filter((patient) => {
    if (!searchTerm) return true;

    const searchValue = searchTerm.toLowerCase();
    return (
      patient.patientId.toLowerCase().includes(searchValue) ||
      patient.patientName.toLowerCase().includes(searchValue) ||
      patient.phone.toLowerCase().includes(searchValue) ||
      patient.location.toLowerCase().includes(searchValue) ||
      patient.prescription.toLowerCase().includes(searchValue) ||
      patient.physicianName.toLowerCase().includes(searchValue)
    );
  });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Search Patients
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by Patient ID, Name, Phone, Location, Prescription, or Physician"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={filteredPatients}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            getRowId={(row) => row.patientId}
            sx={{
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
            }}
            onRowClick={(params) => {
              navigate(`/edit-patient/${params.row.patientId}`);
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default SearchPatient;
