interface DishCardProps {
  name: string;
  description: string;
  price: number;
  imageSrc: string;
}

const DishCard = ({ name, description, price, imageSrc }: DishCardProps) => {
  return (
    <div className="dish-card">
      <div className="dish-image-wrapper">
        <img src={imageSrc} alt={name} className="dish-image" loading="lazy" />
      </div>
      <div className="dish-content">
        <div className="dish-header">
          <h3 className="dish-name">{name}</h3>
          <span className="dish-price">${price.toFixed(2)}</span>
        </div>
        <p className="dish-desc">{description}</p>
        <span className="dish-order">Order Now</span>
      </div>
    </div>
  );
};

export default DishCard;
