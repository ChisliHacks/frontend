import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { lessonsApi, authApi, type Lesson, type LessonUpdate } from "../utils/api";
import { useAuth } from "../hooks/useAuth";

const LessonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState<LessonUpdate>({});
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  const handleCompleteLesson = async () => {
    if (!lesson?.id || !isAuthenticated) return;

    try {
      setError(null);
      const result = await authApi.completeLesson(lesson.id);
      setCompletionMessage(`🎉 ${result.message} You earned ${result.points_earned} points!`);

      // Refresh user data to update progress stats
      await refreshUser();

      // Auto-hide the message after 5 seconds
      setTimeout(() => setCompletionMessage(null), 5000);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to complete lesson");
    }
  };

  useEffect(() => {
    const fetchLesson = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const lessonData = await lessonsApi.getLesson(parseInt(id));
        setLesson(lessonData);
        setFormData({
          title: lessonData.title,
          description: lessonData.description || "",
          summary: lessonData.summary || "",
          category: lessonData.category || "",
          difficulty_level: lessonData.difficulty_level,
          duration_minutes: lessonData.duration_minutes,
        });
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || "Failed to fetch lesson");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !lesson) return;

    try {
      setUpdating(true);
      setError(null);
      const updatedLesson = await lessonsApi.updateLesson(parseInt(id), formData);
      setLesson(updatedLesson);
      setIsEditing(false);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to update lesson");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this lesson?")) return;

    try {
      await lessonsApi.deleteLesson(parseInt(id));
      navigate("/lessons");
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to delete lesson");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading lesson...</span>
        </div>
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button onClick={() => navigate("/lessons")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Lesson not found</p>
          <button onClick={() => navigate("/lessons")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center">
            <button onClick={() => navigate("/lessons")} className="mr-4 text-gray-600 hover:text-gray-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{isEditing ? "Edit Lesson" : "Lesson Details"}</h1>
          </div>
          {isAuthenticated && !isEditing && (
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Edit
              </button>
              <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {/* Success Message */}
        {completionMessage && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">{completionMessage}</div>}

        {/* Error Message */}
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">{error}</div>}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter lesson description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                <textarea
                  name="summary"
                  value={formData.summary || ""}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter lesson summary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration_minutes"
                    value={formData.duration_minutes || ""}
                    onChange={handleChange}
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <select
                  name="difficulty_level"
                  value={formData.difficulty_level || ""}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {updating ? "Updating..." : "Update Lesson"}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{lesson.title}</h2>

                {lesson.description && (
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">{lesson.description}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 mb-6">
                  {lesson.category && <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">{lesson.category}</span>}
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      lesson.difficulty_level === "Beginner" ? "bg-green-100 text-green-800" : lesson.difficulty_level === "Intermediate" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                    }`}>
                    {lesson.difficulty_level}
                  </span>
                  {lesson.duration_minutes && <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-800">{lesson.duration_minutes} mins</span>}
                </div>
                <div className="text-sm text-gray-500 mb-6">
                  Created: {new Date(lesson.created_at).toLocaleDateString()}
                  {lesson.updated_at && lesson.updated_at !== lesson.created_at && <span className="ml-4">Updated: {new Date(lesson.updated_at).toLocaleDateString()}</span>}
                </div>

                {/* Lesson Summary Section */}
                {lesson.summary && (
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                      <span>�</span>
                      <span>Lesson Summary</span>
                    </h3>
                    <div className="prose max-w-none">
                      <div className="text-blue-800 whitespace-pre-wrap">{lesson.summary}</div>
                    </div>
                  </div>
                )}
              </div>

              {lesson.filename && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Lesson File</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-8 h-8 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900">{lesson.filename}</p>
                          <p className="text-sm text-gray-500">Lesson material</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            handleCompleteLesson();
                            navigate(`/lessons/${lesson.id}/study`);
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">
                          Study
                        </button>
                        <a
                          href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"}/upload/files/${encodeURIComponent(lesson.filename)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="prose max-w-none">
                <p className="text-gray-600">
                  {lesson.filename ? "This lesson includes downloadable materials. Click the download button above to access the lesson content." : "This lesson doesn't have any attached files yet."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;
