import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Grid,
  Button,
  MenuItem,
  Typography,
  Paper,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { googleService } from "../../services/googleService";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";

const EditPatient = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    name: "",
    age: "",
    gender: "",
    phone: "",
    location: "",
    address: "",
    prescription: "",
    dose: "",
    visitDate: "",
    nextVisit: "",
    physicianName: "",
    physicianId: "",
    physicianPhone: "",
    bill: "",
  });

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
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
        const patientRow = response.values.find((row) => row[0] === patientId);
        if (patientRow) {
          setFormData({
            patientId: patientRow[0] || "",
            name: patientRow[1] || "",
            age: patientRow[2] || "",
            gender: patientRow[3] || "",
            phone: patientRow[4] || "",
            location: patientRow[5] || "",
            address: patientRow[6] || "",
            prescription: patientRow[7] || "",
            dose: patientRow[8] || "",
            visitDate: patientRow[9] || "",
            nextVisit: patientRow[10] || "",
            physicianName: patientRow[11] || "",
            physicianId: patientRow[12] || "",
            physicianPhone: patientRow[13] || "",
            bill: patientRow[14] || "",
          });
        } else {
          setError("Patient not found");
          navigate("/view-patients");
        }
      }
    } catch (error) {
      console.error("Error fetching patient:", error);
      setError("Failed to fetch patient: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Find the row index of the patient to update
      const response = await googleService.getValues("Patients!A2:A");
      const rowIndex = response.values.findIndex((row) => row[0] === patientId);

      if (rowIndex === -1) {
        throw new Error("Patient not found");
      }

      // Convert form data to array format
      const rowData = [
        formData.patientId,
        formData.name,
        formData.age,
        formData.gender,
        formData.phone,
        formData.location,
        formData.address,
        formData.prescription,
        formData.dose,
        formData.visitDate,
        formData.nextVisit,
        formData.physicianName,
        formData.physicianId,
        formData.physicianPhone,
        formData.bill,
      ];

      // Update the row in the spreadsheet
      await googleService.updateRow("Patients", rowIndex + 2, rowData);
      setSuccess(true);

      // Navigate back to view patients after successful update
      setTimeout(() => {
        navigate("/view-patients");
      }, 1500);
    } catch (error) {
      console.error("Error updating patient:", error);
      setError("Failed to update patient: " + error.message);
    } finally {
      setLoading(false);
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
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Edit Patient
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Patient updated successfully!
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient ID"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                disabled
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                type="number"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                margin="normal"
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                multiline
                rows={2}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prescription"
                name="prescription"
                value={formData.prescription}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dose"
                name="dose"
                value={formData.dose}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Visit Date"
                name="visitDate"
                type="date"
                value={formData.visitDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Next Visit"
                name="nextVisit"
                type="date"
                value={formData.nextVisit}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Physician Name"
                name="physicianName"
                value={formData.physicianName}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Physician ID"
                name="physicianId"
                value={formData.physicianId}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Physician Phone"
                name="physicianPhone"
                value={formData.physicianPhone}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bill Amount"
                name="bill"
                type="number"
                value={formData.bill}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              Update Patient
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/view-patients")}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EditPatient;
