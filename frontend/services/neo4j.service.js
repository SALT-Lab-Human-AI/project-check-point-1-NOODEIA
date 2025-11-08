import { neo4jService } from '../lib/neo4j.js'
import { v4 as uuidv4 } from 'uuid'

class Neo4jDataService {
  async createUser(id, email, name) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        CREATE (u:User {
          id: $id,
          email: $email,
          name: $name,
          xp: 0,
          level: 1,
          created_at: datetime(),
          updated_at: datetime()
        })
        RETURN u
        `,
        { id, email, name }
      )

      return neo4jService.nodeToObject(result.records[0].get('u'))
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getUserByEmail(email) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {email: $email})
        RETURN u
        `,
        { email }
      )

      if (result.records.length === 0) return null
      return neo4jService.nodeToObject(result.records[0].get('u'))
    } catch (error) {
      console.error('Error getting user by email:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getUserById(userId) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})
        RETURN u
        `,
        { userId }
      )

      if (result.records.length === 0) return null
      return neo4jService.nodeToObject(result.records[0].get('u'))
    } catch (error) {
      console.error('Error getting user by ID:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async updateUser(userId, updates) {
    const session = neo4jService.getSession()
    try {
      const setClauses = Object.keys(updates)
        .map((key) => `u.${key} = $${key}`)
        .join(', ')

      const result = await session.run(
        `
        MATCH (u:User {id: $userId})
        SET ${setClauses}, u.updated_at = datetime()
        RETURN u
        `,
        { userId, ...updates }
      )

      return neo4jService.nodeToObject(result.records[0].get('u'))
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async createSession(userId, title) {
    const session = neo4jService.getSession()
    try {
      const sessionId = uuidv4()
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})
        CREATE (s:Session {
          id: $sessionId,
          title: $title,
          created_at: datetime(),
          updated_at: datetime()
        })
        CREATE (u)-[:HAS]->(s)
        RETURN s
        `,
        { userId, sessionId, title }
      )

      return neo4jService.nodeToObject(result.records[0].get('s'))
    } catch (error) {
      console.error('Error creating session:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getUserSessions(userId) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[:HAS]->(s:Session)
        RETURN s
        ORDER BY s.updated_at DESC
        `,
        { userId }
      )

      return result.records.map((record) =>
        neo4jService.nodeToObject(record.get('s'))
      )
    } catch (error) {
      console.error('Error getting user sessions:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getSessionById(sessionId) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (s:Session {id: $sessionId})
        RETURN s
        `,
        { sessionId }
      )

      if (result.records.length === 0) return null
      return neo4jService.nodeToObject(result.records[0].get('s'))
    } catch (error) {
      console.error('Error getting session by ID:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async updateSession(sessionId, title) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (s:Session {id: $sessionId})
        SET s.title = $title, s.updated_at = datetime()
        RETURN s
        `,
        { sessionId, title }
      )

      return neo4jService.nodeToObject(result.records[0].get('s'))
    } catch (error) {
      console.error('Error updating session:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async touchSession(sessionId) {
    const session = neo4jService.getSession()
    try {
      await session.run(
        `
        MATCH (s:Session {id: $sessionId})
        SET s.updated_at = datetime()
        `,
        { sessionId }
      )
    } catch (error) {
      console.error('Error touching session:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async deleteSession(sessionId) {
    const session = neo4jService.getSession()
    try {
      await session.run(
        `
        MATCH (s:Session {id: $sessionId})
        OPTIONAL MATCH (s)-[:OCCURRED]->(c:Chat)
        DETACH DELETE s, c
        `,
        { sessionId }
      )

      return true
    } catch (error) {
      console.error('Error deleting session:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async createChat(sessionId, role, content) {
    const session = neo4jService.getSession()
    try {
      const chatId = uuidv4()

      console.log('💬 Creating Chat:', {
        sessionId: sessionId.substring(0, 8) + '...',
        chatId: chatId.substring(0, 8) + '...',
        role,
        contentPreview: content.substring(0, 50) + '...'
      })

      // Create the chat and NEXT relationship in a single transaction
      const result = await session.run(
        `
        MATCH (s:Session {id: $sessionId})

        // Find the last chat in this session
        OPTIONAL MATCH (s)-[:OCCURRED]->(lastChat:Chat)
        WITH s, lastChat
        ORDER BY lastChat.created_at DESC
        LIMIT 1
        WITH s, lastChat

        // Create new chat
        CREATE (c:Chat {
          id: $chatId,
          role: $role,
          content: $content,
          created_at: datetime()
        })
        CREATE (s)-[:OCCURRED]->(c)

        // Create NEXT relationship if there was a previous chat
        FOREACH (prev IN CASE WHEN lastChat IS NOT NULL THEN [lastChat] ELSE [] END |
          CREATE (prev)-[:NEXT]->(c)
        )

        RETURN c, s.id as verifySessionId, lastChat.id as prevChatId
        `,
        { sessionId, chatId, role, content }
      )

      if (result.records.length === 0) {
        console.error('❌ Failed to create chat: Session not found')
        throw new Error('Session not found')
      }

      const record = result.records[0]
      const newChat = neo4jService.nodeToObject(record.get('c'))
      const verifySessionId = record.get('verifySessionId')
      const prevChatId = record.get('prevChatId')

      console.log('✅ Chat created successfully')
      console.log('✅ OCCURRED relationship: Session', verifySessionId.substring(0, 8) + '... -> Chat', chatId.substring(0, 8) + '...')

      if (prevChatId) {
        console.log('✅ NEXT relationship: Chat', prevChatId.substring(0, 8) + '... -> Chat', chatId.substring(0, 8) + '...')
      } else {
        console.log('📎 No previous chat - this is the first message in session')
      }

      await this.touchSession(sessionId)

      return newChat
    } catch (error) {
      console.error('❌ Error creating chat:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getSessionChats(sessionId) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (s:Session {id: $sessionId})-[:OCCURRED]->(c:Chat)
        RETURN c
        ORDER BY c.created_at ASC
        `,
        { sessionId }
      )

      return result.records.map((record) =>
        neo4jService.nodeToObject(record.get('c'))
      )
    } catch (error) {
      console.error('Error getting session chats:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getSessionWithChats(sessionId) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (s:Session {id: $sessionId})
        OPTIONAL MATCH (s)-[:OCCURRED]->(c:Chat)
        WITH s, c
        ORDER BY c.created_at ASC
        RETURN s, collect(c) as chats
        `,
        { sessionId }
      )

      if (result.records.length === 0) return null

      const record = result.records[0]
      return {
        session: neo4jService.nodeToObject(record.get('s')),
        chats: record
          .get('chats')
          .map((c) => neo4jService.nodeToObject(c))
          .filter(Boolean),
      }
    } catch (error) {
      console.error('Error getting session with chats:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async updateChat(chatId, content) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (c:Chat {id: $chatId})
        SET c.content = $content
        RETURN c
        `,
        { chatId, content }
      )

      return neo4jService.nodeToObject(result.records[0].get('c'))
    } catch (error) {
      console.error('Error updating chat:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async deleteChat(chatId) {
    const session = neo4jService.getSession()
    try {
      await session.run(
        `
        MATCH (c:Chat {id: $chatId})
        DETACH DELETE c
        `,
        { chatId }
      )

      return true
    } catch (error) {
      console.error('Error deleting chat:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async deleteChatsAfter(sessionId, chatId) {
    const session = neo4jService.getSession()
    try {
      await session.run(
        `
        MATCH (s:Session {id: $sessionId})-[:OCCURRED]->(start:Chat {id: $chatId})
        MATCH (start)-[:NEXT*]->(c:Chat)
        DETACH DELETE c
        `,
        { sessionId, chatId }
      )

      return true
    } catch (error) {
      console.error('Error deleting chats after:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getUserStats(userId) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[:HAS]->(s:Session)
        OPTIONAL MATCH (s)-[:OCCURRED]->(c:Chat)
        RETURN
          count(DISTINCT s) as totalSessions,
          count(c) as totalChats,
          sum(CASE WHEN c.role = 'user' THEN 1 ELSE 0 END) as userChats,
          sum(CASE WHEN c.role = 'assistant' THEN 1 ELSE 0 END) as assistantChats
        `,
        { userId }
      )

      const record = result.records[0]
      return {
        totalSessions: neo4jService.toNumber(record.get('totalSessions')),
        totalChats: neo4jService.toNumber(record.get('totalChats')),
        userChats: neo4jService.toNumber(record.get('userChats')),
        assistantChats: neo4jService.toNumber(record.get('assistantChats')),
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async searchSessions(userId, searchTerm) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[:HAS]->(s:Session)
        WHERE toLower(s.title) CONTAINS toLower($searchTerm)
        RETURN s
        ORDER BY s.updated_at DESC
        `,
        { userId, searchTerm }
      )

      return result.records.map((record) =>
        neo4jService.nodeToObject(record.get('s'))
      )
    } catch (error) {
      console.error('Error searching sessions:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getDailyAndWeeklyForStudent(studentKey) {
    const session = neo4jService.getSession()
    try {
      // Find user by id, name, or email
      const userResult = await session.run(
        `
        MATCH (u:User)
        WHERE u.id = $studentKey 
           OR toLower(u.name) = toLower($studentKey)
           OR toLower(u.email) = toLower($studentKey)
        RETURN u.id as userId
        LIMIT 1
        `,
        { studentKey }
      )

      if (userResult.records.length === 0) {
        return { days: [], weeks: [] }
      }

      const userId = userResult.records[0].get('userId')

      // Get daily stats for last 14 days
      const dailyResult = await session.run(
        `
        MATCH (u:User {id: $userId})-[:COMPLETED]->(qs:QuizSession)
        WHERE qs.completedAt >= datetime() - duration({days: 14})
        WITH date(qs.completedAt) as day,
             avg(toFloat(qs.score) / toFloat(qs.totalQuestions)) as avgCorrect,
             count(qs) as attempts
        RETURN day as date, avgCorrect, attempts
        ORDER BY day ASC
        `,
        { userId }
      )

      const days = dailyResult.records.map(record => {
        const date = record.get('date')
        const avgCorrect = neo4jService.toNumber(record.get('avgCorrect')) || 0
        const attempts = neo4jService.toNumber(record.get('attempts')) || 0
        
        // Format date as YYYY-MM-DD
        let dateStr = ''
        if (date) {
          if (typeof date === 'object' && 'year' in date) {
            // Neo4j Date object
            dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
          } else if (date.toStandardDate) {
            // Neo4j DateTime converted to Date
            const jsDate = date.toStandardDate()
            dateStr = jsDate.toISOString().split('T')[0]
          } else {
            // String or other format
            dateStr = String(date)
          }
        }
        
        return {
          date: dateStr,
          avgCorrect: avgCorrect,
          attempts: attempts
        }
      })

      // Get weekly stats - group by ISO week (all weeks)
      const weeklyResult = await session.run(
        `
        MATCH (u:User {id: $userId})-[:COMPLETED]->(qs:QuizSession)
        WITH 
          date(qs.completedAt) as day,
          toFloat(qs.score) / toFloat(qs.totalQuestions) * 100 as pct,
          qs.id as sessionId
        WITH 
          day.year as year,
          day.week as week,
          pct,
          sessionId
        WITH 
          year,
          week,
          max(pct) as best,
          min(pct) as worst,
          count(pct) as attempts,
          collect(sessionId) as sessionIds
        RETURN 
          year,
          week,
          toString(year) + '-W' + 
          CASE 
            WHEN week < 10 THEN '0' + toString(week)
            ELSE toString(week)
          END as weekLabel,
          round(best) as best,
          round(worst) as worst,
          attempts,
          sessionIds
        ORDER BY year DESC, week DESC
        `,
        { userId }
      )

      // Helper function to get ISO week date range
      const getISOWeekRange = (year, week) => {
        // Calculate the date of the Monday of the ISO week
        // ISO week 1 is the week containing Jan 4
        const jan4 = new Date(year, 0, 4)
        const jan4Day = jan4.getDay() || 7 // Convert Sunday (0) to 7
        const daysToMonday = jan4Day - 1
        const week1Monday = new Date(jan4)
        week1Monday.setDate(jan4.getDate() - daysToMonday)
        
        // Calculate the Monday of the target week
        const targetMonday = new Date(week1Monday)
        targetMonday.setDate(week1Monday.getDate() + (week - 1) * 7)
        
        // Calculate Sunday (end of week)
        const targetSunday = new Date(targetMonday)
        targetSunday.setDate(targetMonday.getDate() + 6)
        
        // Format dates as YYYY-MM-DD
        const formatDate = (date) => {
          const y = date.getFullYear()
          const m = String(date.getMonth() + 1).padStart(2, '0')
          const d = String(date.getDate()).padStart(2, '0')
          return `${y}-${m}-${d}`
        }
        
        return {
          start: formatDate(targetMonday),
          end: formatDate(targetSunday)
        }
      }

      const weeks = weeklyResult.records.map(record => {
        const year = neo4jService.toNumber(record.get('year'))
        const week = neo4jService.toNumber(record.get('week'))
        const weekLabel = record.get('weekLabel') || ''
        const best = neo4jService.toNumber(record.get('best')) || 0
        const worst = neo4jService.toNumber(record.get('worst')) || 0
        const attempts = neo4jService.toNumber(record.get('attempts')) || 0
        const sessionIds = record.get('sessionIds') || []
        
        const dateRange = getISOWeekRange(year, week)
        
        return {
          year,
          week,
          week: weekLabel,
          weekRange: `${dateRange.start} to ${dateRange.end}`,
          best: best,
          worst: worst,
          attempts: attempts,
          sessionIds: sessionIds
        }
      })

      // Get individual quiz sessions for each week
      const quizDetails = {}
      for (const weekData of weeks) {
        if (weekData.sessionIds && weekData.sessionIds.length > 0) {
          const sessionsResult = await session.run(
            `
            MATCH (u:User {id: $userId})-[:COMPLETED]->(qs:QuizSession)
            WHERE qs.id IN $sessionIds
            RETURN qs.id as id,
                   qs.score as score,
                   qs.totalQuestions as totalQuestions,
                   qs.streak as streak,
                   qs.xpEarned as xpEarned,
                   qs.nodeType as nodeType,
                   qs.completedAt as completedAt
            ORDER BY qs.completedAt ASC
            `,
            { userId, sessionIds: weekData.sessionIds }
          )

          quizDetails[weekData.week] = sessionsResult.records.map(record => {
            const completedAt = record.get('completedAt')
            let dateStr = ''
            if (completedAt) {
              if (completedAt.toStandardDate) {
                const jsDate = completedAt.toStandardDate()
                dateStr = jsDate.toISOString()
              } else {
                dateStr = String(completedAt)
              }
            }

            return {
              id: record.get('id'),
              score: neo4jService.toNumber(record.get('score')) || 0,
              totalQuestions: neo4jService.toNumber(record.get('totalQuestions')) || 0,
              streak: neo4jService.toNumber(record.get('streak')) || 0,
              xpEarned: neo4jService.toNumber(record.get('xpEarned')) || 0,
              nodeType: record.get('nodeType') || 'common',
              completedAt: dateStr,
              percentage: Math.round(((neo4jService.toNumber(record.get('score')) || 0) / (neo4jService.toNumber(record.get('totalQuestions')) || 1)) * 100)
            }
          })
        }
      }

      // Calculate current month and previous month average accuracy
      const now = new Date()
      const currentMonth = parseInt(now.getMonth() + 1, 10) // Neo4j months are 1-12, ensure integer
      const currentYear = parseInt(now.getFullYear(), 10) // Ensure integer
      const nextMonth = currentMonth === 12 ? 1 : parseInt(currentMonth + 1, 10)
      const nextYear = currentMonth === 12 ? parseInt(currentYear + 1, 10) : parseInt(currentYear, 10)
      
      const previousMonth = currentMonth === 1 ? 12 : parseInt(currentMonth - 1, 10)
      const previousYear = currentMonth === 1 ? parseInt(currentYear - 1, 10) : parseInt(currentYear, 10)
      const previousNextMonth = previousMonth === 12 ? 1 : parseInt(previousMonth + 1, 10)
      const previousNextYear = previousMonth === 12 ? parseInt(previousYear + 1, 10) : parseInt(previousYear, 10)

      // Get current month average
      const currentMonthResult = await session.run(
        `
        MATCH (u:User {id: $userId})-[:COMPLETED]->(qs:QuizSession)
        WHERE qs.completedAt >= datetime({year: toInteger($currentYear), month: toInteger($currentMonth), day: 1, hour: 0, minute: 0, second: 0})
          AND qs.completedAt < datetime({year: toInteger($nextYear), month: toInteger($nextMonth), day: 1, hour: 0, minute: 0, second: 0})
        WITH sum(toFloat(qs.score)) as totalScore, sum(toFloat(qs.totalQuestions)) as totalQuestions
        RETURN CASE WHEN totalQuestions > 0 THEN (totalScore / totalQuestions * 100) ELSE 0 END as avgAccuracy
        `,
        { 
          userId, 
          currentYear, 
          currentMonth, 
          nextYear, 
          nextMonth
        }
      )

      // Get previous month average
      const previousMonthResult = await session.run(
        `
        MATCH (u:User {id: $userId})-[:COMPLETED]->(qs:QuizSession)
        WHERE qs.completedAt >= datetime({year: toInteger($previousYear), month: toInteger($previousMonth), day: 1, hour: 0, minute: 0, second: 0})
          AND qs.completedAt < datetime({year: toInteger($previousNextYear), month: toInteger($previousNextMonth), day: 1, hour: 0, minute: 0, second: 0})
        WITH sum(toFloat(qs.score)) as totalScore, sum(toFloat(qs.totalQuestions)) as totalQuestions
        RETURN CASE WHEN totalQuestions > 0 THEN (totalScore / totalQuestions * 100) ELSE 0 END as avgAccuracy
        `,
        { 
          userId, 
          previousYear, 
          previousMonth, 
          previousNextYear, 
          previousNextMonth
        }
      )

      // Get previous month's days online (same 14-day period from previous month)
      const fourteenDaysAgo = new Date(now)
      fourteenDaysAgo.setDate(now.getDate() - 14)
      
      // Calculate the same 14-day period from the previous month
      const previousFourteenDaysAgo = new Date(fourteenDaysAgo)
      previousFourteenDaysAgo.setMonth(previousFourteenDaysAgo.getMonth() - 1)
      const previousFourteenDaysEnd = new Date(now)
      previousFourteenDaysEnd.setMonth(previousFourteenDaysEnd.getMonth() - 1)

      const previousMonthDaysResult = await session.run(
        `
        MATCH (u:User {id: $userId})-[:COMPLETED]->(qs:QuizSession)
        WHERE qs.completedAt >= datetime({year: toInteger($prevStartYear), month: toInteger($prevStartMonth), day: toInteger($prevStartDay), hour: 0, minute: 0, second: 0})
          AND qs.completedAt < datetime({year: toInteger($prevEndYear), month: toInteger($prevEndMonth), day: toInteger($prevEndDay), hour: 0, minute: 0, second: 0})
        WITH date(qs.completedAt) as day
        RETURN count(DISTINCT day) as daysOnline, sum(1) as totalAttempts
        `,
        { 
          userId,
          prevStartYear: previousFourteenDaysAgo.getFullYear(),
          prevStartMonth: previousFourteenDaysAgo.getMonth() + 1,
          prevStartDay: previousFourteenDaysAgo.getDate(),
          prevEndYear: previousFourteenDaysEnd.getFullYear(),
          prevEndMonth: previousFourteenDaysEnd.getMonth() + 1,
          prevEndDay: previousFourteenDaysEnd.getDate()
        }
      )

      const currentMonthAvg = currentMonthResult.records[0] 
        ? neo4jService.toNumber(currentMonthResult.records[0].get('avgAccuracy')) || 0 
        : 0
      const previousMonthAvg = previousMonthResult.records[0] 
        ? neo4jService.toNumber(previousMonthResult.records[0].get('avgAccuracy')) || 0 
        : 0
      
      const previousMonthDaysOnline = previousMonthDaysResult.records[0]
        ? neo4jService.toNumber(previousMonthDaysResult.records[0].get('daysOnline')) || 0
        : 0
      const previousMonthAttempts = previousMonthDaysResult.records[0]
        ? neo4jService.toNumber(previousMonthDaysResult.records[0].get('totalAttempts')) || 0
        : 0

      // Calculate percentage change
      let monthOverMonthChange = 0
      if (previousMonthAvg > 0) {
        monthOverMonthChange = ((currentMonthAvg - previousMonthAvg) / previousMonthAvg) * 100
      } else if (currentMonthAvg > 0) {
        monthOverMonthChange = 100 // 100% increase from 0
      }

      return { 
        days, 
        weeks, 
        quizDetails,
        monthOverMonthChange: Math.round(monthOverMonthChange * 10) / 10, // Round to 1 decimal
        currentMonthAvg: Math.round(currentMonthAvg * 10) / 10,
        previousMonthAvg: Math.round(previousMonthAvg * 10) / 10,
        previousMonthDaysOnline,
        previousMonthAttempts
      }
    } catch (error) {
      console.error('Error getting daily and weekly stats:', error)
      throw error
    } finally {
      await session.close()
    }
  }
}

export const neo4jDataService = new Neo4jDataService()
