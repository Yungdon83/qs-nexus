import { BrowserRouter, Routes, Route } from "react-router-dom"
import Timetable from "./pages/Timetable"
import ProtectedRoute from "./components/ProtectedRoute"
import Navbar from "./components/Navbar"
import GPACalculator from "./pages/GPACalculator"
import CourseQuiz from "./pages/CourseQuiz"
import StudyAssistant from "./pages/StudyAssistant"
import QuizHistory from "./pages/QuizHistory"
import QuizLeaderboard from "./pages/QuizLeaderboard"
import QuizReview from "./pages/QuizReview"
import QuizPerformance from "./pages/QuizPerformance"
import CourseProgress from "./pages/CourseProgress"
import Assignments from "./pages/Assignments"


// Public Pages
import Home from "./pages/Home"
import About from "./pages/About"
import Courses from "./pages/Courses"
import Resources from "./pages/Resources"
import Login from "./pages/Login"
import Register from "./pages/Register"
import LevelCourses from "./pages/LevelCourses"
import CourseDetails from "./pages/CourseDetails"

// Dashboards
import StudentDashboard from "./pages/StudentDashboard"
import LecturerDashboard from "./pages/LecturerDashboard"
import AdminDashboard from "./pages/AdminDashboard"

// Admin
import ManageStudents from "./pages/ManageStudents"
import ManageLecturers from "./pages/ManageLecturers"
import CreateLecturer from "./pages/CreateLecturer"
import ManageCourses from "./pages/ManageCourses"
import EditCourse from "./pages/EditCourse"
import ManageTimetable from "./pages/ManageTimetable"
import EditTimetable from "./pages/EditTimetable"
import AdminResources from "./pages/AdminResources"
import AdminAnnouncements from "./pages/AdminAnnouncements"
import AdminEvents from "./pages/AdminEvents"

// Student
import StudentSubmissions from "./pages/StudentSubmissions"
import StudentAnnouncements from "./pages/StudentAnnouncements"
import StudentAssignments from "./pages/StudentAssignments"
import SubmitAssignment from "./pages/SubmitAssignment"

// Resources
import UploadResource from "./pages/UploadResource"
import ManageResources from "./pages/ManageResources"

// Announcements
import CreateAnnouncement from "./pages/CreateAnnouncement"
import ManageAnnouncements from "./pages/ManageAnnouncements"
import EditAnnouncement from "./pages/EditAnnouncement"

// Events
import CreateEvent from "./pages/CreateEvent"
import ManageEvents from "./pages/ManageEvents"
import EditEvent from "./pages/EditEvent"

// Assignments
import CreateAssignment from "./pages/CreateAssignment"
import ManageAssignments from "./pages/ManageAssignments"
import GradeSubmissions from "./pages/GradeSubmissions"

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        {/* ================= PUBLIC ================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/courses"
          element={<Courses />}
        />

        <Route
          path="/courses/:level"
          element={<LevelCourses />}
        />

        <Route
          path="/course/:courseCode"
          element={<CourseDetails />}
        />
        <Route
  path="/assignments"
  element={<Assignments />}
/>




        <Route
          path="/resources"
          element={<Resources />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/timetable"
          element={<Timetable />}
        />


        {/* ================= STUDENT ACADEMIC TOOLS ================= */}

        <Route
          path="/gpa-calculator"
          element={
            <ProtectedRoute role="student">
              <GPACalculator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course-quiz/:courseCode"
          element={
            <ProtectedRoute role="student">
              <CourseQuiz />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz-history"
          element={
            <ProtectedRoute role="student">
              <QuizHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz-leaderboard"
          element={
            <ProtectedRoute role="student">
              <QuizLeaderboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz-review/:attemptId"
          element={
            <ProtectedRoute role="student">
              <QuizReview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz-performance"
          element={
            <ProtectedRoute role="student">
              <QuizPerformance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/study-assistant"
          element={
            <ProtectedRoute role="student">
              <StudyAssistant />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course-progress"
          element={
            <ProtectedRoute role="student">
              <CourseProgress />
            </ProtectedRoute>
          }
        />


        {/* ================= ADMIN ================= */}

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-students"
          element={
            <ProtectedRoute role="admin">
              <ManageStudents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-lecturers"
          element={
            <ProtectedRoute role="admin">
              <ManageLecturers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-lecturer"
          element={
            <ProtectedRoute role="admin">
              <CreateLecturer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-courses"
          element={
            <ProtectedRoute role="admin">
              <ManageCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-course/:id"
          element={
            <ProtectedRoute role="admin">
              <EditCourse />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-timetable"
          element={
            <ProtectedRoute role="admin">
              <ManageTimetable />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-timetable/:id"
          element={
            <ProtectedRoute role="admin">
              <EditTimetable />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-resources"
          element={
            <ProtectedRoute role="admin">
              <AdminResources />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-announcements"
          element={
            <ProtectedRoute role="admin">
              <AdminAnnouncements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-events"
          element={
            <ProtectedRoute role="admin">
              <AdminEvents />
            </ProtectedRoute>
          }
        />


        {/* ================= STUDENT ================= */}

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-submissions"
          element={
            <ProtectedRoute role="student">
              <StudentSubmissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-announcements"
          element={
            <ProtectedRoute role="student">
              <StudentAnnouncements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-assignments"
          element={
            <ProtectedRoute role="student">
              <StudentAssignments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/submit-assignment/:id"
          element={
            <ProtectedRoute role="student">
              <SubmitAssignment />
            </ProtectedRoute>
          }
        />


        {/* ================= LECTURER ================= */}

        <Route
          path="/lecturer-dashboard"
          element={
            <ProtectedRoute role="lecturer">
              <LecturerDashboard />
            </ProtectedRoute>
          }
        />


        {/* ================= RESOURCES ================= */}

        <Route
          path="/upload-resource"
          element={
            <ProtectedRoute role="lecturer">
              <UploadResource />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-resources"
          element={
            <ProtectedRoute role="lecturer">
              <ManageResources />
            </ProtectedRoute>
          }
        />


        {/* ================= ANNOUNCEMENTS ================= */}

        <Route
          path="/create-announcement"
          element={
            <ProtectedRoute role="lecturer">
              <CreateAnnouncement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-announcements"
          element={
            <ProtectedRoute role="lecturer">
              <ManageAnnouncements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-announcement/:id"
          element={
            <ProtectedRoute role="lecturer">
              <EditAnnouncement />
            </ProtectedRoute>
          }
        />


        {/* ================= EVENTS ================= */}

        <Route
          path="/create-event"
          element={
            <ProtectedRoute role="lecturer">
              <CreateEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-events"
          element={
            <ProtectedRoute role="lecturer">
              <ManageEvents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-event/:id"
          element={
            <ProtectedRoute role={["lecturer", "admin"]}>
              <EditEvent />
            </ProtectedRoute>
          }
        />


        {/* ================= ASSIGNMENTS ================= */}

        <Route
          path="/create-assignment"
          element={
            <ProtectedRoute role="lecturer">
              <CreateAssignment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-assignments"
          element={
            <ProtectedRoute role="lecturer">
              <ManageAssignments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/grade-submissions"
          element={
            <ProtectedRoute role="lecturer">
              <GradeSubmissions />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App
