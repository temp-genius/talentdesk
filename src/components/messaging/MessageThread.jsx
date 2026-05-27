import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

function formatTime(ts) {
  const date = new Date(ts)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const timeStr = date.toLocaleTimeString('en-IE', { hour: 'numeric', minute: '2-digit', hour12: true })
  if (date.toDateString() === now.toDateString()) return `Today at ${timeStr}`
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday at ${timeStr}`
  return date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' }) + ` at ${timeStr}`
}

export default function MessageThread({ jobId, otherUserId, otherUserName, jobTitle }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!jobId || !otherUserId || !user) return

    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('id, sender_user_id, recipient_user_id, message_body, sent_at')
        .eq('job_id', jobId)
        .or(
          `and(sender_user_id.eq.${user.id},recipient_user_id.eq.${otherUserId}),` +
          `and(sender_user_id.eq.${otherUserId},recipient_user_id.eq.${user.id})`
        )
        .order('sent_at', { ascending: true })
      if (data) setMessages(data)
    }

    fetchMessages()

    const channel = supabase
      .channel(`thread-${jobId}-${user.id}-${otherUserId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `job_id=eq.${jobId}` },
        payload => {
          const m = payload.new
          const relevant =
            (m.sender_user_id === user.id && m.recipient_user_id === otherUserId) ||
            (m.sender_user_id === otherUserId && m.recipient_user_id === user.id)
          if (relevant) setMessages(prev => [...prev, m])
        }
      )
      .subscribe()

    const interval = setInterval(fetchMessages, 10000)
    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [jobId, otherUserId, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!body.trim()) return
    setSending(true)
    const { error } = await supabase.from('messages').insert({
      job_id: jobId,
      sender_user_id: user.id,
      recipient_user_id: otherUserId,
      message_body: body.trim(),
    })
    if (!error) {
      console.log('Email notification queued:', {
        to: otherUserId,
        from: user.id,
        jobId,
        subject: `New message about: ${jobTitle ?? 'a role'}`,
        preview: body.trim().slice(0, 100),
      })
      setBody('')
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 480 }}>
      {/* Thread header */}
      {(otherUserName || jobTitle) && (
        <div className="px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
          {otherUserName && <p className="text-sm font-semibold text-gray-900">{otherUserName}</p>}
          {jobTitle && <p className="text-xs text-gray-500 mt-0.5">Re: {jobTitle}</p>}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 italic py-10">No messages yet. Say hello!</p>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_user_id === user.id
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                isMe
                  ? 'bg-primary-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
              }`}>
                <p className="leading-relaxed">{msg.message_body}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                  {formatTime(msg.sent_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-gray-200 bg-white p-4 flex gap-3 flex-shrink-0">
        <input
          type="text"
          className="input flex-1"
          placeholder="Type a message…"
          value={body}
          onChange={e => setBody(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          className="btn-primary px-5 flex-shrink-0 disabled:opacity-50"
          disabled={sending || !body.trim()}
        >
          Send
        </button>
      </form>
    </div>
  )
}
