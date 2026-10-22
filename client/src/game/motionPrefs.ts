import { useSyncExternalStore } from 'react'

/**
 * The viewer's own animation settings — the one pacing control each player
 * owns (bot speed is the host's, and lives on the server). Per device, in
 * `localStorage`: losing them costs a click, so a storage that throws or comes
 * back empty just means the defaults.
 *
 * `animScale` multiplies every animation's length, both the slots
 * `animationSchedule` reserves and the CSS durations (as `--anim-scale` on
 * `:root`), so the two can't drift apart.
 *
 * `reduceMotion` is the setting *or* the browser's `prefers-reduced-motion`,
 * whichever says so. It turns movement off (flights, lunges, tilts) and keeps
 * the colour cues, so the information stays and the motion goes. CSS reads it
 * as `:root[data-reduce-motion]` rather than the media query, so both sources
 * go through one switch.
 */
export const ANIM_SCALES = [0.5, 1, 1.5, 2] as const
export type AnimScale = (typeof ANIM_SCALES)[number]

/** Where animation speed starts: "Slow", so a player new to the site isn't
 * overwhelmed by the pace (the user, 2026-10-14). */
export const DEFAULT_ANIM_SCALE: AnimScale = 1.5

export interface MotionSettings {
  readonly animScale: AnimScale
  /** The viewer's own switch, not counting the browser's preference. */
  readonly reduceMotion: boolean
  /** Sound effects' volume (`game/sound.ts`), 0 (off) to 1. */
  readonly soundVolume: number
  /** The background music's volume in a game (`game/music.ts`), 0 (off) to 1. */
  readonly musicVolume: number
}

/**
 * Which shape the stored settings have, saved beside them. 2 (2026-10-10):
 * sound became on by default, and before then every save wrote
 * `sound: false` whether or not the viewer had touched it (changing the speed
 * saved it too), so a `sound` saved without a version is no choice. 3: the
 * on/off `sound` became two volumes; a version 2 `sound: false` is a sound
 * volume of 0. 4 (2026-10-22): the default speed became "Slow" (1.5), and a
 * speed of 1 saved before then was usually just the old default, written
 * along with a volume change, so it reads as the new default.
 */
const VERSION = 4
const SOUND_DEFAULT_ON = 2
const VOLUMES = 3
const SLOW_DEFAULT = 4

/** Where each slider starts. */
export const DEFAULT_SOUND_VOLUME = 0.7
export const DEFAULT_MUSIC_VOLUME = 0.7

const volume = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : fallback

export interface MotionPrefs extends MotionSettings {
  /** The setting or the browser's preference. What every animation obeys. */
  readonly reduced: boolean
}

const STORAGE_KEY = 'mtg.motion'
const DEFAULTS: MotionSettings = {
  animScale: DEFAULT_ANIM_SCALE,
  reduceMotion: false,
  soundVolume: DEFAULT_SOUND_VOLUME,
  musicVolume: DEFAULT_MUSIC_VOLUME,
}

function readStored(): MotionSettings {
  try {
    return parseSettings(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return DEFAULTS
  }
}

/** The settings saved as `raw` (`localStorage`), or the defaults where it
 * says nothing usable — including an older shape's (see `VERSION`). */
export function parseSettings(raw: string | null): MotionSettings {
  try {
    if (raw === null) return DEFAULTS
    const parsed = JSON.parse(raw) as Partial<MotionSettings> & {
      readonly version?: number
      readonly sound?: boolean
    }
    const version = parsed.version ?? 0
    const saved = ANIM_SCALES.find((s) => s === parsed.animScale)
    const animScale = saved === undefined || (saved === 1 && version < SLOW_DEFAULT) ? DEFAULTS.animScale : saved
    return {
      animScale,
      reduceMotion: parsed.reduceMotion === true,
      soundVolume:
        version >= VOLUMES
          ? volume(parsed.soundVolume, DEFAULTS.soundVolume)
          : version === SOUND_DEFAULT_ON && parsed.sound === false
            ? 0
            : DEFAULTS.soundVolume,
      musicVolume: version >= VOLUMES ? volume(parsed.musicVolume, DEFAULTS.musicVolume) : DEFAULTS.musicVolume,
    }
  } catch {
    return DEFAULTS
  }
}

function browserPrefersReduced(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

let settings: MotionSettings = readStored()
let current: MotionPrefs = derive(settings)
const listeners = new Set<() => void>()

function derive(s: MotionSettings): MotionPrefs {
  return { ...s, reduced: s.reduceMotion || browserPrefersReduced() }
}

function apply(): void {
  current = derive(settings)
  // No page (a unit test reading `parseSettings`): nothing to style.
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--anim-scale', String(current.animScale))
  // The played card always rises into its spotlight; the attribute is what
  // the CSS keys that on (App.css's `played-card-rise`).
  root.setAttribute('data-cast-entrance', 'rise')
  if (current.reduced) root.setAttribute('data-reduce-motion', '')
  else root.removeAttribute('data-reduce-motion')
  for (const l of listeners) l()
}

apply()
try {
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', apply)
} catch {
  // An old browser without matchMedia listeners keeps whatever it said at load.
}

/** The settings as they stand, for code outside React (the scheduler, the
 * overlays' timers). */
export function motionPrefs(): MotionPrefs {
  return current
}

export function setMotionSettings(next: Partial<MotionSettings>): void {
  settings = { ...settings, ...next }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...settings, version: VERSION }))
  } catch {
    // Not remembered past this page load; still applies now.
  }
  apply()
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useMotionPrefs(): MotionPrefs {
  return useSyncExternalStore(subscribe, motionPrefs)
}
