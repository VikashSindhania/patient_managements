import React from "react";
import { Navigate } from "react-router-dom";
import { googleService } from "../services/googleService";

const RouteGuard = ({ children }) => {
  if (!googleService.isSheetSelected()) {
    return <Navigate to="/select-file" replace />;
  }

  return children;
};

export default RouteGuard;
