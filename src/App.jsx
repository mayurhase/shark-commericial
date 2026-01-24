import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import './App.css'

const TARGET_CELL_SIZE = 120
const BASE_DELAY = 50
const RING_BEAT = 70
const FLASH_DURATION = 200
const NEON_COLORS = ['#00f0ff', '#ff2aa1', '#7cff00', '#ffd400', '#8a2bff', '#ff6b00']
const SECTIONS = ['home', 'story', 'about', 'why', 'brands', 'gallery', 'contact']

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
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)
  const galleryCarouselRef = useRef(null)

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

  const pickRandomColor = () => NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)]

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

    const clickX = event.clientX
    const clickY = event.clientY
    const col = Math.floor(clickX / cellWidth)
    const row = Math.floor(clickY / cellHeight)
    if (col < 0 || row < 0 || col >= cols || row >= rows) return

    clearTimers()
    setFlashes({})

    const baseColor = pickRandomColor()
    const ringStep = Math.min(cellWidth, cellHeight)
    const waveSpeed = ringStep / RING_BEAT

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const centerX = (c + 0.5) * cellWidth
        const centerY = (r + 0.5) * cellHeight
        const distance = Math.hypot(centerX - clickX, centerY - clickY)
        const ringIndex = distance / ringStep
        if (prefersReduced.current && ringIndex >= 1) continue
        const alpha = Math.max(0.08, 0.65 - ringIndex * 0.06)
        const color = hexToRgba(baseColor, alpha)
        const delay = BASE_DELAY + distance / waveSpeed
        const key = `${r}-${c}`

        schedule(() => {
          setFlashes((prev) => ({ ...prev, [key]: color }))
          schedule(() => {
            setFlashes((prev) => {
              const next = { ...prev }
              delete next[key]
              return next
            })
          }, FLASH_DURATION)
        }, delay)
      }
    }
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
      onClick={handleClick}
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
            <p style={{ color: 'orange' }}>
              Creating opportunity for all — by turning attention into leverage.
            </p>
          </section>

          <section id="story" className="snap-section info-section info-hero" ref={(el) => setSectionRef(1, el)}>
            <div className="section-inner panel-content">
              <div className="info-pill content-block">Ideas That Bite. Marketing That Converts</div>
              <div className="info-copy content-block">
                <h1>
                  We help local and growing businesses build strong brands through social media, branding, video production, and digital advertising.
                  <br />
                  Founded in 2020 by Tushar Puri, we bring 6+ years of industry experience with one clear focus
                  <br />
                   — results that grow your business with creators, companies.                                   
                 
                 </h1>
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

          <section id="about" className="snap-section info-section about-section" ref={(el) => setSectionRef(2, el)}>
            <div className="section-inner panel-content about-layout">
              <div className="about-copy content-block">
                <h2>Our mission is to shape narratives that spark movements.</h2>
                <p>We believe creators are the new media. And we know how to use that power to grow businesses that matter.</p>
              </div>
              <div className="about-card content-block" aria-hidden>
                <div className="about-card-media">
                  <div className="about-play">▶</div>
                </div>
                <div className="about-card-meta">
                  <div className="about-heart">❤</div>
                  <span>1.1M</span>
                </div>
                <div className="about-card-title">Reach masses</div>
                <div className="about-card-tag">#socialtag</div>
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

          <section id="contact" className="snap-section info-section" ref={(el) => setSectionRef(6, el)}>
            <div className="section-inner panel-content">
              <div className="contact-header">
                <h2 className="contact-title">Contact Us</h2>
                <p className="contact-subtitle">Get in Touch</p>
               </div>
              <div className="contact-content-wrapper">
                {/* Left Column - Contact Details */}
                <div className="contact-column contact-details-column">
                  <div className="contact-details-card">
                    <div className="contact-info-item">
                      <label className="contact-info-label">Office Phone</label>
                      <a href="tel:+919175713150" className="contact-info-value">9175713150</a>
                    </div>

                    <div className="contact-info-item">
                      <label className="contact-info-label">Office Email</label>
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
                  <form className="contact-form">
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
                      <img 
                        src="/assets/arrow.png" 
                        alt="" 
                        className="arrow-indicator button-arrow"
                        width="18"
                        height="18"
                        loading="eager"
                        aria-hidden="true"
                      />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="section-label content-block">{SECTIONS[currentSectionIndex]}</div>
      </div>
    </div>
  )
}

export default App
