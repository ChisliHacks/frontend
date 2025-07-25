/**
 * Utility functions for processing lesson content and summaries
 */

export interface ParsedChapter {
  title: string;
  content: string;
}

/**
 * Parse chapters from LLM-generated chapterized summary
 * This replaces the old manual parsing with LLM-based chapter creation
 */
export function parseChaptersFromLLMSummary(chapters: string[]): string[] {
  if (!chapters || chapters.length === 0) return [];

  return chapters
    .filter((chapter) => chapter.trim().length > 30) // Filter out very short chapters
    .map((chapter) => chapter.trim());
}

/**
 * Legacy function for parsing chapters from manual summary text
 * Now mainly used as fallback when LLM service is unavailable
 */
export function parseChaptersFromSummary(summary: string): string[] {
  if (!summary) return [];

  const chapters: string[] = [];

  // Split by common chapter delimiters
  const chapterPatterns = [
    /(?:^|\n)(?:Chapter|CHAPTER)\s*(\d+)[:\.\-\s]/gm,
    /(?:^|\n)(\d+)\.\s*([A-Z][^.\n]*)/gm,
    /(?:^|\n)(?:Section|SECTION)\s*([A-Za-z0-9]+)[:\.\-\s]/gm,
    /(?:^|\n)([A-Z][A-Z\s]{2,})[:\n]/gm, // All caps headings
    /(?:^|\n)(#{1,3})\s*([^\n]+)/gm, // Markdown headings
  ];

  // Try to split by double newlines first (paragraph breaks)
  const paragraphs = summary.split(/\n\s*\n/);

  if (paragraphs.length > 1) {
    paragraphs.forEach((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (trimmed.length > 50) {
        // Only include substantial paragraphs
        chapters.push(trimmed);
      }
    });
  }

  // If we didn't get good chapters from paragraphs, try pattern matching
  if (chapters.length < 2) {
    chapters.length = 0; // Clear previous attempts

    // Try to find numbered sections or bullet points
    const lines = summary.split("\n");
    let currentChapter = "";

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Check if this looks like a chapter/section header
      if (
        /^(\d+[\.\)]\s*|[A-Z]\.\s*|Chapter\s*\d+|Section\s*[A-Za-z0-9]+|#{1,3}\s*)/.test(
          trimmed
        ) ||
        /^[A-Z][A-Z\s]{5,}$/.test(trimmed) // All caps headers
      ) {
        // Save previous chapter if it exists
        if (currentChapter.trim()) {
          chapters.push(currentChapter.trim());
        }
        currentChapter = trimmed + "\n";
      } else if (trimmed) {
        currentChapter += trimmed + "\n";
      }
    });

    // Add the last chapter
    if (currentChapter.trim()) {
      chapters.push(currentChapter.trim());
    }
  }

  // If we still don't have good chapters, split by sentences and group them
  if (chapters.length < 2) {
    chapters.length = 0;
    const sentences = summary
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 20);

    // Group sentences into chunks of 3-4
    for (let i = 0; i < sentences.length; i += 3) {
      const chunk = sentences
        .slice(i, i + 3)
        .join(". ")
        .trim();
      if (chunk) {
        chapters.push(chunk + ".");
      }
    }
  }

  // Limit to reasonable number of chapters and length
  return chapters
    .slice(0, 8) // Max 8 chapters
    .filter((chapter) => chapter.length > 30 && chapter.length < 1000) // Reasonable length
    .map((chapter) => chapter.trim());
}

/**
 * Extract key concepts from a summary
 */
export function extractKeyConcepts(summary: string): string[] {
  if (!summary) return [];

  const concepts: string[] = [];

  // Look for bullet points or numbered lists
  const bulletPoints = summary.match(/(?:^|\n)[\-\*\•]\s*([^\n]+)/gm);
  if (bulletPoints) {
    concepts.push(
      ...bulletPoints.map((point) => point.replace(/^[\n\-\*\•]\s*/, "").trim())
    );
  }

  // Look for numbered points
  const numberedPoints = summary.match(/(?:^|\n)\d+\.\s*([^\n]+)/gm);
  if (numberedPoints) {
    concepts.push(
      ...numberedPoints.map((point) => point.replace(/^[\n\d\.\s]*/, "").trim())
    );
  }

  // Look for phrases that start with key concept indicators
  const conceptIndicators = [
    "Key point",
    "Important",
    "Remember",
    "Note that",
    "Concept",
    "Definition",
    "Principle",
    "Rule",
    "Law",
    "Theory",
  ];

  conceptIndicators.forEach((indicator) => {
    const regex = new RegExp(`${indicator}[:\s]*([^.!?\\n]+)`, "gi");
    const matches = summary.match(regex);
    if (matches) {
      concepts.push(...matches.map((match) => match.trim()));
    }
  });

  return concepts
    .slice(0, 10) // Limit to 10 concepts
    .filter((concept) => concept.length > 10 && concept.length < 200)
    .map((concept) => concept.trim());
}

/**
 * Generate study questions from a summary
 */
export function generateStudyQuestions(summary: string): string[] {
  if (!summary) return [];

  const questions: string[] = [
    "What are the main concepts covered in this lesson?",
    "Can you explain the key points in simple terms?",
    "What are some practical applications of this material?",
    "How does this relate to other topics I should know?",
    "What are the most important things to remember?",
  ];

  // Add specific questions based on content
  if (summary.toLowerCase().includes("definition")) {
    questions.push("Can you define the key terms mentioned?");
  }

  if (summary.toLowerCase().includes("example")) {
    questions.push(
      "Can you provide more examples to illustrate these concepts?"
    );
  }

  if (
    summary.toLowerCase().includes("process") ||
    summary.toLowerCase().includes("step")
  ) {
    questions.push("Can you walk me through the process step by step?");
  }

  return questions.slice(0, 8);
}
