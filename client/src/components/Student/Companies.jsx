export default function Companies() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 to-[#0a1128]">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600/20 to-blue-800/20 rounded-full border border-blue-500/30 mb-6">
            
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Powerful Features for{" "}
            <span className="text-blue-400">Modern Learning</span>
          </h2>
          
        </div>

        <div className="h-9"></div>
        {/* Main Content: Image Left, Features Right */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Image */}
          <div className="relative order-2 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl transform rotate-3"></div>
            <div className="relative">
              <img
                className="w-full h-auto rounded-3xl border border-blue-900/30 shadow-2xl shadow-blue-900/20 object-cover"
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                alt="Students learning online together in a modern classroom setting"
              />
              {/* Floating elements for visual appeal */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-500/30 rounded-full blur-sm animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-purple-500/20 rounded-full blur-sm animate-pulse delay-1000"></div>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className="space-y-10 order-1 lg:order-2 max-w-3xl mx-auto">
            {/* Feature Card Component */}
            {[
              {
                title: "Interactive Learning Dashboard",
                description:
                  "Track your progress with real-time analytics, personalized learning paths, and detailed performance insights that adapt to your learning style.",
                colors: "from-blue-500 to-blue-600",
                border: "border-blue-800/20 hover:border-blue-500/40",
                shadow: "shadow-blue-500/30 group-hover:shadow-blue-500/50",
                icon: (
                  <path
                    d="M14 18.667V24.5m4.668-8.167V24.5m4.664-12.833V24.5m2.333-21L15.578 13.587a.584.584 0 0 1-.826 0l-3.84-3.84a.583.583 0 0 0-.825 0L2.332 17.5M4.668 21v3.5m4.664-8.167V24.5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ),
              },
              {
                title: "Expert-Led Courses",
                description:
                  "Learn from industry professionals with years of experience. Enjoy live sessions, interactive Q&A, and personalized feedback from experts.",
                colors: "from-green-500 to-green-600",
                border: "border-green-800/20 hover:border-green-500/40",
                shadow: "shadow-green-500/30 group-hover:shadow-green-500/50",
                icon: (
                  <>
                    <path
                      d="M23.333 14c0 5.155-4.178 9.333-9.333 9.333S4.667 19.155 4.667 14 8.845 4.667 14 4.667 23.333 8.845 23.333 14z"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <path
                      d="M14 9.333V14l2.333 2.333"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                ),
              },
              {
                title: "Flexible Learning Formats",
                description:
                  "Access courses anytime, anywhere. Download materials, take quizzes offline, and sync your progress seamlessly across all devices.",
                colors: "from-purple-500 to-purple-600",
                border: "border-purple-800/20 hover:border-purple-500/40",
                shadow: "shadow-purple-500/30 group-hover:shadow-purple-500/50",
                icon: (
                  <>
                    <path
                      d="M4.668 25.666h16.333a2.333 2.333 0 0 0 2.334-2.333V8.166L17.5 2.333H7a2.333 2.333 0 0 0-2.333 2.333v4.667"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                ),
              },
              {
                title: "Industry-Recognized Certificates",
                description:
                  "Earn certificates that matter in the industry. Our credentials are recognized by top employers and can significantly boost your career prospects.",
                colors: "from-orange-500 to-orange-600",
                border: "border-orange-800/20 hover:border-orange-500/40",
                shadow: "shadow-orange-500/30 group-hover:shadow-orange-500/50",
                icon: (
                  <>
                    <path
                      d="M9.333 25.667V21l4.667-2.333L18.667 21v4.667"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                ),
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group p-6 md:p-8 rounded-2xl bg-gradient-to-br from-black/10 via-black/5 to-transparent ${feature.border} transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-5 md:gap-6">
                  <div
                    className={`flex-shrink-0 p-4 bg-gradient-to-br ${feature.colors} rounded-xl ${feature.shadow} transition-all duration-300`}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 28 28"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {feature.icon}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3 group-hover:opacity-90">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
