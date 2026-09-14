import { describe, it, expect } from 'vitest'
import { buildFormVideoLinks } from './formVideos'

describe('buildFormVideoLinks', () => {
  it('builds a YouTube search URL scoped to proper form for a woman working out', () => {
    const links = buildFormVideoLinks('Hip Thrust')
    expect(links.youtube).toBe(
      'https://www.youtube.com/results?search_query=Hip+Thrust+proper+form+woman+workout'
    )
  })

  it('builds a TikTok search URL with the same query', () => {
    const links = buildFormVideoLinks('Hip Thrust')
    expect(links.tiktok).toBe('https://www.tiktok.com/search?q=Hip%20Thrust%20proper%20form%20woman%20workout')
  })

  it('URL-encodes exercise names containing special characters', () => {
    const links = buildFormVideoLinks('Banded Lateral Walk ("Monster Walk")')
    expect(links.youtube).toContain('Banded+Lateral+Walk')
    expect(links.youtube).not.toContain('(')
  })
})
