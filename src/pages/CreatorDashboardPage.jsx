import { useEffect, useState } from "react";
import client from "../api/client";
import { useToast } from "../context/ToastContext";

export default function CreatorDashboardPage() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", price: 0, category: "" });
  const [modules, setModules] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [generatingModules, setGeneratingModules] = useState(false);
  const [savingStructure, setSavingStructure] = useState(false);
  const toast = useToast();

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const { data } = await client.get("/courses");
      setCourses(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to load your courses right now.");
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const createCourse = async (event) => {
    event.preventDefault();
    try {
      setCreatingCourse(true);
      setMessage("");
      toast.info("Creating course shell...");
      const payload = new FormData();
      payload.append("course", new Blob([JSON.stringify(form)], { type: "application/json" }));
      const { data } = await client.post("/courses", payload, { headers: { "Content-Type": "multipart/form-data" } });
      setForm({ title: "", description: "", price: 0, category: "" });
      setSelectedCourseId(String(data.id));
      setMessage("Course shell created. Next: upload videos, review the generated modules, then save the structure.");
      toast.success("Course shell created successfully.");
      await loadCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to create the course shell.");
    } finally {
      setCreatingCourse(false);
    }
  };

  const autoGenerate = async () => {
    try {
      setGeneratingModules(true);
      setMessage("");
      toast.info("Uploading videos and generating draft modules...");
      const payload = new FormData();
      files.forEach((file) => payload.append("videos", file));
      const { data } = await client.post(`/upload/${selectedCourseId}/videos`, payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setModules(data.modules);
      setMessage("Videos were uploaded to storage and grouped into draft modules. Final step: click Save generated structure to publish them into the course.");
      toast.success("Draft modules generated successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to upload videos and generate modules.");
    } finally {
      setGeneratingModules(false);
    }
  };

  const saveStructure = async () => {
    try {
      setSavingStructure(true);
      setMessage("");
      toast.info("Saving generated structure...");
      await client.put(`/courses/${selectedCourseId}/structure`, modules);
      setMessage("Course structure saved. Modules and lesson video metadata are now attached to this course.");
      toast.success("Course structure saved.");
      await loadCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to save the generated structure.");
    } finally {
      setSavingStructure(false);
    }
  };

  return (
    <section className="creator-layout">
      <form className="card form-card creator-panel" onSubmit={createCourse}>
        <div className="panel-head">
          <div>
            <p className="eyebrow">Futranix studio</p>
            <h2>Create a course</h2>
          </div>
          <p className="panel-copy">Start with a clean course shell, then turn raw videos into ordered modules.</p>
        </div>
        <div className="creator-steps">
          <span className="pill">1. Create shell</span>
          <span className="pill">2. Upload videos</span>
          <span className="pill">3. Save generated structure</span>
        </div>
        <div className="creator-form-grid">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="creator-description" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        </div>
        <button className="primary-button creator-action" type="submit" disabled={creatingCourse}>
          {creatingCourse ? "Creating shell..." : "Create course shell"}
        </button>
      </form>

      <div className="card form-card creator-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Automation ready</p>
            <h2>Studio upload pipeline</h2>
          </div>
          <p className="panel-copy">Select a course, upload multiple MP4s, and let the platform draft the module structure.</p>
        </div>
        {message && <p className="success-text">{message}</p>}
        {loadingCourses && <p className="panel-copy">Loading your course list...</p>}
        <div className="upload-controls">
          <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
            <option value="">Select course</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
          <label className="file-drop">
            <span>{files.length > 0 ? `${files.length} file(s) selected` : "Choose MP4 files"}</span>
            <input type="file" accept="video/mp4" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
          </label>
        </div>
        <button className="ghost-button upload-action" type="button" onClick={autoGenerate} disabled={!selectedCourseId || files.length === 0 || generatingModules}>
          {generatingModules ? "Generating modules..." : "Auto-generate modules"}
        </button>
        <div className="module-editor">
          {modules.length === 0 && (
            <div className="card nested-card empty-state">
              <strong>No generated modules yet</strong>
              <p>After uploading videos, this area will show the draft module and lesson structure before you save it into the course.</p>
            </div>
          )}
          {modules.map((module, moduleIndex) => (
            <div className="card nested-card" key={`${module.title}-${moduleIndex}`}>
              <input value={module.title} onChange={(e) => {
                const copy = [...modules];
                copy[moduleIndex].title = e.target.value;
                setModules(copy);
              }} />
              {module.lessons.map((lesson, lessonIndex) => (
                <input
                  key={`${lesson.title}-${lessonIndex}`}
                  value={lesson.title}
                  onChange={(e) => {
                    const copy = [...modules];
                    copy[moduleIndex].lessons[lessonIndex].title = e.target.value;
                    setModules(copy);
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        {modules.length > 0 && (
          <button className="primary-button creator-action" type="button" onClick={saveStructure} disabled={savingStructure}>
            {savingStructure ? "Saving structure..." : "Save generated structure"}
          </button>
        )}
      </div>
    </section>
  );
}
