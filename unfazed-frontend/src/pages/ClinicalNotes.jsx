import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Search,
  Plus,
  CalendarDays,
  Clock3,
  Lock,
  ChevronRight,
  MoreHorizontal,
  X,
  Save
} from "lucide-react";

import api from "../services/api";
import "./ClinicalNotes.css";

function ClinicalNotes() {
  const [notes, setNotes] = useState([]);
  const [clients, setClients] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showNewNote, setShowNewNote] = useState(false);
  const [showEditNote, setShowEditNote] = useState(false);

  const [saving, setSaving] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);

  const [selectedNote, setSelectedNote] = useState(null);
  const [menuNoteId, setMenuNoteId] = useState(null);

  const [form, setForm] = useState({
    clientId: "",
    noteType: "session",
    title: "",
    content: "",
    visibility: "private"
  });

  // =========================================================
  // LOAD NOTES
  // =========================================================

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/clinical-notes");

      const data = response.data;

      const noteList =
        Array.isArray(data)
          ? data
          : Array.isArray(data.clinicalNotes)
            ? data.clinicalNotes
            : Array.isArray(data.notes)
              ? data.notes
              : Array.isArray(data.data)
                ? data.data
                : [];

      setNotes(noteList);
    } catch (error) {
      console.error("Failed to load clinical notes:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load clinical notes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD CLIENTS
  // =========================================================

  const loadClients = async () => {
    try {
      const response = await api.get("/clients");

      const data = response.data;

      const clientList =
        Array.isArray(data)
          ? data
          : Array.isArray(data.clients)
            ? data.clients
            : Array.isArray(data.data)
              ? data.data
              : [];

      setClients(clientList);

      return clientList;
    } catch (error) {
      console.error("Failed to load clients:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load clients."
      );

      return [];
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  // =========================================================
  // NEW NOTE
  // =========================================================

  const handleOpenNewNote = async () => {
    setError("");
    setMenuNoteId(null);

    setForm({
      clientId: "",
      noteType: "session",
      title: "",
      content: "",
      visibility: "private"
    });

    await loadClients();

    setShowNewNote(true);
  };

  const handleCloseNewNote = () => {
    if (saving) return;

    setShowNewNote(false);

    setForm({
      clientId: "",
      noteType: "session",
      title: "",
      content: "",
      visibility: "private"
    });
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // =========================================================
  // CREATE NOTE
  // =========================================================

  const handleCreateNote = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.clientId) {
      setError("Please select a client.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a note title.");
      return;
    }

    if (!form.content.trim()) {
      setError("Please enter the clinical note.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/clinical-notes", {
        clientId: form.clientId,
        noteType: form.noteType,
        title: form.title.trim(),
        content: form.content.trim(),
        visibility: form.visibility
      });

      setShowNewNote(false);

      setForm({
        clientId: "",
        noteType: "session",
        title: "",
        content: "",
        visibility: "private"
      });

      await loadNotes();
    } catch (error) {
      console.error("Failed to create clinical note:", error);

      setError(
        error.response?.data?.message ||
          "Unable to create clinical note. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // OPEN NOTE
  // =========================================================

  const handleOpenNote = async (note) => {
    try {
      setLoadingNote(true);
      setError("");
      setMenuNoteId(null);

      if (!note._id) {
        setSelectedNote(note);
        return;
      }

      const response = await api.get(
        `/clinical-notes/${note._id}`
      );

      const clinicalNote =
        response.data?.clinicalNote ||
        response.data?.note ||
        response.data?.data ||
        response.data;

      setSelectedNote(clinicalNote);
    } catch (error) {
      console.error("Failed to open clinical note:", error);

      setError(
        error.response?.data?.message ||
          "Unable to open clinical note."
      );
    } finally {
      setLoadingNote(false);
    }
  };

  const handleCloseNote = () => {
    setSelectedNote(null);
  };

  // =========================================================
  // EDIT NOTE
  // =========================================================

  const handleEditNote = async (note) => {
    try {
      setError("");
      setMenuNoteId(null);
      setLoadingNote(true);

      let noteToEdit = note;

      if (note._id) {
        const response = await api.get(
          `/clinical-notes/${note._id}`
        );

        noteToEdit =
          response.data?.clinicalNote ||
          response.data?.note ||
          response.data?.data ||
          response.data;
      }

      setForm({
        clientId:
          noteToEdit.client?._id ||
          noteToEdit.client?.id ||
          noteToEdit.client ||
          "",
        noteType:
          noteToEdit.noteType ||
          "session",
        title:
          noteToEdit.title ||
          "",
        content:
          noteToEdit.content ||
          "",
        visibility:
          noteToEdit.visibility ||
          "private"
      });

      setSelectedNote(noteToEdit);
      setShowEditNote(true);
    } catch (error) {
      console.error("Failed to load note for editing:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load clinical note for editing."
      );
    } finally {
      setLoadingNote(false);
    }
  };

  const handleCloseEditNote = () => {
    if (saving) return;

    setShowEditNote(false);
    setSelectedNote(null);

    setForm({
      clientId: "",
      noteType: "session",
      title: "",
      content: "",
      visibility: "private"
    });
  };

  const handleUpdateNote = async (event) => {
    event.preventDefault();

    if (!selectedNote?._id) {
      setError("Clinical note ID is missing.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a note title.");
      return;
    }

    if (!form.content.trim()) {
      setError("Please enter the clinical note.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.put(
        `/clinical-notes/${selectedNote._id}`,
        {
          noteType: form.noteType,
          title: form.title.trim(),
          content: form.content.trim(),
          visibility: form.visibility
        }
      );

      setShowEditNote(false);
      setSelectedNote(null);

      setForm({
        clientId: "",
        noteType: "session",
        title: "",
        content: "",
        visibility: "private"
      });

      await loadNotes();
    } catch (error) {
      console.error("Failed to update clinical note:", error);

      setError(
        error.response?.data?.message ||
          "Unable to update clinical note."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE NOTE
  // =========================================================

  const handleDeleteNote = async (note) => {
    setMenuNoteId(null);

    const confirmed = window.confirm(
      "Are you sure you want to delete this clinical note? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/clinical-notes/${note._id}`
      );

      await loadNotes();
    } catch (error) {
      console.error("Failed to delete clinical note:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete clinical note."
      );
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getClientName = (note) => {
    if (note.client?.name) {
      return note.client.name;
    }

    if (note.clientName) {
      return note.clientName;
    }

    if (note.client?.fullName) {
      return note.client.fullName;
    }

    return "Client";
  };

  const getNoteType = (note) => {
    return (
      note.noteType ||
      note.type ||
      note.sessionType ||
      note.appointmentType ||
      "Therapy Session"
    );
  };

  const getStatus = (note) => {
    const status =
      note.status ||
      note.visibility ||
      "private";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase()
    );
  };

  const getNoteContent = (note) => {
    return (
      note.content ||
      note.note ||
      note.text ||
      note.body ||
      note.description ||
      "No note preview available."
    );
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getNoteDate = (note) => {
    return (
      note.date ||
      note.createdAt ||
      note.updatedAt ||
      note.sessionDate
    );
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return notes;
    }

    return notes.filter((note) => {
      const clientName =
        getClientName(note).toLowerCase();

      const type =
        getNoteType(note).toLowerCase();

      const content =
        getNoteContent(note).toLowerCase();

      const status =
        getStatus(note).toLowerCase();

      return (
        clientName.includes(query) ||
        type.includes(query) ||
        content.includes(query) ||
        status.includes(query)
      );
    });
  }, [notes, search]);

  const totalNotes = notes.length;

  const thisMonth = notes.filter((note) => {
    const value = getNoteDate(note);

    if (!value) return false;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const now = new Date();

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  const draftNotes = notes.filter(
    (note) =>
      String(note.status || "").toLowerCase() ===
      "draft"
  ).length;

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <header className="dashboard-header">

        <div>
          <p className="dashboard-eyebrow">
            PRACTICE
          </p>

          <h1>
            Clinical Notes
          </h1>

          <p className="dashboard-subtitle">
            Document and manage your private session notes securely.
          </p>
        </div>

        <div className="header-actions">

          <button
            className="new-button"
            type="button"
            onClick={handleOpenNewNote}
          >
            <Plus size={18} />
            New Note
          </button>

        </div>

      </header>

      {/* ERROR */}

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      {/* SECURITY */}

      <div className="notes-security-banner">

        <div className="notes-security-icon">
          <Lock size={18} />
        </div>

        <div>
          <strong>
            Your clinical notes are private
          </strong>

          <span>
            Notes are protected and accessible only to authorized users.
          </span>
        </div>

      </div>

      {/* SUMMARY */}

      <section className="notes-summary-grid">

        <div className="notes-summary-card">

          <div className="notes-summary-icon">
            <FileText size={20} />
          </div>

          <div>
            <span>Total notes</span>

            <strong>
              {loading ? "—" : totalNotes}
            </strong>
          </div>

        </div>

        <div className="notes-summary-card">

          <div className="notes-summary-icon">
            <CalendarDays size={20} />
          </div>

          <div>
            <span>This month</span>

            <strong>
              {loading ? "—" : thisMonth}
            </strong>
          </div>

        </div>

        <div className="notes-summary-card">

          <div className="notes-summary-icon">
            <Clock3 size={20} />
          </div>

          <div>
            <span>Draft notes</span>

            <strong>
              {loading ? "—" : draftNotes}
            </strong>
          </div>

        </div>

      </section>

      {/* NOTES */}

      <div className="dashboard-card notes-card">

        <div className="notes-toolbar">

          <div>
            <h2>
              Recent clinical notes
            </h2>

            <p>
              {loading
                ? "Loading clinical notes..."
                : `${filteredNotes.length} notes shown`}
            </p>
          </div>

          <div className="notes-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

        </div>

        <div className="notes-list">

          {loading ? (

            <div className="empty-state">
              Loading clinical notes...
            </div>

          ) : filteredNotes.length === 0 ? (

            <div className="empty-state">
              {search
                ? "No clinical notes match your search."
                : "No clinical notes found."}
            </div>

          ) : (

            filteredNotes.map((note) => {

              const clientName =
                getClientName(note);

              const status =
                getStatus(note);

              const noteDate =
                getNoteDate(note);

              return (
                <div
                  className="clinical-note-row"
                  key={
                    note._id ||
                    note.id ||
                    `${clientName}-${noteDate}`
                  }
                >

                  <div className="note-client-avatar">
                    {clientName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="clinical-note-main">

                    <div className="clinical-note-title">

                      <strong>
                        {clientName}
                      </strong>

                      <span
                        className={`note-status ${
                          status.toLowerCase() === "draft"
                            ? "draft"
                            : ""
                        }`}
                      >
                        {status}
                      </span>

                    </div>

                    <span className="clinical-note-type">
                      {getNoteType(note)}
                    </span>

                    <p>
                      {getNoteContent(note)}
                    </p>

                    <div className="clinical-note-meta">

                      <span>
                        <CalendarDays size={12} />
                        {formatDate(noteDate)}
                      </span>

                      <span>
                        <Clock3 size={12} />

                        {formatTime(
                          note.sessionTime ||
                          note.time ||
                          noteDate
                        )}
                      </span>

                    </div>

                  </div>

                  {/* MENU */}

                  <div
                    style={{
                      position: "relative"
                    }}
                  >

                    <button
                      className="note-menu"
                      title="More options"
                      type="button"
                      onClick={() => {
                        setMenuNoteId(
                          menuNoteId === note._id
                            ? null
                            : note._id
                        );
                      }}
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {menuNoteId === note._id && (

                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "42px",
                          width: "155px",
                          background: "#ffffff",
                          border: "1px solid #e2eceb",
                          borderRadius: "10px",
                          boxShadow:
                            "0 12px 30px rgba(15, 23, 42, 0.14)",
                          padding: "6px",
                          zIndex: 50
                        }}
                      >

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenNote(note)
                          }
                          style={menuItemStyle}
                        >
                          View note
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEditNote(note)
                          }
                          style={menuItemStyle}
                        >
                          Edit note
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteNote(note)
                          }
                          style={{
                            ...menuItemStyle,
                            color: "#c24141"
                          }}
                        >
                          Delete note
                        </button>

                      </div>
                    )}

                  </div>

                  {/* OPEN */}

                  <button
                    className="note-open"
                    type="button"
                    onClick={() =>
                      handleOpenNote(note)
                    }
                    disabled={loadingNote}
                  >
                    {loadingNote
                      ? "Opening..."
                      : "Open"}

                    {!loadingNote && (
                      <ChevronRight size={15} />
                    )}
                  </button>

                </div>
              );
            })

          )}

        </div>

        <div className="notes-footer">

          <span>
            {loading
              ? "Loading..."
              : `Showing ${filteredNotes.length} of ${totalNotes} notes`}
          </span>

          <button
            className="view-all-button"
            type="button"
          >
            View all notes
            <ChevronRight size={15} />
          </button>

        </div>

      </div>

      {/* =====================================================
          NEW NOTE MODAL
      ===================================================== */}

      {showNewNote && (

        <div style={overlayStyle}>

          <div style={modalStyle}>

            <ModalHeader
              title="New Clinical Note"
              subtitle="Add a private note for a client session."
              onClose={handleCloseNewNote}
            />

            <form onSubmit={handleCreateNote}>

              <FormField label="Client">

                <select
                  name="clientId"
                  value={form.clientId}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="">
                    Select a client
                  </option>

                  {clients.map((client) => (
                    <option
                      key={client._id || client.id}
                      value={client._id || client.id}
                    >
                      {client.name} — {client.email}
                    </option>
                  ))}

                </select>

              </FormField>

              <FormField label="Note Type">

                <select
                  name="noteType"
                  value={form.noteType}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="session">
                    Session
                  </option>

                  <option value="assessment">
                    Assessment
                  </option>

                  <option value="follow_up">
                    Follow-up
                  </option>

                  <option value="progress">
                    Progress Note
                  </option>

                  <option value="general">
                    General
                  </option>
                </select>

              </FormField>

              <FormField label="Title">

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Initial consultation"
                  required
                  style={inputStyle}
                />

              </FormField>

              <FormField label="Clinical Note">

                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder="Write your private session note..."
                  required
                  rows={8}
                  style={{
                    ...inputStyle,
                    height: "auto",
                    padding: "13px",
                    resize: "vertical",
                    lineHeight: 1.6
                  }}
                />

              </FormField>

              <FormField label="Visibility">

                <select
                  name="visibility"
                  value={form.visibility}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="private">
                    Private
                  </option>

                  <option value="shared">
                    Shared
                  </option>
                </select>

              </FormField>

              <FormActions
                onCancel={handleCloseNewNote}
                saving={saving}
                text="Save Clinical Note"
              />

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          EDIT NOTE MODAL
      ===================================================== */}

      {showEditNote && selectedNote && (

        <div style={overlayStyle}>

          <div style={modalStyle}>

            <ModalHeader
              title="Edit Clinical Note"
              subtitle="Update the selected clinical note."
              onClose={handleCloseEditNote}
            />

            <form onSubmit={handleUpdateNote}>

              <FormField label="Client">

                <input
                  type="text"
                  value={
                    selectedNote.client?.name ||
                    selectedNote.clientName ||
                    "Client"
                  }
                  disabled
                  style={{
                    ...inputStyle,
                    background: "#f4f8f8",
                    color: "#71808a"
                  }}
                />

              </FormField>

              <FormField label="Note Type">

                <select
                  name="noteType"
                  value={form.noteType}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="session">
                    Session
                  </option>

                  <option value="assessment">
                    Assessment
                  </option>

                  <option value="follow_up">
                    Follow-up
                  </option>

                  <option value="progress">
                    Progress Note
                  </option>

                  <option value="general">
                    General
                  </option>
                </select>

              </FormField>

              <FormField label="Title">

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />

              </FormField>

              <FormField label="Clinical Note">

                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  required
                  rows={8}
                  style={{
                    ...inputStyle,
                    height: "auto",
                    padding: "13px",
                    resize: "vertical",
                    lineHeight: 1.6
                  }}
                />

              </FormField>

              <FormField label="Visibility">

                <select
                  name="visibility"
                  value={form.visibility}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="private">
                    Private
                  </option>

                  <option value="shared">
                    Shared
                  </option>
                </select>

              </FormField>

              <FormActions
                onCancel={handleCloseEditNote}
                saving={saving}
                text="Update Clinical Note"
              />

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          VIEW NOTE MODAL
      ===================================================== */}

      {selectedNote && !showEditNote && (

        <div
          style={overlayStyle}
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseNote();
            }
          }}
        >

          <div style={modalStyle}>

            <ModalHeader
              title={
                selectedNote.title ||
                "Clinical Note"
              }
              subtitle={
                selectedNote.client?.name ||
                selectedNote.clientName ||
                "Client"
              }
              onClose={handleCloseNote}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "22px",
                flexWrap: "wrap"
              }}
            >

              <span style={badgeStyle}>
                {selectedNote.noteType ||
                  "Session"}
              </span>

              <span style={secondaryBadgeStyle}>
                {selectedNote.visibility ||
                  "Private"}
              </span>

              <span style={secondaryBadgeStyle}>
                {formatDate(
                  selectedNote.createdAt ||
                  selectedNote.date
                )}
              </span>

            </div>

            <div
              style={{
                background: "#f8fbfb",
                border: "1px solid #e2eceb",
                borderRadius: "12px",
                padding: "20px",
                color: "#294952",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap"
              }}
            >
              {selectedNote.content ||
                selectedNote.note ||
                "No content available."}
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "flex-end"
              }}
            >

              <button
                type="button"
                onClick={handleCloseNote}
                style={cancelButtonStyle}
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// =========================================================
// SMALL UI COMPONENTS
// =========================================================

function ModalHeader({
  title,
  subtitle,
  onClose
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "24px"
      }}
    >
      <div>

        <p
          style={{
            margin: "0 0 6px",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "1.2px",
            color: "#258f89"
          }}
        >
          CLINICAL NOTE
        </p>

        <h2
          style={{
            margin: 0,
            fontSize: "25px",
            color: "#123d4a"
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: "7px 0 0",
            color: "#71808a",
            fontSize: "14px"
          }}
        >
          {subtitle}
        </p>

      </div>

      <button
        type="button"
        onClick={onClose}
        style={closeButtonStyle}
      >
        <X size={19} />
      </button>

    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: "18px" }}>

      <label
        style={{
          display: "block",
          marginBottom: "7px",
          fontSize: "14px",
          fontWeight: 600,
          color: "#173f4b"
        }}
      >
        {label}
      </label>

      {children}

    </div>
  );
}

