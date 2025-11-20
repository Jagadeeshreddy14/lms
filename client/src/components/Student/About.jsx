import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Award, 
  Target, 
  Zap, 
  Globe,
  Shield,
  Clock,
  Star,
  TrendingUp,
  Heart,
  Lightbulb,
  Rocket,
  CheckCircle
} from 'lucide-react';

const About = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "Comprehensive Courses",
      description: "From beginner to advanced levels, our courses cover every aspect of modern technology and business skills."
    },
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from industry professionals with years of real-world experience and proven teaching methods."
    },
    {
      icon: Award,
      title: "Certified Learning",
      description: "Earn certificates that are recognized by leading companies and boost your career prospects."
    },
    {
      icon: Target,
      title: "Skill-Based Learning",
      description: "Focus on practical skills that you can immediately apply in your work and projects."
    },
    {
      icon: Clock,
      title: "Flexible Schedule",
      description: "Learn at your own pace with lifetime access to course materials and community support."
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Join a worldwide network of learners and professionals sharing knowledge and experiences."
    }
  ];

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We constantly evolve our platform with the latest educational technologies and methodologies."
    },
    {
      icon: Heart,
      title: "Student Success",
      description: "Your success is our priority. We provide personalized support throughout your learning journey."
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Every course undergoes rigorous quality checks to ensure the highest educational standards."
    },
    {
      icon: Rocket,
      title: "Career Growth",
      description: "We focus on practical skills that directly contribute to your professional advancement."
    }
  ];

  const stats = [
    { number: "900+", label: "Active Students", icon: Users },
    { number: "50+", label: "Expert Courses", icon: BookOpen },
    { number: "150+", label: "Industry Experts", icon: Award },
    { number: "98%", label: "Success Rate", icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <motion.section 
        className="pt-24 pb-16 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              About{' '}
            </span>
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              CourseConnect
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-slate-300 max-w-3xl mx-auto mb-12"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            Empowering learners worldwide with cutting-edge courses, expert instruction, 
            and a community-driven approach to skill development and career advancement.
          </motion.p>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInUp}>
              <h2 className="text-4xl font-bold text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                At CourseConnect, we believe that quality education should be accessible to everyone, 
                everywhere. Our mission is to democratize learning by providing world-class courses 
                that bridge the gap between traditional education and industry requirements.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed">
                We're committed to creating an ecosystem where learners can acquire in-demand skills, 
                connect with industry experts, and accelerate their career growth through practical, 
                hands-on learning experiences.
              </p>
            </motion.div>
            
            <motion.div 
              className="relative"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-3xl p-8">
                <Rocket className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white text-center mb-4">
                  Transforming Education
                </h3>
                <p className="text-slate-300 text-center">
                  With innovative teaching methods and real-world applications, 
                  we're reshaping how people learn and grow professionally.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Statistics Section */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/50"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-white text-center mb-12"
            variants={fadeInUp}
          >
            Our Impact
          </motion.h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center hover:border-slate-600/50 hover:bg-slate-800/70 transition-all duration-300"
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <IconComponent className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-slate-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-white text-center mb-12"
            variants={fadeInUp}
          >
            Why Choose CourseConnect?
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 hover:bg-slate-800/70 transition-all duration-300 group"
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <IconComponent className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/50"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-white text-center mb-12"
            variants={fadeInUp}
          >
            Our Values
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <motion.div
                  key={value.title}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center hover:border-slate-600/50 hover:bg-slate-800/70 transition-all duration-300 group"
                  variants={fadeInUp}
                  transition={{ delay: index * 0.15 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{value.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Vision Section */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-4xl font-bold text-white mb-8"
            variants={fadeInUp}
          >
            Our Vision
          </motion.h2>
          
          <motion.div 
            className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-3xl p-8 mb-8"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <Target className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <p className="text-xl text-slate-300 leading-relaxed">
              To become the world's leading platform for skill-based learning, where anyone can 
              access high-quality education, connect with expert mentors, and build a successful 
              career in the digital economy.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
              variants={fadeInUp}
            >
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Accessibility</h3>
              <p className="text-slate-300 text-sm">Making quality education accessible to learners worldwide</p>
            </motion.div>
            
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
              variants={fadeInUp}
            >
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Innovation</h3>
              <p className="text-slate-300 text-sm">Leveraging cutting-edge technology for immersive learning</p>
            </motion.div>
            
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
              variants={fadeInUp}
            >
              <Star className="w-8 h-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Excellence</h3>
              <p className="text-slate-300 text-sm">Maintaining the highest standards in course quality and delivery</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600/10 to-purple-600/10"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of students who have transformed their careers with CourseConnect
          </p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            whileHover={{ scale: 1.02 }}
          >
            <motion.a
              href="/course"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen className="w-5 h-5" />
              Explore Courses
            </motion.a>
            <motion.a
              href="/register"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/50 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users className="w-5 h-5" />
              Join Community
            </motion.a>
          </motion.div>
        </div>
      </motion.section>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute w-96 h-96 bg-blue-500/5 rounded-full top-1/4 left-1/4 blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.03, 0.08, 0.03]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute w-64 h-64 bg-purple-500/5 rounded-full bottom-1/4 right-1/4 blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.08, 0.03, 0.08]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
      </div>
    </div>
  );
};

export default About;