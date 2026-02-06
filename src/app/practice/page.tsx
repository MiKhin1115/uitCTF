"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { FaSearch, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaTimes, FaCloudUploadAlt, FaFlag, FaFileDownload, FaLock } from "react-icons/fa";

// Mock Data
const EVENTS = [
  { id: "jan", name: "January Event" },
  { id: "feb", name: "February Event" },
  { id: "mar", name: "March Event" },
  { id: "apr", name: "April Event" },
  { id: "may", name: "May Event" },
];

const CATEGORIES = ["All", "Forensics", "Cryptography", "Web Exploitation", "Reverse Engineering", "Pwn"];

type Challenge = {
  id: string;
  title: string;
  category: string;
  eventId: string;
  points: number;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  solved?: boolean;
  writeupFile?: string; // Optional: File name or URL if a write-up exists
};

// Generate mock challenges for different events
const MOCK_CHALLENGES: Challenge[] = Array.from({ length: 150 }).map((_, i) => {
  const difficulty = ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)] as "Easy" | "Medium" | "Hard";
  
  let points = 0;
  if (difficulty === "Easy") points = 100;
  else if (difficulty === "Medium") points = 200;
  else if (difficulty === "Hard") points = 300;

  return {
    id: `chal-${i}`,
    title: `Challenge ${i + 1}`,
    category: CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1)) + 1], // Random category (excluding "All")
    eventId: EVENTS[Math.floor(Math.random() * EVENTS.length)].id,
    points: points,
    difficulty: difficulty,
    description: "This is a sample challenge description. In a real scenario, this would contain detailed instructions, hints, and context about the challenge. You might need to analyze a file, exploit a vulnerability, or decrypt a message.",
    solved: Math.random() > 0.8,
    writeupFile: Math.random() > 0.7 ? "writeup.pdf" : undefined, // Some challenges have write-ups
  };
});

const ITEMS_PER_PAGE = 9;

