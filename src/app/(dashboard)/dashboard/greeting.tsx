'use client'

import { useState, useEffect } from 'react'

export default function Greeting({ userName }: { userName: string }) {
  const [greeting, setGreeting] = useState('Selamat Datang')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setGreeting('Selamat Pagi')
    else if (hour >= 12 && hour < 15) setGreeting('Selamat Siang')
    else if (hour >= 15 && hour < 18) setGreeting('Selamat Sore')
    else setGreeting('Selamat Malam')
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        {greeting}, {userName}! 👋
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Berikut ringkasan data Desa hari ini.
      </p>
    </div>
  )
}
