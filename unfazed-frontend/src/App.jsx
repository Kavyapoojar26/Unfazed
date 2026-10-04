import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Clients from "./pages/Clients";
import ClinicalNotes from "./pages/ClinicalNotes";
import Payments from "./pages/Payments";
import Invoices from "./pages/Invoices";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import BookSession from "./pages/BookSession";
import AppLayout from "./layouts/AppLayout";

import PublicProfile from "./pages/PublicProfile";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}

        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/therapist/:slug"
          element={<PublicProfile />}
        />
        
        <Route
          path="/therapist/:slug/book"
          element={<BookSession />}
        />
        {/* PROTECTED APP */}

        <Route
          element={
            isAuthenticated ? (
              <AppLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/appointments"
            element={<Appointments />}
          />

          <Route
            path="/clients"
            element={<Clients />}
          />

          <Route
            path="/clinical-notes"
            element={<ClinicalNotes />}
          />

          <Route
            path="/payments"
            element={<Payments />}
          />

          <Route
            path="/invoices"
            element={<Invoices />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

        </Route>

        {/* DEFAULT */}

        <Route
          path="/"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? "/dashboard"
                  : "/login"
              }
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;