import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Analytics } from '@vercel/analytics/react'
import './App.css'

const TARGET_CELL_SIZE = 120
const PASTEL_COLORS = [
  '#f94144', '#f3722c', '#f8961e', '#f9844a', '#f9c74f', '#43aa8b', '#577590',
]
const SECTIONS = ['home', 'about', 'services', 'why', 'brands', 'gallery', 'contact']

const TALENT_DATA = [
  { id: 1, image: 'EDBCFD2A-329E-40F6-96DC-7CB7808324E5.JPG.jpeg', name: 'Raj Shaman' },
  { id: 2, image: 'IMG_0460.JPG.jpeg', name: 'Think School' },
  { id: 3, image: 'IMG_0690.JPG.jpeg', name: 'Anik' },
  { id: 4, image: 'IMG_0738.JPG.jpeg', name: 'Ansh' },
  { id: 5, image: 'IMG_1180.JPG.jpeg', name: 'Vaibhav' },
  { id: 6, image: 'IMG_1196.JPG.jpeg', name: 'Varun' },
  { id: 7, image: 'IMG_1648.JPG.jpeg', name: 'saptarshi' },
  { id: 8, image: 'IMG_1871.JPG.jpeg', name: 'Nikhil' },
  { id: 9, image: 'IMG_1876.JPG.jpeg', name: 'Gemini' },
  { id: 10, image: 'IMG_1877.JPG.jpeg', name: '100xEngineers' },
]

