function DepartmentOverview() {
  const stats = [
    {
      number: "500+",
      title: "Students"
    },
    {
      number: "25+",
      title: "Lecturers"
    },
    {
      number: "5",
      title: "Academic Levels"
    },
    {
      number: "50+",
      title: "Courses"
    }
  ]

  return (
    <section className="bg-blue-900 text-white py-16 px-6">

      <div className="max-w-5xl mx-auto text-center">

        <h2 className="text-3xl font-bold mb-6">
          About Quantity Surveying Department
        </h2>

        <p className="text-lg mb-12">
          The department is dedicated to producing skilled professionals
          in construction cost management, project evaluation, and the
          built environment.
        </p>


        <div className="grid md:grid-cols-4 gap-6">

          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white text-blue-900 rounded-xl p-6"
            >

              <h3 className="text-4xl font-bold">
                {stat.number}
              </h3>

              <p className="mt-2">
                {stat.title}
              </p>

            </div>
          ))}

        </div>

      </div>

    </section>
  )
}

export default DepartmentOverview