export default function PracticePage() {
  const [selectedEvent, setSelectedEvent] = useState(EVENTS[0].id);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEventBoxOpen, setIsEventBoxOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); // Simulate admin role

  // Simulate user role fetch (In a real app, this would come from your auth context/API)
  useEffect(() => {
    // For demonstration, we'll just keep it as false (Regular User).
    // Toggle this to true to see the Admin view.
    setIsAdmin(false); 
  }, []);

  // Filter challenges
  const filteredChallenges = MOCK_CHALLENGES.filter((challenge) => {
    const matchesEvent = challenge.eventId === selectedEvent;
    const matchesCategory = selectedCategory === "All" || challenge.category === selectedCategory;
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEvent && matchesCategory && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredChallenges.length / ITEMS_PER_PAGE);
  const currentChallenges = filteredChallenges.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentEventName = EVENTS.find(e => e.id === selectedEvent)?.name || "Select Event";

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-8">
          
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Header & Filters */}
            <div className="mb-8">
              <div className="mb-6 flex items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Practice Arena
                </h1>

                <span className="text-2xl text-white/20">/</span>

                {/* Event Selector */}
                <div className="relative">
                  <button
                    onClick={() => setIsEventBoxOpen(!isEventBoxOpen)}
                    className="group flex items-center gap-2 rounded-lg py-1 text-2xl font-bold text-[#077c8a] transition hover:text-[#099aa8]"
                  >
                    <span>{currentEventName}</span>
                    {isEventBoxOpen ? <FaChevronUp className="text-sm opacity-50" /> : <FaChevronDown className="text-sm opacity-50" />}
                  </button>

                  {/* Dropdown Content */}
                  {isEventBoxOpen && (
                    <div className="absolute left-0 top-full z-10 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-2xl ring-1 ring-black/5">
                      <div className="p-1">
                        {EVENTS.map((event) => (
                          <button
                            key={event.id}
                            onClick={() => {
                              setSelectedEvent(event.id);
                              setIsEventBoxOpen(false); // Close on select
                              setCurrentPage(1);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                              selectedEvent === event.id
                                ? "bg-[#077c8a]/10 text-[#077c8a]"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {event.name}
                            {selectedEvent === event.id && <div className="h-1.5 w-1.5 rounded-full bg-[#077c8a]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(1);
                      }}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        selectedCategory === cat
                          ? "bg-white/15 text-white ring-1 ring-white/20"
                          : "bg-transparent text-white/40 hover:bg-white/5 hover:text-white/80"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search & Admin Toggle */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search challenges..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:border-[#077c8a] focus:outline-none focus:ring-1 focus:ring-[#077c8a]"
                    />
                  </div>
                  
                  {/* Dev Tool: Admin Toggle */}
                  <button
                    onClick={() => setIsAdmin(!isAdmin)}
                    className={`hidden md:flex h-10 px-3 items-center justify-center rounded-lg border text-xs font-mono transition ${
                      isAdmin 
                        ? "border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                        : "border-white/10 bg-white/5 text-white/40 hover:text-white"
                    }`}
                    title="Toggle Admin Mode (Dev Tool)"
                  >
                    {isAdmin ? "ADMIN" : "USER"}
                  </button>
                </div>
              </div>
            </div>

            {/* Challenges Grid */}
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {currentChallenges.length > 0 ? (
                currentChallenges.map((challenge) => (
                  <button
                    key={challenge.id}
                    onClick={() => setSelectedChallenge(challenge)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-[#077c8a]/50 hover:bg-white/10"
                  >
                    <div className="w-full">
                      <div className="mb-4 flex items-start justify-between">
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-semibold uppercase tracking-wider ${
                            challenge.difficulty === "Easy"
                              ? "bg-green-500/10 text-green-400"
                              : challenge.difficulty === "Medium"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {challenge.difficulty}
                        </span>
                        <span className="text-sm font-medium text-[#077c8a]">{challenge.points} pts</span>
                      </div>

                      <h3 className="mb-2 text-xl font-bold text-white group-hover:text-[#077c8a] transition-colors">
                        {challenge.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <span>{challenge.category}</span>
                      </div>
                    </div>

                    {challenge.solved && (
                      <div className="mt-4 flex w-full justify-end">
                        <span className="text-green-500 text-xs font-bold uppercase tracking-widest">Solved</span>
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="col-span-full flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
                  <p className="text-lg font-medium text-white/60">No challenges found</p>
                  <p className="text-sm text-white/40">Try adjusting your filters or search query</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaChevronLeft />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`h-10 w-10 rounded-lg border text-sm font-medium transition ${
                          currentPage === page
                            ? "border-[#077c8a] bg-[#077c8a] text-white"
                            : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    (page === currentPage - 2 && page > 1) ||
                    (page === currentPage + 2 && page < totalPages)
                  ) {
                    return (
                      <span key={page} className="text-white/40">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Challenge Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 p-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`inline-block rounded px-2 py-1 text-xs font-semibold uppercase tracking-wider ${
                      selectedChallenge.difficulty === "Easy"
                        ? "bg-green-500/10 text-green-400"
                        : selectedChallenge.difficulty === "Medium"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {selectedChallenge.difficulty}
                  </span>
                  <span className="text-sm font-medium text-white/60">{selectedChallenge.category}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedChallenge.title}</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xl font-bold text-[#077c8a]">{selectedChallenge.points} pts</div>
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white transition"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <div className="rounded-xl bg-white/5 p-4 text-white/80 leading-relaxed border border-white/5">
                  {selectedChallenge.description}
                </div>
              </div>

              {/* Write-up Section - Conditional Rendering based on Role */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Write-up</h3>
                
                {isAdmin ? (
                  // Admin View: Upload/Edit Write-up
                  <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-8 text-center hover:bg-white/5 hover:border-white/40 transition cursor-pointer group">
                    <FaCloudUploadAlt className="mx-auto text-4xl text-white/20 group-hover:text-[#077c8a] transition mb-3" />
                    <p className="text-sm font-medium text-white/80">
                      {selectedChallenge.writeupFile ? "Update Write-up File" : "Upload Write-up File"}
                    </p>
                    <p className="text-xs text-white/40 mt-1">PDF, MD, or TXT (Max 5MB)</p>
                    {selectedChallenge.writeupFile && (
                       <p className="mt-2 text-xs text-[#077c8a]">Current file: {selectedChallenge.writeupFile}</p>
                    )}
                  </div>
                ) : (
                  // User View: Download or Empty State
                  selectedChallenge.writeupFile ? (
                    <div className="flex items-center justify-between rounded-xl bg-white/5 p-4 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#077c8a]/10 text-[#077c8a]">
                          <FaFileDownload />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Official Write-up</p>
                          <p className="text-xs text-white/40">Click to download solution</p>
                        </div>
                      </div>
                      <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition">
                        Download
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl bg-white/[0.02] p-6 border border-white/5 text-center">
                      <FaLock className="mb-2 text-white/10 text-xl" />
                      <p className="text-sm text-white/40">No write-up available yet.</p>
                    </div>
                  )
                )}
              </div>

              {/* Flag Submission */}
              <div className="bg-[#077c8a]/5 -mx-6 -mb-6 p-6 border-t border-[#077c8a]/20">
                <label className="block text-sm font-medium text-[#077c8a] mb-2">Flag Submission</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaFlag className="text-[#077c8a]" />
                    </div>
                    <input
                      type="text"
                      placeholder="UIT{flag_goes_here}"
                      className="block w-full rounded-lg border border-[#077c8a]/30 bg-[#0a0a0a] pl-10 pr-3 py-2.5 text-white placeholder-white/30 focus:border-[#077c8a] focus:ring-1 focus:ring-[#077c8a] focus:outline-none"
                    />
                  </div>
                  <button className="rounded-lg bg-[#077c8a] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#099aa8] transition shadow-lg shadow-[#077c8a]/20">
                    Submit Flag
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
