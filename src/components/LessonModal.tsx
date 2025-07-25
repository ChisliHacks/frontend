import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { uploadApi, aiApi, jobsApi, type LessonCreate, type JobListItem } from "../utils/api";

type LessonFormData = {
  title: string;
  category: string;
  difficulty_level: "Beginner" | "Intermediate" | "Advanced";
  summary?: string;
  description?: string;
  duration_minutes?: number;
  lesson_score?: number;
  related_job_ids?: number[];
  related_job_positions?: string[];
};

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lesson: LessonCreate, file?: File) => void;
  isLoading: boolean;
}

const LessonModal: React.FC<LessonModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const { control, handleSubmit, setValue, watch, reset } = useForm<LessonFormData>({
    defaultValues: {
      title: "",
      category: "",
      difficulty_level: "Beginner",
      summary: "",
      description: "",
      duration_minutes: undefined,
      lesson_score: 0,
      related_job_ids: [],
      related_job_positions: [],
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  const [processingPDF, setProcessingPDF] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);

  // Job-related state
  const [availableJobs, setAvailableJobs] = useState<JobListItem[]>([]);
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [selectedJobPositions, setSelectedJobPositions] = useState<string[]>([]);
  const [loadingJobSuggestions, setLoadingJobSuggestions] = useState(false);
  const [loadingCategorySuggestion, setLoadingCategorySuggestion] = useState(false);

  const watchedTitle = watch("title");
  const watchedSummary = watch("summary");
  const watchedDescription = watch("description");
  const watchedCategory = watch("category");
  const watchedDifficultyLevel = watch("difficulty_level");
  const watchedDurationMinutes = watch("duration_minutes");

  const onSubmitForm = (data: LessonFormData) => {
    const lessonData: LessonCreate = {
      title: data.title,
      category: data.category,
      difficulty_level: data.difficulty_level,
      summary: data.summary || "",
      description: data.description || "",
      duration_minutes: data.duration_minutes,
      lesson_score: data.lesson_score || 0,
      related_job_ids: selectedJobIds,
      related_job_positions: selectedJobPositions,
    };
    onSubmit(lessonData, selectedFile || undefined);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        alert("Please select a PDF file only.");
        e.target.value = ""; // Clear the input
        return;
      }
      setSelectedFile(file);
      setProcessingPDF(true);
      setAutoFilledFields([]);

      // Try to extract text and estimate duration
      try {
        const uploadResponse = await uploadApi.uploadLessonMaterial(file, file.name, true);
        const filledFields: string[] = [];

        // Auto-fill summary if extracted
        if (uploadResponse.summary && !watchedSummary) {
          setValue("summary", uploadResponse.summary || "");
          filledFields.push("summary");
        }

        // Auto-fill description with extracted text preview if available
        if (uploadResponse.extracted_text_preview && !watchedDescription) {
          // Use first paragraph or first 200 characters as description
          const firstParagraph = uploadResponse.extracted_text_preview.split("\n\n")[0];
          const description = firstParagraph.length > 200 ? firstParagraph.substring(0, 200) + "..." : firstParagraph;

          setValue("description", description || "");
          filledFields.push("description");
        }

        // Auto-detect category based on content keywords
        if (uploadResponse.extracted_text_preview && !watchedCategory) {
          const text = uploadResponse.extracted_text_preview.toLowerCase();
          let detectedCategory = "";

          // Programming-related keywords
          if (
            text.includes("programming") ||
            text.includes("code") ||
            text.includes("algorithm") ||
            text.includes("javascript") ||
            text.includes("python") ||
            text.includes("java") ||
            text.includes("software") ||
            text.includes("development") ||
            text.includes("function")
          ) {
            detectedCategory = "Programming";
          }
          // Math-related keywords
          else if (text.includes("mathematics") || text.includes("calculus") || text.includes("algebra") || text.includes("equation") || text.includes("theorem") || text.includes("proof")) {
            detectedCategory = "Mathematics";
          }
          // Science-related keywords
          else if (text.includes("science") || text.includes("physics") || text.includes("chemistry") || text.includes("biology") || text.includes("experiment") || text.includes("hypothesis")) {
            detectedCategory = "Science";
          }
          // Business-related keywords
          else if (text.includes("business") || text.includes("marketing") || text.includes("management") || text.includes("strategy") || text.includes("economics") || text.includes("finance")) {
            detectedCategory = "Business";
          }
          // Design-related keywords
          else if (text.includes("design") || text.includes("ui") || text.includes("ux") || text.includes("graphic") || text.includes("visual") || text.includes("interface")) {
            detectedCategory = "Design";
          }
          // Language-related keywords
          else if (text.includes("language") || text.includes("grammar") || text.includes("vocabulary") || text.includes("literature") || text.includes("writing") || text.includes("english")) {
            detectedCategory = "Language";
          }

          if (detectedCategory) {
            setValue("category", detectedCategory);
            filledFields.push("category");
          }
        }

        // Auto-detect difficulty level based on content complexity
        if (uploadResponse.extracted_text_preview && watchedDifficultyLevel === "Beginner") {
          const text = uploadResponse.extracted_text_preview.toLowerCase();
          let detectedDifficulty: "Beginner" | "Intermediate" | "Advanced" = "Beginner";

          // Advanced keywords
          if (text.includes("advanced") || text.includes("complex") || text.includes("sophisticated") || text.includes("expert") || text.includes("master") || text.includes("professional")) {
            detectedDifficulty = "Advanced";
          }
          // Intermediate keywords
          else if (text.includes("intermediate") || text.includes("moderate") || text.includes("standard") || text.includes("regular") || text.includes("typical") || text.includes("common")) {
            detectedDifficulty = "Intermediate";
          }
          // Beginner keywords (default, but check for explicit mentions)
          else if (text.includes("beginner") || text.includes("basic") || text.includes("introduction") || text.includes("fundamental") || text.includes("simple") || text.includes("easy")) {
            detectedDifficulty = "Beginner";
          }

          if (detectedDifficulty !== "Beginner") {
            setValue("difficulty_level", detectedDifficulty);
            filledFields.push("difficulty_level");
          }
        }

        // Auto-generate title if empty (use filename without extension as fallback)
        if (!watchedTitle) {
          const fileName = file.name.replace(/\.(pdf)$/i, "");
          // Clean up filename: replace underscores/hyphens with spaces, capitalize words
          const cleanTitle = fileName.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

          setValue("title", cleanTitle);
          filledFields.push("title");
        }

        // Estimate reading duration based on text length (average 200 words per minute)
        if (uploadResponse.extracted_text_preview) {
          const wordCount = uploadResponse.extracted_text_preview.split(/\s+/).length;
          const estimatedMinutes = Math.ceil(wordCount / 200);
          setEstimatedDuration(estimatedMinutes);

          // Auto-fill duration if not set
          if (!watchedDurationMinutes) {
            setValue("duration_minutes", estimatedMinutes);
            filledFields.push("duration_minutes");
          }
        }

        setAutoFilledFields(filledFields);
      } catch (error) {
        console.warn("Failed to process PDF:", error);

        // Even if processing fails, try to auto-fill title from filename
        if (!watchedTitle) {
          const fileName = file.name.replace(/\.(pdf)$/i, "");
          const cleanTitle = fileName.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

          setValue("title", cleanTitle);
          setAutoFilledFields(["title"]);
        }
      } finally {
        setProcessingPDF(false);
      }
    } else {
      setSelectedFile(null);
      setEstimatedDuration(null);
      setAutoFilledFields([]);
    }
  };

  // Load available jobs when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableJobs();
    }
  }, [isOpen]);

  const loadAvailableJobs = async () => {
    try {
      const jobs = await jobsApi.getActiveJobs({ limit: 1000 });
      setAvailableJobs(jobs);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    }
  };

  const handleSuggestJobs = async () => {
    setLoadingJobSuggestions(true);
    try {
      const response = await aiApi.suggestJobs({
        lesson_title: watchedTitle || "Untitled Lesson",
        lesson_description: watchedDescription || "",
        lesson_category: watchedCategory || "General",
      });

      // Add the suggested positions to selected job positions
      setSelectedJobPositions((prev) => {
        const combined = [...prev, ...(response.suggested_job_positions || [])];
        return [...new Set(combined)]; // Remove duplicates
      });
    } catch (error) {
      console.error("Failed to get job suggestions:", error);
      alert("Failed to get job suggestions. Please try again.");
    } finally {
      setLoadingJobSuggestions(false);
    }
  };

  const handleSuggestCategory = async () => {
    setLoadingCategorySuggestion(true);
    try {
      const response = await aiApi.suggestCategory({
        lesson_title: watchedTitle || "Untitled Lesson",
        lesson_description: watchedDescription || "",
        lesson_content: "", // We don't have full content access in the modal
      });

      if (response.suggested_category) {
        setValue("category", response.suggested_category);
        setAutoFilledFields((prev) => [...prev.filter((f) => f !== "category"), "category"]);
      }
    } catch (error) {
      console.error("Failed to get category suggestion:", error);
      alert("Failed to get category suggestion. Please try again.");
    } finally {
      setLoadingCategorySuggestion(false);
    }
  };

  const handleJobSelection = (jobId: number, selected: boolean) => {
    if (selected) {
      setSelectedJobIds((prev) => [...prev, jobId]);
    } else {
      setSelectedJobIds((prev) => prev.filter((id) => id !== jobId));
    }
  };

  const handleJobPositionRemove = (position: string) => {
    setSelectedJobPositions((prev) => prev.filter((p) => p !== position));
  };

  const resetForm = () => {
    reset({
      title: "",
      category: "",
      difficulty_level: "Beginner",
      summary: "",
      description: "",
      duration_minutes: undefined,
      lesson_score: 0,
      related_job_ids: [],
      related_job_positions: [],
    });
    setSelectedFile(null);
    setEstimatedDuration(null);
    setProcessingPDF(false);
    setAutoFilledFields([]);
    setSelectedJobIds([]);
    setSelectedJobPositions([]);
    setLoadingJobSuggestions(false);
    setLoadingCategorySuggestion(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Lesson</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <Controller
              name="title"
              control={control}
              rules={{
                required: "Title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters",
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <>
                  <input
                    {...field}
                    type="text"
                    required
                    className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${error ? "border-red-500" : ""} ${
                      autoFilledFields.includes("title") ? "bg-green-50 border-green-300" : ""
                    }`}
                    placeholder="Enter lesson title"
                  />
                  {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                </>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lesson File (PDF Only) *</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={processingPDF}
            />
            {processingPDF && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <p className="text-sm text-blue-700">Processing PDF and auto-filling form...</p>
                </div>
              </div>
            )}
            {selectedFile && !processingPDF && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  ✓ Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                </p>
                {estimatedDuration && <p className="text-xs text-green-600 mt-1">Estimated reading time: {estimatedDuration} minutes</p>}
                {autoFilledFields.length > 0 && <p className="text-xs text-green-600 mt-1">✨ Auto-filled: {autoFilledFields.join(", ").replace(/_/g, " ")}</p>}
              </div>
            )}
            {!selectedFile && !processingPDF && <p className="text-xs text-gray-500 mt-1">Upload a PDF to auto-generate summary, description, category, and more</p>}
          </div>

          {selectedFile && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <Controller
                  name="summary"
                  control={control}
                  rules={{
                    maxLength: {
                      value: 500,
                      message: "Summary must be less than 500 characters",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <textarea
                        {...field}
                        rows={3}
                        className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${error ? "border-red-500" : ""} ${
                          autoFilledFields.includes("summary") ? "bg-green-50 border-green-300" : ""
                        }`}
                        placeholder="Brief summary of the lesson (auto-generated from PDF)"
                      />
                      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                    </>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Controller
                  name="description"
                  control={control}
                  rules={{
                    maxLength: {
                      value: 1000,
                      message: "Description must be less than 1000 characters",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <textarea
                        {...field}
                        rows={4}
                        className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${error ? "border-red-500" : ""} ${
                          autoFilledFields.includes("description") ? "bg-green-50 border-green-300" : ""
                        }`}
                        placeholder="Detailed lesson description (optional)"
                      />
                      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                    </>
                  )}
                />
              </div>
            </>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <button
                type="button"
                onClick={handleSuggestCategory}
                disabled={loadingCategorySuggestion || !watchedTitle}
                className="text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed">
                {loadingCategorySuggestion ? "Suggesting..." : "🤖 AI Suggest"}
              </button>
            </div>
            <Controller
              name="category"
              control={control}
              rules={{
                required: "Category is required",
              }}
              render={({ field, fieldState: { error } }) => (
                <>
                  <input
                    {...field}
                    type="text"
                    required
                    className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${error ? "border-red-500" : ""} ${
                      autoFilledFields.includes("category") ? "bg-green-50 border-green-300" : ""
                    }`}
                    placeholder="e.g., Programming, Design, Business"
                  />
                  {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                </>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
              <Controller
                name="difficulty_level"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <select
                      {...field}
                      className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${error ? "border-red-500" : ""} ${
                        autoFilledFields.includes("difficulty_level") ? "bg-green-50 border-green-300" : ""
                      }`}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                  </>
                )}
              />
            </div>

            {selectedFile && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                  {estimatedDuration && <span className="text-xs text-gray-500 ml-1">(estimated: {estimatedDuration}min)</span>}
                </label>
                <Controller
                  name="duration_minutes"
                  control={control}
                  rules={{
                    min: {
                      value: 1,
                      message: "Duration must be positive",
                    },
                  }}
                  render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
                    <>
                      <input
                        {...field}
                        type="number"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        min="1"
                        className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${error ? "border-red-500" : ""} ${
                          autoFilledFields.includes("duration_minutes") ? "bg-green-50 border-green-300" : ""
                        }`}
                        placeholder={estimatedDuration ? `e.g., ${estimatedDuration}` : "e.g., 60"}
                      />
                      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                    </>
                  )}
                />
              </div>
            )}

            {/* Lesson Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Score (points)</label>
              <Controller
                name="lesson_score"
                control={control}
                rules={{
                  min: {
                    value: 0,
                    message: "Score must be non-negative",
                  },
                }}
                render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
                  <>
                    <input
                      {...field}
                      type="number"
                      value={value || ""}
                      onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : 0)}
                      min="0"
                      className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${error ? "border-red-500" : ""}`}
                      placeholder="e.g., 10"
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                  </>
                )}
              />
            </div>
          </div>

          {/* Related Jobs Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Related Jobs</label>
              <button
                type="button"
                onClick={handleSuggestJobs}
                disabled={loadingJobSuggestions}
                className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                {loadingJobSuggestions ? "Suggesting..." : "🤖 AI Suggest"}
              </button>
            </div>

            {/* AI Suggested Job Positions */}
            {selectedJobPositions.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">AI Suggested Positions:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedJobPositions.map((position, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {position}
                      <button type="button" onClick={() => handleJobPositionRemove(position)} className="ml-1 text-blue-600 hover:text-blue-800">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Jobs from Database */}
            {availableJobs.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Available Jobs from Database:</p>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {availableJobs.map((job) => (
                    <div key={job.id} className="flex items-center space-x-2 py-1">
                      <input type="checkbox" id={`job-${job.id}`} checked={selectedJobIds.includes(job.id)} onChange={(e) => handleJobSelection(job.id, e.target.checked)} className="rounded" />
                      <label htmlFor={`job-${job.id}`} className="text-sm flex-1 cursor-pointer text-gray-700">
                        {job.position} at {job.company}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableJobs.length === 0 && selectedJobPositions.length === 0 && <p className="text-sm text-gray-500 py-2">No jobs selected. Use AI Suggest to get job recommendations.</p>}

            {(selectedJobIds.length > 0 || selectedJobPositions.length > 0) && (
              <p className="text-xs text-gray-600 mt-1">
                {selectedJobIds.length} existing job(s) + {selectedJobPositions.length} AI suggested position(s) selected
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {isLoading ? "Processing PDF & creating lesson..." : "Create Lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonModal;
