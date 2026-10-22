import { useState } from "react"

function GPACalculator() {
  const [courses, setCourses] = useState([
    {
      id: 1,
      code: "",
      title: "",
      unit: "",
      grade: "",
    },
  ])

  const gradePoints = {
    A: 5,
    B: 4,
    C: 3,
    D: 2,
    E: 1,
    F: 0,
  }

  function addCourse() {
    setCourses([
      ...courses,
      {
        id: Date.now(),
        code: "",
        title: "",
        unit: "",
        grade: "",
      },
    ])
  }

  function removeCourse(id) {
    if (courses.length === 1) return

    setCourses(
      courses.filter((course) => course.id !== id)
    )
  }

  function updateCourse(id, field, value) {
    setCourses(
      courses.map((course) =>
        course.id === id
          ? {
              ...course,
              [field]: value,
            }
          : course
      )
    )
  }

  const totalUnits = courses.reduce(
    (total, course) =>
      total + (Number(course.unit) || 0),
    0
  )

  const totalGradePoints = courses.reduce(
    (total, course) =>
      total +
      (Number(course.unit) || 0) *
        (gradePoints[course.grade] ?? 0),
    0
  )

  const gpa =
    totalUnits > 0
      ? (totalGradePoints / totalUnits).toFixed(2)
      : "0.00"

  function resetCalculator() {
    setCourses([
      {
        id: Date.now(),
        code: "",
        title: "",
        unit: "",
        grade: "",
      },
    ])
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 py-10 px-5 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-400">
            GPA Calculator
          </h1>

          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Calculate your semester GPA quickly and easily.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 transition-colors duration-300">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead>
                <tr className="border-b dark:border-slate-700">

                  <th className="text-left p-3 text-gray-700 dark:text-gray-300">
                    Course Code
                  </th>

                  <th className="text-left p-3 text-gray-700 dark:text-gray-300">
                    Course Title
                  </th>

                  <th className="text-left p-3 text-gray-700 dark:text-gray-300">
                    Units
                  </th>

                  <th className="text-left p-3 text-gray-700 dark:text-gray-300">
                    Grade
                  </th>

                  <th className="text-left p-3 text-gray-700 dark:text-gray-300">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {courses.map((course) => (

                  <tr
                    key={course.id}
                    className="border-b dark:border-slate-700"
                  >

                    <td className="p-3">
                      <input
                        type="text"
                        value={course.code}
                        onChange={(e) =>
                          updateCourse(
                            course.id,
                            "code",
                            e.target.value
                          )
                        }
                        placeholder="QTS101"
                        className="w-full border rounded-lg p-2 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="text"
                        value={course.title}
                        onChange={(e) =>
                          updateCourse(
                            course.id,
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="Course title"
                        className="w-full border rounded-lg p-2 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={course.unit}
                        onChange={(e) =>
                          updateCourse(
                            course.id,
                            "unit",
                            e.target.value
                          )
                        }
                        placeholder="3"
                        className="w-24 border rounded-lg p-2 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                      />
                    </td>

                    <td className="p-3">
                      <select
                        value={course.grade}
                        onChange={(e) =>
                          updateCourse(
                            course.id,
                            "grade",
                            e.target.value
                          )
                        }
                        className="w-24 border rounded-lg p-2 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                      >

                        <option value="">
                          Grade
                        </option>

                        <option value="A">
                          A
                        </option>

                        <option value="B">
                          B
                        </option>

                        <option value="C">
                          C
                        </option>

                        <option value="D">
                          D
                        </option>

                        <option value="E">
                          E
                        </option>

                        <option value="F">
                          F
                        </option>

                      </select>
                    </td>

                    <td className="p-3">

                      <button
                        onClick={() =>
                          removeCourse(course.id)
                        }
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                      >
                        Remove
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          <div className="flex flex-wrap gap-4 mt-6">

            <button
              onClick={addCourse}
              className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-3 rounded-lg font-semibold"
            >
              + Add Course
            </button>

            <button
              onClick={resetCalculator}
              className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-3 rounded-lg font-semibold"
            >
              Reset
            </button>

          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-8">

          <ResultCard
            title="Total Units"
            value={totalUnits}
          />

          <ResultCard
            title="Total Grade Points"
            value={totalGradePoints.toFixed(2)}
          />

          <ResultCard
            title="Your GPA"
            value={gpa}
            highlight
          />

        </div>

      </div>
    </div>
  )
}

function ResultCard({
  title,
  value,
  highlight = false,
}) {
  return (
    <div
      className={`rounded-2xl shadow p-6 text-center transition-colors duration-300 ${
        highlight
          ? "bg-blue-900 text-white"
          : "bg-white dark:bg-slate-900"
      }`}
    >
      <p
        className={
          highlight
            ? "text-blue-200"
            : "text-gray-500 dark:text-gray-400"
        }
      >
        {title}
      </p>

      <h2
        className={`text-3xl font-bold mt-2 ${
          highlight
            ? "text-white"
            : "text-blue-900 dark:text-blue-400"
        }`}
      >
        {value}
      </h2>
    </div>
  )
}

export default GPACalculator