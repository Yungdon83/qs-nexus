import { BrowserRouter, Routes, Route } from "react-router-dom"
import CourseDetails from "./pages/CourseDetails"
import Navbar from "./components/Navbar"

import Home from "./pages/Home"
import About from "./pages/About"
import Courses from "./pages/Courses"
import Resources from "./pages/Resources"
import Login from "./pages/Login"
import LevelCourses from "./pages/LevelCourses"


function App() {

  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/courses" element={<Courses />} />

        <Route path="/courses/:level" element={<LevelCourses />} />

        <Route path="/resources" element={<Resources />} />
<Route path="/course/:courseCode" element={<CourseDetails />} />
        <Route path="/login" element={<Login />} />

      </Routes>

    </BrowserRouter>
  )
}

export default App