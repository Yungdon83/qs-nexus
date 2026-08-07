import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"


function GradeSubmissions() {


  const [submissions, setSubmissions] = useState([])

  const [loading, setLoading] = useState(true)






  useEffect(() => {

    fetchSubmissions()

  }, [])







  async function fetchSubmissions() {


    const { data, error } = await supabase

      .from("submissions")

      .select(`
        *,
        assignments (
          title,
          course_code
        )
      `)

      .order("submitted_at", {
        ascending: false
      })





    if (error) {

      alert(error.message)

    } else {

      setSubmissions(data || [])

    }



    setLoading(false)


  }








  async function updateSubmission(id, grade, feedback) {


    const { error } = await supabase

      .from("submissions")

      .update({

        grade,

        feedback

      })

      .eq("id", id)






    if (error) {

      alert(error.message)

    } else {

      alert("Submission updated")

      fetchSubmissions()

    }


  }







  if (loading) {


    return (

      <div className="p-10 text-xl">

        Loading submissions...

      </div>

    )


  }







  return (

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-6xl mx-auto">


        <h1 className="text-3xl font-bold text-blue-900 mb-8">

          Grade Submissions

        </h1>






        {
          submissions.length === 0 ? (


            <div className="bg-white p-8 rounded-xl shadow">

              No submissions yet.

            </div>


          ) : (


            <div className="space-y-6">


              {
                submissions.map((submission) => (


                  <SubmissionCard

                    key={submission.id}

                    submission={submission}

                    updateSubmission={updateSubmission}

                  />


                ))

              }


            </div>


          )
        }



      </div>


    </div>

  )

}





function SubmissionCard({
  submission,
  updateSubmission
}) {


  const [grade, setGrade] = useState(
    submission.grade || ""
  )


  const [feedback, setFeedback] = useState(
    submission.feedback || ""
  )





  return (

    <div className="bg-white rounded-xl shadow p-6">


      <h2 className="text-xl font-bold text-blue-900">

        {submission.assignments?.title}

      </h2>



      <p>

        Course:

        {" "}

        {submission.assignments?.course_code}

      </p>



      <a

        href={submission.file_url}

        target="_blank"

        className="text-blue-600 underline"

      >

        View Submission

      </a>





      <div className="mt-5 space-y-3">


        <input

          value={grade}

          onChange={(e) => setGrade(e.target.value)}

          placeholder="Grade"

          className="w-full border p-3 rounded-lg"

        />



        <textarea

          value={feedback}

          onChange={(e) => setFeedback(e.target.value)}

          placeholder="Feedback"

          className="w-full border p-3 rounded-lg"

        />





        <button

          onClick={() =>
            updateSubmission(
              submission.id,
              grade,
              feedback
            )
          }

          className="bg-blue-900 text-white px-5 py-2 rounded-lg"

        >

          Save Grade

        </button>


      </div>



    </div>

  )

}



export default GradeSubmissions