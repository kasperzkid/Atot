import { useEffect } from 'react';
import AccentGraphics from '../components/AccentGraphics';
import BackgroundGraphics from '../components/BackgroundGraphics';
import exteriorImg from '@/assets/restaurant-exterior.jpg';
import familyImg from '@/assets/family-dining.jpg';
import interiorImg from '@/assets/restaurant-interior.jpg';
import Footer from '../components/Footer';

const FindUs = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.1 });
    const els = document.querySelectorAll('.reveal');
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="find-us-page">
      {/* Hero */}
      <section className="hero find-us-hero" style={{ minHeight: '90vh' }}>
        <div className="deco-layer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <AccentGraphics />
        </div>
        
        <div className="hero-left">
          <h1 className="headline reveal">Welcoming You<br />& Your Family</h1>
          <p className="hero-desc reveal reveal-delay-1">
            Discover the heart of premium dining at Atot. Our doors are always open to create unforgettable memories for you and your loved ones.
          </p>
          
          <div className="promo-box reveal reveal-delay-2">
            <h2 className="promo-title">Special Family Offer</h2>
            <p className="promo-text">Come with your family and enjoy a <strong>30% discount</strong> on your entire meal!</p>
            <button className="btn btn-green download-btn">Download Discount Card</button>
          </div>
        </div>

        <div className="hero-right">
          <div className="image-container">
            <div className="main-image-block find-us-image">
              <img src={exteriorImg} alt="Atot Restaurant" width={800} height={1024} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Professional with SVG icons */}
      <section style={{ padding: '120px 8%', position: 'relative', overflow: 'hidden' }}>
        <div className="deco-layer"><BackgroundGraphics /></div>
        <div className="section-header reveal" style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 className="section-title">Why Families Love Us</h2>
          <p className="section-subtitle">Every detail is designed with your comfort and joy in mind.</p>
        </div>

        <div className="family-features-grid">
          {[
            { 
              title: 'Private Events', 
              desc: 'Reserve our elegant private dining room for birthdays, anniversaries, and special celebrations.',
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>
            },
            { 
              title: 'Kid-Friendly Menu', 
              desc: 'A curated selection of dishes that little ones love, with healthy ingredients parents trust.',
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 9H5l1 12h12l1-12z"/><path d="M12 14v3"/></svg>
            },
            { 
              title: 'Fully Accessible', 
              desc: 'Wide aisles, wheelchair access, and staff trained to assist every guest with care.',
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="2"/><path d="M12 6v6"/><path d="M8 12h8"/><path d="M10 18l-2-6"/><path d="M14 18l2-6"/></svg>
            },
            { 
              title: 'Free Parking', 
              desc: 'Complimentary valet and self-parking available for all guests.',
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>
            },
          ].map((item, idx) => (
            <div key={idx} className={`contact-card reveal reveal-delay-${idx + 1}`}>
              <div className="contact-icon">{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section style={{ padding: '120px 8%', position: 'relative', overflow: 'hidden' }}>
        <div className="deco-layer"><AccentGraphics /></div>
        <div className="section-header reveal" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 className="section-title">Our Space</h2>
          <p className="section-subtitle">Step inside and feel the warmth of Atot.</p>
        </div>

        <div className="gallery-grid">
          <div className="reveal gallery-item">
            <img src={familyImg} alt="Family dining" loading="lazy" />
            <div className="gallery-item-overlay">
              <h4>Traditional Family Warmth</h4>
              <p>Large tables and a welcoming atmosphere for your most cherished gatherings.</p>
            </div>
          </div>
          <div className="reveal reveal-delay-1 gallery-item">
            <img src={interiorImg} alt="Restaurant interior" loading="lazy" />
            <div className="gallery-item-overlay">
              <h4>Elegant Modern Architecture</h4>
              <p>Sophisticated design meets classical comfort in every corner of Atot.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Map & Info - Mirrored from Home Page */}
      <section className="contact-section" style={{ background: 'hsl(var(--secondary))', paddingBottom: '100px' }}>
        <div className="deco-layer"><BackgroundGraphics /></div>
        
        <div className="section-header reveal text-center mx-auto">
          <h2 className="section-title">A Place for Everyone</h2>
          <p className="section-subtitle">Experience a new standard of fine dining. Find us in the heart of Worabe.</p>
        </div>

        <div className="contact-main-grid reveal">
          {/* Info Column */}
          <div className="contact-info-container">
            <div className="info-item">
              <div className="info-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
              <div className="info-text">
                <h5>Our Location</h5>
                <p>Worabe Main Street, Silt'e Zone, Central Ethiopia</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
              <div className="info-text">
                <h5>Opening Hours</h5>
                <p>Monday - Friday: 11:00 AM - 11:00 PM<br />Saturday - Sunday: 10:00 AM - 12:00 AM</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
              <div className="info-text">
                <h5>Contact Us</h5>
                <p>+251 91 123 4567<br />hello@atot.com</p>
              </div>
            </div>
          </div>

          {/* Map Column */}
          <div className="contact-map-grid-container">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.4474606056756!2d38.18510869866282!3d7.848148017746172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17b30903777ac633%3A0xa08a798dca44bc0b!2sAtot%20hotel%20%26%20Restaurant!5e0!3m2!1sen!2sus!4v1776570151420!5m2!1sen!2sus" 
               width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Location"
            />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default FindUs;
