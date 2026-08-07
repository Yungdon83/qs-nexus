import { useState } from "react"
import { supabase } from "../lib/supabase"


function CreateLecturer() {

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [department, setDepartment] = useState("Quantity Surveying")

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")


  async function handleSubmit(e) {

    e.preventDefault()

    setLoading(true)
    setMessage("")
    setError("")


    if (!fullName || !email || !password) {

      setError("Please fill in all required fields.")

      setLoading(false)

      return
    }


    if (password.length < 6) {

      setError("Password must be at least 6 characters.")

      setLoading(false)

      return
    }


    try {

      const {
        data: { session }
      } = await supabase.auth.getSession()


      if (!session) {

        setError("You must be logged in as an administrator.")

        setLoading(false)

        return
      }


      const { data, error: functionError } =
        await supabase.functions.invoke(
          "create-lecturer",
          {
            body: {
              full_name: fullName,
              email: email,
              password: password,
              department: department,
            },
          }
        )


      if (functionError) {

        setError(functionError.message)

        setLoading(false)

        return
      }


      if (data?.error) {

        setError(data.error)

        setLoading(false)

        return
      }


      setMessage(
        "Lecturer account created successfully."
      )


      setFullName("")
      setEmail("")
      setPassword("")
      setDepartment("Quantity Surveying")


    } catch (err) {

      setError(
        err.message ||
        "Something went wrong."
      )

    }


    setLoading(false)
  }


  return (

    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-2xl mx-auto">

        <div className="bg-white rounded-xl shadow p-8">

          <h1 className="text-3xl font-bold text-blue-900 mb-2">

            Create Lecturer Account

          </h1>


          <p className="text-gray-600 mb-8">

            Create an official lecturer login account.

          </p>


          {message && (

            <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">

              {message}

            </div>

          )}


          {error && (

            <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">

              {error}

            </div>

          )}


          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >


            <div>

              <label className="block font-semibold mb-2">

                Full Name

              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                placeholder="Enter lecturer's full name"
                className="w-full border rounded-lg p-3"
                required
              />

            </div>



            <div>

              <label className="block font-semibold mb-2">

                Email

              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="lecturer@example.com"
                className="w-full border rounded-lg p-3"
                required
              />

            </div>



            <div>

              <label className="block font-semibold mb-2">

                Temporary Password

              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter temporary password"
                className="w-full border rounded-lg p-3"
                minLength={6}
                required
              />

            </div>



            <div>

              <label className="block font-semibold mb-2">

                Department

              </label>

              <input
                type="text"
                value={department}
                onChange={(e) =>
                  setDepartment(e.target.value)
                }
                className="w-full border rounded-lg p-3"
              />

            </div>



            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50"
            >

              {loading
                ? "Creating Lecturer..."
                : "Create Lecturer Account"
              }

            </button>


          </form>

        </div>

      </div>

    </div>

  )
}


export default CreateLecturer