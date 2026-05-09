import { motion } from "framer-motion";
import { ArrowRight, Layers3, Route } from "lucide-react";
import { useEffect, useState } from "react";
import client from "../api/client";
import { useToast } from "../context/ToastContext";

export default function LearningPathPage() {
  const [paths, setPaths] = useState([]);
  const toast = useToast();

  useEffect(() => {
    client.get("/learning-paths").then(({ data }) => setPaths(data));
  }, []);

  const follow = async (pathId) => {
    await client.post(`/learning-paths/${pathId}/follow`);
    toast.success("Pathway saved to your dashboard.");
    const { data } = await client.get("/learning-paths");
    setPaths(data);
  };

  return (
    <section className="page-stack">
      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Pathways</p>
            <h1 className="player-title">Complete role-based journeys with clarity and momentum.</h1>
          </div>
        </div>
        <div className="grid compact-grid">
          {paths.map((path) => (
            <motion.article key={path.id} className="premium-card path-card" whileHover={{ y: -6 }} transition={{ duration: 0.22 }}>
              <div className="path-top">
                <span className="mini-pill"><Route size={14} /> Pathway</span>
                <span className="mini-pill subtle-pill"><Layers3 size={14} /> {path.courses.length} courses</span>
              </div>
              <h2>{path.title}</h2>
              <p>{path.description}</p>
              <div className="chips">
                {path.courses.map((course) => <span className="pill" key={course.id}>{course.title}</span>)}
              </div>
              <button className={path.followed ? "ghost-button" : "primary-button"} onClick={() => follow(path.id)}>
                {path.followed ? "Following" : "Follow pathway"}
                {!path.followed && <ArrowRight size={16} />}
              </button>
            </motion.article>
          ))}
        </div>
      </section>
    </section>
  );
}
