export interface Track {
  id: string
  title: string
  freq: string
  src: string
}

export const tracks: Track[] = [
  { id: '1', title: 'Ethereal Lofi', freq: '87.5', src: '/music/track1.mp3' },
  { id: '2', title: 'Wind, Moon & Love', freq: '94.2', src: '/music/track2.mp3' },
]
