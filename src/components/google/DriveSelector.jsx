import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import { useNavigate } from "react-router-dom";
import { googleService } from "../../services/googleService";

const DriveSelector = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [createNewOpen, setCreateNewOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initializeGoogle = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize Google API
        await googleService.initializeGoogleAPI();

        if (!mounted) return;

        // Sign in the user
        await googleService.signIn();

        if (!mounted) return;

        // Get list of spreadsheets
        const spreadsheets = await googleService.listSpreadsheets();

        if (!mounted) return;

        setFiles(spreadsheets);
      } catch (error) {
        console.error("Failed to initialize:", error);
        if (mounted) {
          setError(error.message || "Failed to initialize Google API");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeGoogle();

    return () => {
      mounted = false;
    };
  }, []);

  const handleFileSelect = async (file) => {
    try {
      setSelectedFile(file);
      googleService.setSheetId(file.id);
      navigate("/view-patients");
    } catch (error) {
      setError("Failed to select file: " + error.message);
    }
  };

  const handleCreateNew = async () => {
    if (!newFileName.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const newSheet = await googleService.createSpreadsheet(newFileName);

      setSelectedFile({
        id: newSheet.spreadsheetId,
        name: newFileName,
      });

      googleService.setSheetId(newSheet.spreadsheetId);

      // Refresh the file list
      const spreadsheets = await googleService.listSpreadsheets();
      setFiles(spreadsheets);

      setCreateNewOpen(false);
      navigate("/view-patients");
    } catch (error) {
      setError("Failed to create spreadsheet: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const retryInitialization = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2, p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={retryInitialization}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Select Google Sheet
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          Please select a Google Sheet to store patient data or create a new
          one.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setCreateNewOpen(true)}
          >
            Create New Sheet
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom>
          Available Sheets:
        </Typography>
        <List>
          {files.map((file) => (
            <ListItem
              key={file.id}
              button
              selected={selectedFile?.id === file.id}
              onClick={() => handleFileSelect(file)}
            >
              <ListItemIcon>
                <TableChartIcon />
              </ListItemIcon>
              <ListItemText primary={file.name} />
            </ListItem>
          ))}
          {files.length === 0 && (
            <ListItem>
              <ListItemText primary="No spreadsheets found" />
            </ListItem>
          )}
        </List>
      </Paper>

      <Dialog open={createNewOpen} onClose={() => setCreateNewOpen(false)}>
        <DialogTitle>Create New Spreadsheet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Spreadsheet Name"
            fullWidth
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateNewOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateNew}
            disabled={!newFileName.trim() || loading}
          >
            {loading ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DriveSelector;
