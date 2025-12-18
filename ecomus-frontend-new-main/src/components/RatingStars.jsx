import React from "react";
import PropTypes from "prop-types";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

const RatingStars = ({ rating = 0, reviewCount = 0, size = 12, showCount = false }) => {
  const normalizedRating = Number.isFinite(Number(rating))
    ? Math.max(0, Math.min(5, Number(rating)))
    : 0;

  const renderStar = (index) => {
    if (normalizedRating >= index + 1) {
      return <FaStar key={`star-${index}`} size={size} color="#f5a623" />;
    }

    if (normalizedRating > index && normalizedRating < index + 1) {
      return <FaStarHalfAlt key={`star-${index}`} size={size} color="#f5a623" />;
    }

    return <FaRegStar key={`star-${index}`} size={size} color="#c5c5c5" />;
  };

  return (
    <div className="d-flex align-items-center" style={{ gap: "6px" }}>
      <div className="d-flex" style={{ gap: "2px" }}>
        {[0, 1, 2, 3, 4].map((index) => renderStar(index))}
      </div>
      {showCount && (
        <span style={{ fontSize: `${size * 0.85}px`, color: "#555" }}>
          {normalizedRating.toFixed(1)} ({reviewCount || 0})
        </span>
      )}
    </div>
  );
};

RatingStars.propTypes = {
  rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  reviewCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number,
  showCount: PropTypes.bool,
};

export default RatingStars;
