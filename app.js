// DOM Element Selectors
const $ = (selector) => document.querySelector(selector);
const listEl = $("#list");
const form = $("#form");
const titleEl = $("#title");
const bodyEl = $("#body");
const searchEl = $("#search");
const sortEl = $("#sort");

// Constants
const STORAGE_KEY = "notes-app-v1";

// Utility Functions
const loadNotes = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const saveNotes = (notes) => localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
const getCurrentTime = () => new Date().toISOString();

// Main Render Function
function renderNotes() {
    const searchQuery = (searchEl.value || "").toLowerCase().trim();
    const sortOption = sortEl.value;
    let notes = loadNotes();

    // Filter notes based on search query
    if (searchQuery) {
        notes = notes.filter(note => 
            (note.title + " " + note.body).toLowerCase().includes(searchQuery)
        );
    }

    // Sort notes based on selected option
    notes.sort((a, b) => {
        switch (sortOption) {
            case "new": return new Date(b.updated) - new Date(a.updated);
            case "old": return new Date(a.updated) - new Date(b.updated);
            case "az": return a.title.localeCompare(b.title);
            case "za": return b.title.localeCompare(a.title);
            default: return 0;
        }
    });

    // Clear the list
    listEl.innerHTML = "";

    // Show empty state if no notes
    if (notes.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";
        emptyState.innerHTML = searchQuery 
            ? `📝 No notes found for "${searchQuery}"`
            : "📝 No notes yet. Create your first note above!";
        listEl.appendChild(emptyState);
        return;
    }

    // Render each note
    notes.forEach(note => {
        const noteElement = createNoteElement(note);
        listEl.appendChild(noteElement);
    });
}

// Create Note Element
function createNoteElement(note) {
    const li = document.createElement("li");
    
    // Note header
    const header = document.createElement("div");
    header.className = "note-head";
    
    const title = document.createElement("div");
    title.className = "note-title";
    title.textContent = note.title || "📝 Untitled Note";
    
    const time = document.createElement("div");
    time.className = "note-time";
    time.textContent = formatDate(note.updated);
    
    header.appendChild(title);
    header.appendChild(time);

    // Note body
    const body = document.createElement("div");
    body.className = "note-body";
    body.textContent = note.body || "No content";

    // Actions
    const actions = document.createElement("div");
    actions.className = "actions";

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.className = "primary";
    editBtn.innerHTML = "✏️ Edit";
    editBtn.onclick = () => editNote(note);

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "danger";
    deleteBtn.innerHTML = "🗑️ Delete";
    deleteBtn.onclick = () => deleteNote(note.id);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    // Assemble note element
    li.appendChild(header);
    li.appendChild(body);
    li.appendChild(actions);

    return li;
}

// Edit Note Function
function editNote(note) {
    const newTitle = prompt("Edit title:", note.title);
    if (newTitle === null) return; // User cancelled

    const newBody = prompt("Edit content:", note.body);
    if (newBody === null) return; // User cancelled

    const notes = loadNotes().map(n => 
        n.id === note.id 
            ? { ...n, title: newTitle.trim(), body: newBody.trim(), updated: getCurrentTime() }
            : n
    );

    saveNotes(notes);
    renderNotes();
}

// Delete Note Function
function deleteNote(noteId) {
    if (!confirm("Are you sure you want to delete this note?")) return;
    
    const notes = loadNotes().filter(note => note.id !== noteId);
    saveNotes(notes);
    renderNotes();
}

// Format Date Function
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        return "Today, " + date.toLocaleTimeString();
    } else if (diffDays === 2) {
        return "Yesterday, " + date.toLocaleTimeString();
    } else if (diffDays <= 7) {
        return date.toLocaleDateString() + ", " + date.toLocaleTimeString();
    } else {
        return date.toLocaleDateString();
    }
}

// Form Submit Handler
form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const title = titleEl.value.trim();
    const body = bodyEl.value.trim();
    
    // Validate input
    if (!title && !body) {
        alert("Please enter a title or some content for your note.");
        return;
    }

    // Create new note
    const newNote = {
        id: crypto.randomUUID(),
        title: title,
        body: body,
        created: getCurrentTime(),
        updated: getCurrentTime()
    };

    // Save note
    const notes = loadNotes();
    notes.unshift(newNote); // Add to beginning of array
    saveNotes(notes);

    // Clear form
    titleEl.value = "";
    bodyEl.value = "";
    
    // Re-render notes
    renderNotes();
    
    // Focus on title input for next note
    titleEl.focus();
});

// Search and Sort Event Listeners
searchEl.addEventListener("input", renderNotes);
sortEl.addEventListener("change", renderNotes);

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
    renderNotes();
    titleEl.focus();
});
