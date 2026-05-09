import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Lock, PlayCircle, Sparkles, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import client from "../api/client";
import SkeletonCard from "../components/ui/SkeletonCard";
import { useToast } from "../context/ToastContext";
import { getCourseRating } from "../hooks/useRating";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [openModule, setOpenModule] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setCourse(null);
    setError("");
    client.get(`/courses/${courseId}`)
      .then(({ data }) => {
        setCourse(data);
        setOpenModule(data.modules[0]?.id ?? null);
      })
      .catch((err) => setError(err.response?.data?.message || "Unable to load this course right now."));
  }, [courseId]);

  useEffect(() => {
    const paymentState = searchParams.get("payment");
    if (!paymentState) return;

    if (paymentState === "success") {
      toast.success("Payment successful. Course unlocked.");
    } else if (paymentState === "failed") {
      toast.error("Payment failed. Please try again.");
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("payment");
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams, toast]);

  const enroll = async () => {
    try {
      setEnrollLoading(true);
      await client.post(`/enroll/${courseId}`);
      toast.success("Enrollment completed.");
      const { data } = await client.get(`/courses/${courseId}`);
      setCourse(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to enroll right now.");
    } finally {
      setEnrollLoading(false);
    }
  };

  const createPayment = async () => {
    try {
      setPaymentLoading(true);
      const { data } = await client.post(`/payment/create-order/${courseId}`);

      if (data.sandboxMode) {
        await client.post(`/payment/mock-confirm/${data.orderId}`);
        toast.success("Mock payment completed. Course unlocked.");
        const { data: refreshedCourse } = await client.get(`/courses/${courseId}`);
        setCourse(refreshedCourse);
        return;
      }

      await launchPaytmCheckout(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to start payment right now.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const launchPaytmCheckout = async (paymentData) => {
    await loadPaytmScript(paymentData.checkoutJsUrl);

    if (!window.Paytm || !window.Paytm.CheckoutJS) {
      throw new Error("Paytm checkout SDK did not load.");
    }

    window.Paytm.CheckoutJS.init({
      root: "",
      flow: "DEFAULT",
      data: {
        orderId: paymentData.orderId,
        token: paymentData.txnToken,
        tokenType: "TXN_TOKEN",
        amount: paymentData.amount
      },
      merchant: {
        mid: paymentData.paytmMid
      },
      handler: {
        notifyMerchant: () => {}
      }
    }).then(() => {
      window.Paytm.CheckoutJS.invoke();
    });
  };

  const loadPaytmScript = (src) => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-paytm-mid-script="${src}"]`);
    if (existing) {
      if (window.Paytm?.CheckoutJS) {
        resolve();
        return;
      }
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.paytmMidScript = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load Paytm script."));
    document.body.appendChild(script);
  });

  const totals = useMemo(() => {
    if (!course) return { lessons: 0, modules: 0 };
    return {
      modules: course.modules.length,
      lessons: course.modules.reduce((sum, module) => sum + module.lessons.length, 0)
    };
  }, [course]);

  const previewDescription = useMemo(() => {
    if (!course?.description) return "";
    const compact = course.description.replace(/\s+/g, " ").trim();
    return compact.length > 190 ? `${compact.slice(0, 190).trim()}...` : compact;
  }, [course]);

  const isPaidCourse = Number(course?.price ?? 0) > 0;

  if (error) return <p className="error-text">{error}</p>;

  if (!course) {
    return (
      <section className="page-stack">
        <SkeletonCard className="detail-skeleton" />
        <SkeletonCard className="detail-skeleton" />
      </section>
    );
  }

  return (
    <section className="page-stack">
      <section className="detail-layout detail-layout-sticky">
        <div className="detail-main-column">
          <div className="premium-card detail-content">
            <div className="detail-preview">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} className="detail-thumbnail" />
              ) : (
                <div className="detail-thumbnail detail-thumbnail-fallback" />
              )}
              <div className="detail-overlay">
                <span className="eyebrow">{course.category}</span>
                <h1>{course.title}</h1>
                <p>{previewDescription}</p>
                <div className="detail-badges">
                  <span className="pill"><Star size={14} fill="currentColor" /> {getCourseRating(course.id).toFixed(1)}</span>
                  <span className="pill"><BookOpen size={14} /> {totals.modules} modules</span>
                  <span className="pill"><PlayCircle size={14} /> {totals.lessons} lessons</span>
                </div>
              </div>
            </div>

            <div className="detail-description">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">What you will get</p>
                  <h2>Structured depth, not scattered content</h2>
                </div>
              </div>
              <p className="detail-summary">{course.description}</p>
              <div className="benefit-grid">
                <div className="benefit-card"><Sparkles size={18} /><span>AI-guided modular structure</span></div>
                <div className="benefit-card"><CheckCircle2 size={18} /><span>Progress tracking with resume support</span></div>
                <div className="benefit-card"><BookOpen size={18} /><span>Ordered learning path experience</span></div>
              </div>
            </div>
          </div>

          <section className="section-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Course curriculum</p>
                <h2>Module-by-module progression</h2>
              </div>
            </div>
            <div className="module-list">
              {course.modules.length === 0 && (
                <article className="premium-card empty-state">
                  <strong>No lessons published yet</strong>
                  <p>This course shell exists, but no saved module or lesson structure is attached yet.</p>
                </article>
              )}
              {course.modules.map((module) => {
                const expanded = openModule === module.id;
                return (
                  <motion.article key={module.id} className="premium-card module-accordion" layout>
                    <button className="module-trigger" onClick={() => setOpenModule(expanded ? null : module.id)}>
                      <div>
                        <p className="eyebrow">Module {module.sortOrder + 1}</p>
                        <h3>{module.title}</h3>
                      </div>
                      <span className={`pill ${module.completed ? "pill-success" : ""}`}>{module.completed ? "Completed" : `${module.lessons.length} lessons`}</span>
                    </button>
                    {expanded && (
                      <div className="module-lesson-list">
                        {module.lessons.map((lesson) => (
                          <div className="lesson-row" key={lesson.id}>
                            <div>
                              <strong>{lesson.title}</strong>
                              <p>Resume from {lesson.lastWatchedSecond}s</p>
                            </div>
                            {course.enrolled ? (
                              <Link className="text-link" to={`/player/${lesson.id}`}>Open lesson</Link>
                            ) : (
                              <span className="muted lesson-lock"><Lock size={14} /> {isPaidCourse ? "Pay to unlock" : "Enroll to unlock"}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.article>
                );
              })}
            </div>
          </section>
        </div>

        <div className="price-rail">
          <aside className="premium-card price-card">
            <p className="eyebrow">Enrollment</p>
            <h2>Rs. {course.price}</h2>
            <p>Creator: {course.creatorName}</p>
            <div className="price-meta">
              <span className="pill">{course.completionPercentage}% completed</span>
              <span className="pill">{course.enrolled ? "Enrolled" : "Not enrolled"}</span>
            </div>
            {!course.enrolled ? (
              <div className="price-actions">
                {isPaidCourse ? (
                  <button className="primary-button" onClick={createPayment} disabled={paymentLoading}>
                    {paymentLoading ? "Starting payment..." : "Pay with Paytm"}
                  </button>
                ) : (
                  <button className="primary-button" onClick={enroll} disabled={enrollLoading}>
                    {enrollLoading ? "Enrolling..." : "Enroll now"}
                  </button>
                )}
              </div>
            ) : (
              <Link to={course.modules[0]?.lessons[0] ? `/player/${course.modules[0].lessons[0].id}` : "#"} className="primary-button">
                Continue learning
              </Link>
            )}
          </aside>
        </div>
      </section>
    </section>
  );
}
