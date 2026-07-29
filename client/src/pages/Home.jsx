function Home() {
  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="bg-blue-900 text-white min-h-[80vh] flex items-center">

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">

          <div>

            <p className="text-yellow-400 font-semibold mb-4">
              UNIVERSITY OF IBADAN
            </p>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Department of
              <span className="text-yellow-400">
                {" "}Quantity Surveying
              </span>
            </h1>

            <p className="mt-6 text-lg text-blue-100">
              QS Nexus is a digital academic portal connecting students,
              lecturers, and the department in one platform.
            </p>


            <div className="mt-8 flex gap-4">

              <button className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300">
                Student Portal
              </button>


              <button className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-blue-900">
                Explore Courses
              </button>

            </div>

          </div>



          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10">

            <div className="grid grid-cols-2 gap-6">

              <div className="bg-white/10 p-6 rounded-xl">
                <h2 className="text-3xl font-bold text-yellow-400">
                  500+
                </h2>
                <p>Students</p>
              </div>


              <div className="bg-white/10 p-6 rounded-xl">
                <h2 className="text-3xl font-bold text-yellow-400">
                  50+
                </h2>
                <p>Courses</p>
              </div>


              <div className="bg-white/10 p-6 rounded-xl">
                <h2 className="text-3xl font-bold text-yellow-400">
                  30+
                </h2>
                <p>Lecturers</p>
              </div>


              <div className="bg-white/10 p-6 rounded-xl">
                <h2 className="text-3xl font-bold text-yellow-400">
                  5
                </h2>
                <p>Levels</p>
              </div>

            </div>

          </div>

        </div>

      </section>



      {/* Quick Access */}

      <section className="py-20 px-6">

        <div className="max-w-7xl mx-auto">

          <h2 className="text-3xl font-bold text-center">
            Quick Access
          </h2>


          <div className="grid md:grid-cols-4 gap-6 mt-10">

            {[
              "Course Materials",
              "Past Questions",
              "Announcements",
              "Department Events"
            ].map((item) => (

              <div
                key={item}
                className="bg-white shadow-lg rounded-2xl p-6 hover:-translate-y-2 transition"
              >

                <h3 className="font-semibold text-lg">
                  {item}
                </h3>

                <p className="text-gray-500 mt-2">
                  Access important departmental resources.
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>




      {/* Announcements Section */}

      <section className="py-20 bg-gray-100 px-6">

        <div className="max-w-7xl mx-auto">


          <div className="flex justify-between items-center mb-10">

            <h2 className="text-3xl font-bold text-blue-900">
              Latest Announcements
            </h2>


            <button className="text-blue-900 font-semibold hover:text-yellow-500">
              View All
            </button>

          </div>



          <div className="grid md:grid-cols-3 gap-6">


            <div className="bg-white rounded-2xl shadow p-6">

              <span className="text-sm text-yellow-500 font-semibold">
                Academic
              </span>

              <h3 className="font-bold text-xl mt-3">
                First Semester Lecture Schedule
              </h3>

              <p className="text-gray-500 mt-3">
                Updated departmental timetable and lecture information.
              </p>

            </div>



            <div className="bg-white rounded-2xl shadow p-6">

              <span className="text-sm text-yellow-500 font-semibold">
                Department
              </span>

              <h3 className="font-bold text-xl mt-3">
                Departmental Meeting
              </h3>

              <p className="text-gray-500 mt-3">
                Important information from the department management.
              </p>

            </div>



            <div className="bg-white rounded-2xl shadow p-6">

              <span className="text-sm text-yellow-500 font-semibold">
                Students
              </span>

              <h3 className="font-bold text-xl mt-3">
                New Learning Resources
              </h3>

              <p className="text-gray-500 mt-3">
                New lecture materials are available for students.
              </p>

            </div>


          </div>


        </div>

      </section>


    </div>
  );
}


export default Home;