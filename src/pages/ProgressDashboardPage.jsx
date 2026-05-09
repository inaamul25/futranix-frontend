import { motion } from "framer-motion";
import { BookMarked, ChartSpline, CircleDollarSign, Users2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import CourseCard from "../components/CourseCard";
import SkeletonCard from "../components/ui/SkeletonCard";

export default function ProgressDashboardPage() {
  const [dashboard, setDashboard] = useState({ enrolledCourses: [], recommendedCourses: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/progress/dashboard")
      .then(({ data }) => setDashboard(data))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ([
    { label: "Active courses", value: dashboard.enrolledCourses.length, icon: BookMarked },
    { label: "Average completion", value: `${Math.round((dashboard.enrolledCourses.reduce((sum, item) => sum + item.completionPercentage, 0) / (dashboard.enrolledCourses.length || 1)) || 0)}%`, icon: ChartSpline },
    { label: "Recommendations", value: dashboard.recommendedCourses.length, icon: Users2 },
    { label: "Momentum score", value: "A+", icon: CircleDollarSign }
  ]), [dashboard]);

  return (
    <section className="page-stack">
      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1 className="player-title">A focused cockpit for your learning momentum.</h1>
          </div>
        </div>
        <div className="stats-grid">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.article
                key={stat.label}
                className="premium-card stat-card"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <span className="stat-icon"><Icon size={18} /></span>
                <strong>{stat.value}</strong>
                <p>{stat.label}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Continue learning</p>
            <h2>Pick up exactly where you left off</h2>
          </div>
        </div>
        <div className="grid compact-grid">
          {loading
            ? Array.from({ length: 3 }, (_, index) => <SkeletonCard key={index} />)
            : dashboard.enrolledCourses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={{ ...course, id: course.courseId, creatorName: "Your instructor", price: 0, description: course.title }}
                />
              ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recommended next</p>
            <h2>Smart suggestions based on your current path</h2>
          </div>
        </div>
        <div className="grid compact-grid">
          {loading
            ? Array.from({ length: 3 }, (_, index) => <SkeletonCard key={index} />)
            : dashboard.recommendedCourses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={{ ...course, id: course.courseId, creatorName: "Recommended", price: 0, description: course.title }}
                />
              ))}
        </div>
      </section>
    </section>
  );
}
