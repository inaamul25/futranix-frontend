import { ArrowRight, BrainCircuit, LayoutTemplate, Sparkles, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import client from "../api/client";
import CourseCard from "../components/CourseCard";
import SkeletonCard from "../components/ui/SkeletonCard";
import { useAuth } from "../context/AuthContext";

const categoryMeta = {
  Programming: "Build production-ready developer fluency",
  AI: "Applied intelligence tracks and workflows",
  Design: "Craft modern digital experiences",
  Marketing: "Performance growth with systems thinking"
};

export default function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { auth } = useAuth();

  const search = searchParams.get("search") || "";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseResponse, pathResponse] = await Promise.all([
          client.get("/courses", { params: search ? { search } : {} }),
          client.get("/learning-paths")
        ]);
        setCourses(courseResponse.data);
        setPaths(pathResponse.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search]);

  const featuredCourses = courses.slice(0, 6);
  const continueLearning = courses.filter((course) => course.enrolled).slice(0, 3);
  const categories = useMemo(() => [...new Set(courses.map((course) => course.category))], [courses]);

  const filterByCategory = (category) => {
    const params = new URLSearchParams(searchParams);
    params.set("search", category);
    setSearchParams(params);
  };

  return (
    <section className="page-stack">
      <motion.section
        className="hero hero-premium"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      >
        <div className="hero-content">
          <p className="eyebrow">Futranix Academy</p>
          <h1>
            Upgrade Your Skills with <span className="gradient-text">AI-Powered Learning</span>
          </h1>
          <p className="hero-copy">
            Move through beautifully structured modular programs, immersive lesson rooms, and
            clear progress pathways designed for serious modern careers.
          </p>
          <div className="hero-actions">
            <Link to={auth ? "/dashboard" : "/auth"} className="primary-button">
              {auth ? "Continue learning" : "Start learning"}
            </Link>
            <a href="#featured-programs" className="ghost-button">Browse featured tracks</a>
          </div>
          <div className="hero-metrics">
            <div className="hero-metric">
              <span>Structured courses</span>
              <strong>{courses.length || 12}+</strong>
            </div>
            <div className="hero-metric">
              <span>Pathway journeys</span>
              <strong>{paths.length || 4}</strong>
            </div>
            <div className="hero-metric">
              <span>Creator-led modules</span>
              <strong>Premium</strong>
            </div>
          </div>
        </div>

        <div className="hero-preview">
          <motion.div className="floating-panel hero-dashboard" animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
            <div className="panel-chip"><Sparkles size={16} /> Smart path engine</div>
            <h3>Adaptive learning cockpit</h3>
            <p>Track progress, jump into the next lesson, and get recommended pathways at the right time.</p>
            <div className="preview-stats">
              <div><BrainCircuit size={16} /><span>AI-assisted pacing</span></div>
              <div><LayoutTemplate size={16} /><span>Modular curriculum</span></div>
              <div><Trophy size={16} /><span>Visible mastery progress</span></div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {auth && continueLearning.length > 0 && (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Momentum</p>
              <h2>Continue learning</h2>
            </div>
          </div>
          <div className="grid compact-grid">
            {continueLearning.map((course) => <CourseCard key={course.id} course={course} />)}
          </div>
        </section>
      )}

      <section className="section-block" id="featured-programs">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured programs</p>
            <h2>Curated tracks with premium structure</h2>
          </div>
          {search && <span className="pill">Filtered by: {search}</span>}
        </div>
        <div className="horizontal-scroll">
          {loading
            ? Array.from({ length: 4 }, (_, index) => <SkeletonCard key={index} className="featured-skeleton" />)
            : featuredCourses.map((course) => <CourseCard key={course.id} course={course} featured />)}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Categories</p>
            <h2>Choose your capability lane</h2>
          </div>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <button key={category} className="category-card" onClick={() => filterByCategory(category)}>
              <span>{category}</span>
              <p>{categoryMeta[category] || "A modular path designed for focused progression."}</p>
              <ArrowRight size={18} />
            </button>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Learning paths</p>
            <h2>Stack complete journeys, not random lessons</h2>
          </div>
        </div>
        <div className="grid compact-grid">
          {paths.map((path) => (
            <motion.article
              key={path.id}
              className="premium-card path-card"
              whileHover={{ y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <p className="eyebrow">Pathway</p>
              <h3>{path.title}</h3>
              <p>{path.description}</p>
              <div className="chips">
                {path.courses.slice(0, 3).map((course) => <span className="pill" key={course.id}>{course.title}</span>)}
              </div>
              <Link to="/paths" className="text-link">View pathway</Link>
            </motion.article>
          ))}
        </div>
      </section>
    </section>
  );
}