function FormActions({
  onCancel,
  saving,
  text
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px"
      }}
    >

      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        style={cancelButtonStyle}
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={saving}
        style={{
          height: "44px",
          padding: "0 20px",
          border: "none",
          borderRadius: "10px",
          background: saving
            ? "#a9c8c5"
            : "#2f918a",
          color: "#ffffff",
          fontWeight: 700,
          cursor: saving
            ? "not-allowed"
            : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        <Save size={17} />

        {saving ? "Saving..." : text}
      </button>

    </div>
  );
}

// =========================================================
// STYLES
// =========================================================

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  zIndex: 1000
};

const modalStyle = {
  width: "100%",
  maxWidth: "680px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#ffffff",
  borderRadius: "18px",
  boxShadow:
    "0 24px 70px rgba(15, 23, 42, 0.22)",
  padding: "28px"
};

const inputStyle = {
  width: "100%",
  height: "46px",
  border: "1px solid #d5e3e2",
  borderRadius: "10px",
  padding: "0 13px",
  fontSize: "14px",
  color: "#173f4b",
  background: "#ffffff",
  outline: "none",
  boxSizing: "border-box"
};

const closeButtonStyle = {
  border: "none",
  background: "#f1f7f6",
  width: "38px",
  height: "38px",
  borderRadius: "10px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#49646d"
};

const cancelButtonStyle = {
  height: "44px",
  padding: "0 18px",
  border: "1px solid #d5e3e2",
  borderRadius: "10px",
  background: "#ffffff",
  color: "#49646d",
  fontWeight: 600,
  cursor: "pointer"
};

const menuItemStyle = {
  width: "100%",
  border: "none",
  background: "transparent",
  padding: "10px 12px",
  textAlign: "left",
  borderRadius: "7px",
  cursor: "pointer",
  color: "#294952",
  fontSize: "14px"
};

const badgeStyle = {
  padding: "6px 10px",
  borderRadius: "20px",
  background: "#e8f5f3",
  color: "#237b76",
  fontSize: "12px",
  fontWeight: 600
};

const secondaryBadgeStyle = {
  padding: "6px 10px",
  borderRadius: "20px",
  background: "#f1f5f9",
  color: "#52636b",
  fontSize: "12px"
};

export default ClinicalNotes;