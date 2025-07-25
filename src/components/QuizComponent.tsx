import React, { useState } from "react";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer?: number; // Optional, used for feedback if provided by AI
}

export interface QuizData {
  title?: string;
  questions: QuizQuestion[];
}

interface QuizComponentProps {
  quizData: QuizData;
  onAnswer: (questionIndex: number, selectedOption: number, optionText: string) => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ quizData, onAnswer }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    if (submittedQuestions.has(questionIndex)) return; // Prevent changing after submission

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuestion = (questionIndex: number) => {
    const selectedOption = selectedAnswers[questionIndex];
    if (selectedOption === undefined) return;

    const optionText = quizData.questions[questionIndex].options[selectedOption];
    setSubmittedQuestions((prev) => new Set([...prev, questionIndex]));

    // Send the answer back to chat
    onAnswer(questionIndex, selectedOption, optionText);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 my-2">
      <div className="flex items-center mb-3">
        <div className="text-2xl mr-2">🧠</div>
        <h4 className="font-semibold text-purple-800">{quizData.title || "Interactive Quiz"}</h4>
      </div>

      <div className="space-y-4">
        {quizData.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="bg-white rounded-lg p-4 border border-purple-100">
            <h5 className="font-medium text-gray-800 mb-3">
              <span className="text-purple-600 font-bold">Q{questionIndex + 1}:</span> {question.question}
            </h5>

            <div className="space-y-2">
              {question.options.map((option, optionIndex) => {
                const isSelected = selectedAnswers[questionIndex] === optionIndex;
                const isSubmitted = submittedQuestions.has(questionIndex);

                let buttonClass = "w-full text-left p-3 rounded-md border transition-all duration-200 ";

                if (isSubmitted) {
                  if (isSelected) {
                    buttonClass += "bg-blue-100 border-blue-300 text-blue-800"; // Show as submitted, not right/wrong
                  } else {
                    buttonClass += "bg-gray-50 border-gray-200 text-gray-600";
                  }
                } else {
                  buttonClass += isSelected ? "bg-purple-100 border-purple-300 text-purple-800" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-200";
                }

                return (
                  <button key={optionIndex} onClick={() => handleOptionSelect(questionIndex, optionIndex)} disabled={isSubmitted} className={buttonClass}>
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${isSelected ? "border-purple-500" : "border-gray-300"}`}>
                        {isSelected && <div className="w-3 h-3 rounded-full bg-purple-500"></div>}
                      </div>
                      <span className="font-medium mr-2 text-purple-600">{String.fromCharCode(65 + optionIndex)}.</span>
                      <span>{option}</span>
                      {isSubmitted && isSelected && <span className="ml-auto text-blue-600">📤</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {!submittedQuestions.has(questionIndex) && selectedAnswers[questionIndex] !== undefined && (
              <button onClick={() => handleSubmitQuestion(questionIndex)} className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium">
                Submit Answer
              </button>
            )}

            {submittedQuestions.has(questionIndex) && (
              <div className="mt-3 flex items-center text-sm">
                <div className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Answer submitted!
                </div>
                <span className="text-gray-600 ml-2">Tuna is preparing feedback...</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-purple-600 bg-purple-50 p-2 rounded">💡 Select your answer and click "Submit Answer" - Tuna will provide instant feedback!</div>
    </div>
  );
};

export default QuizComponent;
