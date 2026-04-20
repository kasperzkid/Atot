import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import BackgroundGraphics from '../components/BackgroundGraphics';
import AccentGraphics from '../components/AccentGraphics';
import BotanicalDecor from '../components/BotanicalDecor';
import DishCard from '../components/DishCard';
import Footer from '../components/Footer';
import heroImg from '@/assets/restaurant-hero.jpg';
import interiorImg from '@/assets/restaurant-interior.jpg';
import servicePayment from '@/assets/service-payment-online.png';
import serviceOrdering from '@/assets/service-ordering.jpg';
import serviceDishes from '@/assets/service-dishes.jpg';

const Home = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState('traditionalFood');
  const [menuPage, setMenuPage] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'forward' | 'backward'>('forward');
  const [swipeKey, setSwipeKey] = useState(0);
  const itemsPerPage = 5;
  const [roadmapProgress, setRoadmapProgress] = useState(0);
  const roadmapRef = useRef<HTMLElement>(null);
  const reviewIntervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const handleScroll = () => {
      if (!roadmapRef.current) return;
      const rect = roadmapRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const start = windowHeight * 0.7;
      const total = rect.height + windowHeight * 0.3;
      let progress = ((start - rect.top) / total) * 100;
      progress = Math.max(0, Math.min(100, progress));
      setRoadmapProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const reviews = [
    { name: "Sarah Jenkins", role: "Food Blogger", stars: 5, text: "The best lamb biryani I've ever had. Truly an authentic experience that transports you to another world." },
    { name: "Michael Ross", role: "Regular Guest", stars: 5, text: "The online ordering system is so seamless, and the food always arrives piping hot. It's our weekly family tradition!" },
    { name: "Emma Whitfield", role: "Wedding Planner", stars: 5, text: "We hosted our engagement dinner here and the staff made every detail absolutely perfect. The ambiance is unmatched." },
    { name: "James Chen", role: "Tech Executive", stars: 5, text: "After traveling the world, I can confidently say Atot's cuisine rivals the finest restaurants in Paris and Tokyo." },
    { name: "Priya Sharma", role: "Food Critic", stars: 5, text: "Atot brings soulful cooking to a fine dining setting. The chocolate soufflé alone is worth the visit." },
  ];

  const [shuffledReviews] = useState(() => {
    const original = [...reviews].sort(() => Math.random() - 0.5);
    return [...original, ...original, ...original]; // Triple it for infinite loop
  });
  const [reviewIndex, setReviewIndex] = useState(reviews.length);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const advanceReview = useCallback(() => {
    setIsTransitioning(true);
    setReviewIndex(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (reviewIndex >= reviews.length * 2) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setReviewIndex(reviews.length);
      }, 800); // Wait for transition duration
      return () => clearTimeout(timeout);
    }
  }, [reviewIndex, reviews.length]);

  useEffect(() => {
    reviewIntervalRef.current = setInterval(advanceReview, 4000);
    return () => clearInterval(reviewIntervalRef.current);
  }, [advanceReview]);

  const menuData: Record<string, Array<{ name: string; description: string; price: number; imageSrc: string }>> = {
    traditionalFood: [
      { name: 'Heritage Beef Stew', description: 'Tender beef slow-simmered with root vegetables in a hearty, aromatic broth.', price: 18, imageSrc: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&auto=format&fit=crop' },
      { name: 'Spiced Lamb Biryani', description: 'Layers of saffron-kissed basmati rice and succulent lamb, spiced to perfection.', price: 22, imageSrc: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop' },
      { name: 'Classic Handmade Dumplings', description: 'Delicate wrappers filled with seasoned pork, scallions, and a splash of ginger.', price: 14, imageSrc: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400&auto=format&fit=crop' },
      { name: 'Rustic Herb Flatbread', description: 'Stone-oven baked with rosemary, thyme, and a drizzle of cold-pressed olive oil.', price: 10, imageSrc: 'https://plus.unsplash.com/premium_photo-1668095397731-e2096f39f3d7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fFJ1c3RpYyUyMEhlcmIlMjBGbGF0YnJlYWR8ZW58MHx8MHx8fDA%3D' },
      { name: 'Vietnamese Pho', description: 'Rich bone broth ladled over silky noodles, crowned with fresh herbs and lime.', price: 16, imageSrc: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&auto=format&fit=crop' },
      { name: 'Moroccan Chicken Tagine', description: 'Slow-braised chicken, preserved lemons, and green olives in a fragrant stew.', price: 24, imageSrc: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400&auto=format&fit=crop' },
      { name: 'Spanish Seafood Paella', description: 'Golden saffron rice brimming with prawns, mussels, and tender calamari.', price: 30, imageSrc: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&auto=format&fit=crop' },
      { name: 'Greek Moussaka', description: 'Silky layers of eggplant, seasoned lamb, and golden béchamel gratin.', price: 21, imageSrc: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop' },
      { name: 'Hungarian Goulash', description: 'Paprika-spiced stew with melt-in-your-mouth beef and baby potatoes.', price: 19, imageSrc: 'https://images.unsplash.com/photo-1633457027853-106d9bed16ce?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8SHVuZ2FyaWFuJTIwR291bGFzaHxlbnwwfHwwfHx8MA%3D%3D' },
      { name: 'Crispy Vegetable Samosas', description: 'Golden pastry pockets bursting with spiced potatoes and sweet peas.', price: 8, imageSrc: 'https://plus.unsplash.com/premium_photo-1695297516710-854716c51121?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fENyaXNweSUyMFZlZ2V0YWJsZSUyMFNhbW9zYXN8ZW58MHx8MHx8fDA%3D' },
    ],
    westernFood: [
      { name: 'Slow-Roasted Ribeye', description: 'Premium cut finished with garlic butter, served with truffle mash.', price: 32, imageSrc: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&auto=format&fit=crop' },
      { name: 'Truffle Mac & Cheese', description: 'Four artisan cheeses baked under a crispy panko-truffle crust.', price: 21, imageSrc: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400&auto=format&fit=crop' },
      { name: 'Pan-Seared Salmon', description: 'Wild-caught salmon with asparagus tips and a velvety lemon-butter foam.', price: 28, imageSrc: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&auto=format&fit=crop' },
      { name: 'Margherita Pizza', description: 'San Marzano tomato base, hand-pulled mozzarella, and fresh basil leaves.', price: 18, imageSrc: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop' },
      { name: 'Signature Cheeseburger', description: 'Angus beef, aged cheddar, caramelized onions, and our secret house sauce.', price: 16, imageSrc: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop' },
      { name: 'Beer-Battered Fish & Chips', description: 'Crispy golden cod with thick-cut fries and house-made tartar sauce.', price: 19, imageSrc: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop' },
      { name: 'Chicken Parmesan', description: 'Herb-crusted chicken breast blanketed in marinara and bubbling mozzarella.', price: 22, imageSrc: 'https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?w=400&auto=format&fit=crop' },
      { name: 'Caesar Salad', description: 'Crisp romaine hearts, shaved parmesan, garlic croutons, and tangy dressing.', price: 12, imageSrc: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&auto=format&fit=crop' },
      { name: 'Smoky BBQ Pork Ribs', description: 'Fall-off-the-bone ribs glazed in our signature smoky bourbon BBQ sauce.', price: 26, imageSrc: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop' },
      { name: 'Beef Wellington', description: 'Premium tenderloin wrapped in mushroom duxelles and flaky golden pastry.', price: 40, imageSrc: 'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=400&auto=format&fit=crop' },
    ],
    desserts: [
      { name: 'Chocolate Soufflé', description: 'Pillowy-light dark chocolate soufflé with a molten, velvety center.', price: 12, imageSrc: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&auto=format&fit=crop' },
      { name: 'Berry Panna Cotta', description: 'Silky vanilla bean cream topped with a vibrant forest berry compote.', price: 10, imageSrc: 'https://images.unsplash.com/photo-1766491765420-2f4f2c4bf49a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8QmVycnklMjBQYW5uYSUyMENvdHRhfGVufDB8fDB8fHww' },
      { name: 'Classic Tiramisu', description: 'Espresso-soaked ladyfingers folded into clouds of mascarpone cream.', price: 11, imageSrc: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&auto=format&fit=crop' },
      { name: 'New York Cheesecake', description: 'Dense and creamy cheesecake on a buttery graham cracker base.', price: 9, imageSrc: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&auto=format&fit=crop' },
      { name: 'Crème Brûlée', description: 'Classic Tahitian vanilla custard with a perfectly caramelized sugar shell.', price: 10, imageSrc: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&auto=format&fit=crop' },
      { name: 'French Macarons', description: 'A curated box of six delicate almond cookies in seasonal flavors.', price: 15, imageSrc: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400&auto=format&fit=crop' },
      { name: 'Warm Apple Pie', description: 'Cinnamon-spiced apples in flaky pastry, served with vanilla bean ice cream.', price: 8, imageSrc: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400&auto=format&fit=crop' },
      { name: 'Lemon Meringue Tart', description: 'Bright lemon curd crowned with pillowy, torched Swiss meringue.', price: 9, imageSrc: 'https://images.unsplash.com/photo-1728129370212-a29c8f046399?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8TGVtb24lMjBNZXJpbmd1ZSUyMFRhcnR8ZW58MHx8MHx8fDA%3D' },
      { name: 'Artisan Gelato', description: 'Three scoops of handcrafted Italian gelato — ask for today\'s specials.', price: 7, imageSrc: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&auto=format&fit=crop' },
      { name: 'Turkish Baklava', description: 'Layers of crisp filo pastry, crushed pistachios, and rosewater syrup.', price: 13, imageSrc: 'https://images.unsplash.com/photo-1617806501553-d3a6a3a7b227?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8VHVya2lzaCUyMEJha2xhdmElMjBUdXJraXNoJTIwQmFrbGF2YXxlbnwwfHwwfHx8MA%3D%3D' },
    ],
    drinks: [
      { name: 'Classic Mojito', description: 'Fresh muddled mint, white rum, lime juice, and sparkling soda water.', price: 12, imageSrc: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&auto=format&fit=crop' },
      { name: 'Aperol Spritz', description: 'Bittersweet Aperol lifted by crisp prosecco and a citrus twist.', price: 14, imageSrc: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop' },
      { name: 'Lavender Lemonade', description: 'Hand-squeezed lemons infused with French lavender and raw honey.', price: 8, imageSrc: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&auto=format&fit=crop' },
      { name: 'Fresh Orange Juice', description: 'Pure-pressed Valencia oranges — no sugar, no compromise.', price: 6, imageSrc: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&auto=format&fit=crop' },
      { name: 'Single Espresso', description: 'A bold, concentrated shot of single-origin dark roast coffee.', price: 4, imageSrc: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&auto=format&fit=crop' },
      { name: 'Silky Cappuccino', description: 'Velvety espresso crowned with a thick layer of microfoam milk.', price: 6, imageSrc: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&auto=format&fit=crop' },
      { name: 'Matcha Latte', description: 'Ceremonial-grade matcha whisked with oat milk for an earthy, creamy sip.', price: 7, imageSrc: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8TWF0Y2hhJTIwTGF0dGV8ZW58MHx8MHx8fDA%3D' },
      { name: 'Classic Margarita', description: 'Reposado tequila, Cointreau, and fresh lime with a salt-kissed rim.', price: 13, imageSrc: 'https://images.unsplash.com/photo-1638295620979-69c385ea3551?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fENsYXNzaWMlMjBNYXJnYXJpdGF8ZW58MHx8MHx8fDA%3D' },
      { name: 'House Red Wine', description: 'A robust Pinot Noir with layers of dark cherry, earth, and oak.', price: 10, imageSrc: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&auto=format&fit=crop' },
      { name: 'Iced Peach Tea', description: 'House-brewed black tea sweetened with ripe peach syrup, served over ice.', price: 6, imageSrc: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400&auto=format&fit=crop' },
    ]
  };

  const formatCategoryName = (key: string) => {
    const spaced = key.replace(/([A-Z])/g, ' $1').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  const handlePageChange = (newPage: number) => {
    setSwipeDirection(newPage > menuPage ? 'forward' : 'backward');
    setSwipeKey(prev => prev + 1);
    setMenuPage(newPage);
  };

  const totalMenuPages = Math.ceil((menuData[activeCategory]?.length || 0) / itemsPerPage);

  return (
    <main>
      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="deco-layer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <BackgroundGraphics />
          <BotanicalDecor type="vine" style={{ top: '20%', right: '10%', width: '120px', transform: 'rotate(45deg)' }} />
          <BotanicalDecor type="fern" style={{ bottom: '15%', left: '5%', width: '100px', opacity: 0.05 }} />
        </div>
        
        <div className="hero-left">
          <h1 className="headline reveal">A Taste Above<br />the Rest</h1>
          <p className="hero-desc reveal reveal-delay-1">Thoughtfully prepared. Beautifully served. Every dish on our menu is a celebration of flavor, crafted to delight from the very first bite.</p>
          
          <div className="hero-btns reveal reveal-delay-2">
            <a href="#menu" className="btn btn-black rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-xl">Menu</a>
            <Link to="/menu" className="btn btn-green rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-xl flex items-center gap-2 group">
              Book a table <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="social-icons reveal reveal-delay-3">
            <a href="#" className="social-link"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" /></svg></a>
            <a href="#" className="social-link"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg></a>
            <a href="#" className="social-link" aria-label="TikTok"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg></a>
            <div className="social-line"></div>
          </div>
        </div>

        <div className="hero-right">
          <div className="image-container">
            <div className="main-image-block">
              <img src={heroImg} alt="Atot Restaurant Interior" width={800} height={1024} />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="welcome-section about-large" id="about">
        <div className="deco-layer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <AccentGraphics />
          <BotanicalDecor type="leaf" style={{ top: '10%', left: '40%', width: '60px', opacity: 0.03 }} />
        </div>
        <div className="welcome-content reveal">
          <h2 className="section-title">Born From Passion.<br />Built on Tradition.</h2>
          <p className="large-text">What began as a humble family bistro has grown into something far greater — a dining destination where every recipe carries a story and every meal honors our roots.</p>
          <p>At Atot, we believe hospitality is more than service. It's the warmth in the room, the care in the kitchen, and the connection between the people who cook and the people who gather.</p>
          
          <div style={{ marginTop: '30px' }}>
            <Link to="/find-us" className="btn btn-green btn-find-us rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-xl">Find Us</Link>
          </div>
        </div>
        <div className="image-container video-container reveal">
          <div className="main-image-block video-square">
            {!isVideoPlaying ? (
              <div className="video-facade" onClick={() => setIsVideoPlaying(true)}>
                <img src={interiorImg} alt="Grand Restaurant Interior" loading="lazy" width={1280} height={720} />
                <div className="play-button">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
            ) : (
              <iframe 
                width="100%" height="100%" 
                src="https://www.youtube.com/embed/jfKfPfyJRdk?si=Hq6sQY8T7a9V_5E1&autoplay=1" 
                title="YouTube video player" frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" allowFullScreen
              />
            )}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="special-dishes" id="menu">
        <div className="deco-layer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <BackgroundGraphics />
        </div>
        
        <div className="section-header reveal">
          <h2 className="section-title">Our Special Menu</h2>
        </div>

        <div className="reveal reveal-delay-1" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', marginBottom: '60px', flexWrap: 'wrap' }}>
          {Object.keys(menuData).map(category => (
            <button key={category} className={`category-pill ${activeCategory === category ? 'active' : ''}`}
              onClick={() => { setActiveCategory(category); setMenuPage(0); setSwipeKey(prev => prev + 1); }}>
              {formatCategoryName(category)}
            </button>
          ))}
        </div>

        <div className="menu-pagination-container reveal">
          <button className="menu-arrow prev" onClick={() => handlePageChange(Math.max(0, menuPage - 1))} disabled={menuPage === 0}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          <div key={swipeKey} className={`dish-grid-paginated ${swipeDirection === 'forward' ? 'menu-swipe-enter' : 'menu-swipe-enter-reverse'}`}>
            {menuData[activeCategory]
              .slice(menuPage * itemsPerPage, (menuPage + 1) * itemsPerPage)
              .map((dish, index) => (
                <DishCard key={`${activeCategory}-${menuPage}-${index}`} {...dish} />
              ))}
          </div>

          <button className="menu-arrow next" onClick={() => handlePageChange(Math.min(totalMenuPages - 1, menuPage + 1))} disabled={(menuPage + 1) * itemsPerPage >= menuData[activeCategory].length}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        <div className="pagination-footer">
          <div className="pagination-dots">
            {Array.from({ length: totalMenuPages }).map((_, idx) => (
              <div key={idx} className={`pagination-dot ${menuPage === idx ? 'active' : ''}`} onClick={() => handlePageChange(idx)} />
            ))}
          </div>
          <span className="pagination-text">Page {menuPage + 1} of {totalMenuPages}</span>
        </div>
      </section>

      {/* Service Roadmap */}
      <section className="service-section" id="service" ref={roadmapRef} style={{ '--scroll-progress': `${roadmapProgress}%` } as React.CSSProperties}>
        <div className="deco-layer"><BackgroundGraphics /></div>
        <div className="section-header reveal" style={{ marginBottom: '80px' }}>
          <h2 className="section-title">What Makes Us Unique</h2>
          <p className="section-subtitle">Experience a new standard of hospitality through our innovative services.</p>
        </div>

        <div className="roadmap-container">
          <div className="roadmap-track"><div className="roadmap-line"></div></div>
          {[
            { badge: "Convenient", title: "Online Ordering", desc: "Get your favorite Atot dishes delivered hot and fresh. Our real-time tracking keeps you updated from kitchen to doorstep.", img: serviceOrdering },
            { badge: "Seamless", title: "Online Payment", desc: "Experience frictionless transactions with our secure online payment gateway. We support all major digital wallets and cards.", img: servicePayment },
            { badge: "Curated", title: "Diverse Dishes", desc: "From local family traditions to western culinary masterpieces, our menu celebrates flavor from every corner of the globe.", img: serviceDishes }
          ].map((item, idx) => (
            <div key={idx} className="service-item reveal">
              <div className="roadmap-point"></div>
              <div className="service-image-box">
                <img src={item.img} alt={item.title} loading="lazy" width={768} height={512} />
              </div>
              <div className="service-text">
                <span className="service-badge">{item.badge}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section" id="reviews">
        <div className="deco-layer"><BackgroundGraphics /></div>
        <div className="section-header reveal">
          <h2 className="section-title">Our Customer Reviews</h2>
          <p className="section-subtitle">Read what our cherished guests have to say about their Atot experience.</p>
        </div>

        <div className="reviews-single-wrapper">
          <div className="reviews-single-track" style={{ 
            transform: `translateX(calc(var(--reviews-center) - (var(--review-card-width) / 2) - (${reviewIndex} * (var(--review-card-width) + var(--review-card-gap)))))`,
            transition: isTransitioning ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
          }}>
            {shuffledReviews.map((rev, idx) => (
              <div key={idx} className={`review-single-card ${reviewIndex === idx ? 'active' : ''}`}>
                <div className="stars">
                  {Array.from({ length: rev.stars }).map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                  ))}
                </div>
                <p className="testimonial-text">"{rev.text}"</p>
                <div className="testimonial-author">
                  <span className="author-name">{rev.name}</span>
                  <span className="author-role">{rev.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <div className="deco-layer"><BackgroundGraphics /></div>
        
        <div className="section-header reveal text-center mx-auto">
          <h2 className="section-title">Visit Us</h2>
          <p className="section-subtitle">Experience a new standard of fine dining. Find us in the heart of Worabe.</p>
        </div>
        
        <div className="contact-main-grid reveal reveal-delay-1">
          {/* Restaurant Info First */}
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
            
            <div className="contact-social-minimal">
              <a href="#" className="social-link"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" /></svg></a>
              <a href="#" className="social-link"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg></a>
              <a href="#" className="social-link" aria-label="TikTok"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg></a>
            </div>
          </div>

          {/* Map Second */}
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

export default Home;
