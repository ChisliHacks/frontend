import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  lessonsApi,
  uploadApi,
  type LessonListItem,
  type LessonCreate,
} from "../utils/api";
import { useAuth } from "../hooks/useAuth";
import LessonModal from "../components/LessonModal";

const Lessons: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [creatingLesson, setCreatingLesson] = useState(false);

  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result: LessonListItem[];

      if (searchQuery) {
        result = await lessonsApi.searchLessons(searchQuery, {
          category: categoryFilter || undefined,
          difficulty_level: difficultyFilter || undefined,
        });
      } else {
        result = await lessonsApi.getPublishedLessons({
          category: categoryFilter || undefined,
          difficulty_level: difficultyFilter || undefined,
        });
      }

      setLessons(result);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to fetch lessons");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, difficultyFilter]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handleCreateLesson = async (lessonData: LessonCreate, file?: File) => {
    try {
      setCreatingLesson(true);

      let filename = "";
      let summary = lessonData.summary || "";

      // If file was selected, it should already be processed, but handle the upload
      if (file) {
        // Since we already processed the file during selection, we might have the summary
        // But we still need to do the actual upload for the lesson creation
        const uploadResponse = await uploadApi.uploadLessonMaterial(
          file,
          file.name,
          false
        ); // Don't regenerate summary
        filename = uploadResponse.filename;

        // Use existing summary or fall back to generated one
        if (!summary && uploadResponse.summary) {
          summary = uploadResponse.summary;
        }

        // Log any errors for debugging
        if (uploadResponse.text_extraction_error) {
          console.warn(
            "Text extraction error:",
            uploadResponse.text_extraction_error
          );
        }
        if (uploadResponse.summary_error) {
          console.warn(
            "Summary generation error:",
            uploadResponse.summary_error
          );
        }
      }

      // Create lesson with the data
      const lessonToCreate: LessonCreate = {
        ...lessonData,
        description: lessonData.description || "",
        summary: summary || "",
        filename: filename || "",
        duration_minutes: lessonData.duration_minutes || 0,
        lesson_score: lessonData.lesson_score || 0,
      };

      await lessonsApi.createLesson(lessonToCreate);
      setShowModal(false);
      fetchLessons(); // Refresh the list
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to create lesson");
    } finally {
      setCreatingLesson(false);
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      await lessonsApi.deleteLesson(id);
      fetchLessons(); // Refresh the list
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to delete lesson");
    }
  };

  const handleEditLesson = (id: number) => {
    navigate(`/lessons/${id}/edit`);
  };

  const handleViewLesson = (id: number) => {
    navigate(`/lessons/${id}`);
  };

  const categories = [
    ...new Set(
      lessons
        .map((lesson) => lesson.category)
        .filter((cat) => cat && cat.trim())
    ),
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.lessonsList = lessons.map((l) => ({
        id: l.id,
        title: l.title,
        summary: l.summary || "",
      }));
      window.dispatchEvent(new Event("lessonsListUpdated"));
    }
  }, [lessons]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lessons</h1>
            <p className="mt-2 text-gray-600">
              Discover and learn from our comprehensive lesson collection
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Lesson
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Lessons
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or content..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading lessons...</span>
          </div>
        ) : (
          /* Lessons Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No lessons found.</p>
                {searchQuery || categoryFilter || difficultyFilter ? (
                  <p className="text-gray-400 mt-2">
                    Try adjusting your filters.
                  </p>
                ) : null}
              </div>
            ) : (
              lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {lesson.title}
                      </h3>
                      {isAuthenticated && (
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => handleEditLesson(lesson.id)}
                            className="text-gray-400 hover:text-blue-600 p-1"
                            title="Edit"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="Delete"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-2 line-clamp-3">
                      {lesson.summary ||
                        lesson.description ||
                        "No description available"}
                    </p>
                    {lesson.summary &&
                      lesson.summary !== lesson.description && (
                        <p className="text-gray-500 text-xs mb-2">
                          Summary available
                        </p>
                      )}

                    <div className="mb-4 p-2 bg-gray-50 rounded-md">
                      {lesson.filename && lesson.filename.trim() ? (
                        <div className="flex items-center justify-between truncate">
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 text-blue-500 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <span className="text-sm text-gray-700 truncate">
                              {lesson.filename}
                            </span>
                          </div>
                          <a
                            href={uploadApi.getFileUrl(lesson.filename)}
                            download
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            title="Download file"
                          >
                            Download
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-gray-400 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="text-sm text-gray-500">
                            No file attached
                          </span>
                          <span className="ml-2 text-gray-400">-</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {lesson.category && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {lesson.category}
                          </span>
                        )}
                        {lesson.duration_minutes > 0 && (
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            {lesson.duration_minutes}min
                          </span>
                        )}
                        {lesson.lesson_score > 0 && (
                          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            {lesson.lesson_score} pts
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          lesson.difficulty_level === "Beginner"
                            ? "bg-green-100 text-green-800"
                            : lesson.difficulty_level === "Intermediate"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {lesson.difficulty_level}
                      </span>
                    </div>

                    <button
                      onClick={() => handleViewLesson(lesson.id)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Lesson
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Lesson Modal */}
      <LessonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateLesson}
        isLoading={creatingLesson}
      />
    </div>
  );
};

export default Lessons;
