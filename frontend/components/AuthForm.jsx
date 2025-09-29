"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { User, Mail, Lock, Sparkles, Brain, GraduationCap } from "lucide-react"
import { supabase } from "../lib/supabase"

export default function AuthForm({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (isLogin) {
        // Sign in existing user
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError) {
          if (authError.message === 'Invalid login credentials') {
            throw new Error('Invalid email or password. Please check your credentials and try again.')
          }
          throw authError
        }

        // Get user data from our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single()

        if (userError && userError.code === 'PGRST116') {
          // User doesn't exist in our table, create them
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{
              id: authData.user.id,
              email: email,
              name: authData.user.user_metadata?.name || email.split('@')[0]
            }])
            .select()
            .single()

          if (createError) throw createError
          onSuccess(newUser)
        } else if (userData) {
          onSuccess(userData)
        }
      } else {
        // Sign up new user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        })

        if (authError) {
          if (authError.message.includes('already registered')) {
            throw new Error('This email is already registered. Please sign in instead.')
          }
          throw authError
        }

        // Check if sign up requires email confirmation
        if (authData.user && !authData.session) {
          throw new Error('Please check your email to confirm your account before signing in.')
        }

        // Create user in our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            email: email,
            name: name
          }])
          .select()
          .single()

        if (userError) throw userError
        onSuccess(userData)
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError(error.message || 'Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="relative mx-auto max-w-md w-full backdrop-blur-sm bg-white/90 dark:bg-zinc-950/90 shadow-2xl border-0">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Noodeia AI Tutor
          </CardTitle>
          <CardDescription className="text-base">
            {isLogin ? "Welcome back! Sign in to continue learning" : "Join us to start your AI-powered learning journey"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-500" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="h-11 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-500" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-indigo-500" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {isLogin ? "Sign In" : "Create Account"}
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
              }}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Brain className="h-4 w-4" />
              <span>Powered by AI • Personalized Learning • Available 24/7</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}