import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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

  const [grid, setGrid] = useState({
    rows: 0,
    cols: 0,
    cellWidth: TARGET_CELL_SIZE,
    cellHeight: TARGET_CELL_SIZE,
  })
  const [hoverKey, setHoverKey] = useState(null)
  const [flashes, setFlashes] = useState({})
  const [activeSection, setActiveSection] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

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

  useEffect(() => {
    if (!reduceMotion) return
    const updateActive = () => {
      const center = window.scrollY + window.innerHeight / 2
      let current = SECTIONS[0]
      SECTIONS.forEach((id) => {
        const el = document.getElementById(id)
        if (!el) return
        if (center >= el.offsetTop) {
          current = id
        }
      })
      setActiveSection(current)
    }

    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', updateActive)
    return () => {
      window.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', updateActive)
    }
  }, [reduceMotion])

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el)
    }
  }

  useLayoutEffect(() => {
    if (reduceMotion) return

    gsap.registerPlugin(ScrollTrigger)

    sectionsRef.current.forEach((section, index) => {
      const next = sectionsRef.current[index + 1]
      const currentContent = section.querySelector('.panel-content')
      const nextContent = next ? next.querySelector('.panel-content') : null

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=70%',
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          onEnter: () => {
            if (currentContent) gsap.set(currentContent, { opacity: 1, y: 0 })
            setActiveSection(SECTIONS[index])
          },
          onEnterBack: () => {
            if (currentContent) gsap.set(currentContent, { opacity: 1, y: 0 })
            setActiveSection(SECTIONS[index])
          },
        },
      })

      if (currentContent) {
        gsap.set(currentContent, { opacity: 1, y: 0 })
        tl.to(currentContent, { opacity: 0.6, y: -30, duration: 0.5 })
      }
      if (nextContent) {
        gsap.set(nextContent, { opacity: 0, y: 50 })
        tl.to(nextContent, { opacity: 1, y: 0, duration: 0.5 }, '<')
      }
    })

    ScrollTrigger.refresh()

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [reduceMotion])

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
  const currentIndex = SECTIONS.indexOf(activeSection)

  const scrollToSection = (direction) => {
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const target = SECTIONS[nextIndex]
    if (!target) return
    const el = document.getElementById(target)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div
      className={`app${reduceMotion ? ' reduced' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
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
            <span className="brand-name">social</span>
            <span className="brand-sub">TAG</span>
          </div>
          <button
            className="menu content-block"
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        {menuOpen && (
          <nav className="menu-panel content-block" aria-label="Sections">
            {SECTIONS.map((section) => (
              <a key={section} href={`#${section}`} onClick={() => setMenuOpen(false)}>
                {section}
              </a>
            ))}
          </nav>
        )}

        <div className="section-nav content-block" aria-label="Section navigation">
          <button
            type="button"
            className="section-nav-button"
            onClick={() => scrollToSection('up')}
            disabled={currentIndex <= 0}
            aria-label="Previous section"
          >
            <img src="/assets/up-arrow.PNG" alt="" />
          </button>
          <button
            type="button"
            className="section-nav-button"
            onClick={() => scrollToSection('down')}
            disabled={currentIndex >= SECTIONS.length - 1}
            aria-label="Next section"
          >
            <img src="/assets/down-arrow.PNG" alt="" />
          </button>
        </div>

        <div className="scroll-wrap">
          <section id="home" className="hero snap-section" ref={addToRefs}>
            <div className="section-inner panel-content">
            <div className="hero-copy content-block">
              <h1>
                We're not an
                <br />
                agency
              </h1>
              <p>We're the architects of the new attention economy.</p>
            </div>
              <button className="cta content-block" type="button">
                Build Your Narrative
              </button>
            </div>
          </section>

          <section id="about" className="snap-section info-section info-hero" ref={addToRefs}>
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

          <section id="brands" className="snap-section info-section" ref={addToRefs}>
            <div className="section-inner panel-content content-block">
              <h2>Brands</h2>
              <p>Partnering with ambitious brands ready to lead their category.</p>
            </div>
          </section>

          <section id="creators" className="snap-section info-section" ref={addToRefs}>
            <div className="section-inner panel-content content-block">
              <h2>Creators</h2>
              <p>Curated talent networks, real community pull, and platform-native storytelling.</p>
            </div>
          </section>

          <section id="contact" className="snap-section info-section" ref={addToRefs}>
            <div className="section-inner panel-content content-block">
              <h2>Contact</h2>
              <p>Let's build something memorable together.</p>
            </div>
          </section>
        </div>

        <div className="section-label content-block">{activeSection}</div>
      </div>
    </div>
  )
}

export default App
