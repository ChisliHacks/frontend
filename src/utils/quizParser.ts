import type { QuizData, QuizQuestion } from "../components/QuizComponent";

/**
 * Parses AI response content to detect and extract quiz data
 * Supports multiple formats that the AI might use
 */
export function parseQuizFromAIResponse(content: string): QuizData | null {
  // Try JSON format first (if AI responds with structured JSON)
  const jsonQuiz = tryParseJSONQuiz(content);
  if (jsonQuiz) return jsonQuiz;

  // Try markdown/text format
  const textQuiz = tryParseTextQuiz(content);
  if (textQuiz) return textQuiz;

  // Try more flexible parsing for complex responses with feedback and questions
  const flexibleQuiz = tryParseFlexibleQuiz(content);
  if (flexibleQuiz) return flexibleQuiz;

  return null;
}

function tryParseJSONQuiz(content: string): QuizData | null {
  try {
    // Look for JSON blocks in the content
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*"questions"[\s\S]*\}/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      if (parsed.questions && Array.isArray(parsed.questions)) {
        return {
          title: parsed.title || "Quiz",
          questions: parsed.questions.map((q: { question: string; options?: string[]; choices?: string[]; correct?: number; correctAnswer?: number }) => ({
            question: q.question,
            options: q.options || q.choices,
            correctAnswer: q.correct || q.correctAnswer,
          })),
        };
      }
    }
  } catch {
    // JSON parsing failed, continue to text parsing
  }

  return null;
}

function tryParseTextQuiz(content: string): QuizData | null {
  const questions: QuizQuestion[] = [];

  // Only parse if content actually contains quiz structure (not just mentions quiz)
  if (!containsQuizContent(content)) {
    return null;
  }

  // Split content into sections that might contain questions
  // Pattern 1: "Question 1:", "Q1:", etc. followed by options
  const questionPattern1 = /(Question\s*\d+|Q\d+):\s*([^]*?)(?=(Question\s*\d+|Q\d+):|$)/gi;

  // Pattern 2: Numbered questions like "1.", "2.", etc. followed by options
  const questionPattern2 = /^(\d+)\.\s*([^]*?)(?=^\d+\.|$)/gm;

  // Pattern 3: For follow-up questions that might appear after feedback
  const followUpPattern = /(Question\s*\d+[^]*?)(?=Question\s*\d+|$)/gi;

  let matches = Array.from(content.matchAll(questionPattern1));
  if (matches.length === 0) {
    matches = Array.from(content.matchAll(questionPattern2));
  }

  // If still no matches, try the follow-up pattern
  if (matches.length === 0) {
    matches = Array.from(content.matchAll(followUpPattern));
  }

  for (const match of matches) {
    const questionBlock = match.length > 2 ? match[2].trim() : match[1].trim(); // Handle different capture groups
    const question = extractQuestionFromBlock(questionBlock);

    if (question) {
      questions.push(question);
    }
  }

  // Only return quiz data if we found at least one complete question with options
  return questions.length > 0 ? { questions } : null;
}

function tryParseFlexibleQuiz(content: string): QuizData | null {
  // This function handles complex responses that mix feedback with questions
  // Look for any question pattern followed by options, regardless of surrounding text

  const questions: QuizQuestion[] = [];

  // Pattern to find any text that looks like "Question X: ... A. ... B. ... C. ... D."
  // This is more flexible and can handle questions embedded in feedback text
  const flexiblePattern = /(Question\s*\d+[:\s]*[^]*?)(?=Question\s*\d+|$)/gis;

  const matches = Array.from(content.matchAll(flexiblePattern));

  for (const match of matches) {
    const questionSection = match[1];

    // Check if this section actually contains a complete question with options
    if (/A\.\s*[^]*?B\.\s*[^]*?C\.\s*[^]*?D\./is.test(questionSection)) {
      const question = extractQuestionFromFlexibleBlock(questionSection);
      if (question) {
        questions.push(question);
      }
    }
  }

  return questions.length > 0 ? { questions } : null;
}

function extractQuestionFromFlexibleBlock(block: string): QuizQuestion | null {
  // Extract question and options from a flexible block that might contain other text

  // Find the actual question text (after "Question X:")
  const questionMatch = block.match(/Question\s*\d+[:\s]*(.*?)(?=A\.|$)/is);
  if (!questionMatch) return null;

  const questionText = questionMatch[1].trim();
  if (!questionText || questionText.length < 5) return null;

  // Extract all options using a more flexible pattern
  const options: string[] = [];
  const optionPattern = /([A-D])\.\s*([^]*?)(?=\s*[A-D]\.|$)/gs;
  const expectedLetters = ["A", "B", "C", "D"];
  let letterIndex = 0;
  let match;

  while ((match = optionPattern.exec(block)) !== null && letterIndex < 4) {
    const letter = match[1];
    const text = match[2].trim();

    // Only accept if it's the expected letter in sequence
    if (letter === expectedLetters[letterIndex] && text && text.length > 2) {
      // Clean up the option text
      const cleanText = text
        .replace(/\n.*$/, "") // Remove everything after first line break
        .replace(/[^\w\s\-.,;:()]/g, " ") // Remove special characters except basic punctuation
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();

      if (cleanText && !cleanText.toLowerCase().includes("please choose") && !cleanText.toLowerCase().includes("select") && cleanText.length > 2) {
        options.push(cleanText);
        letterIndex++;
      } else {
        break; // Invalid option, stop parsing
      }
    }
  }

  if (options.length < 2) return null;

  return {
    question: questionText,
    options: options,
  };
}

