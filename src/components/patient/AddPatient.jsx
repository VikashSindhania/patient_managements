import React, { useState } from "react";
import {
  Box,
  TextField,
  Grid,
  Button,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { googleService } from "../../services/googleService";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const AddPatient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!googleService.getSheetId()) {
      setError("Please select a Google Sheet first");
      navigate("/select-file");
      return;
    }

    try {
      // Convert form data to array format for Google Sheets
      const values = [
        [
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
        ],
      ];

      // Append the data to the spreadsheet
      await googleService.appendValues("Patients!A2:O2", values);

      setSuccess(true);
      // Reset form
      setFormData({
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
    } catch (error) {
      setError("Error saving patient: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add New Patient
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Patient added successfully!
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit} role="form">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Patient ID"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                data-testid="patientid-input"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Patient Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                data-testid="name-input"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                data-testid="age-input"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                data-testid="gender-input"
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                data-testid="phoneNumber-input"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Prescription"
                name="prescription"
                value={formData.prescription}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Dose"
                name="dose"
                value={formData.dose}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Visit Date"
                name="visitDate"
                type="date"
                value={formData.visitDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Physician Name"
                name="physicianName"
                value={formData.physicianName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Physician ID"
                name="physicianId"
                value={formData.physicianId}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Physician Phone"
                name="physicianPhone"
                value={formData.physicianPhone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Bill Amount"
                name="bill"
                type="number"
                value={formData.bill}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Add Patient"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/")}
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

export default AddPatient;
