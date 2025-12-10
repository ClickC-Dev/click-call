import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getProjectBySegments } from '../store/projects'
import type { Project } from '../types'
import { DEFAULT_AVATAR_URL, DEFAULT_BG, DEFAULT_INTRO_CTA_TEXT, DEFAULT_RINGTONE_URL } from '../constants'

type ViewState = 'intro' | 'ringing' | 'connected'

export default function PublicCall() {
  const { user, call } = useParams()
  const [sp] = useSearchParams()
  const u = user || sp.get('user') || ''
  const c = call || sp.get('call') || ''
  const found = getProjectBySegments(u, c)
  const project: Project | null = found || null

  const [state, setState] = useState<ViewState>('intro')
  const [muted, setMuted] = useState(false)
  const [videoOn, setVideoOn] = useState(true)
  const [speakerOn, setSpeakerOn] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const ringtoneRef = useRef<HTMLAudioElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<number | null>(null)

  const bg = useMemo(() => project?.bg || DEFAULT_BG, [project])
  const avatar = useMemo(() => project?.avatar_url || DEFAULT_AVATAR_URL, [project])
  const introText = useMemo(() => project?.intro_cta_text || DEFAULT_INTRO_CTA_TEXT, [project])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  const startRinging = () => {
    setState('ringing')
    try { navigator.vibrate?.(200) } catch {}
    const ring = new Audio(DEFAULT_RINGTONE_URL)
    ring.loop = true
    ring.volume = 0.7
    ringtoneRef.current = ring
    ring.play().catch(()=>{})
    window.setTimeout(() => connect(), 2500)
  }

  const connect = () => {
    ringtoneRef.current?.pause()
    ringtoneRef.current = null
    setState('connected')
    setElapsed(0)
    timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000)
    const url = project?.audio_url || ''
    if (url) {
      const a = new Audio(url)
      a.loop = false
      a.volume = muted ? 0 : 1
      audioRef.current = a
      a.play().catch(()=>{})
    } else {
      const utter = new SpeechSynthesisUtterance(project?.initial_message || '')
      const voices = speechSynthesis.getVoices()
      const v = voices.find(v=>v.lang?.toLowerCase().startsWith('pt')) || voices[0]
      if (v) utter.voice = v
      speechSynthesis.cancel()
      speechSynthesis.speak(utter)
    }
  }

  const endCall = () => {
    ringtoneRef.current?.pause()
    audioRef.current?.pause()
    setState('intro')
    setElapsed(0)
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
  }

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : 1
  }, [muted])

  const shareLink = () => {
    const url = window.location.href
    const title = project ? `Call com ${project.caller_name}` : 'Click Call'
    if (navigator.share) navigator.share({ title, url }).catch(()=>{})
    else navigator.clipboard.writeText(url)
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: DEFAULT_BG }}>
        <div className="text-center text-white">
          <div className="text-xl">Projeto não encontrado</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white" style={{ background: bg }}>
      <div className="max-w-sm mx-auto pt-10 px-4">
        <div className="flex flex-col items-center gap-4">
          <img src={avatar} alt="avatar" className="w-24 h-24 rounded-full border border-white/20" />
          <div className="text-lg font-semibold">{project.caller_name}</div>
          {state === 'intro' && (
            <>
              <p className="text-center text-neutral-300">{project.initial_message}</p>
              <button onClick={startRinging} className="mt-4 w-full py-3 rounded bg-emerald-600">{introText}</button>
            </>
          )}
          {state === 'ringing' && (
            <div className="flex flex-col items-center gap-3 animate-pulse">
              <div>Chamando...</div>
              <button onClick={endCall} className="px-4 py-2 rounded bg-neutral-700">Cancelar</button>
            </div>
          )}
          {state === 'connected' && (
            <div className="w-full space-y-4">
              <div className="text-center text-sm text-neutral-300">Conectado • {Math.floor(elapsed/60).toString().padStart(2,'0')}:{(elapsed%60).toString().padStart(2,'0')}</div>
              <div className="text-center">{project.initial_message}</div>
              {project.cta_text && project.cta_url && (
                <a href={project.cta_url} target="_blank" className="block w-full text-center py-2 rounded bg-emerald-600">{project.cta_text}</a>
              )}
              <div className="grid grid-cols-4 gap-2">
                <button onClick={()=>setMuted(m=>!m)} className={`py-2 rounded ${muted?'bg-red-600':'bg-neutral-700'}`}>{muted?'Unmute':'Mute'}</button>
                <button onClick={()=>setVideoOn(v=>!v)} className={`py-2 rounded ${videoOn?'bg-neutral-700':'bg-yellow-600'}`}>{videoOn?'Vídeo on':'Vídeo off'}</button>
                <button onClick={endCall} className="py-2 rounded bg-red-700">Encerrar</button>
                <button onClick={()=>setSpeakerOn(s=>!s)} className={`py-2 rounded ${speakerOn?'bg-neutral-700':'bg-blue-600'}`}>{speakerOn?'Alto-falante':'Fone'}</button>
              </div>
              <button onClick={shareLink} className="w-full py-2 rounded bg-neutral-700">Compartilhar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
