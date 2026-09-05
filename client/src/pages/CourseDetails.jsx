import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import courseService from "../services/courseService";
import { openResourceFile } from "../utils/resourceStorage";

function CourseDetails() {
  const { courseCode } = useParams();
  const [course, setCourse] = useState(null);
  const [lecturer, setLecturer] = useState(null);
  const [resources, setResources] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function handleOpenResource(fileUrl) {
    try {
      await openResourceFile(fileUrl);
    } catch (openError) {
      console.error("COURSE RESOURCE ERROR:", openError);
      window.alert("This file is currently unavailable. Please try again later.");
    }
  }

  useEffect(() => {
    async function loadCourse() {
      setLoading(true);
      setError("");

      try {
        const courseData = await courseService.getCourseByCode(courseCode);

        if (!courseData) {
          setError("Course not found.");
          return;
        }

        setCourse(courseData);

        const [lecturerResult, resourcesResult, assignmentsResult] = await Promise.all([
          courseData.lecturer_id
            ? supabase
                .from("profiles")
                .select("full_name, department")
                .eq("id", courseData.lecturer_id)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          supabase
            .from("resources")
            .select("id, title, file_url, resource_type")
            .eq("course_code", courseData.course_code)
            .order("created_at", { ascending: false }),
          supabase
            .from("assignments")
            .select("id, title, due_date")
            .eq("course_code", courseData.course_code)
            .order("due_date", { ascending: true }),
        ]);

        if (lecturerResult.error) throw lecturerResult.error;
        if (resourcesResult.error) throw resourcesResult.error;
        if (assignmentsResult.error) throw assignmentsResult.error;

        setLecturer(lecturerResult.data);
        setResources(resourcesResult.data || []);
        setAssignments(assignmentsResult.data || []);
      } catch (loadError) {
        console.error("COURSE DETAILS ERROR:", loadError);
        setError(loadError.message || "Unable to load course.");
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseCode]);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-6 py-10">Loading course...</div>;
  }

  if (error || !course) {
    return <div className="max-w-6xl mx-auto px-6 py-10 text-red-700">{error || "Course not found."}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <h1 className="text-4xl font-bold text-blue-900">
        {course.course_code}
      </h1>

      <h2 className="text-xl text-gray-700 mt-2">
        {course.course_title}
      </h2>

      <div className="grid md:grid-cols-3 gap-4 mt-8">

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold text-blue-900">Lecturer</h3>
          <p>{lecturer?.full_name || "To be assigned"}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold text-blue-900">Level</h3>
          <p>{course.level || "N/A"}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold text-blue-900">Credit Unit</h3>
          <p>{course.unit ?? "-"}</p>
        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-10">

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            Description
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {course.description || "No description available."}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            📚 Lecture Materials
          </h3>

          <Link
            to={`/library?course=${encodeURIComponent(course.course_code)}`}
            className="inline-block mb-4 bg-yellow-500 text-white px-4 py-2 rounded-lg"
          >
            View Library Materials
          </Link>

          <ul className="space-y-2">
            {resources.length > 0 ? resources.map((resource) => (
              <li key={resource.id}>
                {resource.file_url ? (
                  <button type="button" onClick={() => handleOpenResource(resource.file_url)} className="text-blue-700 hover:underline">
                    {resource.title}
                  </button>
                ) : resource.title}
              </li>
            )) : <li>No lecture materials available.</li>}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            📝 Assignments
          </h3>

          <ul className="space-y-2">
            {assignments.length > 0 ? assignments.map((assignment) => (
              <li key={assignment.id}>
                <Link to={`/submit-assignment/${assignment.id}`} className="text-blue-700 hover:underline">
                  {assignment.title}
                </Link>
              </li>
            )) : <li>No assignments available.</li>}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            📄 Past Questions
          </h3>

          <ul className="space-y-2">
            {resources.filter((resource) => resource.resource_type?.toLowerCase().includes("past")).map((resource) => (
              <li key={resource.id}>
                {resource.file_url ? <button type="button" onClick={() => handleOpenResource(resource.file_url)} className="text-blue-700 hover:underline">{resource.title}</button> : resource.title}
              </li>
            ))}
            {!resources.some((resource) => resource.resource_type?.toLowerCase().includes("past")) && <li>No past questions available.</li>}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            📢 Announcements
          </h3>

          <ul className="space-y-2">
            <li>No course-specific announcements available.</li>
          </ul>
        </div>

      </div>

    </div>
  );
}

export default CourseDetails;