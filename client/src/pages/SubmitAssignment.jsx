import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useAuth } from "../contexts/AuthContext"


function SubmitAssignment() {


  const { id } = useParams()

  const navigate = useNavigate()

  const { user } = useAuth()


  const [file, setFile] = useState(null)

  const [loading, setLoading] = useState(false)






  async function handleSubmit(e) {

    e.preventDefault()


    if (!file) {

      alert("Please select a file")

      return

    }



    if (!user) {

      alert("Please login first")

      return

    }



    try {


      setLoading(true)



      const fileName = `${user.id}-${Date.now()}-${file.name}`



      const { error: uploadError } = await supabase.storage

        .from("assignments")

        .upload(fileName, file)



      if (uploadError) {

        throw uploadError

      }





      const {
        data: publicUrl
      } = supabase.storage

        .from("assignments")

        .getPublicUrl(fileName)






      const { error } = await supabase

        .from("submissions")

        .insert({

          assignment_id: id,

          student_id: user.id,

          file_url: publicUrl.publicUrl

        })





      if (error) {

        throw error

      }




      alert("Assignment submitted successfully")

      navigate("/student-dashboard")




    } catch (error) {


      alert(error.message)



    } finally {


      setLoading(false)


    }


  }







  return (

    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-8">


      <div className="bg-white rounded-xl shadow p-8 w-full max-w-xl">


        <h1 className="text-3xl font-bold text-blue-900 mb-6">

          Submit Assignment

        </h1>




        <form

          onSubmit={handleSubmit}

          className="space-y-5"

        >



          <input

            type="file"

            onChange={(e) => setFile(e.target.files[0])}

            className="w-full border p-3 rounded-lg"

            required

          />





          <button

            type="submit"

            disabled={loading}

            className="w-full bg-blue-900 text-white py-3 rounded-lg"

          >

            {
              loading
              ? "Submitting..."
              : "Submit Assignment"
            }


          </button>




        </form>


      </div>


    </div>

  )

}


export default SubmitAssignment