import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import MessageThread from '../../components/messaging/MessageThread'
import Logo from '../../components/layout/Logo'

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000
  if (diff < 60)     return 'just now'
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(ts).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })
}

export default function RecruiterMessages() {
  const { user, logout } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading]             = useState(true)
  const [active, setActive]               = useState(null)
  const [currentUserName, setCurrentUserName] = useState('')

  const loadConversations = useCallback(async () => {
    if (!user) return
    const { data: msgs } = await supabase
      .from('messages')
      .select('id, job_id, sender_user_id, recipient_user_id, message_body, sent_at, jobs!left(title)')
      .or(`sender_user_id.eq.${user.id},recipient_user_id.eq.${user.id}`)
      .order('sent_at', { ascending: false })

    if (!msgs) { setLoading(false); return }

    const { data: unreadRows } = await supabase
      .from('messages')
      .select('job_id, sender_user_id')
      .eq('recipient_user_id', user.id)
      .is('read_at', null)

    const unreadSet = new Set((unreadRows ?? []).map(r => `${r.job_id}::${r.sender_user_id}`))

    const convMap = new Map()
    for (const msg of msgs) {
      const otherId = msg.sender_user_id === user.id ? msg.recipient_user_id : msg.sender_user_id
      const key = `${msg.job_id}::${otherId}`
      if (!convMap.has(key)) {
        convMap.set(key, {
          jobId:       msg.job_id,
          otherUserId: otherId,
          lastMessage: msg.message_body,
          lastAt:      msg.sent_at,
          jobTitle:    msg.jobs?.title ?? null,
          hasUnread:   unreadSet.has(key),
        })
      }
    }
    const convList = Array.from(convMap.values())

    // Fetch company names for each other user (hiring managers)
    const otherIds = [...new Set(convList.map(c => c.otherUserId))]
    if (otherIds.length > 0) {
      const { data: companies } = await supabase
        .from('hiring_company_profiles')
        .select('user_id, company_name')
        .in('user_id', otherIds)
      const nameMap = Object.fromEntries(
        (companies ?? []).map(c => [c.user_id, c.company_name ?? 'Hiring Manager'])
      )
      setConversations(convList.map(c => ({ ...c, otherUserName: nameMap[c.otherUserId] ?? 'Hiring Manager' })))
    } else {
      setConversations([])
    }
    setLoading(false)
  }, [user])

  useEffect(() => { loadConversations() }, [loadConversations])

  useEffect(() => {
    if (!user) return
    supabase
      .from('recruiter_profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCurrentUserName(
          `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim() || user.email
        )
      })
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/recruiter/dashboard">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/recruiter/dashboard"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Dashboard</Link>
            <button className="btn-secondary text-sm" onClick={logout}>Sign out</button>
          </div>
        </div>
      </header>

      {/* Main layout: stacked on mobile, side-by-side on desktop */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full md:px-6 md:py-8 md:gap-6 md:items-start">

        {/* Sidebar: full-width on mobile when no thread open; always visible on desktop */}
        <aside className={`${active ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-72 md:flex-shrink-0 bg-white md:rounded-xl border-b md:border border-gray-200 overflow-hidden md:self-stretch`}>
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Messages</h2>
          </div>

          {loading ? (
            <div className="p-4 space-y-4 flex-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5 pt-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center flex-1 flex flex-col items-center justify-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">No messages yet</p>
              <p className="text-xs text-gray-400">Hiring managers will reach out when they have a role for you</p>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto">
              {conversations.map(conv => {
                const initials = conv.otherUserName
                  .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                const isActive = active?.jobId === conv.jobId && active?.otherUserId === conv.otherUserId
                return (
                  <li key={`${conv.jobId}::${conv.otherUserId}`}>
                    <button
                      onClick={() => setActive(conv)}
                      className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-gray-50 transition-colors border-b border-gray-50
                        ${isActive ? 'bg-primary-50 border-l-2 border-l-primary-500' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs
                                      flex items-center justify-center flex-shrink-0">
                        {initials || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className={`text-sm truncate ${conv.hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-900'}`}>
                              {conv.otherUserName}
                            </p>
                            {conv.hasUnread && (
                              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(conv.lastAt)}</span>
                        </div>
                        {conv.jobTitle && (
                          <p className="text-xs text-primary-600 truncate">{conv.jobTitle}</p>
                        )}
                        <p className={`text-xs truncate mt-0.5 ${conv.hasUnread ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>
                          {conv.lastMessage.length > 50
                            ? conv.lastMessage.slice(0, 50) + '…'
                            : conv.lastMessage}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>

        {/* Thread panel: full-width on mobile when active; always visible on desktop */}
        <div className={`${active ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-white md:rounded-xl border border-gray-200 overflow-hidden md:min-h-[500px]`}>
          {/* Back button — mobile only */}
          {active && (
            <div className="flex items-center px-4 py-3 border-b border-gray-100 md:hidden">
              <button
                onClick={() => setActive(null)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to conversations
              </button>
            </div>
          )}
          {active ? (
            <MessageThread
              jobId={active.jobId}
              otherUserId={active.otherUserId}
              otherUserName={active.otherUserName}
              jobTitle={active.jobTitle}
              currentUserName={currentUserName || user.email}
            />
          ) : (
            <div className="flex items-center justify-center h-full py-24 text-center px-6">
              <div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600">Select a conversation</p>
                <p className="text-xs text-gray-400 mt-1">Choose from the list to view your messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
