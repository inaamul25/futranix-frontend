import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Link2,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  School,
  UserRound
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const tabLabels = ["Profile", "Attendance", "Subscription", "Referral", "Certificate"];

const emptyProfile = {
  userId: null,
  fullName: "",
  email: "",
  profileImageUrl: "",
  phone: "",
  alternatePhone: "",
  gender: "",
  dateOfBirth: "",
  experience: "",
  careerGap: 0,
  currentState: "",
  currentCity: "",
  preferredLocation: "",
  githubUrl: "",
  linkedinUrl: "",
  resumeUrl: "",
  roles: []
};

export default function MyProfilePage() {
  const { updateProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("Profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [editingSummary, setEditingSummary] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [profile, setProfile] = useState(emptyProfile);
  const [summaryForm, setSummaryForm] = useState({
    fullName: "",
    phone: "",
    alternatePhone: "",
    gender: "",
    dateOfBirth: "",
    experience: ""
  });
  const [detailForm, setDetailForm] = useState({
    currentState: "",
    currentCity: "",
    preferredLocation: "",
    githubUrl: "",
    linkedinUrl: "",
    resumeUrl: "",
    careerGap: 0
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data } = await client.get("/profile/me");
      setProfile(data);
      setSummaryForm({
        fullName: data.fullName || "",
        phone: data.phone || "",
        alternatePhone: data.alternatePhone || "",
        gender: data.gender || "",
        dateOfBirth: data.dateOfBirth || "",
        experience: data.experience || ""
      });
      setDetailForm({
        currentState: data.currentState || "",
        currentCity: data.currentCity || "",
        preferredLocation: data.preferredLocation || "",
        githubUrl: data.githubUrl || "",
        linkedinUrl: data.linkedinUrl || "",
        resumeUrl: data.resumeUrl || "",
        careerGap: data.careerGap ?? 0
      });
      updateProfile({
        fullName: data.fullName,
        email: data.email,
        profileImageUrl: data.profileImageUrl,
        roles: data.roles
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl(profile.profileImageUrl || "");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile, profile.profileImageUrl]);

  const handleTabClick = (tab) => {
    if (tab !== "Profile") {
      toast.info(`${tab} will be added soon.`);
      return;
    }
    setActiveTab(tab);
  };

  const handleAvatarPick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setAvatarFile(file);
    toast.info("Profile photo selected. Click Save to upload it.");
  };

  const submitProfileUpdate = async (nextSummary, nextDetails) => {
    try {
      setSaving(true);
      const payload = new FormData();
      payload.append("profile", JSON.stringify({
        fullName: nextSummary.fullName,
        phone: nextSummary.phone,
        alternatePhone: nextSummary.alternatePhone,
        gender: nextSummary.gender,
        dateOfBirth: nextSummary.dateOfBirth,
        experience: nextSummary.experience,
        careerGap: Number(nextDetails.careerGap || 0),
        currentState: nextDetails.currentState,
        currentCity: nextDetails.currentCity,
        preferredLocation: nextDetails.preferredLocation,
        githubUrl: nextDetails.githubUrl,
        linkedinUrl: nextDetails.linkedinUrl,
        resumeUrl: nextDetails.resumeUrl
      }));
      if (avatarFile) {
        payload.append("avatar", avatarFile);
      }

      const { data } = await client.put("/profile/me", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setProfile(data);
      setAvatarFile(null);
      setEditingSummary(false);
      setEditingDetails(false);
      updateProfile({
        fullName: data.fullName,
        email: data.email,
        profileImageUrl: data.profileImageUrl,
        roles: data.roles
      });
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to save profile details.");
    } finally {
      setSaving(false);
    }
  };

  const saveSummary = () => submitProfileUpdate(summaryForm, detailForm);
  const saveDetails = () => submitProfileUpdate(summaryForm, detailForm);

  const display = (value, fallback = "Not added yet") => value?.toString().trim() ? value : fallback;
  const avatarInitial = profile.fullName?.trim()?.[0] || "U";

  if (loading) {
    return (
      <section className="profile-page-shell">
        <div className="profile-page-head">
          <button type="button" className="profile-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
            <span>My Profile</span>
          </button>
        </div>
        <div className="card empty-state">
          <strong>Loading profile</strong>
          <p>Fetching your saved account details.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page-shell">
      <div className="profile-page-head">
        <button type="button" className="profile-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
          <span>My Profile</span>
        </button>
      </div>

      <div className="profile-tabs">
        {tabLabels.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`profile-tab ${activeTab === tab ? "profile-tab-active" : ""}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="profile-card profile-summary-card">
        <div className="profile-avatar-block">
          <div className="profile-avatar-ring">
              <div className="profile-avatar-large">
              {avatarPreviewUrl ? (
                <img src={avatarPreviewUrl} alt={profile.fullName} className="profile-avatar-image" />
              ) : (
                <span className="profile-avatar-fallback profile-avatar-large-fallback">{avatarInitial}</span>
              )}
            </div>
          </div>
          <button type="button" className="profile-strength-pill" onClick={handleAvatarPick}>
            Upload photo
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="account-avatar-input"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="profile-summary-main">
          <div className="profile-summary-top">
            <div>
              <div className="profile-title-row">
                <h2>{display(profile.fullName, "YOUR NAME").toUpperCase()}</h2>
              </div>

              {editingSummary ? (
                <div className="profile-edit-grid">
                  <input placeholder="Full name" value={summaryForm.fullName} onChange={(event) => setSummaryForm((current) => ({ ...current, fullName: event.target.value }))} />
                  <input placeholder="Phone" value={summaryForm.phone} onChange={(event) => setSummaryForm((current) => ({ ...current, phone: event.target.value }))} />
                  <input placeholder="Alternate phone" value={summaryForm.alternatePhone} onChange={(event) => setSummaryForm((current) => ({ ...current, alternatePhone: event.target.value }))} />
                  <input placeholder="Gender" value={summaryForm.gender} onChange={(event) => setSummaryForm((current) => ({ ...current, gender: event.target.value }))} />
                  <input placeholder="Date of birth" value={summaryForm.dateOfBirth} onChange={(event) => setSummaryForm((current) => ({ ...current, dateOfBirth: event.target.value }))} />
                  <input placeholder="Experience" value={summaryForm.experience} onChange={(event) => setSummaryForm((current) => ({ ...current, experience: event.target.value }))} />
                  <div className="profile-inline-actions">
                    <button type="button" className="primary-button" onClick={saveSummary} disabled={saving}>Save</button>
                    <button type="button" className="ghost-button" onClick={() => setEditingSummary(false)} disabled={saving}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="profile-meta-grid">
                  <span><Mail size={16} /> {display(profile.email)}</span>
                  <span><UserRound size={16} /> {display(profile.gender)}</span>
                  <span><CalendarDays size={16} /> {display(profile.dateOfBirth)}</span>
                  <span><Phone size={16} /> {display(profile.phone)}</span>
                  <span><Phone size={16} /> {display(profile.alternatePhone)}</span>
                  <span><School size={16} /> {display(profile.experience)}</span>
                </div>
              )}
            </div>

            {!editingSummary && (
              <button type="button" className="profile-edit-link" onClick={() => setEditingSummary(true)}>
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-card profile-details-card">
        <div className="profile-section-head">
          <div>
            <span className="profile-section-bar" />
            <h3>Generic Details</h3>
          </div>
          {!editingDetails && (
            <button type="button" className="profile-edit-link" onClick={() => setEditingDetails(true)}>
              Edit
            </button>
          )}
        </div>

        {editingDetails ? (
          <div className="profile-edit-grid">
            <input placeholder="Career gap" type="number" value={detailForm.careerGap} onChange={(event) => setDetailForm((current) => ({ ...current, careerGap: Number(event.target.value) }))} />
            <input placeholder="Current state" value={detailForm.currentState} onChange={(event) => setDetailForm((current) => ({ ...current, currentState: event.target.value }))} />
            <input placeholder="Current city" value={detailForm.currentCity} onChange={(event) => setDetailForm((current) => ({ ...current, currentCity: event.target.value }))} />
            <textarea placeholder="Preferred locations" value={detailForm.preferredLocation} onChange={(event) => setDetailForm((current) => ({ ...current, preferredLocation: event.target.value }))} />
            <input placeholder="Github URL" value={detailForm.githubUrl} onChange={(event) => setDetailForm((current) => ({ ...current, githubUrl: event.target.value }))} />
            <input placeholder="LinkedIn URL" value={detailForm.linkedinUrl} onChange={(event) => setDetailForm((current) => ({ ...current, linkedinUrl: event.target.value }))} />
            <input placeholder="Resume URL" value={detailForm.resumeUrl} onChange={(event) => setDetailForm((current) => ({ ...current, resumeUrl: event.target.value }))} />
            <div className="profile-inline-actions">
              <button type="button" className="primary-button" onClick={saveDetails} disabled={saving}>Save</button>
              <button type="button" className="ghost-button" onClick={() => setEditingDetails(false)} disabled={saving}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-detail-grid">
              <div>
                <span>Work Experience</span>
                <strong>{display(profile.experience)}</strong>
              </div>
              <div>
                <span>Career Gap</span>
                <strong>{profile.careerGap ?? 0}</strong>
              </div>
              <div>
                <span>Current State</span>
                <strong>{display(profile.currentState)}</strong>
              </div>
              <div>
                <span>Current City</span>
                <strong>{display(profile.currentCity)}</strong>
              </div>
              <div className="profile-wide-detail">
                <span>Preferred Location</span>
                <strong>{display(profile.preferredLocation)}</strong>
              </div>
            </div>

            <div className="profile-link-grid">
              {profile.githubUrl ? (
                <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="profile-link-card">
                  <Link2 size={28} />
                  <div>
                    <span>Github profile</span>
                    <strong>Open GitHub</strong>
                  </div>
                </a>
              ) : (
                <button type="button" className="profile-link-card profile-link-button" onClick={() => toast.info("Add your Github URL in profile details.")}>
                  <Link2 size={28} />
                  <div>
                    <span>Github profile</span>
                    <strong>Add Github URL</strong>
                  </div>
                </button>
              )}

              {profile.linkedinUrl ? (
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="profile-link-card">
                  <Link2 size={28} />
                  <div>
                    <span>LinkedIn profile</span>
                    <strong>Open LinkedIn</strong>
                  </div>
                </a>
              ) : (
                <button type="button" className="profile-link-card profile-link-button" onClick={() => toast.info("Add your LinkedIn URL in profile details.")}>
                  <Link2 size={28} />
                  <div>
                    <span>LinkedIn profile</span>
                    <strong>Add LinkedIn URL</strong>
                  </div>
                </button>
              )}

              {profile.resumeUrl ? (
                <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="profile-link-card">
                  <FileText size={28} />
                  <div>
                    <span>Resume</span>
                    <strong>View Resume</strong>
                  </div>
                </a>
              ) : (
                <button type="button" className="profile-link-card profile-link-button" onClick={() => toast.info("Add your resume URL in profile details.")}>
                  <FileText size={28} />
                  <div>
                    <span>Resume</span>
                    <strong>Add Resume URL</strong>
                  </div>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
