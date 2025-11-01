"use client"

import { useState } from 'react'
import { X } from 'lucide-react'

export default function GroupChatAccessModal({ isOpen, onClose, onJoinGroup, onCreateGroup }) {
  const [mode, setMode] = useState('join')
  const [accessKey, setAccessKey] = useState('')
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'join') {
        if (!accessKey.trim()) {
          setError('Please enter an access key')
          return
        }
        await onJoinGroup(accessKey.trim())
      } else {
        if (!groupName.trim() || !accessKey.trim()) {
          setError('Please enter a group name and access key')
          return
        }
        await onCreateGroup({
          name: groupName.trim(),
          description: groupDescription.trim(),
          accessKey: accessKey.trim()
        })
      }

      // Reset form
      setAccessKey('')
      setGroupName('')
      setGroupDescription('')
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {mode === 'join' ? 'Join Group Chat' : 'Create Group Chat'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setMode('join')}
            className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
              mode === 'join'
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            Join Existing
          </button>
          <button
            onClick={() => setMode('create')}
            className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
              mode === 'create'
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            Create New
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'create' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Access Key *
            </label>
            <input
              type="text"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder={mode === 'join' ? 'Enter access key to join' : 'Create an access key'}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-zinc-500">
              {mode === 'join'
                ? 'Ask the group admin for the access key'
                : 'Share this key with others to let them join'}
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'join' ? 'Join Group' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  )
}