import { Link } from "react-router-dom"


function Courses() {

  const levels = [
    "100 Level",
    "200 Level",
    "300 Level",
    "400 Level",
    "500 Level"
  ]


  return (
    <div className="p-10">

      <h1 className="text-4xl font-bold text-blue-900 mb-6">
        Course Materials
      </h1>


      <p className="text-gray-600 mb-10">
        Access Quantity Surveying courses, lecture slides,
        notes and academic resources.
      </p>


      <div className="grid md:grid-cols-5 gap-5">

        {levels.map((level, index) => (

          <div
            key={index}
            className="bg-white shadow-lg rounded-xl p-6 text-center"
          >

            <h2 className="text-xl font-bold text-blue-900">
              {level}
            </h2>


            <Link
              to={`/courses/${level}`}
              className="mt-4 inline-block bg-blue-900 text-white px-4 py-2 rounded-lg"
            >
              View Courses
            </Link>


          </div>

        ))}

      </div>


    </div>
  )
}


export default Courses