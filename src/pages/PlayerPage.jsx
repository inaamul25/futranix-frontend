import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import client from "../api/client";

export default function PlayerPage() {
  const { lessonId } = useParams();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [question, setQuestion] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [videoError, setVideoError] = useState("");

  const loadComments = async () => {
    const { data } = await client.get(`/comments/lesson/${lessonId}`);
    setComments(data);
  };

  useEffect(() => {
    loadComments();
  }, [lessonId]);

  useEffect(() => {
    let objectUrl = "";

    const loadVideo = async () => {
      setLoadingVideo(true);
      setVideoError("");
      try {
        const { data } = await client.get(`/lessons/${lessonId}/stream`, {
          responseType: "blob"
        });
        objectUrl = URL.createObjectURL(data);
        setVideoUrl(objectUrl);
      } catch (err) {
        setVideoError(err.response?.data?.message || "Unable to stream this video. Make sure you are enrolled in the course.");
      } finally {
        setLoadingVideo(false);
      }
    };

    loadVideo();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [lessonId]);

  const updateProgress = async (event) => {
    await client.post("/progress", {
      lessonId: Number(lessonId),
      completed: event.type === "ended",
      lastWatchedSecond: Math.floor(event.target.currentTime)
    });
  };

  const submitComment = async (event) => {
    event.preventDefault();
    await client.post("/comments", { lessonId: Number(lessonId), content, question });
    setContent("");
    setQuestion(false);
    loadComments();
  };

  return (
    <section className="player-page">
      <div className="player-page-head">
        <div>
          <p className="eyebrow">Futranix Academy lesson room</p>
          <h1 className="player-title">Watch, reflect, and discuss without losing momentum.</h1>
        </div>
        <p className="player-copy">
          Stream the lesson securely, post questions beside the video, and keep your learning
          context in one focused workspace.
        </p>
      </div>

      <div className="player-layout">
        <div className="card player-stage">
          {loadingVideo ? (
            <div className="empty-state">
              <strong>Loading lesson video</strong>
              <p>Preparing secure playback for this lesson.</p>
            </div>
          ) : videoError ? (
            <div className="empty-state">
              <strong>Video unavailable</strong>
              <p className="error-text">{videoError}</p>
            </div>
          ) : (
            <video className="video-player" controls onTimeUpdate={updateProgress} onEnded={updateProgress}>
              <source src={videoUrl} type="video/mp4" />
            </video>
          )}
        </div>

        <aside className="card discussion-panel player-discussion">
          <div className="discussion-header">
            <div>
              <p className="eyebrow">Live notes</p>
              <h2>Lesson discussion</h2>
            </div>
            <span className="pill">{comments.length} comment{comments.length === 1 ? "" : "s"}</span>
          </div>

          <form onSubmit={submitComment} className="discussion-composer">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ask a question, capture an insight, or leave a timestamped note"
            />
            <div className="discussion-actions">
              <label className="toggle">
                <input type="checkbox" checked={question} onChange={(e) => setQuestion(e.target.checked)} />
                <span>Mark as Q&A</span>
              </label>
              <button className="primary-button discussion-submit" type="submit">Post note</button>
            </div>
          </form>

          <div className="comment-list">
            {comments.map((comment) => (
              <div className="comment" key={comment.id}>
                <div className="comment-head">
                  <strong>{comment.userName}</strong>
                  {comment.question && <span className="pill">Q&A</span>}
                </div>
                <p>{comment.content}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
