import { BrowserRouter, Routes, Route } from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute"
import Navbar from "./components/Navbar"
import StudentSubmissions from "./pages/StudentSubmissions"
import StudentAnnouncements from "./pages/StudentAnnouncements"
// Public Pages
import Home from "./pages/Home"
import About from "./pages/About"
import Courses from "./pages/Courses"
import Resources from "./pages/Resources"
import Login from "./pages/Login"
import Register from "./pages/Register"
import LevelCourses from "./pages/LevelCourses"
import CourseDetails from "./pages/CourseDetails"
import ManageLecturers from "./pages/ManageLecturers"

import ManageStudents from "./pages/ManageStudents"

// Dashboards
import StudentDashboard from "./pages/StudentDashboard"
import LecturerDashboard from "./pages/LecturerDashboard"
import AdminDashboard from "./pages/AdminDashboard"


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
import StudentAssignments from "./pages/StudentAssignments"
import SubmitAssignment from "./pages/SubmitAssignment"
import GradeSubmissions from "./pages/GradeSubmissions"



function App() {


  return (

    <BrowserRouter>


      <Navbar />



      <Routes>



        {/* PUBLIC */}

        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/courses" element={<Courses />} />

        <Route
          path="/courses/:level"
          element={<LevelCourses />}
        />

        <Route
          path="/course/:courseCode"
          element={<CourseDetails />}
        />
<Route
path="/student-submissions"
element={<StudentSubmissions />}
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
path="/student-announcements"
element={<StudentAnnouncements />}
/>
        <Route
          path="/register"
          element={<Register />}
        />

<Route
path="/manage-students"
element={
<ProtectedRoute role="admin">
<ManageStudents/>
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





        {/* RESOURCES */}


        <Route
          path="/upload-resource"
          element={<UploadResource />}
        />


        <Route
          path="/manage-resources"
          element={<ManageResources />}
        />






        {/* ANNOUNCEMENTS */}


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







        {/* EVENTS */}


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








        {/* ASSIGNMENTS */}


        <Route
          path="/create-assignment"
          element={<CreateAssignment />}
        />


        <Route
          path="/manage-assignments"
          element={<ManageAssignments />}
        />


        <Route
          path="/student-assignments"
          element={<StudentAssignments />}
        />


        <Route
          path="/submit-assignment/:id"
          element={<SubmitAssignment />}
        />


        <Route
          path="/grade-submissions"
          element={<GradeSubmissions />}
        />




      </Routes>



    </BrowserRouter>

  )

}


export default App