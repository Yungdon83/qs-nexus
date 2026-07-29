import { useParams, Link } from "react-router-dom"


function LevelCourses() {

  const { level } = useParams()


  const coursesByLevel = {
    "100 Level": [
      "QTS 101",
      "QTS 103",
      "QTS 105",
      "QTS 107",
      "MTH 101",
      "PHY 101",
      "CHM 101"
    ],

    "200 Level": [
      "QTS 201",
      "QTS 203",
      "QTS 205",
      "QTS 207"
    ],

    "300 Level": [
      "QTS 301",
      "QTS 303",
      "QTS 305",
      "QTS 307"
    ],

    "400 Level": [
      "QTS 401",
      "QTS 403",
      "QTS 405",
      "QTS 407"
    ],

    "500 Level": [
      "QTS 501",
      "QTS 503",
      "QTS 505",
      "Research Project"
    ]
  }


  const courses = coursesByLevel[level] || []


  return (

    <div className="p-10">

      <h1 className="text-4xl font-bold text-blue-900 mb-6">
        {level} Courses
      </h1>


      <p className="text-gray-600 mb-8">
        Select a course to access lecture materials and resources.
      </p>


      <div className="grid md:grid-cols-3 gap-6">


        {courses.map((course, index) => (

          <div
            key={index}
            className="bg-white shadow-lg rounded-xl p-6"
          >

            <h2 className="text-2xl font-bold text-blue-900">
              {course}
            </h2>


            <Link
              to={`/course/${course}`}
              className="mt-4 inline-block bg-yellow-500 text-white px-5 py-2 rounded-lg"
            >
              Open Course
            </Link>


          </div>

        ))}


      </div>


    </div>

  )
}


export default LevelCourses