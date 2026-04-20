const BackgroundGraphics = () => {
  return (
    <>
      <div className="bg-curves">
        <svg className="bg-curve" style={{ top: '-10%', left: '-5%', width: '120%', height: '120%', opacity: 0.08 }} viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <path d="M-100,300 C200,100 500,900 1100,400" strokeWidth="2" stroke="#666" fill="none" />
        </svg>
        <svg className="bg-curve" style={{ top: '15%', right: '-10%', width: '80%', height: '80%', transform: 'rotate(-15deg)', opacity: 0.1 }} viewBox="0 0 500 500" preserveAspectRatio="none">
          <path d="M0,500 C150,450 350,50 500,0" strokeWidth="1" stroke="#666" fill="none" />
        </svg>
        <svg className="bg-curve" style={{ top: '35%', left: '20%', width: '95%', height: '40%', opacity: 0.04 }} viewBox="0 0 500 200" preserveAspectRatio="none">
          <path d="M-100,50 C150,200 450,-50 600,100" strokeWidth="1.5" stroke="#666" fill="none" />
        </svg>
        <svg className="bg-curve" style={{ top: '50%', left: '10%', width: '100%', height: '60%', transform: 'rotate(10deg)', opacity: 0.06 }} viewBox="0 0 1000 600" preserveAspectRatio="none">
          <path d="M0,300 C300,100 700,500 1000,200" strokeWidth="1" stroke="#666" fill="none" />
        </svg>
        <svg className="bg-curve" style={{ bottom: '-10%', left: '5%', width: '70%', height: '50%', transform: 'rotate(10deg)', opacity: 0.05 }} viewBox="0 0 500 200" preserveAspectRatio="none">
          <path d="M0,100 C100,150 200,0 300,100 C400,200 500,50 600,150" strokeWidth="3" stroke="#666" fill="none" />
        </svg>
        <svg className="bg-curve" style={{ bottom: '10%', right: '5%', width: '80%', height: '40%', transform: 'rotate(-5deg)', opacity: 0.03 }} viewBox="0 0 1000 400" preserveAspectRatio="none">
          <path d="M1000,200 C800,400 400,0 0,200" strokeWidth="1" stroke="#666" fill="none" />
        </svg>
      </div>
    </>
  );
};

export default BackgroundGraphics;
