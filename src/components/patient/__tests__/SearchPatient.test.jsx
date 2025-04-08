import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import SearchPatient from "../SearchPatient";
import { googleService } from "../../../services/googleService";

// Mock the googleService
jest.mock("../../../services/googleService", () => ({
  googleService: {
    getSheetId: jest.fn(),
    getValues: jest.fn(),
  },
}));

// Mock useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

describe("SearchPatient Component", () => {
  const mockPatients = [
    {
      patientId: "P001",
      patientName: "John Doe",
      age: "30",
      gender: "Male",
      phone: "1234567890",
      location: "New York",
      prescription: "Medicine A",
      bill: "100",
    },
    {
      patientId: "P002",
      patientName: "Jane Smith",
      age: "25",
      gender: "Female",
      phone: "0987654321",
      location: "Los Angeles",
      prescription: "Medicine B",
      bill: "200",
    },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock the getSheetId to return a valid ID
    googleService.getSheetId.mockReturnValue("mock-sheet-id");

    // Mock the getValues to return our test data
    googleService.getValues.mockResolvedValue({
      values: mockPatients.map((patient) => [
        patient.patientId,
        patient.patientName,
        patient.age,
        patient.gender,
        patient.phone,
        patient.location,
        "", // address
        patient.prescription,
        "", // dose
        "", // visitDate
        "", // nextVisit
        "", // physicianName
        "", // physicianId
        "", // physicianPhone
        patient.bill,
      ]),
    });
  });

  test("renders search input and table headers", async () => {
    render(
      <BrowserRouter>
        <SearchPatient />
      </BrowserRouter>
    );

    // Check if search input is rendered
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by/i)).toBeInTheDocument();
    });

    // Wait for the table to be populated and check column headers
    await waitFor(() => {
      const columnHeaders = screen.getAllByRole("columnheader");
      expect(columnHeaders.length).toBeGreaterThan(0);

      // Find headers by their aria-label
      const headers = columnHeaders.map((header) =>
        header.getAttribute("aria-label")
      );
      expect(headers).toContain("Patient ID");
      expect(headers).toContain("Patient Name");
      expect(headers).toContain("Age");
      //expect(headers).toContain("Gender");
    });
  });

  test("filters patients based on search input", async () => {
    render(
      <BrowserRouter>
        <SearchPatient />
      </BrowserRouter>
    );

    // Wait for initial data load and grid to be rendered
    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1); // Header row + data rows
    });

    // Get the search input
    const searchInput = screen.getByPlaceholderText(/Search by/i);

    // Type 'John' in the search input
    fireEvent.change(searchInput, { target: { value: "John" } });

    // Wait for filtering to complete and check results
    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      // Should have header row + one data row for John
      expect(rows.length).toBe(2);

      // Check that John's row exists
      const cells = screen.getAllByRole("cell");
      const johnCell = cells.find((cell) => cell.textContent === "John Doe");
      expect(johnCell).toBeInTheDocument();

      // Verify Jane's data is not present
      const janeCell = cells.find((cell) => cell.textContent === "Jane Smith");
      expect(janeCell).toBeUndefined();
    });
  });

  test("displays error message when sheet is not selected", async () => {
    // Mock getSheetId to return null
    googleService.getSheetId.mockReturnValue(null);

    render(
      <BrowserRouter>
        <SearchPatient />
      </BrowserRouter>
    );

    // Check for error message
    await waitFor(() => {
      expect(
        screen.getByText("Please select a Google Sheet first")
      ).toBeInTheDocument();
    });
  });

  test("displays error message when API call fails", async () => {
    // Mock getValues to reject
    googleService.getValues.mockRejectedValue(new Error("API Error"));

    render(
      <BrowserRouter>
        <SearchPatient />
      </BrowserRouter>
    );

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch patients/i)).toBeInTheDocument();
    });
  });
});
