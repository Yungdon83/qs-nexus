import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import useAssignments from "../hooks/useAssignments"


function StudentAssignments() {


  const { profile } = useAuth()


  const {
    assignments,
    loading,
    fetchAssignments
  } = useAssignments()





  useEffect(() => {

    fetchAssignments()

  }, [])







  const studentAssignments = assignments.filter(
    (assignment) =>
      assignment.level === profile?.level
  )







  if (loading) {

    return (

      <div className="p-10 text-xl">

        Loading assignments...

      </div>

    )

  }







  return (

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-6xl mx-auto">


        <h1 className="text-3xl font-bold text-blue-900 mb-8">

          My Assignments

        </h1>





        {
          studentAssignments.length === 0 ? (


            <div className="bg-white rounded-xl shadow p-8">

              No assignments available.

            </div>


          ) : (


            <div className="grid md:grid-cols-2 gap-6">


              {
                studentAssignments.map((assignment) => (


                  <div

                    key={assignment.id}

                    className="bg-white rounded-xl shadow p-6"

                  >


                    <h2 className="text-2xl font-bold text-blue-900">

                      {assignment.title}

                    </h2>




                    <p className="mt-3 text-gray-700">

                      {assignment.description}

                    </p>




                    <div className="mt-4 space-y-2">


                      <p>

                        <strong>Course:</strong>{" "}

                        {assignment.course_code}

                      </p>



                      <p>

                        <strong>Due Date:</strong>{" "}

                        {assignment.due_date}

                      </p>



                    </div>





                    <Link

                      to={`/submit-assignment/${assignment.id}`}

                      className="inline-block mt-6 bg-blue-900 text-white px-5 py-2 rounded-lg"

                    >

                      Submit Assignment

                    </Link>



                  </div>


                ))

              }


            </div>


          )
        }



      </div>


    </div>

  )

}


export default StudentAssignments