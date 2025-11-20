import api from './config.js';

// Create Stripe Checkout Session
export const createCheckoutSession = async (courseId, courseName, coursePrice, courseImage) => {
  try {
    console.log({ courseId, courseName, coursePrice, courseImage });
    const response = await api.post('/payment/create-checkout-session', {
      courseId,
      courseName,
      coursePrice: Math.round(coursePrice * 100),
      courseImage,
    });
    return response.data;
  } catch (error) {
    console.error('Create checkout session error:', error);
    throw error;
  }
};

// Verify payment success (optional)
export const verifyPayment = async (sessionId) => {
  try {
    console.log('Sending payment verification request for session:', sessionId);
    const response = await api.post('/payment/verify-session', {
      sessionId,
    });
    console.log('Payment verification successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Verify payment error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // Re-throw with more detailed error info
    const errorMessage = error.response?.data?.message || error.message || 'Payment verification failed';
    const errorStatus = error.response?.status || 500;
    
    throw {
      ...error,
      message: errorMessage,
      status: errorStatus,
      details: error.response?.data
    };
  }
};
