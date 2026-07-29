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

              <button className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-xl font-semibold">
                Student Portal
              </button>

              <button className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-blue-900">
                Explore Courses
              </button>

            </div>

          </div>


          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10">

            <div className="grid grid-cols-2 gap-6">

              {[
                ["500+", "Students"],
                ["50+", "Courses"],
                ["30+", "Lecturers"],
                ["5", "Levels"]
              ].map(([number, text]) => (

                <div key={text} className="bg-white/10 p-6 rounded-xl">

                  <h2 className="text-3xl font-bold text-yellow-400">
                    {number}
                  </h2>

                  <p>{text}</p>

                </div>

              ))}

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
            ].map((item)=>(

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




      {/* Announcements */}

      <section className="py-20 bg-gray-100 px-6">

        <div className="max-w-7xl mx-auto">

          <h2 className="text-3xl font-bold text-blue-900 mb-10">
            Latest Announcements
          </h2>


          <div className="grid md:grid-cols-3 gap-6">

            {[
              "First Semester Lecture Schedule",
              "Departmental Meeting",
              "New Learning Resources"
            ].map((item)=>(

              <div key={item} className="bg-white rounded-2xl shadow p-6">

                <p className="text-yellow-500 font-semibold">
                  Department
                </p>

                <h3 className="font-bold text-xl mt-3">
                  {item}
                </h3>

                <p className="text-gray-500 mt-3">
                  Important updates and information from the department.
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>




      {/* Events */}

      <section className="py-20 px-6">

        <div className="max-w-7xl mx-auto">

          <h2 className="text-3xl font-bold text-blue-900 mb-10">
            Upcoming Events
          </h2>


          <div className="grid md:grid-cols-3 gap-6">

            {[
              ["Department Seminar", "Academic seminar organised by lecturers."],
              ["Student Association Meeting", "Important student discussions and updates."],
              ["Career Development Session", "Industry preparation for QS students."]
            ].map(([title, description])=>(

              <div
                key={title}
                className="border rounded-2xl p-6 shadow-sm hover:shadow-lg transition"
              >

                <h3 className="text-xl font-bold">
                  {title}
                </h3>

                <p className="text-gray-500 mt-3">
                  {description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>




      {/* Featured Resources */}

      <section className="py-20 bg-blue-900 text-white px-6">

        <div className="max-w-7xl mx-auto">

          <h2 className="text-3xl font-bold mb-10">
            Featured Resources
          </h2>


          <div className="grid md:grid-cols-3 gap-6">

            {[
              "Lecture Slides",
              "Past Examination Questions",
              "Course Handbooks"
            ].map((resource)=>(

              <div key={resource} className="bg-white/10 rounded-2xl p-6">

                <h3 className="text-xl font-bold">
                  {resource}
                </h3>

                <p className="text-blue-100 mt-3">
                  Access important academic materials anytime.
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>




      {/* Department Overview */}

      <section className="py-20 px-6">

        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-3xl font-bold text-blue-900">
            About Quantity Surveying
          </h2>

          <p className="mt-6 text-gray-600 text-lg leading-relaxed">
            Quantity Surveying is a professional discipline focused on
            cost management, construction economics, project planning,
            and ensuring value throughout the construction process.
            QS Nexus was created to provide students and staff with a
            central digital platform for learning, communication,
            and academic collaboration.
          </p>

        </div>

      </section>




      {/* Footer */}

      <footer className="bg-gray-900 text-white py-12 px-6">

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">


          <div>

            <h2 className="text-2xl font-bold text-yellow-400">
              QS Nexus
            </h2>

            <p className="mt-4 text-gray-400">
              Digital academic portal for the Department of Quantity Surveying.
            </p>

          </div>



          <div>

            <h3 className="font-bold mb-4">
              Quick Links
            </h3>

            <ul className="space-y-2 text-gray-400">

              <li>Home</li>
              <li>Courses</li>
              <li>Resources</li>
              <li>Login</li>

            </ul>

          </div>



          <div>

            <h3 className="font-bold mb-4">
              Contact
            </h3>

            <p className="text-gray-400">
              Department of Quantity Surveying
            </p>

            <p className="text-gray-400">
              University of Ibadan
            </p>

          </div>


        </div>


        <div className="text-center text-gray-500 mt-10">

          © {new Date().getFullYear()} QS Nexus. All rights reserved.

        </div>


      </footer>


    </div>
  );
}


export default Home;