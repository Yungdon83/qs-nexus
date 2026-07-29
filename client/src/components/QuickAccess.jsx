function QuickAccess() {

  const cards = [
    {
      title: "Course Materials",
      description: "Access lecture slides and learning resources."
    },
    {
      title: "Past Questions",
      description: "Prepare with previous examination papers."
    },
    {
      title: "Announcements",
      description: "Get important departmental updates."
    },
    {
      title: "Lecturers",
      description: "Meet your course lecturers."
    },
    {
      title: "Department Events",
      description: "Stay updated with upcoming activities."
    },
    {
      title: "Student Resources",
      description: "Access academic guides and resources."
    }
  ]


  return (
    <section className="py-16 px-6">

      <h2 className="text-3xl font-bold text-center text-blue-900 mb-10">
        Quick Access
      </h2>


      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">

        {cards.map((card, index) => (

          <div 
            key={index}
            className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition"
          >

            <h3 className="text-xl font-bold text-blue-900 mb-3">
              {card.title}
            </h3>

            <p className="text-gray-600">
              {card.description}
            </p>

          </div>

        ))}

      </div>

    </section>
  )
}

export default QuickAccess