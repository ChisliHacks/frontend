import React, { useState, useEffect } from "react";
import { authApi, type LeaderboardResponse, type JobLeaderboardResponse } from "../utils/api";

const TopPerformers: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [jobLeaderboard, setJobLeaderboard] = useState<JobLeaderboardResponse | null>(null);
  const [viewType, setViewType] = useState<"general" | "by-jobs">("general");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        if (viewType === "general") {
          const data = await authApi.getLeaderboard(limit);
          setLeaderboard(data);
        } else {
          const data = await authApi.getLeaderboardByJobs(limit);
          setJobLeaderboard(data);
        }
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || "Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit, viewType]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "🏆";
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case 2:
        return "text-gray-600 bg-gray-50 border-gray-200";
      case 3:
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const toggleJobExpansion = (jobPosition: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobPosition)) {
      newExpanded.delete(jobPosition);
    } else {
      newExpanded.add(jobPosition);
    }
    setExpandedJobs(newExpanded);
  };

  const formatExperienceLevel = (level: string | undefined) => {
    if (!level) return "";
    return level.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-4xl mr-3">🏆</div>
            <h1 className="text-4xl font-bold text-gray-900">Top Performers</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the most dedicated learners on our platform! These top performers have shown exceptional commitment to their learning journey.
          </p>
        </div>

        {/* Stats Overview */}
        {viewType === "general" && leaderboard && leaderboard.top_performers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-yellow-200">
              <div className="flex items-center">
                <div className="text-3xl mr-3">🥇</div>
                <div>
                  <p className="text-sm font-medium text-yellow-600">Top Scorer</p>
                  <p className="text-2xl font-bold text-yellow-800">{leaderboard.top_performers[0].username}</p>
                  <p className="text-sm text-yellow-600">{leaderboard.top_performers[0].total_lesson_score} points</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-200">
              <div className="flex items-center">
                <div className="text-3xl mr-3">📚</div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Most Lessons</p>
                  <p className="text-2xl font-bold text-blue-800">{Math.max(...leaderboard.top_performers.map((p) => p.lessons_completed))}</p>
                  <p className="text-sm text-blue-600">lessons completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-green-200">
              <div className="flex items-center">
                <div className="text-3xl mr-3">⭐</div>
                <div>
                  <p className="text-sm font-medium text-green-600">Best Average</p>
                  <p className="text-2xl font-bold text-green-800">{Math.max(...leaderboard.top_performers.map((p) => p.average_score)).toFixed(1)}</p>
                  <p className="text-sm text-green-600">avg score/lesson</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-800">Leaderboard</h2>

              {/* View Type Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewType("general")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewType === "general" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
                  🏆 Overall
                </button>
                <button
                  onClick={() => setViewType("by-jobs")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewType === "by-jobs" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
                  💼 By Jobs
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Show top:</label>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-500">performers</span>
            </div>
          </div>
        </div>

        {/* Leaderboard Content */}
        {viewType === "general" ? (
          // General Leaderboard
          leaderboard && leaderboard.top_performers.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lessons Completed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Since</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboard.top_performers.map((performer, index) => {
                      const rank = index + 1;
                      return (
                        <tr key={performer.id} className={rank <= 3 ? getRankColor(rank) : "hover:bg-gray-50"}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-2xl mr-2">{getRankIcon(rank)}</span>
                              <span className={`text-lg font-bold ${rank <= 3 ? "" : "text-gray-600"}`}>#{rank}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className={`h-10 w-10 rounded-full ${rank <= 3 ? getRankColor(rank).split(" ")[2] : "bg-gray-100"} flex items-center justify-center`}>
                                  <span className="text-sm font-medium text-gray-600">{performer.username.charAt(0).toUpperCase()}</span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className={`text-sm font-medium ${rank <= 3 ? "font-bold" : "text-gray-900"}`}>{performer.username}</div>
                                {rank <= 3 && <div className="text-xs text-gray-500">Top Performer</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{performer.total_lesson_score.toLocaleString()} pts</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{performer.lessons_completed} lessons</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{performer.average_score.toFixed(1)} pts/lesson</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{performer.created_at ? new Date(performer.created_at).toLocaleDateString() : "N/A"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Top Performers Yet</h3>
              <p className="text-gray-500">Be the first to complete lessons and earn your place on the leaderboard!</p>
            </div>
          )
        ) : // Job-specific Leaderboard
        jobLeaderboard && Object.keys(jobLeaderboard).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(jobLeaderboard).map(([jobPosition, entry]) => (
              <div key={jobPosition} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => toggleJobExpansion(jobPosition)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">💼</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{entry.job_info.position}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {entry.job_info.company && <span>🏢 {entry.job_info.company}</span>}
                          {entry.job_info.experience_level && <span>📊 {formatExperienceLevel(entry.job_info.experience_level)}</span>}
                          {entry.job_info.industry && <span>🏭 {entry.job_info.industry}</span>}
                          <span>📚 {entry.job_info.related_lessons_count} related lessons</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{entry.top_performers.length} performers</div>
                        <div className="text-sm text-gray-500">Top score: {entry.top_performers[0]?.job_specific_score || 0}</div>
                      </div>
                      {expandedJobs.has(jobPosition) ? <div className="text-gray-400">⬆️</div> : <div className="text-gray-400">⬇️</div>}
                    </div>
                  </div>
                </div>

                {expandedJobs.has(jobPosition) && entry.top_performers.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learner</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Related Lessons</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Stats</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {entry.top_performers.map((performer, index) => {
                          const rank = index + 1;
                          return (
                            <tr key={performer.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-xl mr-2">{getRankIcon(rank)}</span>
                                  <span className="text-sm font-bold text-gray-600">#{rank}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                    <span className="text-indigo-600 font-medium text-xs">{performer.username.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{performer.username}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-blue-600">{performer.job_specific_score}</div>
                                <div className="text-xs text-gray-500">job points</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{performer.related_lessons_count}</div>
                                <div className="text-xs text-gray-500">completed</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-xs text-gray-900">{performer.total_lesson_score} total pts</div>
                                <div className="text-xs text-gray-500">
                                  {performer.lessons_completed} lessons • {performer.average_score.toFixed(1)} avg
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {expandedJobs.has(jobPosition) && entry.top_performers.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 text-4xl mb-2">🎯</div>
                    <p className="text-gray-500">No performers yet for this job position</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">💼</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Job-Specific Data Yet</h3>
            <p className="text-gray-500">Complete job-related lessons to see performance by job categories!</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Want to Join the Top Performers?</h3>
          <p className="text-blue-100 mb-6">Start learning today and climb your way to the top of the leaderboard!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/lessons" className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-50 transition-colors">
              Browse Lessons
            </a>
            <a href="/jobs" className="bg-blue-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-800 transition-colors border border-blue-500">
              Explore Job Opportunities
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPerformers;
