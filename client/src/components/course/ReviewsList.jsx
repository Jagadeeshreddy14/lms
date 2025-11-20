import React from 'react';
import { Star, ThumbsUp, User } from 'lucide-react';

const ReviewsList = ({ reviews = [], courseRating, totalRatings }) => {
  // Calculate rating distribution
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      if (review.rating && review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });
    return distribution;
  };

  const distribution = getRatingDistribution();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-slate-400'
            }`}
          />
        ))}
      </div>
    );
  };

  const getProgressPercentage = (count) => {
    return totalRatings > 0 ? (count / totalRatings) * 100 : 0;
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
        <p className="text-sm">Be the first to share your experience with this course!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600/30">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Overall Score */}
          <div className="text-center md:text-left">
            <div className="text-4xl font-bold text-white mb-2">
              {courseRating?.toFixed(1) || '0.0'}
            </div>
            <div className="flex justify-center md:justify-start mb-2">
              {renderStars(Math.round(courseRating || 0))}
            </div>
            <p className="text-sm text-slate-300">
              {totalRatings || 0} {totalRatings === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Breakdown */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <span className="text-sm text-slate-300 w-8">{rating}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                    style={{ width: `${getProgressPercentage(distribution[rating])}%` }}
                  />
                </div>
                <span className="text-sm text-slate-400 w-8">
                  {distribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Recent Reviews</h3>
        {reviews.map((review, index) => (
          <div
            key={review._id || index}
            className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50"
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                {review.user?.avatar ? (
                  <img
                    src={review.user.avatar}
                    alt={review.user.name || 'User'}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : review.user?.name ? (
                  <span className="text-white text-sm font-medium">
                    {review.user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Review Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <div className="space-y-1 sm:space-y-0">
                    <h4 className="text-white font-medium">
                      {review.user?.name || 'Anonymous User'}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-slate-400">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                {review.review && (
                  <p className="text-slate-300 text-sm leading-relaxed mt-2">
                    {review.review}
                  </p>
                )}

                {/* Helpful Button (placeholder for future implementation) */}
                <div className="flex items-center space-x-4 mt-3">
                  <button className="flex items-center space-x-1 text-slate-400 hover:text-slate-300 transition-colors text-xs">
                    <ThumbsUp className="w-3 h-3" />
                    <span>Helpful</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;
