import { useState } from "react"
import { supabase } from "../lib/supabase"


function CreateLecturer(){

  const [form,setForm] = useState({

    full_name:"",
    email:"",
    password:"",
    department:""

  })


  const [message,setMessage] = useState("")




  function handleChange(e){

    setForm({

      ...form,

      [e.target.name]:e.target.value

    })

  }





  async function createLecturer(e){

    e.preventDefault()


    setMessage("Creating lecturer account...")



    const { data, error } = await supabase.functions.invoke(

      "create-lecturer",

      {

        body: form

      }

    )




    if(error){

      setMessage(error.message)

      return

    }




    if(data?.error){

      setMessage(data.error)

      return

    }




    setMessage(
      "Lecturer account created successfully"
    )



    setForm({

      full_name:"",
      email:"",
      password:"",
      department:""

    })


  }







  return(

    <div className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8">



        <h1 className="text-3xl font-bold text-blue-900 mb-6">

          Create Lecturer Account

        </h1>





        <form

          onSubmit={createLecturer}

          className="space-y-4"

        >




          <input

            name="full_name"

            value={form.full_name}

            onChange={handleChange}

            placeholder="Full Name"

            className="w-full border p-3 rounded-lg"

            required

          />





          <input

            name="email"

            type="email"

            value={form.email}

            onChange={handleChange}

            placeholder="Email"

            className="w-full border p-3 rounded-lg"

            required

          />





          <input

            name="password"

            type="password"

            value={form.password}

            onChange={handleChange}

            placeholder="Temporary Password"

            className="w-full border p-3 rounded-lg"

            required

          />





          <input

            name="department"

            value={form.department}

            onChange={handleChange}

            placeholder="Department"

            className="w-full border p-3 rounded-lg"

            required

          />





          <button

            className="w-full bg-blue-900 text-white p-3 rounded-lg"

          >

            Create Lecturer

          </button>




        </form>





        <p className="mt-5 text-center">

          {message}

        </p>




      </div>


    </div>


  )


}


export default CreateLecturer