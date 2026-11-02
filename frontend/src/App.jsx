import { BrowserRouter, Route, Routes } from "react-router-dom";
import UserProvider from "./context/UserProvider.jsx";
import NavBar from "./components/NavBar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import HomeRedirect from "./components/HomeRedirect.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import NotFoundPage from "./components/NotFoundPage.jsx";
import RunsPage from "./components/RunsPage.jsx";
import RunForm from "./components/RunForm.jsx";
import RunDetailPage from "./components/RunDetailPage.jsx";
import DashboardPage from "./components/DashboardPage.jsx";
import ReleasesPage from "./components/ReleasesPage.jsx";
import ReleaseDetailPage from "./components/ReleaseDetailPage.jsx";
import IssuesPage from "./components/IssuesPage.jsx";
import IssueForm from "./components/IssueForm.jsx";
import IssueDetailPage from "./components/IssueDetailPage.jsx";
import MatchPage from "./components/MatchPage.jsx";

const protectedRoutes = [
  ["/runs", RunsPage],
  ["/runs/new", RunForm],
  ["/runs/:id", RunDetailPage],
  ["/runs/:id/edit", RunForm],
  ["/dashboard", DashboardPage],
  ["/releases", ReleasesPage],
  ["/releases/detail", ReleaseDetailPage],
  ["/issues", IssuesPage],
  ["/issues/new", IssueForm],
  ["/issues/:id", IssueDetailPage],
  ["/issues/:id/edit", IssueForm],
  ["/match", MatchPage],
];

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <NavBar />
        <main className="page">
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {protectedRoutes.map(([path, Page]) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute>
                    <Page />
                  </ProtectedRoute>
                }
              />
            ))}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </UserProvider>
    </BrowserRouter>
  );
}
