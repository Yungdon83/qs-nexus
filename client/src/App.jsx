import { BrowserRouter, Routes, Route } from "react-router-dom"

import ProtectedRoute from "./components/ProtectedRoute"
import Navbar from "./components/Navbar"

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


        {/* PUBLIC */}

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



        {/* ADMIN */}

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



        {/* DASHBOARDS */}


        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />


        <Route
          path="/lecturer-dashboard"
          element={
            <ProtectedRoute role="lecturer">
              <LecturerDashboard />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />



        {/* STUDENT */}

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



        {/* RESOURCES */}

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



        {/* ANNOUNCEMENTS */}

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



        {/* EVENTS */}

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
            <ProtectedRoute role="lecturer">
              <EditEvent />
            </ProtectedRoute>
          }
        />



        {/* ASSIGNMENTS */}

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