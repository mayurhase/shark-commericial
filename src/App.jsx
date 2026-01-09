import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Analytics } from '@vercel/analytics/react'
import './App.css'

const TARGET_CELL_SIZE = 120
const BASE_DELAY = 50
const RING_BEAT = 70
const FLASH_DURATION = 200
const ACCENT_COLOR = '#ff2aa1'
const SECTIONS = ['home', 'about', 'brands', 'creators', 'contact']

function App() {
  const timeoutsRef = useRef([])
  const prefersReduced = useRef(false)
  const sectionsRef = useRef([])
  const animationsRef = useRef([])
  const inTransitionRef = useRef(false)
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)

  const [grid, setGrid] = useState({
    rows: 0,
    cols: 0,
    cellWidth: TARGET_CELL_SIZE,
    cellHeight: TARGET_CELL_SIZE,
  })
  const [hoverKey, setHoverKey] = useState(null)
  const [flashes, setFlashes] = useState({})
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [inTransition, setInTransition] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      prefersReduced.current = mq.matches
      setReduceMotion(mq.matches)
    }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const finishPreload = () => {
    setTimeout(() => setIsLoading(false), 500)
  }

  useEffect(() => {
    const updateGrid = () => {
      const cols = Math.max(1, Math.ceil(window.innerWidth / TARGET_CELL_SIZE))
      const rows = Math.max(1, Math.ceil(window.innerHeight / TARGET_CELL_SIZE))
      const cellWidth = window.innerWidth / cols
      const cellHeight = window.innerHeight / rows
      setGrid({ rows, cols, cellWidth, cellHeight })
    }

    updateGrid()
    window.addEventListener('resize', updateGrid)
    return () => window.removeEventListener('resize', updateGrid)
  }, [])

  const setSectionRef = (index, el) => {
    if (!el) return
    sectionsRef.current[index] = el
  }

  useEffect(() => {
    if (reduceMotion) return

    animationsRef.current = sectionsRef.current.map((section) => {
      if (!section) return null
      const content = section.querySelector('.panel-content') || section
      const inDown = gsap.timeline({ paused: true })
      const inUp = gsap.timeline({ paused: true })
      const outDown = gsap.timeline({ paused: true })
      const outUp = gsap.timeline({ paused: true })

      inDown.set(section, { display: 'block' })
      inDown.fromTo(
        content,
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power2.inOut' },
      )

      inUp.set(section, { display: 'block' })
      inUp.fromTo(
        content,
        { opacity: 0, y: -100 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power2.inOut' },
      )

      outDown.to(content, { opacity: 0, y: -80, duration: 0.9, ease: 'power2.inOut' })
      outDown.set(section, { display: 'none' })

      outUp.to(content, { opacity: 0, y: 80, duration: 0.9, ease: 'power2.inOut' })
      outUp.set(section, { display: 'none' })

      return {
        inDown,
        inUp,
        outDown,
        outUp,
      }
    })

    return () => {
      animationsRef.current.forEach((entry) => {
        entry?.inDown?.kill()
        entry?.inUp?.kill()
        entry?.outDown?.kill()
        entry?.outUp?.kill()
      })
    }
  }, [reduceMotion])

  useEffect(() => {
    sectionsRef.current.forEach((section, index) => {
      if (!section) return
      const content = section.querySelector('.panel-content') || section
      if (index === currentSectionIndex) {
        gsap.set(section, { display: 'block' })
        gsap.set(content, { opacity: 1, y: 0 })
      } else {
        gsap.set(section, { display: 'none' })
      }
    })
  }, [currentSectionIndex])

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [])

  const schedule = (fn, delay) => {
    const id = setTimeout(fn, delay)
    timeoutsRef.current.push(id)
  }

  const clearTimers = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  const hexToRgba = (hex, alpha) => {
    const normalized = hex.replace('#', '')
    const bigint = parseInt(normalized, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const triggerRing = (keys, delay, colorMap) => {
    schedule(() => {
      setFlashes((prev) => {
        const next = { ...prev }
        keys.forEach((key) => {
          next[key] = colorMap[key]
        })
        return next
      })

      schedule(() => {
        setFlashes((prev) => {
          const next = { ...prev }
          keys.forEach((key) => {
            delete next[key]
          })
          return next
        })
      }, FLASH_DURATION)
    }, delay)
  }

  const handlePointerMove = (event) => {
    if (event.target.closest?.('.content-block')) return
    const { cols, rows, cellWidth, cellHeight } = grid
    if (!cols || !rows) return

    const col = Math.floor(event.clientX / cellWidth)
    const row = Math.floor(event.clientY / cellHeight)
    if (col < 0 || row < 0 || col >= cols || row >= rows) return

    setHoverKey(`${row}-${col}`)
  }

  const handlePointerLeave = () => {
    setHoverKey(null)
  }

  const handleClick = (event) => {
    if (event.target.closest?.('.content-block')) return
    const { cols, rows, cellWidth, cellHeight } = grid
    if (!cols || !rows) return

    const col = Math.floor(event.clientX / cellWidth)
    const row = Math.floor(event.clientY / cellHeight)
    if (col < 0 || row < 0 || col >= cols || row >= rows) return

    clearTimers()
    setFlashes({})

    const rings = new Map()
    const colorMap = {}

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const distance = Math.hypot(r - row, c - col)
        const ring = Math.floor(distance)
        const fractional = distance - ring
        const alpha = Math.max(0.08, 0.45 - ring * 0.05 - fractional * 0.1)
        colorMap[`${r}-${c}`] = hexToRgba(ACCENT_COLOR, alpha)
        if (prefersReduced.current && ring !== 0) continue
        if (!rings.has(ring)) rings.set(ring, [])
        rings.get(ring).push(`${r}-${c}`)
      }
    }

    rings.forEach((keys, ring) => {
      const delay = ring === 0 ? 0 : BASE_DELAY + (ring - 1) * RING_BEAT
      triggerRing(keys, delay, colorMap)
    })
  }

  const totalCells = grid.rows * grid.cols

  const playTimeline = (tl) =>
    new Promise((resolve) => {
      if (!tl) {
        resolve()
        return
      }
      tl.eventCallback('onComplete', () => resolve())
      tl.restart()
    })

  // Drives section changes: locks input, plays out/in timelines, then commits the index.
  const setSection = async (index) => {
    if (isLoading) return
    if (index < 0 || index >= SECTIONS.length) return
    if (index === currentSectionIndex) return
    if (inTransitionRef.current) return

    inTransitionRef.current = true
    setInTransition(true)

    if (reduceMotion) {
      setCurrentSectionIndex(index)
      inTransitionRef.current = false
      setInTransition(false)
      return
    }

    const direction = index > currentSectionIndex ? 'down' : 'up'
    const currentAnimations = animationsRef.current[currentSectionIndex]
    const nextAnimations = animationsRef.current[index]
    const currentOut = direction === 'down' ? currentAnimations?.outDown : currentAnimations?.outUp
    const nextIn = direction === 'down' ? nextAnimations?.inDown : nextAnimations?.inUp

    await playTimeline(currentOut)
    await playTimeline(nextIn)

    setCurrentSectionIndex(index)
    inTransitionRef.current = false
    setInTransition(false)
  }

  useEffect(() => {
    // Global input interception: one wheel/key/swipe moves exactly one section.
    const onWheel = (event) => {
      event.preventDefault()
      if (isLoading || menuOpen || inTransitionRef.current) return
      if (Math.abs(event.deltaY) < 6) return
      const nextIndex = event.deltaY > 0 ? currentSectionIndex + 1 : currentSectionIndex - 1
      setSection(nextIndex)
    }

    const onKeyDown = (event) => {
      const key = event.key
      if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'PageDown', 'PageUp', 'Home', 'End'].includes(key)) {
        return
      }
      event.preventDefault()
      if (isLoading || menuOpen || inTransitionRef.current) return
      if (key === 'Home') {
        setSection(0)
        return
      }
      if (key === 'End') {
        setSection(SECTIONS.length - 1)
        return
      }
      const isNext = key === 'ArrowDown' || key === 'ArrowRight' || key === 'PageDown'
      const nextIndex = isNext ? currentSectionIndex + 1 : currentSectionIndex - 1
      setSection(nextIndex)
    }

    const onTouchStart = (event) => {
      if (event.touches.length !== 1) return
      touchStartY.current = event.touches[0].clientY
      touchEndY.current = touchStartY.current
    }

    const onTouchMove = (event) => {
      event.preventDefault()
      if (event.touches.length !== 1) return
      touchEndY.current = event.touches[0].clientY
    }

    const onTouchEnd = () => {
      if (isLoading || menuOpen || inTransitionRef.current) return
      const delta = touchStartY.current - touchEndY.current
      if (Math.abs(delta) < 40) return
      const nextIndex = delta > 0 ? currentSectionIndex + 1 : currentSectionIndex - 1
      setSection(nextIndex)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: false })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: false })

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [currentSectionIndex, isLoading, menuOpen])

  const scrollToSection = (direction) => {
    const nextIndex = direction === 'up' ? currentSectionIndex - 1 : currentSectionIndex + 1
    setSection(nextIndex)
  }

  return (
    <div
      className={`app${reduceMotion ? ' reduced' : ''}${isLoading ? ' loading' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      <Analytics />
      {isLoading && (
        <div className="preloader" role="status" aria-live="polite">
          <video
            className="preloader-media"
            src="/assets/shark-animated.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={finishPreload}
            onError={finishPreload}
          />
        </div>
      )}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
          gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
        }}
        aria-hidden
      >
        {Array.from({ length: totalCells }).map((_, index) => {
          const row = Math.floor(index / grid.cols)
          const col = index % grid.cols
          const key = `${row}-${col}`
          const isHover = hoverKey === key
          const flashColor = flashes[key]
          const isFlashing = Boolean(flashColor)
          const cellClass = `cell${isHover ? ' hover' : ''}${isFlashing ? ' flash' : ''}`

          return (
            <div
              key={key}
              className={cellClass}
              style={flashColor ? { '--flash-color': flashColor } : undefined}
            />
          )
        })}
      </div>

      <div className="content">
        <header className="top-bar">
          <div className="brand content-block">
            <img className="brand-logo" src="/assets/shark%20logo.png" alt="Shark logo" />
          </div>
          <button
            className={`menu content-block${menuOpen ? ' open' : ''}`}
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <div
          className={`menu-overlay${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden={!menuOpen}
        >
          <nav
            className={`menu-panel content-block${menuOpen ? ' open' : ''}`}
            aria-label="Sections"
            onClick={(event) => event.stopPropagation()}
          >
            {SECTIONS.map((section, index) => (
              <button
                key={section}
                type="button"
                className={index === currentSectionIndex ? 'active' : ''}
                onClick={() => {
                  setSection(index)
                  setMenuOpen(false)
                }}
              >
                {section}
              </button>
            ))}
          </nav>
        </div>

        <div className="section-nav content-block" aria-label="Section navigation">
          <button
            type="button"
            className="section-nav-button"
            onClick={() => scrollToSection('up')}
            disabled={currentSectionIndex <= 0 || inTransition}
            aria-label="Previous section"
          >
            <img src="/assets/up-arrow.PNG" alt="" />
          </button>
          <button
            type="button"
            className="section-nav-button"
            onClick={() => scrollToSection('down')}
            disabled={currentSectionIndex >= SECTIONS.length - 1 || inTransition}
            aria-label="Next section"
          >
            <img src="/assets/down-arrow.PNG" alt="" />
          </button>
        </div>

        <div className="scroll-wrap">
          <section id="home" className="hero snap-section" ref={(el) => setSectionRef(0, el)}>
            <div className="section-inner panel-content">
              <div className="hero-copy content-block">
                <h1>
                  We&apos;re not an
                  <br />
                  agency
                </h1>
                <p>We&apos;re the architects of the new attention economy.</p>
              </div>
              <button className="cta content-block" type="button">
                Build Your Narrative
              </button>
            </div>
          </section>

          <section id="about" className="snap-section info-section info-hero" ref={(el) => setSectionRef(1, el)}>
            <div className="section-inner panel-content">
              <div className="info-pill content-block">SocialTag began as a talent-first agency.</div>
              <div className="info-copy content-block">
                <h2>
                  Evolving into a media
                  <br />
                  powerhouse partnering
                  <br />
                  with creators, companies,
                  <br />
                  and capital.
                </h2>
              </div>
              <div className="info-icons content-block">
                <div className="info-icon" aria-hidden>
                  <span className="icon-youtube">YT</span>
                </div>
                <div className="info-icon" aria-hidden>
                  <span className="icon-instagram">IG</span>
                </div>
                <div className="info-icon" aria-hidden>
                  <span className="icon-twitter">X</span>
                </div>
                <div className="info-icon" aria-hidden>
                  <span className="icon-linkedin">in</span>
                </div>
              </div>
            </div>
          </section>

          <section id="brands" className="snap-section info-section" ref={(el) => setSectionRef(2, el)}>
            <div className="section-inner panel-content content-block">
              <h2>Brands</h2>
              <p>Partnering with ambitious brands ready to lead their category.</p>
            </div>
          </section>

          <section id="creators" className="snap-section info-section" ref={(el) => setSectionRef(3, el)}>
            <div className="section-inner panel-content content-block">
              <h2>Creators</h2>
              <p>Curated talent networks, real community pull, and platform-native storytelling.</p>
            </div>
          </section>

          <section id="contact" className="snap-section info-section" ref={(el) => setSectionRef(4, el)}>
            <div className="section-inner panel-content content-block">
              <h2>Contact</h2>
              <p>Let&apos;s build something memorable together.</p>
            </div>
          </section>
        </div>

        <div className="section-label content-block">{SECTIONS[currentSectionIndex]}</div>
      </div>
    </div>
  )
}

export default App
