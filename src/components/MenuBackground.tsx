import { Pizza, Coffee, Cherry } from 'lucide-react';

export default function MenuBackground() {
  return (
    <div className="md-bg-graphics">
      <div className="md-blob blob-1"></div>
      <div className="md-blob blob-2"></div>
      <div className="md-blob blob-3"></div>

      <svg className="md-svg-decor decor-top-right" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,40.1,76.8C26.4,84.6,10,87.6,-5.8,86.3C-21.6,85,-43.2,79.4,-58.3,68.2C-73.4,57,-82,40.2,-85.8,22.2C-89.6,4.2,-88.6,-15,-81.8,-31.4C-75,-47.8,-62.4,-61.4,-47.6,-68.3C-32.8,-75.2,-16.4,-75.4,-0.2,-75.1C16,-74.8,32,-73.9,44.7,-76.4Z" transform="translate(100 100)" />
      </svg>

      <svg className="md-svg-decor decor-bottom-left" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M39.5,-65.9C51.4,-58.3,61.4,-47.8,68.1,-35.2C74.8,-22.6,78.2,-8,76.8,5.8C75.4,19.6,69.2,32.6,60.3,43.4C51.4,54.2,39.8,62.8,26.8,68.2C13.8,73.6,-0.6,75.8,-14.2,73.2C-27.8,70.6,-40.6,63.2,-51.8,53C-63,42.8,-72.6,29.8,-76.8,15.2C-81,-0.4,-79.8,-17.6,-73.4,-32.4C-67,-47.2,-55.4,-59.6,-42.2,-66.8C-29,-74,-14.5,-76,0.4,-76.6C15.3,-77.2,30.6,-76.4,39.5,-65.9Z" transform="translate(100 100)" />
      </svg>

      <Pizza className="md-food-icon icon-pizza" />
      <Coffee className="md-food-icon icon-coffee" />
      <Cherry className="md-food-icon icon-leaf" />
    </div>
  );
}
