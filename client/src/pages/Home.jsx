import React from 'react';
import Hero from '../components/Student/Hero';
import Navbar from '../components/Student/Navbar';
import Footer from '../components/Student/Footer';
import Companies from '../components/Student/Companies';
import StudentFeedback from '../components/Student/StudentFeedback';
import CoursesSection from '../components/course/CoursesSection';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <main className="flex-grow">
        {/* hero section  */}
        <Hero />

        {/* companis modern learnig  */}
        <Companies />

        {/* Testimonials Section */}
        <StudentFeedback />

        {/* Courses Section */}
        <CoursesSection />

           
      </main>

      <Footer />
    </div>
  );
};

export default Home;