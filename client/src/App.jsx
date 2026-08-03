import { BrowserRouter, Routes, Route } from "react-router-dom"
import ManageStudents from "./pages/ManageStudents"
import Navbar from "./components/Navbar"
import EditEvent from "./pages/EditEvent"
import ManageEvents from "./pages/ManageEvents"
import Home from "./pages/Home"
import About from "./pages/About"
import Courses from "./pages/Courses"
import Resources from "./pages/Resources"
import Login from "./pages/Login"
import Register from "./pages/Register"
import LevelCourses from "./pages/LevelCourses"
import CourseDetails from "./pages/CourseDetails"
import ManageLecturers from "./pages/ManageLecturers"
import StudentDashboard from "./pages/StudentDashboard"
import LecturerDashboard from "./pages/LecturerDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import ManageCourses from "./pages/ManageCourses"
import UploadResource from "./pages/UploadResource"
import ManageResources from "./pages/ManageResources"
import AdminResources from "./pages/AdminResources"
import CreateAnnouncement from "./pages/CreateAnnouncement"
import ManageAnnouncements from "./pages/ManageAnnouncements"
import EditAnnouncement from "./pages/EditAnnouncement"
import AdminAnnouncements from "./pages/AdminAnnouncements"
import CreateEvent from "./pages/CreateEvent"
import AdminEvents from "./pages/AdminEvents"
import ManageTimetable from "./pages/ManageTimetable"
import Timetable from "./pages/Timetable"

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* Public Pages */}

        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/courses" element={<Courses />} />

        <Route
          path="/courses/:level"
          element={<LevelCourses />}
        />
<Route
  path="/manage-lecturers"
  element={<ManageLecturers />}
/>
        <Route
          path="/course/:courseCode"
          element={<CourseDetails />}
        />
<Route
  path="/manage-students"
  element={<ManageStudents />}
/>
        <Route
          path="/resources"
          element={<Resources />}
        />

        <Route
          path="/register"
          element={<Register />}
        />
        <Route
  path="/admin-events"
  element={<AdminEvents />}
/>
<Route
  path="/manage-events"
  element={<ManageEvents />}
/>
<Route
  path="/manage-courses"
  element={<ManageCourses />}
/>
<Route
  path="/edit-event/:id"
  element={<EditEvent />}
/>
<Route
  path="/manage-timetable"
  element={<ManageTimetable />}
/>
<Route
  path="/timetable"
  element={<Timetable />}
/>
<Route
  path="/admin-resources"
  element={<AdminResources />}
/>
<Route
  path="/admin-announcements"
  element={<AdminAnnouncements />}
/>
        <Route
          path="/login"
          element={<Login />}
        />



        {/* Dashboards */}

        <Route
          path="/student-dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/lecturer-dashboard"
          element={<LecturerDashboard />}
        />

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />



        {/* Resources */}

        <Route
          path="/upload-resource"
          element={<UploadResource />}
        />

        <Route
          path="/manage-resources"
          element={<ManageResources />}
        />



        {/* Announcements */}

        <Route
          path="/create-announcement"
          element={<CreateAnnouncement />}
        />

        <Route
          path="/manage-announcements"
          element={<ManageAnnouncements />}
        />

        <Route
          path="/edit-announcement/:id"
          element={<EditAnnouncement />}
        />



        {/* Events */}

        <Route
          path="/create-event"
          element={<CreateEvent />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App