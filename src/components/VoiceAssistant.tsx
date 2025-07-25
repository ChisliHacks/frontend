import { useVoiceNavigation } from "../hooks/useVoiceNavigation";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    lessonsList?: { id: number; title: string }[];
  }
}

function getLessonsList(): { id: number; title: string }[] {
  return window.lessonsList || [];
}

export default function VoiceAssistant() {
  // Observe AI responses in Chat With Tuna and read aloud
  useEffect(() => {
    const path = window.location.pathname;
    if (!path.includes("study") || !path.includes("chat")) return;
    // Find Tuna chat container
    const tunaChat = document.querySelector("[data-tuna-chat]");
    if (!tunaChat) return;
    // Observe for new AI messages
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (
            node.nodeType === 1 &&
            (node as HTMLElement).className.includes("ai-message")
          ) {
            const text = (node as HTMLElement).textContent;
            if (text) speak(text);
          }
        });
      });
    });
    observer.observe(tunaChat, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [window.location.pathname]);
  const [lastCommand, setLastCommand] = useState("");
  const [navResult, setNavResult] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<string>("");
  const speak = (text: string) => {
    if (window.speechSynthesis) {
      const utter = new window.SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }
  };

  useEffect(() => {
    const announcePage = () => {
      let page = "";
      const path = window.location.pathname;
      if (path === "/") page = "Home";
      else if (path === "/lessons") page = "Lessons";
      else if (path.startsWith("/jobs")) page = "Jobs";
      else if (path.startsWith("/about")) page = "About";
      else if (path.startsWith("/auth/login")) page = "Login";
      else if (path.startsWith("/auth/register")) page = "Register";
      else if (path.startsWith("/profile")) page = "Profile";
      else page = path;
      setCurrentPage(page);
      speak(`You are on the ${page} page.`);
      if (path === "/lessons") {
        setTimeout(() => {
          const lessons = getLessonsList();
          if (lessons.length > 0) {
            const lessonCards = Array.from(
              document.querySelectorAll(".grid > div")
            );
            const details = lessons
              .map((l, i) => {
                let title = l.title;
                let summary = "";
                const card = lessonCards[i];
                if (card) {
                  const titleEl = card.querySelector("h3");
                  const summaryEl = card.querySelector("p");
                  if (titleEl && titleEl.textContent)
                    title = titleEl.textContent.trim();
                  if (summaryEl && summaryEl.textContent)
                    summary = summaryEl.textContent.trim();
                }
                return `Lesson ${i + 1}: ${title}. ${summary}`;
              })
              .join(". ");
            speak(details);
          } else {
            speak("There are no lessons available.");
          }
        }, 800);
      }
    };
    announcePage();
    window.addEventListener("popstate", announcePage);
    // Listen for custom lessonsListUpdated event from Lessons page
    window.addEventListener("lessonsListUpdated", announcePage);
    return () => {
      window.removeEventListener("popstate", announcePage);
      window.removeEventListener("lessonsListUpdated", announcePage);
    };
  }, []);

  const { listening } = useVoiceNavigation((text) => {
    setLastCommand(text);
    const command = text.toLowerCase();
    const path = window.location.pathname;
    if (
      /^(navigate|go) (to )?lessons?$/.test(command) ||
      command === "lessons"
    ) {
      if (window.location.pathname !== "/lessons") {
        window.location.pathname = "/lessons";
        setNavResult("Navigating to Lessons page.");
        speak("Navigating to Lessons page.");
      } else {
        setNavResult("Already on Lessons page.");
        speak("You are already on the Lessons page.");
      }
      return;
    }
    // Lessons page voice features
    if (path.startsWith("/lessons")) {
      // In Study modal: voice command to switch tab to Tuna (QNA)
      const studyModal = document.querySelector(
        "[data-study-modal], .study-modal, .modal"
      );
      if (studyModal) {
        // Go to Tuna tab
        if (
          command.includes("go to tuna") ||
          command.includes("ask tuna") ||
          command.includes("chat with tuna")
        ) {
          const tunaTabBtn = Array.from(
            studyModal.querySelectorAll("button")
          ).find(
            (b) => b.textContent && b.textContent.toLowerCase().includes("tuna")
          );
          if (tunaTabBtn) {
            (tunaTabBtn as HTMLButtonElement).click();
            setNavResult("Switched to Tuna QNA tab");
            speak("Switched to Tuna QNA tab");
          } else {
            setNavResult("Tuna tab button not found");
            speak("Tuna tab button not found");
          }
          return;
        }
        // Go to Summary tab and read summary
        if (command.includes("summary")) {
          const summaryTabBtn = Array.from(
            studyModal.querySelectorAll("button")
          ).find(
            (b) =>
              b.textContent && b.textContent.toLowerCase().includes("summary")
          );
          if (summaryTabBtn) {
            (summaryTabBtn as HTMLButtonElement).click();
            setNavResult("Switched to Summary tab");
            // Try to read summary content
            setTimeout(() => {
              const summaryContent = studyModal.querySelector(
                ".prose, .lesson-summary, .text-gray-700"
              );
              if (summaryContent && summaryContent.textContent) {
                speak(`Summary: ${summaryContent.textContent.trim()}`);
              } else {
                speak("No summary available.");
              }
            }, 400);
          } else {
            setNavResult("Summary tab button not found");
            speak("Summary tab button not found");
          }
          return;
        }
      }
      // In study mode (popup), QNA: detect Study modal and Chat With Tuna button
      if (
        (document.querySelector("[data-study-modal], .study-modal, .modal") ||
          document.querySelector("button[data-study],button.study")) &&
        (command.includes("qna") ||
          command.includes("question") ||
          command.includes("ask") ||
          command.includes("q & a") ||
          command.includes("q and a"))
      ) {
        // Try to find the Chat With Tuna button inside the modal
        const tunaBtn = Array.from(document.querySelectorAll("button")).find(
          (b) =>
            b.textContent &&
            b.textContent.trim().toLowerCase().includes("chat with tuna")
        );
        if (tunaBtn) {
          (tunaBtn as HTMLButtonElement).click();
          setNavResult("Opening QNA (Chat With Tuna)");
          speak("Opening QNA mode");
        } else {
          setNavResult("Chat With Tuna button not found");
          speak("Chat With Tuna button not found");
        }
        return;
      }

      // In Chat With Tuna, allow voice reply (send message)
      if (
        path.includes("study") &&
        path.includes("chat") &&
        listening &&
        lastCommand
      ) {
        // Find Tuna chat input
        const input = document.querySelector(
          "input[data-tuna-input]"
        ) as HTMLInputElement | null;
        if (input) {
          input.value = lastCommand;
          const event = new Event("input", { bubbles: true });
          input.dispatchEvent(event);
          // Find send button
          const sendBtn = Array.from(document.querySelectorAll("button")).find(
            (b) =>
              b.textContent &&
              b.textContent.trim().toLowerCase().includes("send")
          );
          if (sendBtn) (sendBtn as HTMLButtonElement).click();
          setNavResult("Message sent to Tuna");
        }
      }
      const lessons = getLessonsList();
      // On /lessons/:id, allow 'give summary' to read the summary of the current lesson
      const lessonDetailMatch = path.match(/^\/lessons\/(\d+)/);

      // On /lessons/:id, allow 'go to study' to click the Study button
      if (
        lessonDetailMatch &&
        (command.includes("go to study") || command.includes("study"))
      ) {
        // Try to find the Study button by text
        const studyBtn = Array.from(document.querySelectorAll("button")).find(
          (b) => b.textContent && b.textContent.trim().toLowerCase() === "study"
        );
        if (studyBtn) {
          (studyBtn as HTMLButtonElement).click();
          setNavResult("Opening study mode");
          speak("Opening study mode");
        } else {
          setNavResult("Study button not found");
          speak("Study button not found");
        }
        return;
      }

      if (
        lessonDetailMatch &&
        (/give( me)? summary/.test(command) || command.includes("read summary"))
      ) {
        // Only read the summary, not description
        // Try to get the summary from the DOM: prefer .lesson-summary, fallback to first <p> if it has class .lesson-summary
        let summary = "";
        let title = "";
        const titleEl = document.querySelector("h1, h2, h3, .lesson-title");
        const summaryEl = document.querySelector(".lesson-summary");
        if (titleEl && titleEl.textContent) {
          title = titleEl.textContent.trim();
        }
        if (summaryEl && summaryEl.textContent) {
          summary = summaryEl.textContent.trim();
        }
        // If not found, try to find <p> with class containing 'summary'
        if (!summary) {
          const pSummary = Array.from(document.querySelectorAll("p")).find(
            (p) => p.className && p.className.includes("summary")
          );
          if (pSummary && pSummary.textContent)
            summary = pSummary.textContent.trim();
        }
        let spoken = "";
        if (title) spoken = `Lesson: ${title}.`;
        if (summary) spoken += ` ${summary}`;
        if (summary) {
          setNavResult("Reading lesson summary.");
          speak(spoken);
        } else {
          setNavResult("No summary found on this lesson.");
          speak("No summary found on this lesson.");
        }
        return;
      }
      // List lessons
      if (
        command.includes("list lessons") ||
        command.includes("read lessons")
      ) {
        if (lessons.length > 0) {
          const titles = lessons
            .map((l, i) => `Lesson ${i + 1}: ${l.title}`)
            .join(". ");
          setNavResult(`There are ${lessons.length} lessons.`);
          speak(`There are ${lessons.length} lessons. ${titles}`);
        } else {
          setNavResult("No lessons available.");
          speak("There are no lessons available.");
        }
        return;
      }
      // Give summary for all lessons (on /lessons)
      if (
        /give( me)? summary/.test(command) ||
        command.includes("read summary")
      ) {
        if (path === "/lessons") {
          if (lessons.length > 0) {
            const lessonCards = Array.from(
              document.querySelectorAll(".grid > div")
            );
            const summaries = lessons
              .map((l, i) => {
                let title = l.title;
                let summary = "";
                const card = lessonCards[i];
                if (card) {
                  const titleEl = card.querySelector("h3");
                  // Only get .lesson-summary, not description or fallback
                  const summaryEl = card.querySelector(".lesson-summary");
                  if (titleEl && titleEl.textContent)
                    title = titleEl.textContent.trim();
                  if (summaryEl && summaryEl.textContent)
                    summary = summaryEl.textContent.trim();
                }
                // If not found, try to find <p> with class containing 'summary'
                if (!summary && card) {
                  const pSummary = Array.from(card.querySelectorAll("p")).find(
                    (p) => p.className && p.className.includes("summary")
                  );
                  if (pSummary && pSummary.textContent)
                    summary = pSummary.textContent.trim();
                }
                return summary ? `Lesson ${i + 1}: ${title}. ${summary}` : null;
              })
              .filter(Boolean)
              .join(". ");
            if (summaries) {
              setNavResult("Reading all lesson summaries.");
              speak(`Here are the summaries. ${summaries}`);
            } else {
              setNavResult("No summaries found.");
              speak("No summaries found.");
            }
          } else {
            setNavResult("No lessons available.");
            speak("There are no lessons available.");
          }
          return;
        }
      }
      // View lesson by name or by number
      // Prevent lesson title search if Study modal is open and command matches tab switch
      const studyModalEl = document.querySelector(
        "[data-study-modal], .study-modal, .modal"
      );
      const isTabSwitchCmd =
        studyModalEl &&
        (command.includes("go to tuna") ||
          command.includes("ask tuna") ||
          command.includes("chat with tuna") ||
          command.includes("summary"));
      if (!isTabSwitchCmd) {
        const matchTitle =
          command.match(/(?:select|view)? ?lessons? (.+)/) ||
          command.match(/(?:select|view)? ?lesson (.+)/) ||
          command.match(/(?:select|view)? ?(.+)/);
        if (matchTitle) {
          const possibleTitle = matchTitle[1].trim();
          if (possibleTitle) {
            if (/^\d+$/.test(possibleTitle)) {
              // If input is a number, treat as index
              const idx = parseInt(possibleTitle, 10) - 1;
              if (lessons[idx]) {
                window.location.pathname = `/lessons/${lessons[idx].id}`;
                setNavResult(`Opening lesson: ${lessons[idx].title}`);
                speak(`Opening lesson: ${lessons[idx].title}`);
              } else {
                setNavResult(`Lesson number ${possibleTitle} not found.`);
                speak(`Lesson number ${possibleTitle} not found.`);
              }
              return;
            } else {
              // Search by name
              const title = possibleTitle.toLowerCase();
              const foundIdx = lessons.findIndex((l) =>
                l.title.toLowerCase().includes(title)
              );
              if (foundIdx !== -1) {
                const lessonCards = Array.from(
                  document.querySelectorAll(".grid > div")
                );
                const card = lessonCards[foundIdx];
                if (card) {
                  const viewBtn = Array.from(
                    card.querySelectorAll("button")
                  ).find(
                    (b) =>
                      b.textContent &&
                      b.textContent.trim().toLowerCase() === "view"
                  );
                  if (viewBtn) {
                    (viewBtn as HTMLButtonElement).click();
                    setNavResult(`Opening lesson: ${lessons[foundIdx].title}`);
                    speak(`Opening lesson: ${lessons[foundIdx].title}`);
                    return;
                  }
                }
                // Fallback: navigate to lesson detail page
                window.location.pathname = `/lessons/${lessons[foundIdx].id}`;
                setNavResult(`Opening lesson: ${lessons[foundIdx].title}`);
                speak(`Opening lesson: ${lessons[foundIdx].title}`);
              } else {
                setNavResult(
                  `Lesson with title containing "${possibleTitle}" not found.`
                );
                speak(
                  `Sorry, I could not find any lesson with title containing ${possibleTitle}`
                );
              }
              return;
            }
          }
        }
      }
      // Create lesson
      if (command.includes("create lesson")) {
        // Try to find the button by class or by text content for accessibility
        let btn = document.querySelector(
          'button[class*="Create Lesson"]'
        ) as HTMLButtonElement | null;
        if (!btn) {
          // Fallback: search all buttons for text content
          const buttons = Array.from(
            document.querySelectorAll("button")
          ) as HTMLButtonElement[];
          btn =
            buttons.find(
              (b) =>
                b.textContent &&
                b.textContent.trim().toLowerCase().includes("create lesson")
            ) || null;
        }
        if (btn) {
          btn.click();
          setNavResult("Opening create lesson dialog");
          speak("Opening create lesson dialog");
        } else {
          setNavResult("Create lesson button not found");
          speak("Create lesson button not found");
        }
        return;
      }
    }
    // ...existing code for other navigation...
    // ...existing code...
  });

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
      <div
        style={{
          padding: 8,
          background: listening ? "#e0ffe0" : navResult ? "#ffe0e0" : "#f0f0f0",
          borderRadius: 8,
          boxShadow: "0 2px 8px #0002",
          minWidth: 220,
        }}
      >
        <span role="img" aria-label="mic">
          🎤
        </span>{" "}
        {listening ? "Listening... (speak now)" : "Press Backspace to talk"}
        <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
          Commands: home, lessons, jobs, about, login, register, profile,
          logout, upload, up, down, back, "where am I"
        </div>
        <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
          Current page: <b>{currentPage}</b>
        </div>
        {lastCommand && (
          <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
            Last command: <b>{lastCommand}</b>
          </div>
        )}
        {navResult && (
          <div
            style={{
              fontSize: 12,
              color: navResult.startsWith("Sorry") ? "#c00" : "#090",
              marginTop: 4,
            }}
          >
            {navResult}
          </div>
        )}
      </div>
    </div>
  );
}
