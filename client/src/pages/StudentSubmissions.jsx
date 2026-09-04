import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function StudentSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("USER ERROR:", userError);
        setLoading(false);
        return;
      }

      const { data: submissionData, error: submissionError } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", user.id)
        .order("submitted_at", { ascending: false });

      if (submissionError) {
        console.error("SUBMISSION ERROR:", submissionError);
        setLoading(false);
        return;
      }

      if (!submissionData || submissionData.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      const assignmentIds = submissionData.map(
        (submission) => submission.assignment_id
      );

      const { data: assignmentData, error: assignmentError } = await supabase
        .from("assignments")
        .select("*")
        .in("id", assignmentIds);

      if (assignmentError) {
        console.error("ASSIGNMENT ERROR:", assignmentError);
        setLoading(false);
        return;
      }

      const combinedSubmissions = submissionData.map((submission) => ({
        ...submission,
        assignment:
          assignmentData?.find(
            (assignment) => assignment.id === submission.assignment_id
          ) || null,
      }));

      setSubmissions(combinedSubmissions);
    } catch (error) {
      console.error("LOAD SUBMISSIONS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStoragePath = (fileValue) => {
    if (!fileValue) return null;

    if (!fileValue.startsWith("http")) {
      return decodeURIComponent(fileValue);
    }

    try {
      const url = new URL(fileValue);
      const marker = "/storage/v1/object/public/assignments/";

      const index = url.pathname.indexOf(marker);

      if (index === -1) {
        return null;
      }

      return decodeURIComponent(url.pathname.substring(index + marker.length));
    } catch (error) {
      console.error("FILE URL PARSE ERROR:", error);
      return null;
    }
  };

  const openSubmittedFile = async (fileValue) => {
    try {
      const filePath = getStoragePath(fileValue);

      console.log("ORIGINAL FILE URL:", fileValue);
      console.log("STORAGE FILE PATH:", filePath);

      if (!filePath) {
        alert("The submitted file path is invalid.");
        return;
      }

      const { data, error } = await supabase.storage
        .from("assignments")
        .createSignedUrl(filePath, 600);

      if (error) {
        console.error("SIGNED URL ERROR:", error);
        alert("The submitted file could not be found in the assignments storage bucket.");
        return;
      }

      if (!data?.signedUrl) {
        alert("Could not generate a link for the submitted file.");
        return;
      }

      window.open(data.signedUrl, "_blank");
    } catch (error) {
      console.error("OPEN FILE ERROR:", error);
      alert("Something went wrong while opening the submitted file.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-600">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
        <p className="mt-1 text-gray-600">
          View your submitted assignments and grades.
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <p className="text-gray-600">You have not submitted any assignments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {submission.assignment?.title || "Assignment"}
                  </h2>

                  {submission.assignment?.course_code && (
                    <p className="mt-1 text-sm text-gray-500">
                      {submission.assignment.course_code}
                    </p>
                  )}
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-700">Status: </span>
                  <span
                    className={
                      submission.grade !== null
                        ? "font-semibold text-green-600"
                        : "font-semibold text-yellow-600"
                    }
                  >
                    {submission.grade !== null ? "Graded" : "Pending"}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Submitted
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {submission.submitted_at
                      ? new Date(submission.submitted_at).toLocaleString()
                      : "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Grade</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {submission.grade !== null
                      ? `${submission.grade}`
                      : "Not graded yet"}
                  </p>
                </div>
              </div>

              {submission.feedback && (
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-700">
                    Lecturer Feedback
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                    {submission.feedback}
                  </p>
                </div>
              )}

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => openSubmittedFile(submission.file_url)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Open Submitted File
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentSubmissions;