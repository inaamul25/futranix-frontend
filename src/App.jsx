import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import CourseListPage from "./pages/CourseListPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CreatorDashboardPage from "./pages/CreatorDashboardPage";
import LearningPathPage from "./pages/LearningPathPage";
import MyProfilePage from "./pages/MyProfilePage";
import PlayerPage from "./pages/PlayerPage";
import ProgressDashboardPage from "./pages/ProgressDashboardPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CourseListPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/paths" element={<LearningPathPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MyProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProgressDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator"
          element={
            <ProtectedRoute roles={["CREATOR", "ADMIN"]}>
              <CreatorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/player/:lessonId"
          element={
            <ProtectedRoute>
              <PlayerPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}
