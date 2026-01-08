// Loader.jsx
import "./loader.css"
const Loader = () => (
  <div className="loader">
    {Array.from({ length: 9 }).map((_, i) => (
      <div className="text" key={i}>
        <span>TRACKWICKET</span>
      </div>
    ))}
    <div className="line"></div>
  </div>
);

export default Loader;
