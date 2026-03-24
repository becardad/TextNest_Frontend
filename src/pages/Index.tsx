import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Index() {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/chat" replace />;
  }
  return <Navigate to="/login" replace />;
}