function App() {
  const timeoutsRef = useRef([])
  const prefersReduced = useRef(false)
  const sectionsRef = useRef([])
  const animationsRef = useRef([])
  const inTransitionRef = useRef(false)
  const rippleActiveRef = useRef(false)
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)
  const isSectionScrollRef = useRef(false)
  const scrollSectionRef = useRef(null)
  const galleryCarouselRef = useRef(null)
  const gridRef = useRef(null)

  const [grid, setGrid] = useState({
    rows: 0,
    cols: 0,
    cellWidth: TARGET_CELL_SIZE,
    cellHeight: TARGET_CELL_SIZE,
  })
  const [hoverKey, setHoverKey] = useState(null)
  const [flashes, setFlashes] = useState({})
  const [transitionMs, setTransitionMs] = useState(300)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [inTransition, setInTransition] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const brandRows = [
    [
      { label: 'A', className: 'brand-logo brand-logo-alpha' },
      { label: 'BenQ', className: 'brand-logo brand-logo-benq' },
      { label: 'b', className: 'brand-logo brand-logo-b' },
      { label: '∞', className: 'brand-logo brand-logo-loop' },
      { label: 'DigitalOcean', className: 'brand-logo brand-logo-do' },
      { label: 'fiverr.', className: 'brand-logo brand-logo-fiverr' },
      { label: 'IBM', className: 'brand-logo brand-logo-ibm' },
    ],
    [
      { label: 'beauty', className: 'brand-logo brand-logo-beauty' },
      { label: 'A', className: 'brand-logo brand-logo-adobe' },
      { label: 'AppSumo', className: 'brand-logo brand-logo-appsumo' },
      { label: 'stock', className: 'brand-logo brand-logo-stock' },
      { label: 'Canva', className: 'brand-logo brand-logo-canva' },
      { label: 'CRED', className: 'brand-logo brand-logo-cred' },
    ],
  ]

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      prefersReduced.current = mq.matches
      setReduceMotion(mq.matches)
    }
    update()
    mq.addEventListener('change', update)

    // Prevent zoom on double tap for mobile
    let lastTouchEnd = 0
    const preventZoom = (e) => {
      const now = (new Date()).getTime()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }
    document.addEventListener('touchend', preventZoom, { passive: false })

    return () => {
      mq.removeEventListener('change', update)
      document.removeEventListener('touchend', preventZoom)
    }
  }, [])

  const finishPreload = () => {
    setTimeout(() => setIsLoading(false), 500)
  }

  const updateGrid = () => {
    const cols = Math.max(1, Math.ceil(window.innerWidth / TARGET_CELL_SIZE))
    const rows = Math.max(1, Math.ceil(window.innerHeight / TARGET_CELL_SIZE))
    const cellWidth = window.innerWidth / cols
    const cellHeight = window.innerHeight / rows
    setGrid({ rows, cols, cellWidth, cellHeight })
  }

  useEffect(() => {
    updateGrid()

    // Debounced resize handler for better mobile performance
    let resizeTimeout
    const debouncedResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(updateGrid, 150)
    }

    window.addEventListener('resize', debouncedResize)
    window.addEventListener('orientationchange', () => {
      setTimeout(updateGrid, 100) // Delay for orientation change
    })

    return () => {
      window.removeEventListener('resize', debouncedResize)
      window.removeEventListener('orientationchange', updateGrid)
      clearTimeout(resizeTimeout)
    }
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

      inDown.set(section, { display: 'flex' })
      inDown.fromTo(
        content,
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power2.inOut' },
      )

      inUp.set(section, { display: 'flex' })
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
        gsap.set(section, { display: 'flex' })
        gsap.set(content, { opacity: 1, y: 0, clearProps: 'opacity,transform' })
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

const pickRandomColor = () => PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)]

  const handlePointerMove = (event) => {
    // Exclude interactive elements and content blocks from grid interactions
    if (event.target.closest?.('.content-block, form, input, textarea, button, select, a, [role="button"], [onclick]')) return

    // Throttle pointer events on mobile for better performance
    if (window.innerWidth <= 768) {
      if (!handlePointerMove.lastCall || Date.now() - handlePointerMove.lastCall > 50) {
        handlePointerMove.lastCall = Date.now()
      } else {
        return
      }
    }

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
    // Exclude interactive elements and content blocks from grid interactions
    if (event.target.closest?.('.content-block, form, input, textarea, button, select, a, [role="button"], [onclick]')) return

    // Reduce animation complexity on mobile devices
    const isMobile = window.innerWidth <= 768
    if (isMobile && prefersReduced.current) return
    if (rippleActiveRef.current) return

    const { cols, rows } = grid
    if (!cols || !rows) return
    if (!gridRef.current) return

    const rect = gridRef.current.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top
    const col = Math.floor(clickX / TARGET_CELL_SIZE)
    const row = Math.floor(clickY / TARGET_CELL_SIZE)
    if (col < 0 || row < 0 || col >= cols || row >= rows) return
    const originX = (col + 0.5) * TARGET_CELL_SIZE
    const originY = (row + 0.5) * TARGET_CELL_SIZE

    clearTimers()
    setFlashes({})

    const baseColor = pickRandomColor()
    const maxDistance = Math.hypot(cols * TARGET_CELL_SIZE, rows * TARGET_CELL_SIZE)
    const waveSpeed = TARGET_CELL_SIZE / 60
    const bandWidth = TARGET_CELL_SIZE * 4
    const bandDuration = bandWidth / waveSpeed
    const totalDuration = maxDistance / waveSpeed + bandDuration + 200
    setTransitionMs(bandDuration / 2)
    rippleActiveRef.current = true
    schedule(() => {
      rippleActiveRef.current = false
    }, totalDuration)

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const centerX = (c + 0.5) * TARGET_CELL_SIZE
        const centerY = (r + 0.5) * TARGET_CELL_SIZE
        const distance = Math.hypot(centerX - originX, centerY - originY)
        const ratio = distance / maxDistance
        const ringAlpha = Math.max(0, Math.sin(Math.PI * ratio))
        const flashFactor = 1 + ringAlpha * 0.4
        const color = hexToRgba(baseColor, 1)
        const startDelay = distance / waveSpeed - bandDuration / 2
        const endDelay = distance / waveSpeed + bandDuration / 2
        const key = `${r}-${c}`

        schedule(() => {
          setFlashes((prev) => ({ ...prev, [key]: { color, flashFactor } }))
        }, Math.max(0, startDelay))

        schedule(() => {
          setFlashes((prev) => {
            const next = { ...prev }
            delete next[key]
            return next
          })
        }, Math.max(0, endDelay))
      }
    }
  }

  const totalCells = grid.rows * grid.cols
  const gridCenterX = (grid.cols * TARGET_CELL_SIZE) / 2
  const gridCenterY = (grid.rows * TARGET_CELL_SIZE) / 2
  const maxCenterDist = Math.hypot(gridCenterX, gridCenterY)

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
    const canScrollSection = (sectionEl, deltaY) => {
      if (!sectionEl) return false
      const { scrollTop, scrollHeight, clientHeight } = sectionEl
      const maxScroll = scrollHeight - clientHeight
      if (maxScroll <= 0) return false
      if (deltaY > 0 && scrollTop < maxScroll) return true
      if (deltaY < 0 && scrollTop > 0) return true
      return false
    }

    const onWheel = (event) => {
      if (isLoading || menuOpen || inTransitionRef.current) return
      const scrollSection = event.target.closest?.('.scrollable-section')
      if (canScrollSection(scrollSection, event.deltaY)) return
      event.preventDefault()
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
      isSectionScrollRef.current = false
      scrollSectionRef.current = event.target.closest?.('.scrollable-section') || null
      if (event.target.closest?.('.content-block')) return // Don't interfere with interactive elements
      touchStartY.current = event.touches[0].clientY
      touchEndY.current = touchStartY.current
    }

    const onTouchMove = (event) => {
      if (event.touches.length !== 1) return
      const deltaY = touchEndY.current - event.touches[0].clientY
      if (canScrollSection(scrollSectionRef.current, deltaY)) {
        isSectionScrollRef.current = true
        touchEndY.current = event.touches[0].clientY
        return
      }
      if (event.target.closest?.('.content-block')) return
      touchEndY.current = event.touches[0].clientY

      // Only prevent default for vertical scrolling gestures
      const delta = Math.abs(touchStartY.current - touchEndY.current)
      if (delta > 10) {
        event.preventDefault()
      }
    }

    const onTouchEnd = (event) => {
      if (event.target.closest?.('.content-block')) return
      if (isLoading || menuOpen || inTransitionRef.current) return
      if (isSectionScrollRef.current) {
        isSectionScrollRef.current = false
        return
      }
      const delta = touchStartY.current - touchEndY.current
      if (Math.abs(delta) < 50) return // Increased threshold for better mobile UX
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

  const scrollGalleryCarousel = (direction) => {
    if (!galleryCarouselRef.current) return
    const carousel = galleryCarouselRef.current
    const scrollAmount = 280
    if (direction === 'left') {
      carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div
      className={`app${reduceMotion ? ' reduced' : ''}${isLoading ? ' loading' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
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
        ref={gridRef}
        onClick={handleClick}
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
          const flash = flashes[key]
          const isFlashing = Boolean(flash)
          const cellClass = `cell${isFlashing ? ' flash' : ''}`
          const cellX = (col + 0.5) * TARGET_CELL_SIZE
          const cellY = (row + 0.5) * TARGET_CELL_SIZE
          const distToCenter = Math.hypot(cellX - gridCenterX, cellY - gridCenterY)
          const idleBrightness = 0.35 + (1 - distToCenter / maxCenterDist) * 0.65
          const currentBrightness = flash ? idleBrightness * flash.flashFactor : idleBrightness
          const cellColor = flash ? flash.color : 'var(--base-dark)'

          return (
            <div
              key={key}
              className={cellClass}
              style={
                flash
                  ? {
                      '--flash-color': flash.color,
                      '--brightness': currentBrightness,
                      transitionDuration: `${transitionMs}ms`,
                      backgroundColor: cellColor,
                    }
                  : {
                      '--brightness': currentBrightness,
                      transitionDuration: `${transitionMs}ms`,
                      backgroundColor: cellColor,
                    }
              }
            />
          )
        })}
      </div>

      <div className="content">
        <header className="top-bar">
          <div className="brand content-block">
            <img className="brand-logo" src="/assets/shark%20logo.png" alt="Shark logo" style={{ width: '150px', height: 'auto' }} />
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
            <h1 >
              Shark Commercial
            </h1>
            <p>
              Creating opportunity for all — by turning attention into leverage.
            </p>
          </section>

          <section id="about" className="snap-section info-section info-hero" ref={(el) => setSectionRef(1, el)}>
            <div className="section-inner panel-content">
              <div className="info-pill content-block">Ideas That Bite. Marketing That Converts</div>
              <div className="info-copy content-block" style={{ textAlign: 'center', alignItems: 'center' }}>
                <h1>
                  We help local and growing businesses build strong brands through social media, branding, video production, and digital advertising.
                  <br />
                  Founded in 2020 by Tushar Puri, we bring 6+ years of industry experience with one clear focus
                  <br />
                  — results that grow your business with creators, companies.

                </h1>
              </div>
              <div className="info-icons" aria-hidden>
                <div className="info-icon">
                  <img src="/assets/youtube.png" alt="YouTube" />
                </div>
                <div className="info-icon">
                  <img src="/assets/instagram.png" alt="Instagram" />
                </div>
                <div className="info-icon">
                  <img src="/assets/twitter.png" alt="X" />
                </div>
                <div className="info-icon">
                  <img src="/assets/linkedin.png" alt="LinkedIn" />
                </div>
              </div>
            </div>
          </section>

          <section
            id="services"
            className="snap-section info-section services-section"
            ref={(el) => setSectionRef(2, el)}
          >
            <div className="section-inner">
              <div className="expertise-section">

                <div className="expertise-header">
                  <h2 className="expertise-title">
                    Our Expertise
                  </h2>
                </div>

                {/* SERVICES MINIMAL LAYOUT */}
                <div className="services-container">
                  {[
                    {
                      icon: "📈",
                      title: "Digital Marketing",
                      text: "Custom strategies that strengthen brand presence and drive growth"
                    },
                    {
                      icon: "📊",
                      title: "Performance Marketing",
                      text: "ROI-driven campaigns engineered for maximum conversions"
                    },
                    {
                      icon: "🎥",
                      title: "Video Production",
                      text: "Visually compelling stories that elevate engagement and impact"
                    },
                    {
                      icon: "✍️",
                      title: "Content Creation",
                      text: "Strategic content designed to connect and convert effectively"
                    }
                  ].map((item, i) => (
                    <div key={i} className="service-item">
                      <div className="service-icon">{item.icon}</div>
                      <h3 className="service-title">{item.title}</h3>
                      <p className="service-description">{item.text}</p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </section>


          <section id="why" className="snap-section info-section why-section" ref={(el) => setSectionRef(3, el)}>
            <div className="section-inner panel-content">
              <h2 className="why-title">Why Shark Commercial </h2>
              <div className="why-cards-container">
                <div className="why-card">
                  <div className="why-card-icon">🔗</div>
                  <h3 className="why-card-title">Built on<br />Trust</h3>
                  <div className="why-card-divider" />
                  <p className="why-card-text">We earned our reputation before we ever optimized for it. Referrals. Relationships. Results. That's how we grow.</p>
                </div>
                <div className="why-card">
                  <div className="why-card-icon">🎨</div>
                  <h3 className="why-card-title">Industry<br />Fluency</h3>
                  <div className="why-card-divider" />
                  <p className="why-card-text">From SaaS funnels to pre-IPO narratives we get your business, not just your Instagram handle.</p>
                </div>
                <div className="why-card">
                  <div className="why-card-icon">📊</div>
                  <h3 className="why-card-title">Long Term<br />Relevance</h3>
                  <div className="why-card-divider" />
                  <p className="why-card-text">We turn attention into action with content that aligns with your long-term brand story not just a 24-hour spike.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="brands" className="snap-section info-section brands-section" ref={(el) => setSectionRef(4, el)}>
            <div className="section-inner panel-content brands-layout">
              <div className="brands-title content-block">Brands we&apos;ve worked with</div>
              <div className="brands-rails content-block">
                {brandRows.map((row, index) => {
                  const items = row.concat(row)
                  const trackClass = `brands-track${index === 1 ? ' reverse' : ''}`
                  return (
                    <div key={`row-${index}`} className="brands-rail">
                      <div className={trackClass}>
                        {items.map((brand, brandIndex) => (
                          <div key={`${brand.label}-${brandIndex}`} className="brand-tile">
                            <span className={brand.className}>{brand.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <section id="gallery" className="snap-section info-section gallery-section" ref={(el) => setSectionRef(5, el)}>
            <div className="section-inner panel-content">
              <div className="gallery-container">
                <div className="gallery-header-wrapper">
                  <h2 className="gallery-title">GALLERY</h2>
                  <div className="gallery-next-wrapper">
                    <span className="gallery-next-label">Next</span>
                    <img
                      src="/assets/arrow.png"
                      alt="scroll right"
                      className="arrow-indicator gallery-arrow"
                      width="24"
                      height="24"
                      loading="eager"
                    />
                  </div>
                </div>
                <div className="gallery-carousel-wrapper" ref={galleryCarouselRef}>
                  <div className="gallery-grid">
                    {TALENT_DATA.map((talent, index) => (
                      <div key={talent.id} className="gallery-tile">
                        <img
                          src={`/assets/gallery/${talent.image}`}
                          alt={`${talent.name} - Talent Network`}
                          className="gallery-image"
                          width="220"
                          height="220"
                          loading={index < 5 ? "eager" : "lazy"}
                          decoding="async"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="contact" className="snap-section info-section scrollable-section" ref={(el) => setSectionRef(6, el)}>
            <div className="section-inner panel-content">
              <div className="contact-content-wrapper content-block">
                {/* Left Column - Get in Touch */}
                <div className="contact-column contact-details-column">
                  <div className="contact-header contact-left-header">
                    <h2 className="contact-title">Get in Touch</h2>
                  </div>
                  <div className="contact-details-card">
                    <div className="contact-info-item">
                      <label className="contact-info-label">Phone</label>
                      <a href="tel:+919175713150" className="contact-info-value">9175713150</a>
                    </div>

                    <div className="contact-info-item">
                      <label className="contact-info-label">Email</label>
                      <a href="mailto:tusharpuri101@gmail.com" className="contact-info-value">tusharpuri101@gmail.com</a>
                    </div>

                    <div className="contact-info-item">
                      <label className="contact-info-label">Address</label>
                      <p className="contact-info-value">F-26, Above Reliance Digital, TopTen Imperial, Sangamner</p>
                      <a href="https://maps.app.goo.gl/zwtf6jMExqSfQfnPA?g_st=ic" target="_blank" rel="noopener noreferrer" className="contact-map-link">
                        📍 View on Map
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right Column - Contact Form */}
                <div className="contact-column contact-form-column">
                  <div className="contact-header contact-right-header">
                    <h2 className="contact-title">Contact Us</h2>
                  </div>
                  <form className="contact-form content-block" onClick={(e) => e.stopPropagation()}>
                    <div className="form-field">
                      <label htmlFor="contactName" className="form-label">Your Name</label>
                      <input type="text" id="contactName" name="contactName" placeholder="Enter your full name" required />
                    </div>

                    <div className="form-field">
                      <label htmlFor="brandName" className="form-label">Your Brand Name</label>
                      <input type="text" id="brandName" name="brandName" placeholder="Enter your brand or company name" required />
                    </div>

                    <div className="form-field">
                      <label htmlFor="contactPhone" className="form-label">Phone Number</label>
                      <input type="tel" id="contactPhone" name="contactPhone" placeholder="Enter your phone number" required />
                    </div>

                    <button type="submit" className="contact-submit-btn">
                      <span>Send Message</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="section-label content-block">{SECTIONS[currentSectionIndex]}</div>
      </div>
      <Analytics />
    </div>
  )
}

export default App
