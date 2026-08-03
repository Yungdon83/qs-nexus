import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"


function Register() {

  const navigate = useNavigate()

  const [form, setForm] = useState({

    full_name: "",
    email: "",
    password: "",
    department: "Quantity Surveying",
    level: "100L"

  })


  const [loading, setLoading] = useState(false)



  function handleChange(e) {

    setForm({

      ...form,
      [e.target.name]: e.target.value

    })

  }





  async function handleSubmit(e) {

    e.preventDefault()

    setLoading(true)



    const {
      data,
      error
    } = await supabase.auth.signUp({

      email: form.email,

      password: form.password

    })



    if(error){

      alert(error.message)

      setLoading(false)

      return

    }



    const user = data.user



    if(user){


      const { error: profileError } = await supabase
        .from("profiles")
        .insert({

          id: user.id,

          full_name: form.full_name,

          department: form.department,

          level: form.level,

          role: "student"

        })



      if(profileError){

        alert(profileError.message)

        setLoading(false)

        return

      }



    }



    alert(
      "Registration successful! Please login."
    )


    navigate("/login")


  }





  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">


      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">


        <h1 className="text-3xl font-bold text-blue-900 mb-6">

          Create Account

        </h1>



        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >



          <input

            type="text"

            name="full_name"

            placeholder="Full Name"

            value={form.full_name}

            onChange={handleChange}

            className="w-full border p-3 rounded-lg"

            required

          />





          <input

            type="email"

            name="email"

            placeholder="Email"

            value={form.email}

            onChange={handleChange}

            className="w-full border p-3 rounded-lg"

            required

          />





          <input

            type="password"

            name="password"

            placeholder="Password"

            value={form.password}

            onChange={handleChange}

            className="w-full border p-3 rounded-lg"

            required

          />





          <select

            name="level"

            value={form.level}

            onChange={handleChange}

            className="w-full border p-3 rounded-lg"

          >

            <option value="100L">
              100L
            </option>

            <option value="200L">
              200L
            </option>

            <option value="300L">
              300L
            </option>

            <option value="400L">
              400L
            </option>

            <option value="500L">
              500L
            </option>


          </select>





          <button

            type="submit"

            disabled={loading}

            className="w-full bg-blue-900 text-white py-3 rounded-lg"

          >

            {
              loading
              ? "Creating..."
              : "Register"
            }

          </button>



        </form>



      </div>


    </div>

  )

}


export default Register