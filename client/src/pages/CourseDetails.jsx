import { useParams } from "react-router-dom";

function CourseDetails() {
  const { courseCode } = useParams();

  // Temporary sample data
  const courseInfo = {
    "QTS 101": {
      title: "Introduction to Quantity Surveying",
      lecturer: "Dr. A. Adewale",
      level: "100 Level",
      creditUnit: 2,
    },
    "QTS 103": {
      title: "Building Construction",
      lecturer: "Mr. O. Ibrahim",
      level: "100 Level",
      creditUnit: 3,
    },
  };

  const info = courseInfo[courseCode] || {
    title: "Course Information",
    lecturer: "To be assigned",
    level: "N/A",
    creditUnit: "-",
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <h1 className="text-4xl font-bold text-blue-900">
        {courseCode}
      </h1>

      <h2 className="text-xl text-gray-700 mt-2">
        {info.title}
      </h2>

      <div className="grid md:grid-cols-3 gap-4 mt-8">

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold text-blue-900">Lecturer</h3>
          <p>{info.lecturer}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold text-blue-900">Level</h3>
          <p>{info.level}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold text-blue-900">Credit Unit</h3>
          <p>{info.creditUnit}</p>
        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-10">

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            📚 Lecture Materials
          </h3>

          <ul className="space-y-2">
            <li>Week 1 - Introduction.pdf</li>
            <li>Week 2 - Measurement.pdf</li>
            <li>Week 3 - Estimating.pdf</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            📝 Assignments
          </h3>

          <ul className="space-y-2">
            <li>Assignment 1</li>
            <li>Assignment 2</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            📄 Past Questions
          </h3>

          <ul className="space-y-2">
            <li>2025 Examination</li>
            <li>2024 Examination</li>
            <li>2023 Examination</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            📢 Announcements
          </h3>

          <ul className="space-y-2">
            <li>Lecture holds every Tuesday by 10 AM.</li>
            <li>Assignment 1 closes next Friday.</li>
          </ul>
        </div>

      </div>

    </div>
  );
}

export default CourseDetails;