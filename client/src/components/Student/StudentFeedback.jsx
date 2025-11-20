import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const StudentFeedback = () => {
  const feedbacks = [
    {
      name: "Aarav Sharma",
      feedback:
        "This platform completely transformed my learning experience! The interactive dashboard and expert guidance made complex topics easy to understand.",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Priya Das",
      feedback:
        "The flexibility and practical projects were exactly what I needed. The certificate I earned has already helped me land job interviews!",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Rohan Gupta",
      feedback:
        "I loved the course content and the friendly mentors. The real-world assignments helped me build a portfolio that stands out.",
      image: "https://randomuser.me/api/portraits/men/65.jpg",
    },
    {
      name: "Sara Johnson",
      feedback:
        "The AWS and DevOps training helped me land my first cloud engineer role. The mentors were incredibly helpful.",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
    },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 to-[#0a1128] overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            What Our Students{" "}
            <span className="text-blue-400">Say About Us</span>
          </h2>
        </div>

    <div className="h-9"></div>
        {/* Feedback Section */}
        <div className="hidden md:block relative overflow-hidden">
          <div className="flex gap-6 animate-scrollX">
            {[...feedbacks, ...feedbacks].map((fb, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 p-6 rounded-xl bg-gradient-to-br from-black/10 via-black/5 to-transparent border border-gray-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={fb.image}
                    alt={fb.name}
                    className="w-14 h-14 rounded-full border-2 border-blue-500 object-cover"
                  />
                  <h3 className="text-lg font-bold text-white">{fb.name}</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  “{fb.feedback}”
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Carousel */}
        <div className="block md:hidden">
          <Slider {...sliderSettings}>
            {feedbacks.map((fb, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-gradient-to-br from-black/10 via-black/5 to-transparent border border-gray-700"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={fb.image}
                    alt={fb.name}
                    className="w-14 h-14 rounded-full border-2 border-blue-500 object-cover"
                  />
                  <h3 className="text-lg font-bold text-white">{fb.name}</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  “{fb.feedback}”
                </p>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Animation Styles */}
      <style>
        {`
          @keyframes scrollX {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scrollX {
            display: flex;
            animation: scrollX 15s linear infinite; /* Desktop speed */
          }
        `}
      </style>
    </section>
  );
};

export default StudentFeedback;