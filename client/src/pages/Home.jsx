import QuickAccess from "../components/QuickAccess"
import DepartmentOverview from "../components/DepartmentOverview"

function Home() {
  return (
    <main>

      <section className="min-h-screen bg-gray-100 flex items-center justify-center px-6">

        <div className="text-center max-w-3xl">

          <h1 className="text-5xl font-bold text-blue-900 mb-6">
            Welcome to QS Nexus
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            The digital platform connecting Quantity Surveying
            students, lecturers, and the department.
          </p>

          <div className="flex justify-center gap-4">

            <button className="bg-blue-900 text-white px-6 py-3 rounded-lg">
              Student Login
            </button>

            <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg">
              Lecturer Login
            </button>

          </div>

        </div>

      </section>


      <QuickAccess />

      <DepartmentOverview />

    </main>
  )
}

export default Home