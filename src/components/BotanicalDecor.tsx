interface BotanicalDecorProps {
  style?: React.CSSProperties;
  type?: 'leaf' | 'vine' | 'fern' | 'berry';
}

const BotanicalDecor = ({ style, type = 'leaf' }: BotanicalDecorProps) => {
  const getPath = () => {
    switch (type) {
      case 'vine': return "M10,80 C20,60 40,70 60,50 C80,30 90,40 100,20";
      case 'fern': return "M50,90 L50,10 M50,80 L30,70 M50,80 L70,70 M50,60 L25,45 M50,60 L75,45 M50,40 L30,25 M50,40 L70,25";
      case 'berry': return "M50,80 L50,30 M50,50 L70,40 C75,40 75,50 70,50 Z M50,40 L30,30 C25,30 25,40 30,40 Z";
      default: return "M50,80 C50,80 30,50 30,30 C30,10 50,0 50,0 C50,0 70,10 70,30 C70,50 50,80 50,80 Z";
    }
  };

  return (
    <div style={{ ...style, position: 'absolute', pointerEvents: 'none', zIndex: 1 }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d={getPath()} stroke="#666" strokeWidth={type === 'leaf' ? "0" : "1"} fill={type === 'leaf' ? "#666" : "none"} opacity="0.1" />
      </svg>
    </div>
  );
};

export default BotanicalDecor;
