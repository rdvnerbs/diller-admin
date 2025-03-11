import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import {
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Languages,
  MessageCircle,
  Trophy,
} from "lucide-react";
import { createClient } from "../../supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Learn With Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our personalized approach to language learning helps you master
              English faster and more effectively than traditional methods.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Languages className="w-6 h-6" />,
                title: "Personalized Learning",
                description: "Adaptive content tailored to your skill level",
              },
              {
                icon: <MessageCircle className="w-6 h-6" />,
                title: "Conversation Practice",
                description: "Real-world speaking scenarios and feedback",
              },
              {
                icon: <BookOpen className="w-6 h-6" />,
                title: "Diverse Content",
                description: "Business, travel, social and specialized English",
              },
              {
                icon: <Trophy className="w-6 h-6" />,
                title: "Achievement System",
                description: "Track progress with badges and rewards",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Learning Modules</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore Our Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From basic greetings to business negotiations, we have content for
              every learning need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Greetings & Basics",
                description: "Master essential everyday conversations",
                color: "bg-blue-50 border-blue-200",
              },
              {
                title: "Business English",
                description: "Professional vocabulary and communication",
                color: "bg-green-50 border-green-200",
              },
              {
                title: "Travel English",
                description: "Navigate any situation while traveling",
                color: "bg-yellow-50 border-yellow-200",
              },
              {
                title: "Social English",
                description: "Make friends and engage in casual talk",
                color: "bg-purple-50 border-purple-200",
              },
              {
                title: "Academic English",
                description: "Excel in educational environments",
                color: "bg-red-50 border-red-200",
              },
              {
                title: "Specialized Vocabulary",
                description: "Industry-specific terminology",
                color: "bg-indigo-50 border-indigo-200",
              },
            ].map((category, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border ${category.color} hover:shadow-md transition-all`}
              >
                <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <a
                  href="#"
                  className="text-blue-600 font-medium hover:underline inline-flex items-center"
                >
                  Explore lessons
                  <ArrowUpRight className="ml-1 w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Start Your English Journey Today
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are achieving their language goals
            with our personalized platform.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Begin Learning
            <GraduationCap className="ml-2 w-5 h-5" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
