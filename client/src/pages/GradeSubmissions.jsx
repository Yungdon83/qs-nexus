import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function GradeSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    setLoading(true);

    const { data: submissionData, error: submissionError } = await supabase
      .from("submissions")
      .select(`
        id,
        assignment_id,
        student_id,
        file_url,
        submitted_at,
        grade,
        feedback,
        assignments (
          id,
          title,
          course_code,
          level
        )
      `)
      .order("submitted_at", { ascending: false });

    if (submissionError) {
      console.error("SUBMISSION ERROR:", submissionError);
      alert(submissionError.message);
      setLoading(false);
      return;
    }

    const submissionsList = submissionData || [];

    const studentIds = [
      ...new Set(
        submissionsList
          .map((item) => item.student_id)
          .filter(Boolean)
      ),
    ];

    let profiles = [];

    if (studentIds.length > 0) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, level, department")
        .in("id", studentIds);

      if (profileError) {
        console.error("PROFILE ERROR:", profileError);
        alert(profileError.message);
        setLoading(false);
        return;
      }

      profiles = profileData || [];
    }

    const profileMap = {};

    profiles.forEach((profile) => {
      profileMap[profile.id] = profile;
    });

    const finalData = submissionsList.map((submission) => ({
      ...submission,
      student: profileMap[submission.student_id] || null,
    }));

    console.log("LOADED SUBMISSIONS:", finalData);

    setSubmissions(finalData);
    setLoading(false);
  }

  async function updateSubmission(id, grade, feedback) {
    if (grade === "") {
      alert("Please enter a grade.");
      return;
    }

    setSavingId(id);

    const { error } = await supabase
      .from("submissions")
      .update({
        grade,
        feedback,
      })
      .eq("id", id);

    if (error) {
      console.error("GRADE UPDATE ERROR:", error);
      alert(error.message);
      setSavingId(null);
      return;
    }

    alert("Grade and feedback saved successfully.");

    await fetchSubmissions();
    setSavingId(null);
  }

  function formatDate(date) {
    if (!date) return "Unknown";

    const formatted = new Date(date);

    if (Number.isNaN(formatted.getTime())) {
      return "Invalid date";
    }

    return formatted.toLocaleString();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl font-bold text-blue-900">
          Loading submissions...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900">
            Grade Submissions
          </h1>
          <p className="text-gray-600 mt-2">
            Review student assignments, grades and feedback.
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <h2 className="text-xl font-bold text-gray-700">
              No submissions yet.
            </h2>
            <p className="text-gray-500 mt-2">
              Student submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                updateSubmission={updateSubmission}
                saving={savingId === submission.id}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SubmissionCard({
  submission,
  updateSubmission,
  saving,
  formatDate,
}) {
  const [grade, setGrade] = useState(submission.grade ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [openingFile, setOpeningFile] = useState(false);

  const student = submission.student;
  const assignment = submission.assignments;

  function getStoragePath(fileValue) {
    if (!fileValue) return null;

    const originalValue = fileValue.trim();

    if (!originalValue.startsWith("http")) {
      return decodeURIComponent(originalValue);
    }

    try {
      const url = new URL(originalValue);
      const publicMarker = "/storage/v1/object/public/assignments/";
      const signMarker = "/storage/v1/object/sign/assignments/";

      let filePath = null;

      if (url.pathname.includes(publicMarker)) {
        filePath = url.pathname.split(publicMarker)[1];
      } else if (url.pathname.includes(signMarker)) {
        filePath = url.pathname.split(signMarker)[1];
      }

      if (!filePath) {
        console.error("UNRECOGNIZED STORAGE URL:", url.pathname);
        return null;
      }

      return decodeURIComponent(filePath).replace(/^\/+/, "");
    } catch (error) {
      console.error("FILE URL PARSE ERROR:", error);
      return null;
    }
  }

  async function openSubmittedFile() {
    if (!submission.file_url) {
      alert("No submission file found.");
      return;
    }

    setOpeningFile(true);

    try {
      const originalValue = submission.file_url.trim();
      const filePath = getStoragePath(originalValue);

      console.log("ORIGINAL FILE URL:", originalValue);
      console.log("STORAGE FILE PATH:", filePath);

      if (!filePath) {
        alert("Unable to determine the storage file path.");
        return;
      }

      const { data, error } = await supabase.storage
        .from("assignments")
        .createSignedUrl(filePath, 600);

      if (error) {
        console.error("SIGNED URL ERROR:", error);
        alert("Unable to open file: " + error.message);
        return;
      }

      if (!data?.signedUrl) {
        alert("Unable to generate a secure file link.");
        return;
      }

      console.log("SIGNED URL GENERATED:", data.signedUrl);

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("OPEN FILE ERROR:", error);
      alert("Unable to open submitted file.");
    } finally {
      setOpeningFile(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="border-b pb-5">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <p className="text-sm font-bold text-blue-700">
              {assignment?.course_code || "Course"}
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              {assignment?.title || "Assignment"}
            </h2>
          </div>

          {submission.grade !== null &&
          submission.grade !== undefined &&
          submission.grade !== "" ? (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
              Graded
            </span>
          ) : (
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
              Awaiting Grade
            </span>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-5">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Student</p>
          <p className="font-bold text-gray-900 mt-1">
            {student?.full_name || "Unknown student"}
          </p>
          {student?.email && (
            <p className="text-sm text-gray-500 mt-1">{student.email}</p>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Level</p>
          <p className="font-bold text-gray-900 mt-1">
            {student?.level || assignment?.level || "Unknown"}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Department</p>
          <p className="font-bold text-gray-900 mt-1">
            {student?.department || "Quantity Surveying"}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Submitted</p>
          <p className="font-bold text-gray-900 mt-1">
            {formatDate(submission.submitted_at)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm text-gray-500 mb-2">Submitted File</p>

        {submission.file_url ? (
          <button
            type="button"
            onClick={openSubmittedFile}
            disabled={openingFile}
            className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-500"
          >
            {openingFile ? "Opening File..." : "📄 View Submitted File"}
          </button>
        ) : (
          <p className="text-red-600">No submission file found.</p>
        )}
      </div>

      <div className="mt-6">
        <label className="block font-semibold text-gray-700 mb-2">
          Grade
        </label>
        <input
          type="text"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="Enter grade e.g. 85 or A"
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="mt-4">
        <label className="block font-semibold text-gray-700 mb-2">
          Feedback
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write feedback for the student..."
          rows="5"
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <button
        type="button"
        onClick={() => updateSubmission(submission.id, grade, feedback)}
        disabled={saving}
        className="mt-5 bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:bg-gray-400"
      >
        {saving ? "Saving..." : "Save Grade & Feedback"}
      </button>
    </div>
  );
}

export default GradeSubmissions;