function extractQuestionFromBlock(block: string): QuizQuestion | null {
  // Extract the main question text (everything before the options)
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  if (lines.length < 3) return null; // Need at least question + 2 options

  let questionText = "";
  let optionStartIndex = -1;

  // Find where options start (looking for A., B., a), b), etc.)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // More strict pattern for options - must be at start of line and followed by space/content
    if (/^[A-D]\.\s+\S/.test(line)) {
      optionStartIndex = i;
      break;
    }
  }

  if (optionStartIndex === -1) {
    // If we can't find options with the strict pattern, try to extract from the entire block
    // This handles cases where the question and options are on the same lines
    const questionMatch = block.match(/(.*?)(?=A\.\s)/s);
    if (questionMatch) {
      questionText = questionMatch[1].trim();
    } else {
      return null;
    }

    // Extract options from the entire block
    const optionPattern = /([A-D])\.\s*([^]*?)(?=\s*[A-D]\.|$)/g;
    const options: string[] = [];
    const optionLetters = ["A", "B", "C", "D"];
    let expectedLetter = 0;
    let match;

    while ((match = optionPattern.exec(block)) !== null && expectedLetter < 4) {
      const letter = match[1];
      const text = match[2].trim();

      if (
        letter === optionLetters[expectedLetter] &&
        text &&
        !text.toLowerCase().includes("please choose") &&
        !text.toLowerCase().includes("select an option") &&
        !text.toLowerCase().includes("pick the correct") &&
        !text.toLowerCase().includes("choose an option") &&
        !text.toLowerCase().includes("answer") &&
        !text.toLowerCase().includes("select") &&
        !/^(a|an|the)$/i.test(text) &&
        text.length > 2
      ) {
        options.push(text);
        expectedLetter++;
      }
    }

    if (options.length < 2) return null;

    return {
      question: questionText.replace(/^(?:Question\s*\d+[:.]?\s*|Q\d+[:.]?\s*|\d+\.\s*)/i, "").trim(),
      options: options,
    };
  }

  // Question text is everything before options
  questionText = lines.slice(0, optionStartIndex).join(" ");

  // Extract options with stricter validation
  const options: string[] = [];
  const optionLetters = ["A", "B", "C", "D"];
  let expectedLetter = 0;

  for (let i = optionStartIndex; i < lines.length && expectedLetter < 4; i++) {
    const line = lines[i];

    // Check if this line starts with the expected option letter
    const expectedPattern = new RegExp(`^${optionLetters[expectedLetter]}\\. `);
    if (expectedPattern.test(line)) {
      const cleanOption = line.replace(expectedPattern, "").trim();

      // Validate option content - should not contain question-like phrases or instructions
      if (
        cleanOption &&
        !cleanOption.toLowerCase().includes("please choose") &&
        !cleanOption.toLowerCase().includes("select an option") &&
        !cleanOption.toLowerCase().includes("pick the correct") &&
        !cleanOption.toLowerCase().includes("choose an option") &&
        !cleanOption.toLowerCase().includes("answer") &&
        !cleanOption.toLowerCase().includes("select") &&
        !/^(a|an|the)$/i.test(cleanOption) &&
        cleanOption.length > 2
      ) {
        // Should have meaningful content
        options.push(cleanOption);
        expectedLetter++;
      } else {
        break; // Invalid option, stop parsing
      }
    } else if (line.match(/^[A-D]\./)) {
      // Found an option but not in expected order, stop parsing
      break;
    }
  }

  // Need at least 2 valid options in correct order
  if (options.length < 2) return null;

  return {
    question: questionText,
    options: options,
  };
}

/**
 * Checks if content contains quiz-related keywords or patterns
 */
export function containsQuizContent(content: string): boolean {
  // First check if it contains actual quiz structure (questions with multiple options in correct format)
  const hasQuestionStructure = /(?:Question\s*\d+|Q\d+):\s*[^]*?A\.\s+[^]*?B\.\s+/is.test(content);
  const hasNumberedQuestions = /^\d+\.\s*[^]*?A\.\s+[^]*?B\.\s+/ms.test(content);

  // Check for follow-up questions that might appear after feedback text
  const hasFollowUpQuestion = /Question\s*\d+[^]*?A\.\s*[^]*?B\.\s*[^]*?C\.\s*[^]*?D\./is.test(content);

  // Must have actual question structure with at least A. and B. options to be considered a quiz
  if (!hasQuestionStructure && !hasNumberedQuestions && !hasFollowUpQuestion) {
    return false;
  }

  // Additional validation: check for complete option set (A, B, C, D)
  const hasCompleteOptions = /A\.\s+[^]*?B\.\s+[^]*?C\.\s+[^]*?D\./is.test(content);

  return hasCompleteOptions;
}

/**
 * Formats the user's answer for sending back to the AI
 */
export function formatQuizAnswerForAI(questionIndex: number, selectedOption: number, optionText: string, questionText: string): string {
  const optionLetter = String.fromCharCode(65 + selectedOption); // A, B, C, D
  return `My answer to question ${questionIndex + 1}: ${optionLetter}. ${optionText}

Question was: "${questionText}"

Please provide feedback on my answer.`;
}
