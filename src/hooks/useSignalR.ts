// src/hooks/useSignalR.ts
import { useEffect, useRef, useState } from 'react'
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { useAuthStore } from '@/stores/auth-store'
import toast from 'react-hot-toast'

interface UseSignalRReturn {
  connection: HubConnection | null
  isConnected: boolean
  connectionError: string | null
}

export function useSignalR(): UseSignalRReturn {
  const { user, token } = useAuthStore()
  const [connection, setConnection] = useState<HubConnection | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !token) return

    const createConnection = () => {
      const newConnection = new HubConnectionBuilder()
        .withUrl(`https://localhost:7201/notificationHub`, {
          accessTokenFactory: () => token,
          withCredentials: true,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext: { previousRetryCount: any }) => {
            // Custom retry logic: 0s, 2s, 10s, 30s, then every minute
            switch (retryContext.previousRetryCount) {
              case 0: return 0
              case 1: return 2000
              case 2: return 10000
              case 3: return 30000
              default: return 60000
            }
          }
        })
        .configureLogging(LogLevel.Information)
        .build()

      // Connection event handlers
      newConnection.onclose(() => {
        console.log('SignalR connection closed')
        setIsConnected(false)
        setConnectionError('Connection lost')
      })

      newConnection.onreconnecting(() => {
        console.log('SignalR reconnecting...')
        setIsConnected(false)
        setConnectionError('Reconnecting...')
      })

      newConnection.onreconnected(() => {
        console.log('SignalR reconnected')
        setIsConnected(true)
        setConnectionError(null)
        toast.success('Reconnected to live notifications')
      })

      return newConnection
    }

    const startConnection = async () => {
      try {
        const newConnection = createConnection()
        
        await newConnection.start()
        console.log('SignalR Connected')
        
        setConnection(newConnection)
        setIsConnected(true)
        setConnectionError(null)

      } catch (error) {
        console.error('SignalR Connection Error:', error)
        setConnectionError('Failed to connect')
      }
    }

    startConnection()

    return () => {      
      if (connection) {
        connection.stop()
          .then(() => console.log('SignalR connection stopped'))
          .catch((error: any) => console.error('Error stopping SignalR connection:', error))
      }
    }
  }, [user, token])

  return { connection, isConnected, connectionError }
}
