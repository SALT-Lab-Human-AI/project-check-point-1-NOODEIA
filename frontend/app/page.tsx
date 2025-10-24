"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  ArrowRight,
  Brain,
  MessageSquare,
  Zap,
  Sparkles,
  Users,
  Award,
  BookOpen,
  Target,
  Lightbulb,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NoodeiaLogo } from "@/components/noodeia-logo"
import {
  AnimatedBackground,
  FloatingElements,
  ThinkingBubbles,
} from "@/components/animated-graphics"
import { supabase } from "@/lib/supabase"

export default function HomePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
      } catch (error) {
        console.error("Error checking auth:", error)
      }
    }

    checkAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleStartLearning = () => {
    if (isAuthenticated) {
      router.push("/ai")
    } else {
      router.push("/login")
    }
  }
  const features = [
    {
      icon: Brain,
      title: "Personalized AI Tutor",
      description: "Get 1-on-1 tutoring sessions with an AI that adapts to your learning style and pace.",
      gradient: "from-blue-400 to-blue-600",
      delay: 0,
    },
    {
      icon: MessageSquare,
      title: "Group Collaboration",
      description: "Join study groups with classmates and get AI assistance in collaborative discussions.",
      gradient: "from-yellow-400 to-orange-400",
      delay: 0.1,
    },
    {
      icon: BookOpen,
      title: "Smart Note-Taking",
      description: "Take notes with markdown support and visualize concepts with interactive mind maps.",
      gradient: "from-green-400 to-emerald-400",
      delay: 0.2,
    },
    {
      icon: Target,
      title: "Socratic Learning",
      description: "Learn through guided questions and hints rather than direct answers, building deeper understanding.",
      gradient: "from-purple-400 to-pink-400",
      delay: 0.3,
    },
    {
      icon: Lightbulb,
      title: "Context-Aware Help",
      description: "AI understands your entire conversation history to provide relevant and personalized assistance.",
      gradient: "from-indigo-400 to-purple-400",
      delay: 0.4,
    },
    {
      icon: Zap,
      title: "Instant Responses",
      description: "Get immediate help with your questions, available 24/7 whenever you need to study.",
      gradient: "from-red-400 to-pink-400",
      delay: 0.5,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-app-bg via-yellow-50/20 to-orange-50/20 relative">
      <AnimatedBackground />
      <FloatingElements />

      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-gray-200/20 backdrop-blur-sm bg-white/80 relative z-10">
        <Link className="flex items-center justify-center" href="/">
          <NoodeiaLogo size="md" />
        </Link>
        <nav className="ml-auto flex gap-6 sm:gap-8">
          <Link className="text-sm font-medium hover:text-noodeia-primary transition-colors" href="#features">
            Features
          </Link>
          {isAuthenticated ? (
            <Link className="text-sm font-medium hover:text-noodeia-primary transition-colors" href="/ai">
              Dashboard
            </Link>
          ) : (
            <Link className="text-sm font-medium hover:text-noodeia-primary transition-colors" href="/login">
              Login
            </Link>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 xl:py-48 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center">
            {/* Text content - centered */}
            <div className="max-w-3xl space-y-6 text-center">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-noodeia-primary text-sm font-medium"
                >
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Learning Assistant
                  <ThinkingBubbles />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-4xl font-display font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                >
                  <span className="text-gradient">Learn Smarter</span>
                  <br />
                  <span className="text-noodeia-dark">with Noodeia AI</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="max-w-[600px] text-gray-600 text-lg md:text-xl font-light leading-relaxed mx-auto"
                >
                  Your personalized AI tutor that helps you learn through guided questions,
                  collaborative group study, and intelligent note-taking. Available 24/7
                  to support your learning journey.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  onClick={handleStartLearning}
                  size="lg"
                  className="bg-noodeia-primary hover:bg-noodeia-primary/90 text-white px-8 py-3 text-lg transform hover:scale-105 transition-all duration-200"
                >
                  Start Learning <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="border-noodeia-primary text-noodeia-primary hover:bg-noodeia-primary hover:text-white px-8 py-3 text-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Link href="#features">Explore Features</Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex items-center gap-8 text-sm text-gray-600 pt-4 justify-center"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>10,000+ Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>Socratic Method</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Powered</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-16 md:py-24 lg:py-32 bg-white/50 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-display font-bold tracking-tight sm:text-4xl md:text-5xl text-noodeia-dark">
                AI-Powered Learning Tools
              </h2>
              <p className="max-w-[900px] text-gray-600 text-lg md:text-xl font-light leading-relaxed">
                Everything you need to excel in your studies with the power of artificial intelligence.
              </p>
            </div>
          </motion.div>

          <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: feature.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="border-gray-200/30 hover:border-noodeia-primary/30 transition-all duration-300 hover:shadow-lg h-full">
                  <CardHeader className="text-center p-8">
                    <motion.div
                      className={`mx-auto w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl font-display text-noodeia-dark">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-r from-noodeia-primary via-noodeia-secondary to-noodeia-tertiary relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center space-y-6 text-center"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-display font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
                Ready to Transform Your Learning?
              </h2>
              <p className="max-w-[600px] text-white/90 text-lg md:text-xl font-light leading-relaxed">
                Join thousands of students who are already learning smarter with Noodeia's AI-powered tutoring.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThinkingBubbles />
              <Button
                onClick={handleStartLearning}
                size="lg"
                className="bg-white text-noodeia-primary hover:bg-white/90 px-8 py-3 text-lg font-medium transform hover:scale-105 transition-all duration-200"
              >
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <ThinkingBubbles />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/20 bg-white/80 relative z-10">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col gap-2 sm:flex-row items-center">
            <div className="flex items-center gap-4">
              <NoodeiaLogo size="sm" />
              <p className="text-sm text-gray-600">© 2024 Noodeia. All rights reserved.</p>
            </div>
            <nav className="sm:ml-auto flex gap-6">
              <Link className="text-sm hover:text-noodeia-primary transition-colors" href="#">
                Terms of Service
              </Link>
              <Link className="text-sm hover:text-noodeia-primary transition-colors" href="#">
                Privacy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}