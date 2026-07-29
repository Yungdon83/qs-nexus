import { Link } from "react-router-dom"


function Navbar() {

  return (

    <nav className="bg-blue-900 text-white px-8 py-5 flex justify-between items-center">

      <h2 className="text-2xl font-bold">
        QS Nexus
      </h2>


      <div className="flex gap-6">

        <Link to="/">
          Home
        </Link>

        <Link to="/about">
          About
        </Link>

        <Link to="/courses">
          Courses
        </Link>

        <Link to="/resources">
          Resources
        </Link>

        <Link to="/login">
          Login
        </Link>

      </div>


    </nav>

  )

}


export default Navbar