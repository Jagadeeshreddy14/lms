import React, { useState } from 'react';
import { CreditCard, ExternalLink } from 'lucide-react';
import { createCheckoutSession } from '../../Api/paymentApi';

const StripeCheckoutButton = ({ 
  course, 
  className = '',
  buttonText = 'Enroll Now',
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!course || disabled) return;

    setIsLoading(true);
    
    try {
      const response = await createCheckoutSession(
        course._id || course.id,
        course.title,
        course.price || 0,
        course.thumbnail || course.image
      );

      if (response.success && response.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      let errorMsg = 'Failed to start checkout. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMsg = `Checkout failed: ${error.response.data.message}`;
        if (error.response.data.error) {
          errorMsg += `\nDetails: ${error.response.data.error}`;
        }
      }
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || isLoading || !course?.price}
      className={`
        inline-flex items-center justify-center px-6 py-3 
        border border-transparent text-base font-medium rounded-lg
        text-white bg-blue-600 hover:bg-blue-700
        disabled:bg-gray-300 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        transition-colors duration-200
        ${className}
      `}
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Redirecting...
        </div>
      ) : (
        <div className="flex items-center">
          <CreditCard className="h-4 w-4 mr-2" />
          {buttonText}
          {course?.price && (
            <span className="ml-2">- ₹{course.price}</span>
          )}
          <ExternalLink className="h-3 w-3 ml-2" />
        </div>
      )}
    </button>
  );
};

export default StripeCheckoutButton;
