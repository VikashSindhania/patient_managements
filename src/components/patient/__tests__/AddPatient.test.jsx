import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import AddPatient from "../AddPatient";

describe("AddPatient Component", () => {
  test("renders Patient ID input field", () => {
    render(
      <BrowserRouter>
        <AddPatient />
      </BrowserRouter>
    );

    // Check if Patient ID input field is rendered
    const patientIdInput = screen.getByTestId("patientid-input");
    expect(patientIdInput).toBeInTheDocument();

    // Get the actual input element inside the TextField
    const inputElement = patientIdInput.querySelector("input");
    expect(inputElement).toHaveAttribute("required");
    expect(inputElement).toHaveAttribute("name", "patientId");
  });

  test("renders Name input field", () => {
    render(
      <BrowserRouter>
        <AddPatient />
      </BrowserRouter>
    );

    // Check if Name input field is rendered
    const nameInput = screen.getByTestId("name-input");
    expect(nameInput).toBeInTheDocument();

    // Get the actual input element inside the TextField
    const inputElement = nameInput.querySelector("input");
    expect(inputElement).toHaveAttribute("required");
    expect(inputElement).toHaveAttribute("name", "name");
  });

  test("renders Age input field", () => {
    render(
      <BrowserRouter>
        <AddPatient />
      </BrowserRouter>
    );

    // Check if Name input field is rendered
    const nameInput = screen.getByTestId("age-input");
    expect(nameInput).toBeInTheDocument();

    // Get the actual input element inside the TextField
    const inputElement = nameInput.querySelector("input");
    expect(inputElement).toHaveAttribute("required");
    expect(inputElement).toHaveAttribute("name", "age");
  });

  // Gender input field
  test("renders Gender input field", () => {
    render(
      <BrowserRouter>
        <AddPatient />
      </BrowserRouter>
    );

    // Check if Gender input field is rendered
    const genderInput = screen.getByTestId("gender-input");
    expect(genderInput).toBeInTheDocument();

    // Get the actual input element inside the TextField
    const inputElement = genderInput.querySelector("input");
    expect(inputElement).toHaveAttribute("required");
    expect(inputElement).toHaveAttribute("name", "gender");
  });

  // Phone Number input field
  test("renders Phone Number input field", () => {
    render(
      <BrowserRouter>
        <AddPatient />
      </BrowserRouter>
    );

    // Check if Phone Number input field is rendered
    const phoneNumberInput = screen.getByTestId("phoneNumber-input");
    expect(phoneNumberInput).toBeInTheDocument();

    // Get the actual input element inside the TextField
    const inputElement = phoneNumberInput.querySelector("input");
    expect(inputElement).toHaveAttribute("required");
    expect(inputElement).toHaveAttribute("name", "phone");
  });
});
