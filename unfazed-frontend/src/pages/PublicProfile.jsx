import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  ShieldCheck,
  Languages,
  HeartHandshake
} from "lucide-react";
import api from "../services/api";
import "./PublicProfile.css";

const PublicProfile = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get(
          `/therapist/public/${slug}`
        );

        setTherapist(response.data.therapist);
      } catch (err) {
        console.error(
          "Profile loading error:",
          err
        );

        setError(
          "Unable to load this therapist profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [slug]);

  if (loading) {
    return (
      <div className="public-profile">
        <div className="profile-container">
          <div className="profile-loading">
            Loading therapist profile...
          </div>
        </div>
      </div>
    );
  }

  if (error || !therapist) {
    return (
      <div className="public-profile">
        <div className="profile-container">
          <div className="profile-error">
            <h2>Profile unavailable</h2>
            <p>
              {error ||
                "This therapist profile could not be found."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const initials = therapist.name
    ? therapist.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "TT";

  return (
    <div className="public-profile">
      <div className="profile-container">

        {/* Header */}
        <header className="profile-header">
          <div className="profile-avatar">
            {initials}
          </div>

          <div className="profile-header-content">
            <div className="profile-eyebrow">
              UNFAZED THERAPIST PROFILE
            </div>

            <h1>{therapist.name}</h1>

            <p className="profile-role">
              Mental Health Professional
            </p>

            <div className="profile-trust">
              <ShieldCheck size={17} />
              <span>
                Private and confidential sessions
              </span>
            </div>
          </div>
        </header>


        {/* Main Grid */}
        <div className="profile-grid">

          {/* Left Content */}
          <main className="profile-main">

            {/* About */}
            <section className="profile-section">
              <div className="section-label">
                ABOUT
              </div>

              <h2>About {therapist.name?.split(" ")[0]}</h2>

              <p className="profile-bio">
                {therapist.bio ||
                  "A safe and supportive space to talk, reflect and work toward your wellbeing."}
              </p>
            </section>


            {/* Areas of Focus */}
            <section className="profile-section">
              <div className="section-label">
                AREAS OF FOCUS
              </div>

              <h2>Areas of focus</h2>

              {therapist.specializations?.length ? (
                <div className="profile-tags">
                  {therapist.specializations.map(
                    (specialization) => (
                      <span
                        className="profile-tag"
                        key={specialization}
                      >
                        {specialization}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p className="profile-muted">
                  Areas of focus will be updated soon.
                </p>
              )}
            </section>


            {/* Languages */}
            <section className="profile-section">
              <div className="section-label">
                COMMUNICATION
              </div>

              <h2>Languages</h2>

              <div className="language-list">
                <Languages size={19} />

                <div>
                  {therapist.languages?.length ? (
                    therapist.languages.join(" • ")
                  ) : (
                    "English"
                  )}
                </div>
              </div>
            </section>


            {/* What to Expect */}
            <section className="profile-section">
              <div className="section-label">
                SESSIONS
              </div>

              <h2>What to expect</h2>

              <div className="expect-list">

                <div className="expect-item">
                  <div className="expect-icon">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <strong>
                      Individual sessions
                    </strong>

                    <span>
                      One-to-one confidential sessions
                    </span>
                  </div>
                </div>


                <div className="expect-item">
                  <div className="expect-icon">
                    <Clock3 size={19} />
                  </div>

                  <div>
                    <strong>
                      Flexible scheduling
                    </strong>

                    <span>
                      Choose an available time that works
                      for you
                    </span>
                  </div>
                </div>


                <div className="expect-item">
                  <div className="expect-icon">
                    <HeartHandshake size={19} />
                  </div>

                  <div>
                    <strong>
                      Supportive environment
                    </strong>

                    <span>
                      A comfortable space to talk openly
                    </span>
                  </div>
                </div>


                <div className="expect-item">
                  <div className="expect-icon">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <strong>
                      Private & confidential
                    </strong>

                    <span>
                      Your information is handled securely
                    </span>
                  </div>
                </div>

              </div>
            </section>

          </main>


          {/* Booking Card */}
          <aside className="profile-booking-card">

            <div className="booking-card-eyebrow">
              START YOUR JOURNEY
            </div>

            <h2>Book a session</h2>

            <p>
              Take the first step toward your
              wellbeing.
            </p>

            <div className="booking-feature">
              <div className="booking-feature-icon">
                <Clock3 size={20} />
              </div>

              <div>
                <span>Session duration</span>
                <strong>
                  Flexible duration
                </strong>
              </div>
            </div>

            <div className="booking-feature">
              <div className="booking-feature-icon">
                <CalendarDays size={20} />
              </div>

              <div>
                <span>Scheduling</span>
                <strong>
                  Choose your preferred time
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="profile-book-button"
              onClick={() =>
                navigate(
                  `/therapist/${slug}/book`
                )
              }
            >
              <CalendarDays size={19} />

              <span>Book a session</span>

              <ArrowRight size={19} />
            </button>

            <div className="booking-privacy">
              <ShieldCheck size={16} />

              <span>
                Your information is handled
                securely.
              </span>
            </div>

          </aside>

        </div>


        {/* Footer */}
        <footer className="profile-footer">
          <div className="footer-brand">
            <strong>unfazed</strong>
            <span>
              A simpler way to manage your wellbeing
              journey.
            </span>
          </div>

          <div className="footer-private">
            <ShieldCheck size={15} />
            Private & confidential
          </div>
        </footer>

      </div>
    </div>
  );
};

export default PublicProfile;