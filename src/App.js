import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

import Layout from "./components/layout/Layout";
import RouteGuard from "./components/RouteGuard";
import AddPatient from "./components/patient/AddPatient";
import EditPatient from "./components/patient/EditPatient";
import ViewPatients from "./components/patient/ViewPatients";
import DriveSelector from "./components/google/DriveSelector";
import SearchPatient from "./components/patient/SearchPatient";

// Create theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/select-file" replace />}
              />
              <Route path="/select-file" element={<DriveSelector />} />
              <Route
                path="/add-patient"
                element={
                  <RouteGuard>
                    <AddPatient />
                  </RouteGuard>
                }
              />
              <Route
                path="/edit-patient/:patientId"
                element={
                  <RouteGuard>
                    <EditPatient />
                  </RouteGuard>
                }
              />
              <Route
                path="/view-patients"
                element={
                  <RouteGuard>
                    <ViewPatients />
                  </RouteGuard>
                }
              />
              <Route
                path="/search"
                element={
                  <RouteGuard>
                    <SearchPatient />
                  </RouteGuard>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
