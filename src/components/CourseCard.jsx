import { Clock3, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getCourseRating } from "../hooks/useRating";

export default function CourseCard({ course, featured = false }) {
  const rating = getCourseRating(course.id);
  const description = course.description?.length > 120 ? `${course.description.slice(0, 120)}...` : course.description;

  return (
    <motion.article
      className={`course-card premium-card ${featured ? "featured-card" : ""}`}
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ duration: 0.24, ease: "easeInOut" }}
    >
      <div className="course-media">
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="course-thumb" loading="lazy" />
        ) : (
          <div className="course-thumb course-thumb-fallback">
            <div className="thumb-orbit orbit-one" />
            <div className="thumb-orbit orbit-two" />
          </div>
        )}
        <div className="course-glow" />
        <div className="course-media-top">
          <span className="mini-pill">{course.category}</span>
          <span className="mini-pill subtle-pill">
            <TrendingUp size={14} />
            {Math.round(course.completionPercentage || 0)}%
          </span>
        </div>
      </div>
      <div className="card-body">
        <div className="card-rating">
          <span className="rating-badge">
            <Star size={14} fill="currentColor" />
            {rating.toFixed(1)}
          </span>
          <span className="duration-meta">
            <Clock3 size={14} />
            Modular journey
          </span>
        </div>
        <h3>{course.title}</h3>
        <p>{description}</p>
        <div className="card-meta">
          <span>{course.creatorName}</span>
          <strong>Rs. {course.price}</strong>
        </div>
        <div className="progress-inline">
          <div style={{ width: `${course.completionPercentage || 0}%` }} />
        </div>
        <Link to={`/courses/${course.id}`} className="text-link">Explore program</Link>
      </div>
    </motion.article>
  );
}
