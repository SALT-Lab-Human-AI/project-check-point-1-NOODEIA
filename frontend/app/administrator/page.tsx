"use client"

import { useState } from "react"
import React from "react"
import { useRouter } from "next/navigation"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { KeyRound, User, ShieldCheck, TrendingUp, BarChart2, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react"

function GlassCard({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`relative rounded-3xl border border-white/20 bg-white/15 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5 pointer-events-none rounded-3xl" />
      <div className="relative">{children}</div>
    </div>
  )
}

type DayPoint = { date: string; avgCorrect: number; attempts: number }
type WeekStat = { week: string; weekRange?: string; best: number; worst: number; attempts: number; sessionIds?: string[] }
type QuizDetail = {
  id: string
  score: number
  totalQuestions: number
  streak: number
  xpEarned: number
  nodeType: string
  completedAt: string
  percentage: number
}

export default function AdministratorPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [keyInput, setKeyInput] = useState("")
  const [student, setStudent] = useState("")
  const [loading, setLoading] = useState(false)
  const [days, setDays] = useState<DayPoint[]>([])
  const [weeks, setWeeks] = useState<WeekStat[]>([])
  const [quizDetails, setQuizDetails] = useState<Record<string, QuizDetail[]>>({})
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set())
  const [error, setError] = useState("")
  const [monthOverMonthChange, setMonthOverMonthChange] = useState<number | null>(null)
  const [currentMonthAvg, setCurrentMonthAvg] = useState<number | null>(null)
  const [previousMonthAvg, setPreviousMonthAvg] = useState<number | null>(null)
  const [previousMonthDaysOnline, setPreviousMonthDaysOnline] = useState<number | null>(null)
  const [previousMonthAttempts, setPreviousMonthAttempts] = useState<number | null>(null)

  async function checkKey() {
    setError("")
    const res = await fetch("/api/administrator/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: keyInput })
    })
    if (res.ok) setIsAuthed(true)
    else setError("Invalid key")
  }

  async function loadMetrics() {
    if (!student.trim()) { setError("Please enter a student name, email, or user ID"); return; }
    setLoading(true); setError("")
    const res = await fetch(`/api/administrator/quiz?student=${encodeURIComponent(student.trim())}`)
    setLoading(false)
    if (res.status === 401) { setIsAuthed(false); setError("Unauthorized. Please enter the administrator key again."); return; }
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      setError(errorData.msg || "Failed to load data. Check if the student exists.")
      return
    }
    const data = await res.json()
    setDays(data.days || [])
    setWeeks(data.weeks || [])
    setQuizDetails(data.quizDetails || {})
    setMonthOverMonthChange(data.monthOverMonthChange ?? null)
    setCurrentMonthAvg(data.currentMonthAvg ?? null)
    setPreviousMonthAvg(data.previousMonthAvg ?? null)
    setPreviousMonthDaysOnline(data.previousMonthDaysOnline ?? null)
    setPreviousMonthAttempts(data.previousMonthAttempts ?? null)
    setExpandedWeeks(new Set()) // Reset expanded weeks
    if (data.days.length === 0 && data.weeks.length === 0) {
      setError(`✓ Student found, but no quiz data available for "${student}". They may not have completed any quizzes yet.`)
    } else {
      setError("") // Clear any previous errors on success
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100/60 via-purple-100 to-purple-100 px-4 py-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="relative">
          <button
            onClick={() => router.push('/settings')}
            className="absolute left-0 top-0 px-4 py-2 rounded-xl bg-white/30 hover:bg-white/40 border border-white/30 text-gray-800 font-medium transition-all duration-300 backdrop-blur-sm"
          >
            Back to Settings Page
          </button>
          <div className="flex flex-col items-center gap-2">
            <h1 className="font-black text-3xl text-gray-800 drop-shadow-sm flex items-center gap-2">
              <BarChart2 className="w-7 h-7 text-orange-500" />
              Administrator Dashboard
            </h1>
            <p className="text-sm text-gray-600 text-center">
              Enter the key to access, then select a student to view daily average accuracy and weekly summaries.
            </p>
          </div>
        </div>

        {!isAuthed ? (
          <GlassCard>
            <div className="p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-gray-800 font-semibold">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Access Control
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                <div className="flex items-center gap-2 rounded-2xl bg-white/30 border border-white/30 px-3 py-2">
                  <KeyRound className="w-4 h-4 text-gray-700" />
                  <input
                    type="password"
                    value={keyInput}
                    onChange={e => setKeyInput(e.target.value)}
                    placeholder="Enter administrator key"
                    className="flex-1 bg-transparent outline-none placeholder:text-gray-600 text-gray-800"
                    onKeyDown={(e) => e.key === 'Enter' && checkKey()}
                  />
                </div>
                <button
                  onClick={checkKey}
                  className="rounded-2xl px-4 py-2 bg-orange-500/90 hover:bg-orange-500 text-white font-semibold transition-all"
                >
                  Enter
                </button>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
          </GlassCard>
        ) : (
          <>
            <GlassCard>
              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                <div className="flex items-center gap-2 rounded-2xl bg-white/30 border border-white/30 px-3 py-2">
                  <User className="w-4 h-4 text-gray-700" />
                  <input
                    value={student}
                    onChange={e => setStudent(e.target.value)}
                    placeholder="Enter name (e.g. 'First Last name') or email address"
                    className="flex-1 bg-transparent outline-none placeholder:text-gray-600 text-gray-800"
                    onKeyDown={(e) => e.key === 'Enter' && loadMetrics()}
                  />
                </div>
                <button
                  onClick={loadMetrics}
                  disabled={loading}
                  className="rounded-2xl px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Load metrics"}
                </button>
              </div>
              {error && <p className="text-red-600 text-sm px-5">{error}</p>}
            </GlassCard>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <GlassCard className="flex flex-col">
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Total Days Online (past 14 days)</div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="text-2xl font-black text-orange-600 mb-2">{days.length}</div>
                    <div className="flex items-baseline gap-1 flex-wrap">
                      {previousMonthDaysOnline !== null && (() => {
                        const currentDays = days.length
                        if (previousMonthDaysOnline === 0 && currentDays === 0) return null
                        const change = previousMonthDaysOnline > 0 
                          ? ((currentDays - previousMonthDaysOnline) / previousMonthDaysOnline) * 100
                          : (currentDays > 0 ? 100 : 0)
                        const changeRounded = Math.round(change * 100) / 100
                        if (changeRounded === 0) return null
                        return (
                          <>
                            <div className={`text-sm font-bold ${
                              changeRounded > 0 ? 'text-emerald-600' : changeRounded < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {changeRounded > 0 ? '+' : ''}{changeRounded.toFixed(2)}%
                            </div>
                            <div className="text-xs text-gray-500">compared to last month</div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="flex flex-col">
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Total Quiz Attempts (past 14 days)</div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="text-2xl font-black text-orange-600 mb-2">
                      {days.reduce((s, x) => s + (x.attempts || 0), 0)}
                    </div>
                    <div className="flex items-baseline gap-1 flex-wrap">
                      {previousMonthAttempts !== null && (() => {
                        const currentAttempts = days.reduce((s, x) => s + (x.attempts || 0), 0)
                        if (previousMonthAttempts === 0 && currentAttempts === 0) return null
                        const change = previousMonthAttempts > 0 
                          ? ((currentAttempts - previousMonthAttempts) / previousMonthAttempts) * 100
                          : (currentAttempts > 0 ? 100 : 0)
                        const changeRounded = Math.round(change * 100) / 100
                        if (changeRounded === 0) return null
                        return (
                          <>
                            <div className={`text-sm font-bold ${
                              changeRounded > 0 ? 'text-emerald-600' : changeRounded < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {changeRounded > 0 ? '+' : ''}{changeRounded.toFixed(2)}%
                            </div>
                            <div className="text-xs text-gray-500">compared to last month</div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="flex flex-col">
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Overall Average Accuracy (past 14 days)</div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="text-2xl font-black text-orange-600 mb-2">
                      {(() => {
                        const totalAttempts = days.reduce((s, x) => s + (x.attempts || 0), 0)
                        if (totalAttempts === 0) return '0%'
                        // Weighted average: sum of (avgCorrect * attempts) / total attempts
                        const weightedSum = days.reduce((s, x) => s + ((x.avgCorrect || 0) * (x.attempts || 0)), 0)
                        return Math.round((weightedSum / totalAttempts) * 100) + '%'
                      })()}
                    </div>
                    <div className="flex items-baseline gap-1 flex-wrap">
                      {previousMonthAvg !== null && (() => {
                        const totalAttempts = days.reduce((s, x) => s + (x.attempts || 0), 0)
                        if (totalAttempts === 0) return null
                        const weightedSum = days.reduce((s, x) => s + ((x.avgCorrect || 0) * (x.attempts || 0)), 0)
                        const currentAvg = (weightedSum / totalAttempts) * 100
                        if (previousMonthAvg === 0 && currentAvg === 0) return null
                        const change = previousMonthAvg > 0 
                          ? ((currentAvg - previousMonthAvg) / previousMonthAvg) * 100
                          : (currentAvg > 0 ? 100 : 0)
                        const changeRounded = Math.round(change * 100) / 100
                        if (changeRounded === 0) return null
                        return (
                          <>
                            <div className={`text-sm font-bold ${
                              changeRounded > 0 ? 'text-emerald-600' : changeRounded < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {changeRounded > 0 ? '+' : ''}{changeRounded.toFixed(2)}%
                            </div>
                            <div className="text-xs text-gray-500">compared to last month</div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            <GlassCard>
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2 text-gray-800 font-semibold mb-4">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Biweekly Average Accuracy (%)
                </div>
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={(() => {
                      // Fill in all 14 days, even if no data
                      const today = new Date()
                      const allDays: DayPoint[] = []
                      const daysMap = new Map(days.map(d => [d.date, d]))
                      
                      for (let i = 13; i >= 0; i--) {
                        const date = new Date(today)
                        date.setDate(date.getDate() - i)
                        const dateStr = date.toISOString().split('T')[0]
                        const existingDay = daysMap.get(dateStr)
                        allDays.push(existingDay || {
                          date: dateStr,
                          avgCorrect: 0,
                          attempts: 0
                        })
                      }
                      return allDays.map(d => ({ ...d, pct: Math.round((d.avgCorrect || 0) * 100) }))
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fill: '#6b7280' }} 
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                        tickLine={{ stroke: '#d1d5db' }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          const month = date.toLocaleDateString('en-US', { month: 'short' })
                          const day = date.getDate()
                          return `${month} ${day}`
                        }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                        tickLine={{ stroke: '#d1d5db' }}
                        label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 } }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="rounded-xl border border-white/40 bg-white/95 backdrop-blur-md p-4 shadow-xl">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs uppercase text-gray-500 font-semibold tracking-wide">Date</span>
                                    <span className="font-bold text-gray-900 text-sm">{data.date}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs uppercase text-gray-500 font-semibold tracking-wide">Accuracy</span>
                                    <span className="font-black text-orange-600 text-lg">{payload[0].value}%</span>
                                  </div>
                                  {data.attempts !== undefined && (
                                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-200">
                                      <span className="text-xs uppercase text-gray-500 font-semibold tracking-wide">Attempts</span>
                                      <span className="font-bold text-gray-800">{data.attempts}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="pct" 
                        stroke="#f97316" 
                        strokeWidth={3}
                        dot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                      />
                      <ReferenceLine y={50} stroke="#9ca3af" strokeDasharray="2 2" opacity={0.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="p-5 sm:p-6">
                <div className="text-gray-800 font-semibold mb-4">Weekly Summary (all weeks)</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600 border-b border-white/20">
                        <th className="py-3 pr-4 font-semibold">Week</th>
                        <th className="py-3 pr-4 font-semibold">Best</th>
                        <th className="py-3 pr-4 font-semibold">Worst</th>
                        <th className="py-3 pr-4 font-semibold">Attempts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeks.map((w, idx) => {
                        const isExpanded = expandedWeeks.has(w.week)
                        const quizzes = quizDetails[w.week] || []
                        const hasQuizzes = quizzes.length > 0
                        
                        return (
                          <React.Fragment key={w.week}>
                            <tr 
                              className={`${idx < weeks.length - 1 ? 'border-b border-white/10' : ''} hover:bg-white/10 transition-colors ${hasQuizzes ? 'cursor-pointer' : ''}`}
                              onClick={() => hasQuizzes && setExpandedWeeks(prev => {
                                const next = new Set(prev)
                                if (next.has(w.week)) {
                                  next.delete(w.week)
                                } else {
                                  next.add(w.week)
                                }
                                return next
                              })}
                            >
                              <td className="py-3 pr-4 font-medium text-gray-800">
                                <div className="flex items-center gap-2">
                                  {w.weekRange || w.week}
                                  {hasQuizzes && (
                                    isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-500" />
                                    )
                                  )}
                                </div>
                              </td>
                              <td className="py-3 pr-4 text-green-600 font-medium">{w.best}%</td>
                              <td className="py-3 pr-4 text-red-600 font-medium">{w.worst}%</td>
                              <td className="py-3 pr-4 text-gray-700">{w.attempts}</td>
                            </tr>
                            {isExpanded && hasQuizzes && (
                              <tr key={`${w.week}-details`} className="bg-white/5">
                                <td colSpan={4} className="py-4 px-4">
                                  <div className="space-y-2">
                                    <div className="text-xs font-semibold text-gray-600 mb-2">Individual Quiz Performances:</div>
                                    <div className="space-y-1">
                                      {quizzes.map((quiz, quizIdx) => {
                                        const date = new Date(quiz.completedAt)
                                        const dateStr = date.toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric', 
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })
                                        const nodeTypeColors = {
                                          common: 'text-gray-500',
                                          rare: 'text-blue-500',
                                          legendary: 'text-yellow-500'
                                        }
                                        
                                        return (
                                          <div 
                                            key={quiz.id} 
                                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/10 border border-white/20 text-sm"
                                          >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                              <span className="text-gray-500 text-xs flex-shrink-0">#{quizIdx + 1}</span>
                                              <span className="text-gray-700 flex-shrink-0">{dateStr}</span>
                                              <span className={`font-medium flex-shrink-0 ${quiz.percentage >= 80 ? 'text-green-600' : quiz.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {quiz.percentage}%
                                              </span>
                                              <span className="text-gray-600 flex-shrink-0">
                                                ({quiz.score}/{quiz.totalQuestions})
                                              </span>
                                            </div>
                                            <div className="flex-shrink-0">
                                              <span className="text-gray-600 whitespace-nowrap">Streak: <span className="font-medium text-orange-600">{quiz.streak}</span></span>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })}
                      {!weeks.length && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-500">
                            No weekly data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </GlassCard>
          </>
        )}
      </div>
    </div>
  )
}

