import { BrowserRouter, Routes, Route } from "react-router-dom"

import ProtectedRoute from "./components/ProtectedRoute"
import Navbar from "./components/Navbar"
import EditCourse from "./pages/EditCourse"
import Home from "./pages/Home"
import About from "./pages/About"
import Courses from "./pages/Courses"
import Resources from "./pages/Resources"
import Login from "./pages/Login"
import Register from "./pages/Register"
import LevelCourses from "./pages/LevelCourses"
import CourseDetails from "./pages/CourseDetails"
import Timetable from "./pages/Timetable"
import EditTimetable from "./pages/EditTimetable"

import StudentDashboard from "./pages/StudentDashboard"
import LecturerDashboard from "./pages/LecturerDashboard"
import AdminDashboard from "./pages/AdminDashboard"


import ManageStudents from "./pages/ManageStudents"
import ManageLecturers from "./pages/ManageLecturers"
import ManageCourses from "./pages/ManageCourses"
import ManageTimetable from "./pages/ManageTimetable"


import UploadResource from "./pages/UploadResource"
import ManageResources from "./pages/ManageResources"
import AdminResources from "./pages/AdminResources"


import CreateAnnouncement from "./pages/CreateAnnouncement"
import ManageAnnouncements from "./pages/ManageAnnouncements"
import AdminAnnouncements from "./pages/AdminAnnouncements"
import EditAnnouncement from "./pages/EditAnnouncement"


import CreateEvent from "./pages/CreateEvent"
import ManageEvents from "./pages/ManageEvents"
import AdminEvents from "./pages/AdminEvents"
import EditEvent from "./pages/EditEvent"



function App() {

  return (

    <BrowserRouter>

      <Navbar />


      <Routes>


        {/* PUBLIC PAGES */}


        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/courses" element={<Courses />} />

        <Route
          path="/courses/:level"
          element={<LevelCourses />}
        />
        <Route
          path="/edit-course/:id"
          element={
           <ProtectedRoute allowedRole="admin">
           <EditCourse />
           </ProtectedRoute>
       }
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
          path="/timetable"
          element={<Timetable />}
        />



        {/* AUTH */}


        <Route
          path="/login"
          element={<Login />}
        />


        <Route
          path="/register"
          element={<Register />}
        />




        {/* STUDENT */}


        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRole="student">

              <StudentDashboard />

            </ProtectedRoute>
          }
        />





        {/* LECTURER */}


        <Route
          path="/lecturer-dashboard"
          element={
            <ProtectedRoute allowedRole="lecturer">

              <LecturerDashboard />

            </ProtectedRoute>
          }
        />
<Route
  path="/edit-timetable/:id"
  element={
    <ProtectedRoute allowedRole="admin">
      <EditTimetable />
    </ProtectedRoute>
  }
/>




        <Route
          path="/upload-resource"
          element={<UploadResource />}
        />


        <Route
          path="/manage-resources"
          element={<ManageResources />}
        />


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



        <Route
          path="/create-event"
          element={<CreateEvent />}
        />


        <Route
          path="/manage-events"
          element={<ManageEvents />}
        />


        <Route
          path="/edit-event/:id"
          element={<EditEvent />}
        />







        {/* ADMIN / HOD */}



        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRole="admin">

              <AdminDashboard />

            </ProtectedRoute>
          }
        />



        <Route
          path="/manage-students"
          element={
            <ProtectedRoute allowedRole="admin">

              <ManageStudents />

            </ProtectedRoute>
          }
        />



        <Route
          path="/manage-lecturers"
          element={
            <ProtectedRoute allowedRole="admin">

              <ManageLecturers />

            </ProtectedRoute>
          }
        />



        <Route
          path="/manage-courses"
          element={
            <ProtectedRoute allowedRole="admin">

              <ManageCourses />

            </ProtectedRoute>
          }
        />



        <Route
          path="/manage-timetable"
          element={
            <ProtectedRoute allowedRole="admin">

              <ManageTimetable />

            </ProtectedRoute>
          }
        />



        <Route
          path="/admin-resources"
          element={
            <ProtectedRoute allowedRole="admin">

              <AdminResources />

            </ProtectedRoute>
          }
        />



        <Route
          path="/admin-announcements"
          element={
            <ProtectedRoute allowedRole="admin">

              <AdminAnnouncements />

            </ProtectedRoute>
          }
        />



        <Route
          path="/admin-events"
          element={
            <ProtectedRoute allowedRole="admin">

              <AdminEvents />

            </ProtectedRoute>
          }
        />



      </Routes>


    </BrowserRouter>

  )

}


export default App