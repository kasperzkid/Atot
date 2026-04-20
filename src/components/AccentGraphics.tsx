const AccentGraphics = () => {
  return (
    <div className="bg-curves accent-graphics">
      <svg className="bg-curve" viewBox="0 0 1000 400" preserveAspectRatio="none" style={{ bottom: '0', left: '0', width: '100%', height: '220px', opacity: 0.12 }}>
        <path d="M0,150 C200,50 800,250 1000,100" stroke="#666" strokeWidth="1" fill="none" />
        <circle cx="200" cy="115" r="2" fill="#666" opacity="0.3" />
        <circle cx="500" cy="150" r="1.5" fill="#666" opacity="0.2" />
        <circle cx="800" cy="135" r="2" fill="#666" opacity="0.3" />
      </svg>
      <svg className="bg-curve" viewBox="0 0 500 500" preserveAspectRatio="none" style={{ top: '15%', left: '-5%', width: '65%', height: '75%', opacity: 0.08, transform: 'rotate(60deg)' }}>
        <path d="M0,200 C150,50 350,450 500,100" stroke="#666" strokeWidth="1.2" fill="none" />
      </svg>
      <svg className="bg-curve" viewBox="0 0 500 500" preserveAspectRatio="none" style={{ top: '5%', right: '5%', width: '45%', height: '55%', opacity: 0.07, transform: 'rotate(-25deg) scaleX(-1)' }}>
        <path d="M0,500 C200,400 300,100 500,0" stroke="#666" strokeWidth="1" fill="none" />
      </svg>
      <svg className="bg-curve" style={{ top: '40%', right: '10%', width: '55%', height: '65%', opacity: 0.05, transform: 'rotate(110deg)' }} viewBox="0 0 600 400" preserveAspectRatio="none">
        <path d="M0,200 C100,0 300,400 500,150" stroke="#666" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
};

export default AccentGraphics;
