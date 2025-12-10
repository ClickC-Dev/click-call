import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { getProjectBySegments } from '../store/projects'
import type { Project } from '../types'
import { DEFAULT_AVATAR_URL, DEFAULT_BG, DEFAULT_INTRO_CTA_TEXT, DEFAULT_RINGTONE_URL, DEFAULT_NOEL_AUDIO_URL } from '../constants'
import '../call.css'
import { Phone, Volume2, VolumeX, Mic, MicOff, Video, VideoOff, Check, XIcon, Clock, ThumbUp, ThumbDown } from '../components/icons'
import { canonicalLink } from '../lib/link'
import { isLoggedIn } from '../lib/auth'

type ViewState = 'intro' | 'ringing' | 'connected' | 'ended'

export default function PublicCall() {
  const { user, call } = useParams()
  const [sp] = useSearchParams()
  const u = user || sp.get('user') || ''
  const c = call || sp.get('call') || ''
  const [project, setProject] = useState<Project | null>(null)
  useEffect(() => {
    (async () => setProject(await getProjectBySegments(u, c)))()
  }, [u, c])
  const minimalIntro = u.toLowerCase() === 'clickc' && c.toLowerCase() === 'noel'

  const [state, setState] = useState<ViewState>('intro')
  const [muted, setMuted] = useState(false)
  const [videoOn, setVideoOn] = useState(true)
  const [speakerOn, setSpeakerOn] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [feedback, setFeedback] = useState<null | 'good' | 'bad'>(null)
  const ringtoneRef = useRef<HTMLAudioElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<number | null>(null)

  const bg = useMemo(() => project?.bg || DEFAULT_BG, [project])
  const avatar = useMemo(() => project?.avatar_url || DEFAULT_AVATAR_URL, [project])
  const introText = useMemo(() => project?.intro_cta_text || DEFAULT_INTRO_CTA_TEXT, [project])
  const connectedMessage = useMemo(() => project?.initial_message || 'Ho Ho Ho! Aqui é o Papai Noel! Feliz Natal!', [project])
  const rawIntroMessage = useMemo(() => project?.initial_message || 'Você está pronto pra viver uma experiência completamente diferente do que está acostumado?', [project])
  const nameDisplay = useMemo(() => {
    const n = project?.caller_name || 'Click Call'
    return n.startsWith('@') ? n : `@${n}`
  }, [project])
  const renderIntroMessage = () => {
    const parts = rawIntroMessage.split(/(completamente diferente)/i)
    return (
      <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
        {parts.map((t, i) => (
          i % 2 === 1 ? <span key={i} className="text-[#fc0f57]">{t}</span> : <span key={i} className="text-white">{t}</span>
        ))}
      </h1>
    )
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  const startRinging = () => {
    setState('ringing')
    try { navigator.vibrate?.([200, 150, 200, 300]) } catch {}
    const ring = new Audio(DEFAULT_RINGTONE_URL)
    ring.loop = true
    ring.volume = 0.7
    ringtoneRef.current = ring
    ring.play().catch(()=>{})
    if (!minimalIntro) window.setTimeout(() => connect(), 2500)
  }

  const connect = () => {
    ringtoneRef.current?.pause()
    ringtoneRef.current = null
    setState('connected')
    setElapsed(0)
    timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000)
    const url = project?.audio_url || DEFAULT_NOEL_AUDIO_URL || ''
    if (url) {
      const a = new Audio(url)
      a.loop = false
      a.volume = muted ? 0 : 1
      audioRef.current = a
      a.onended = () => {
        if (timerRef.current) window.clearInterval(timerRef.current)
        timerRef.current = null
        setState('ended')
      }
      a.play().catch(()=>{})
    } else {
      const utter = new SpeechSynthesisUtterance(project?.initial_message || '')
      const voices = speechSynthesis.getVoices()
      const v = voices.find(v=>v.lang?.toLowerCase().startsWith('pt')) || voices[0]
      if (v) utter.voice = v
      utter.onend = () => {
        if (timerRef.current) window.clearInterval(timerRef.current)
        timerRef.current = null
        setState('ended')
      }
      speechSynthesis.cancel()
      speechSynthesis.speak(utter)
    }
  }

  const endCall = () => {
    ringtoneRef.current?.pause()
    audioRef.current?.pause()
    setState('ended')
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
  }

  const rejectCall = () => {
    ringtoneRef.current?.pause()
    audioRef.current?.pause()
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
    setElapsed(0)
    setState('intro')
  }

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : 1
  }, [muted])

  const shareLink = () => {
    const p: Project | null = project
    const url = p ? canonicalLink(p) : new URL(`/${encodeURIComponent(u)}/${encodeURIComponent(c)}`, window.location.origin).toString()
    const callerName = project?.caller_name || 'Click Call'
    const payload = { title: 'Click Call', text: `Clique para atender sua call personalizada: ${callerName}`, url }
    if (navigator.share) navigator.share(payload).catch(()=>{})
    else navigator.clipboard.writeText(url)
  }

  const callerName = project?.caller_name || 'Click Call'

  const handleFeedback = (quality: 'good' | 'bad') => {
    setFeedback(quality)
    try {
      const key = 'cc_feedback'
      const arr = JSON.parse(localStorage.getItem(key) || '[]')
      arr.push({ projectId: project?.id, user: u, call: c, elapsed, quality, at: Date.now() })
      localStorage.setItem(key, JSON.stringify(arr))
    } catch {}
    window.setTimeout(() => {
      setFeedback(null)
      setElapsed(0)
      setState('intro')
    }, 2000)
  }

  return (
    <div className="h-[100dvh] bg-black text-white overflow-hidden">
      <div className="max-w-xl mx-auto h-full p-0">
        <div className="bg-black rounded-xl overflow-hidden shadow-sm border border-gray-800 h-full flex flex-col">
          {!minimalIntro && (
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-[#111] text-white"><Phone /></span>
                <div>
                  <div className="font-semibold">Click Call</div>
                  <div className="text-sm text-gray-400">Simulação de ligação personalizada</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={shareLink} className="px-3 py-2 rounded bg-[#fc0f57] hover:bg-[#e30e51] text-white">Compartilhar</button>
                {isLoggedIn() && (
                  <Link to="/admin/projects" className="px-3 py-2 rounded border border-gray-700 text-gray-300 hover:text-white">Gerenciar</Link>
                )}
              </div>
            </div>
          )}
          <div className="relative flex-1" style={{ background: bg }}>
            <div className="soft-bg"></div>
            <div className="px-6 flex-1 h-full flex flex-col items-center justify-center text-center gap-6">
              {!minimalIntro && (
                <div className="relative">
                  <div className="soft-glow"></div>
                  <img src={avatar} alt="avatar" className={`w-28 h-28 rounded-full ring-4 ${state==='ringing'?'ring-[#2fff6d]/40':'ring-transparent'} shadow-[0_0_30px_rgba(47,255,109,0.4)]`} />
                </div>
              )}
              {state === 'intro' && (
                minimalIntro ? (
                  <div className="w-full h-full grid place-items-center">
                    <div className="flex flex-col items-center justify-center text-center gap-6">
                      {renderIntroMessage()}
                      <div className="flex items-center justify-center gap-2 text-gray-300">
                        <Volume2 />
                        <span>Verifique se o som está ativado.</span>
                      </div>
                      <button onClick={startRinging} className="mt-2 w-72 max-w-full py-3 rounded bg-[#fc0f57] hover:bg-[#e30e51] text-white">{introText}</button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full text-center space-y-4">
                    {renderIntroMessage()}
                    <div className="flex items-center justify-center gap-2 text-gray-300">
                      <Volume2 />
                      <span>Dica: ative o som para melhor experiência</span>
                    </div>
                    <button onClick={startRinging} className="mt-2 w-full py-3 rounded bg-[#fc0f57] hover:bg-[#e30e51] text-white">{introText}</button>
                  </div>
                )
              )}
              {state === 'ringing' && (
                minimalIntro ? (
                  <div className="w-full flex-1 flex flex-col items-center justify-center gap-6">
                    <div className="relative -mt-12">
                      <div className="soft-glow"></div>
                      <img src={avatar} alt="avatar" className="w-28 h-28 rounded-full ring-4 ring-[#2fff6d]/40 shadow-[0_0_30px_rgba(47,255,109,0.4)]" />
                    </div>
                    <div className="text-white font-semibold">{project.caller_name}</div>
                    <div className="w-full flex items-center justify-center gap-8">
                      <button onClick={rejectCall} className="rounded-full w-20 h-20 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"><XIcon /></button>
                      <button onClick={shareLink} className="rounded-full w-16 h-16 border border-gray-700 text-gray-300 hover:text-white flex items-center justify-center"><Clock /></button>
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-green-500 opacity-30 ping-slow"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-green-500 opacity-20 ping-slow" style={{ animationDelay: '600ms' }}></div>
                        <button onClick={connect} className="relative z-10 bg-green-600/90 hover:bg-green-600 text-white rounded-full w-20 h-20 flex items-center justify-center backdrop-blur-sm"><Check /></button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full text-center space-y-5">
                    <div className="text-gray-300 pulse-slow">Chamando…</div>
                    <div className="flex items-center justify-center gap-6">
                      <button onClick={endCall} className="rounded-full w-20 h-20 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center">Rejeitar</button>
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-green-500 opacity-30 ping-slow"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-green-500 opacity-20 ping-slow" style={{ animationDelay: '600ms' }}></div>
                        <button onClick={connect} className="relative z-10 bg-green-600/90 hover:bg-green-600 text-white rounded-full w-20 h-20 flex items-center justify-center backdrop-blur-sm">Aceitar</button>
                      </div>
                    </div>
                  </div>
                )
              )}
              {state === 'connected' && (
                minimalIntro ? (
                  <div className="w-full flex-1 flex flex-col items-center justify-center gap-6">
                    <div className="relative pulse-slow">
                      <div className="soft-glow"></div>
                      <img src={avatar} alt="avatar" className="w-28 h-28 rounded-full ring-4 ring-[#2fff6d]/40 shadow-[0_0_30px_rgba(47,255,109,0.4)]" />
                    </div>
                    <div className="text-white font-semibold text-xl">{nameDisplay}</div>
                    <div className="text-center text-sm text-gray-300">{Math.floor(elapsed/60).toString().padStart(2,'0')}:{(elapsed%60).toString().padStart(2,'0')}</div>
                    <div className="w-full flex items-center justify-center gap-4">
                      <button onClick={()=>setMuted(m=>!m)} className="rounded-full w-12 h-12 bg-white/10 text-white hover:bg-white/20 border border-white/10 flex items-center justify-center backdrop-blur-md">{muted ? <MicOff /> : <Mic />}</button>
                      <button onClick={()=>setVideoOn(v=>!v)} className="rounded-full w-12 h-12 bg-white/10 text-white hover:bg-white/20 border border-white/10 flex items-center justify-center backdrop-blur-md">{videoOn ? <Video /> : <VideoOff />}</button>
                      <button onClick={endCall} className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"><Phone /></button>
                      <button onClick={()=>setSpeakerOn(s=>!s)} className="rounded-full w-12 h-12 bg-white/10 text-white hover:bg-white/20 border border-white/10 flex items-center justify-center backdrop-blur-md">{speakerOn ? <Volume2 /> : <VolumeX />}</button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-5">
                    <div className="text-center text-sm text-gray-300">Conectado • {Math.floor(elapsed/60).toString().padStart(2,'0')}:{(elapsed%60).toString().padStart(2,'0')}</div>
                    <div className="text-center text-lg font-medium">{connectedMessage}</div>
                    {project.cta_text && project.cta_url && (
                      <a href={project.cta_url} target="_blank" className="block w-full text-center py-3 rounded bg-[#fc0f57] hover:bg-[#e30e51] text-white">{project.cta_text}</a>
                    )}
                    <div className="grid grid-cols-4 gap-3">
                      <button onClick={()=>setMuted(m=>!m)} className="rounded-full w-12 h-12 bg-white/10 text-white hover:bg-white/20 border border-white/10 flex items-center justify-center backdrop-blur-md">{muted ? <VolumeX /> : <Volume2 />}</button>
                      <button onClick={()=>setVideoOn(v=>!v)} className="rounded-full w-12 h-12 bg-white/10 text-white hover:bg-white/20 border border-white/10 flex items-center justify-center backdrop-blur-md">{videoOn ? <Video /> : <VideoOff />}</button>
                      <button onClick={endCall} className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center">Encerrar</button>
                      <button onClick={()=>setSpeakerOn(s=>!s)} className="rounded-full w-12 h-12 bg-white/10 text-white hover:bg-white/20 border border-white/10 flex items-center justify-center backdrop-blur-md">{speakerOn ? <Volume2 /> : <VolumeX />}</button>
                    </div>
                  </div>
                )
              )}
              {state === 'ended' && (
                <div className="w-full flex-1 flex flex-col items-center justify-center gap-5">
                  <div className="relative">
                    <div className="soft-glow"></div>
                    <img src={avatar} alt="avatar" className="w-24 h-24 rounded-full ring-4 ring-[#2fff6d]/20 shadow-[0_0_30px_rgba(47,255,109,0.25)]" />
                  </div>
                  <div className="text-white font-semibold text-lg">{nameDisplay}</div>
                  <div className="text-sm text-gray-400">Ligação encerrada</div>
                  <div className="text-3xl font-bold">{Math.floor(elapsed/60).toString().padStart(2,'0')}:{(elapsed%60).toString().padStart(2,'0')}</div>
                  <div className="text-sm text-gray-300">Como estava a qualidade da ligação?</div>
                  <div className="flex items-center justify-center gap-10">
                    <div className="flex flex-col items-center gap-2">
                      <button onClick={() => handleFeedback('good')} className={`rounded-full w-16 h-16 ${feedback==='good'?'bg-[#fc0f57]':'bg-white/10'} text-white hover:bg-white/20 border border-white/10 flex items-center justify-center backdrop-blur-md`}><ThumbUp /></button>
                      <span className="text-xs text-gray-300">Boa</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <button onClick={() => handleFeedback('bad')} className={`rounded-full w-16 h-16 ${feedback==='bad'?'bg-[#fc0f57]':'bg-white/10'} text-white hover:bg-white/20 border border-white/10 flex items-center justify-center backdrop-blur-md`}><ThumbDown /></button>
                      <span className="text-xs text-gray-300">Ruim</span>
                    </div>
                  </div>
                </div>
              )}
              {!minimalIntro && (
                <div className="w-full mt-6">
                  <div className="rounded-xl border border-gray-800 p-4 shadow-sm">
                    <div className="font-semibold mb-2">Informações de domínio</div>
                    <div className="text-sm text-gray-300 break-all">{new URL(`/${u}/${c}`, window.location.origin).toString()}</div>
                    <div className="text-sm text-gray-500 mt-1">Link de compartilhamento</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
