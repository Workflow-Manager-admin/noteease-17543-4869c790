import type { MetaFunction } from "@remix-run/node";
import { useState, useMemo, ChangeEvent } from "react";

// PUBLIC_INTERFACE
export const meta: MetaFunction = () => {
  return [
    { title: "NoteEase - Your Personal Notes" },
    {
      name: "description",
      content: "Create, edit, delete, search and categorize your notes with NoteEase.",
    },
  ];
};

type Note = {
  id: number;
  title: string;
  content: string;
  category: string;
};

// PUBLIC_INTERFACE
export default function Index() {
  // State for all notes
  const [notes, setNotes] = useState<Note[]>([]);
  // Controls the open/edit modal note
  const [modalNote, setModalNote] = useState<Note | null>(null);
  // Search text
  const [searchText, setSearchText] = useState<string>("");
  // Active category filter
  const [filterCategory, setFilterCategory] = useState<string>("All");

  // Derive all categories (unique)
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(notes.map((n) => n.category).filter((c) => c.trim() !== ""))
    );
    return ["All", ...cats];
  }, [notes]);

  // Filter notes by search and category
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchText.toLowerCase()) ||
        note.content.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory =
        filterCategory === "All" || note.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [notes, searchText, filterCategory]);

  // Handlers
  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    setSearchText(e.target.value);
  }

  function openNewNote() {
    setModalNote({ id: Date.now(), title: "", content: "", category: "" });
  }

  function openEditNote(note: Note) {
    setModalNote({ ...note });
  }

  function closeModal() {
    setModalNote(null);
  }

  function saveModalNote() {
    if (!modalNote) return;
    setNotes((prev) => {
      const exists = prev.find((n) => n.id === modalNote.id);
      if (exists) {
        return prev.map((n) => (n.id === modalNote.id ? modalNote : n));
      } else {
        return [modalNote, ...prev];
      }
    });
    closeModal();
  }

  function deleteModalNote() {
    if (!modalNote) return;
    setNotes((prev) => prev.filter((n) => n.id !== modalNote.id));
    closeModal();
  }

  // UI
  return (
    <div className="flex flex-col h-screen bg-white text-gray-900">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchText}
          onChange={handleSearch}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
        />
      </div>

      {/* Category Filters */}
      <div className="flex space-x-2 overflow-x-auto px-4 py-2 border-b border-gray-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${
              filterCategory === cat
                ? "bg-[#4A90E2] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="flex-1 overflow-auto p-4">
        {filteredNotes.length === 0 ? (
          <p className="text-center text-gray-500">No notes found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                role="button"
                tabIndex={0}
                onClick={() => openEditNote(note)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openEditNote(note);
                }}
                className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {note.title || "<Untitled>"}
                </h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                  {note.content || <em>No content</em>}
                </p>
                {note.category && (
                  <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {note.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={openNewNote}
        className="fixed bottom-6 right-6 bg-[#F5A623] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:opacity-90"
      >
        +
      </button>

      {/* Modal for Add/Edit */}
      {modalNote && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              {notes.some((n) => n.id === modalNote.id)
                ? "Edit Note"
                : "New Note"}
            </h2>
            <input
              type="text"
              placeholder="Title"
              value={modalNote.title}
              onChange={(e) =>
                setModalNote({ ...modalNote, title: e.target.value })
              }
              className="w-full mb-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
            />
            <textarea
              placeholder="Content"
              value={modalNote.content}
              onChange={(e) =>
                setModalNote({ ...modalNote, content: e.target.value })
              }
              rows={5}
              className="w-full mb-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
            />
            <input
              type="text"
              placeholder="Category"
              value={modalNote.category}
              onChange={(e) =>
                setModalNote({ ...modalNote, category: e.target.value })
              }
              className="w-full mb-4 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
            />
            <div className="flex justify-end space-x-2">
              {notes.some((n) => n.id === modalNote.id) && (
                <button
                  onClick={deleteModalNote}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              )}
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={saveModalNote}
                className="px-4 py-2 bg-[#4A90E2] text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
