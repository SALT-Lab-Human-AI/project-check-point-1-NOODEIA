'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Users } from 'lucide-react'
import GroupChatList from '@/components/GroupChatList'
import GroupChat from '@/components/GroupChat'
import GroupChatAccessModal from '@/components/GroupChatAccessModal'
import { supabase } from '@/lib/supabase'

export default function GroupChatPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [groups, setGroups] = useState([])
  const [selectedGroupData, setSelectedGroupData] = useState<any>(null)
  const [authToken, setAuthToken] = useState<string>('')
  const [theme, setTheme] = useState('light')
  const router = useRouter()

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
  }, [theme])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()

      if (!user || !session) {
        router.push('/')
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
      <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="w-80 border-r bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b px-4 dark:border-zinc-800">
            <h2 className="text-lg font-semibold">Group Chats</h2>
            <button
              onClick={() => router.push('/')}
              className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Back to AI Tutor"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <GroupChatList
              groups={groups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={setSelectedGroupId}
            />
          </div>

          <div className="border-t dark:border-zinc-800">
            <div className="px-4 py-2">
              <button
                onClick={() => router.push('/')}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to AI Tutor
              </button>
            </div>
            <div className="px-4 pb-2">
              <button
                onClick={() => setShowAccessModal(true)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <Plus className="h-4 w-4" />
                Join or Create Group
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
          <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 mb-4 text-zinc-300 dark:text-zinc-600" />
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