import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { rateCourse } from '../../Api/userApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

const Rating = ({ courseId, existingRating, existingReview, onRatingSubmitted }) => {
  const [rating, setRating] = useState(existingRating || 0);
  const [review, setReview] = useState(existingReview || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (existingRating) setRating(existingRating);
    if (existingReview) setReview(existingReview);
  }, [existingRating, existingReview]);

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      setSubmitError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const response = await rateCourse(courseId, {
        rating,
        review: review.trim()
      });

      if (response.success) {
        setSubmitSuccess(true);
        setSubmitError('');
        
        // Call callback to refresh course data
        if (onRatingSubmitted) {
          onRatingSubmitted(response.rating);
        }
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);
      } else {
        setSubmitError(response.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setSubmitError(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 md:p-6 border border-slate-700/50">
      <h3 className="text-lg md:text-xl font-semibold text-white mb-4">
        {existingRating ? 'Update Your Rating' : 'Rate This Course'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Your Rating
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 rounded"
              >
                <Star
                  className={`w-6 h-6 md:w-8 md:h-8 transition-all duration-200 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-slate-400'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-3 text-sm text-slate-300">
                {rating} out of 5 stars
              </span>
            )}
          </div>
        </div>

        {/* Review Text */}
        <div className="space-y-2">
          <label htmlFor="review" className="block text-sm font-medium text-slate-300">
            Your Review (Optional)
          </label>
          <textarea
            id="review"
            rows={4}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your thoughts about this course..."
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm md:text-base"
            maxLength={500}
          />
          <div className="text-xs text-slate-400 text-right">
            {review.length}/500 characters
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm">{submitError}</p>
          </div>
        )}

        {/* Success Message */}
        {submitSuccess && (
          <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3">
            <p className="text-green-400 text-sm">
              Rating submitted successfully! Thank you for your feedback.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !rating}
          className={`w-full py-2 md:py-3 px-4 rounded-lg font-medium text-sm md:text-base transition-all duration-200 ${
            isSubmitting || !rating
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            existingRating ? 'Update Rating' : 'Submit Rating'
          )}
        </button>
      </form>
    </div>
  );
};

export default Rating;