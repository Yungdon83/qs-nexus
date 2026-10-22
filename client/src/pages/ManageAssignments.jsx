import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import useAssignments from "../hooks/useAssignments"


function ManageAssignments() {


  const { user } = useAuth()


  const {
    assignments,
    loading,
    fetchAssignments,
    deleteAssignment
  } = useAssignments()





  useEffect(() => {

    if (user) {

      fetchAssignments()

    }

  }, [user])







  const myAssignments = assignments.filter(
    (assignment) =>
      assignment.created_by === user?.id
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


        <div className="flex justify-between items-center mb-8">


          <h1 className="text-3xl font-bold text-blue-900">

            Manage Assignments

          </h1>



          <Link

            to="/create-assignment"

            className="bg-blue-900 text-white px-5 py-3 rounded-lg"

          >

            Create Assignment

          </Link>



        </div>





        {
          myAssignments.length === 0 ? (


            <div className="bg-white rounded-xl shadow p-8">

              No assignments created yet.

            </div>


          ) : (


            <div className="grid md:grid-cols-2 gap-6">


              {
                myAssignments.map((assignment) => (


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

                        <strong>Level:</strong>{" "}

                        {assignment.level}

                      </p>



                      <p>

                        <strong>Due:</strong>{" "}

                        {assignment.due_date}

                      </p>


                    </div>





                    <button

                      onClick={() =>
                        deleteAssignment(assignment.id)
                      }

                      className="mt-6 bg-red-600 text-white px-5 py-2 rounded-lg"

                    >

                      Delete

                    </button>



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


export default ManageAssignments