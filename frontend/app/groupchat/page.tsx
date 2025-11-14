'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Users, Home } from 'lucide-react'
import GroupChatList from '@/components/GroupChatList'
import GroupChat from '@/components/GroupChat'
import GroupChatAccessModal from '@/components/GroupChatAccessModal'
import ThemeCycleButton from '@/components/ThemeCycleButton'
import { supabase } from '@/lib/supabase'

export default function GroupChatPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [groups, setGroups] = useState([])
  const [selectedGroupData, setSelectedGroupData] = useState<any>(null)
  const [authToken, setAuthToken] = useState<string>('')
  const [themeName, setThemeName] = useState('cream')  // Color theme: cream, lilac, rose, sky
  const router = useRouter()

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('themeName')
    if (savedTheme) {
      setThemeName(savedTheme)
    }
  }, [])

  useEffect(() => {
    // Apply theme to document (always light mode, just different colors)
    document.documentElement.classList.remove('dark')
    document.documentElement.setAttribute('data-theme', themeName)
    document.documentElement.style.colorScheme = 'light'
    localStorage.setItem('themeName', themeName)
  }, [themeName])

  useEffect(() => {
    // Add chat-interface class to html and body for proper styling
    document.documentElement.classList.add("chat-interface")
    document.body.classList.add("chat-interface")

    // Remove the classes when component unmounts
    return () => {
      document.documentElement.classList.remove("chat-interface")
      document.body.classList.remove("chat-interface")
    }
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()

      if (!user || !session) {
        router.push('/login')
      } else {
        setUser(user)
        setAuthToken(session.access_token)
        fetchGroups()
      }
    }
    checkUser()
  }, [router])

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groupchat', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Cache-Control': 'no-cache' // Force fresh fetch
        }
      })
      if (response.ok) {
        const data = await response.json()
        setGroups(data)
      } else {
        const error = await response.json()
        console.error('Fetch groups error:', error)
      }
    } catch (error) {
      console.error('Fetch groups exception:', error)
    }
  }

  useEffect(() => {
    if (selectedGroupId && groups.length > 0) {
      const group = groups.find((g: any) => g.id === selectedGroupId)
      setSelectedGroupData(group)
    }
  }, [selectedGroupId, groups])

  const handleJoinGroup = async (accessKey: string) => {
    try {
      const response = await fetch('/api/groupchat/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ accessKey })
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedGroupId(data.id)
        setShowAccessModal(false)
        await fetchGroups()
      } else {
        const error = await response.json()
        console.error('Join error:', error)
      }
    } catch (error) {
      console.error('Join exception:', error)
    }
  }

  const handleCreateGroup = async (groupData: { name: string, description: string, accessKey: string }) => {
    try {
      const response = await fetch('/api/groupchat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(groupData)
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedGroupId(data.id)
        setShowAccessModal(false)
        await fetchGroups()
      } else {
        const error = await response.json()
        console.error('Create error:', error)
      }
    } catch (error) {
      console.error('Create exception:', error)
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groupchat/${groupId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        // Clear selection first
        setSelectedGroupId(null)
        // Wait a bit to ensure the leave operation completes in the database
        await new Promise(resolve => setTimeout(resolve, 100))
        // Then refresh the groups list
        await fetchGroups()
      } else {
        const error = await response.json()
        // Show the error message to the user
        alert(error.error || 'Failed to leave group')
      }
    } catch (error) {
      console.error('Error leaving group:', error)
      alert('Failed to leave group. Please try again.')
    }
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--surface-0)]">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[var(--surface-0)] text-zinc-900">
      <div className="w-80 border-r border-[var(--surface-2-border)] bg-[var(--surface-2)]">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b border-[var(--surface-2-border)] px-4">
            <h2 className="text-lg font-semibold">Group Chats</h2>
            <div className="flex items-center gap-2">
              <ThemeCycleButton
                currentTheme={themeName}
                onThemeChange={setThemeName}
              />
              <button
                onClick={() => router.push('/home')}
                className="rounded-lg p-2 hover:bg-black/10"
                title="Homepage"
              >
                <Home className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <GroupChatList
              groups={groups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={setSelectedGroupId}
            />
          </div>

          <div className="border-t border-[var(--surface-2-border)]">
            <div className="px-4 py-2">
              <button
                onClick={() => setShowAccessModal(true)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-white hover:bg-zinc-800"
              >
                <Plus className="h-4 w-4" />
                Join or Create Group
              </button>
            </div>
            <div className="px-4 pb-2">
              <button
                onClick={() => router.push('/home')}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 text-zinc-900 hover:bg-zinc-200"
              >
                <Home className="h-4 w-4" />
                Homepage
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {selectedGroupId && selectedGroupData ? (
          <GroupChat
            groupId={selectedGroupId}
            groupData={selectedGroupData}
            currentUser={user}
            authToken={authToken}
            onLeaveGroup={handleLeaveGroup}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 mb-4 text-zinc-300" />
              <p>Select a group chat or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {showAccessModal && (
        <GroupChatAccessModal
          isOpen={showAccessModal}
          onClose={() => setShowAccessModal(false)}
          onJoinGroup={handleJoinGroup}
          onCreateGroup={handleCreateGroup}
        />
      )}
    </div>
  )
}