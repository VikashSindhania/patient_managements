import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

test("renders navigation menu items", () => {
  render(<App />);
  expect(screen.getByText(/Select File/i)).toBeInTheDocument();
  expect(screen.getByText(/Add Patient/i)).toBeInTheDocument();
  expect(screen.getByText(/Edit Patient/i)).toBeInTheDocument();
  expect(screen.getByText(/Search/i)).toBeInTheDocument();
});
