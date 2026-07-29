import { Link } from "react-router-dom";

function Navbar() {

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">


        {/* Logo */}

        <Link to="/" className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center">
            <span className="text-yellow-400 font-bold text-xl">
              QS
            </span>
          </div>


          <div>

            <h1 className="font-bold text-xl text-blue-900">
              QS Nexus
            </h1>

            <p className="text-xs text-gray-500">
              Quantity Surveying Portal
            </p>

          </div>

        </Link>



        {/* Navigation Links */}

        <div className="hidden md:flex items-center gap-8">


          <Link 
            to="/"
            className="text-gray-700 hover:text-blue-900 font-medium"
          >
            Home
          </Link>


          <Link 
            to="/about"
            className="text-gray-700 hover:text-blue-900 font-medium"
          >
            About
          </Link>


          <Link 
            to="/courses"
            className="text-gray-700 hover:text-blue-900 font-medium"
          >
            Courses
          </Link>


          <Link 
            to="/resources"
            className="text-gray-700 hover:text-blue-900 font-medium"
          >
            Resources
          </Link>


        </div>



        {/* Login Button */}

        <Link
          to="/login"
          className="bg-blue-900 text-white px-5 py-2 rounded-xl hover:bg-blue-800"
        >
          Login
        </Link>


      </div>

    </nav>
  );
}

export default Navbar;