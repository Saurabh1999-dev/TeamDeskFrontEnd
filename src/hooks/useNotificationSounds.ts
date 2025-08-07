import { useEffect, useRef } from 'react'


interface NotificationSounds {
  playTaskAssigned: () => void
  playGeneralNotification: () => void
  playSuccess: () => void
  playWarning: () => void
  playError: () => void
}

export function useNotificationSounds(): NotificationSounds {
  const soundsRef = useRef<{ [key: string]: HTMLAudioElement }>({})

  useEffect(() => {
    soundsRef.current = {
      taskAssigned: new Audio('/task-assigned.mp3'),
      general: new Audio('/notification.mp3'),
      success: new Audio('/success.mp3'),
      warning: new Audio('/warning.mp3'),
      error: new Audio('/error.mp3'),
    }

    Object.values(soundsRef.current).forEach(audio => {
      audio.volume = 0.3
      audio.preload = 'auto'
    })

    return () => {
      Object.values(soundsRef.current).forEach(audio => {
        audio.pause()
        audio.src = ''
      })
    }
  }, [])

  const playSound = (soundName: string) => {
    try {
      const audio = soundsRef.current[soundName]
      if (audio) {
        audio.currentTime = 0
        audio.play().catch(error => {
          console.warn('Failed to play notification sound:', error)
        })
      }
    } catch (error) {
      console.warn('Error playing sound:', error)
    }
  }

  return {
    playTaskAssigned: () => playSound('taskAssigned'),
    playGeneralNotification: () => playSound('general'),
    playSuccess: () => playSound('success'),
    playWarning: () => playSound('warning'),
    playError: () => playSound('error'),
  }
}
