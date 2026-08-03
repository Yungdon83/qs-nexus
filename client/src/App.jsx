import { BrowserRouter, Routes, Route } from "react-router-dom"

import Navbar from "./components/Navbar"

import Home from "./pages/Home"
import About from "./pages/About"
import Courses from "./pages/Courses"
import Resources from "./pages/Resources"
import Login from "./pages/Login"
import Register from "./pages/Register"
import LevelCourses from "./pages/LevelCourses"
import CourseDetails from "./pages/CourseDetails"

import StudentDashboard from "./pages/StudentDashboard"
import LecturerDashboard from "./pages/LecturerDashboard"
import AdminDashboard from "./pages/AdminDashboard"

import UploadResource from "./pages/UploadResource"
import ManageResources from "./pages/ManageResources"

import CreateAnnouncement from "./pages/CreateAnnouncement"
import ManageAnnouncements from "./pages/ManageAnnouncements"
import EditAnnouncement from "./pages/EditAnnouncement"

import CreateEvent from "./pages/CreateEvent"
import ManageEvents from "./pages/ManageEvents"
import EditEvent from "./pages/EditEvent"

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* Public */}

        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:level" element={<LevelCourses />} />
        <Route path="/course/:courseCode" element={<CourseDetails />} />
        <Route path="/resources" element={<Resources />} />

        {/* Authentication */}

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboards */}

        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Resources */}

        <Route path="/upload-resource" element={<UploadResource />} />
        <Route path="/manage-resources" element={<ManageResources />} />

        {/* Announcements */}

        <Route path="/create-announcement" element={<CreateAnnouncement />} />
        <Route path="/manage-announcements" element={<ManageAnnouncements />} />
        <Route path="/edit-announcement/:id" element={<EditAnnouncement />} />

        {/* Events */}

        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/manage-events" element={<ManageEvents />} />
        <Route path="/edit-event/:id" element={<EditEvent />} />

      </Routes>

    </BrowserRouter>
  )
}

export default App