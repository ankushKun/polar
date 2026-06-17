import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ButtonBg from '/ButtonBgPng.webp'

const landingCtaBase =
  'relative group transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center text-white drop-shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100'

export default function Home() {
  const { isAuthenticated, isCheckingProfile, login, isConnecting } = useAuth()

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-landing">
      <picture className="absolute inset-0 z-0 block h-full w-full">
        <source srcSet="/BackgroundSkyAndBeam.avif" type="image/avif" />
        <source srcSet="/BackgroundSkyAndBeam.webp" type="image/webp" />
        <img
          src="/BackgroundSkyAndBeam.png"
          alt=""
          aria-hidden="true"
          width={5808}
          height={3740}
          decoding="async"
          fetchPriority="high"
          draggable={false}
          className="h-full w-full object-cover object-center select-none"
        />
      </picture>

      <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
          <img src="/PolarSvg.svg" alt="" className="w-7 h-7" draggable={false} />
          <span className="font-semibold tracking-tight">Polar</span>
        </Link>
        {isAuthenticated ? (
          <Link to="/dashboard" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            Dashboard
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => void login()}
            disabled={isConnecting}
            className="text-sm font-medium text-white/80 hover:text-white transition-colors disabled:opacity-60"
          >
            Sign in
          </button>
        )}
      </header>

      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-full z-10 flex items-center justify-center select-none">
        <span className="font-koulen text-[120px] sm:text-[180px] lg:text-[240px] leading-none text-white tracking-wider">P</span>
        <img src="/PolarSvg.svg" alt="Polar Logo" draggable={false} className="w-[90px] h-[90px] sm:w-[135px] sm:h-[135px] lg:w-[220px] lg:h-[220px] object-contain mx-1 sm:mx-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
        <span className="font-koulen text-[120px] sm:text-[180px] lg:text-[240px] leading-none text-white tracking-wider">LAR</span>
      </div>

      <img
        src="/PolarNoBg.png"
        alt=""
        aria-hidden="true"
        width={2462}
        height={1664}
        decoding="async"
        draggable={false}
        className="absolute bottom-[-5%] left-0 right-0 z-20 h-[70%] w-full object-cover object-top pointer-events-none select-none md:h-[95%] animate-polar-slide-up"
      />

      <div className="absolute top-[50vh] sm:top-[68vh] left-1/2 -translate-x-1/2 z-30">
        {isAuthenticated ? (
          <Link to="/dashboard">
            <button
              type="button"
              disabled={isCheckingProfile}
              className={`${landingCtaBase} px-12 py-5 font-sans font-medium text-lg sm:text-xl`}
              style={{
                backgroundImage: `url(${ButtonBg})`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            >
              {isCheckingProfile ? 'Loading…' : 'Go to Dashboard'}
            </button>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => void login()}
            disabled={isConnecting}
            className={`${landingCtaBase} px-9 sm:px-16 lg:px-24 py-12 sm:py-10 lg:py-12 font-normal text-lg sm:text-2xl md:text-3xl`}
            style={{
              backgroundImage: `url(${ButtonBg})`,
              backgroundSize: '100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          >
            {isConnecting ? 'Redirecting…' : 'Connect GitHub'}
          </button>
        )}
      </div>

      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-xl rounded-2xl border border-white/15 bg-landing/70 px-5 py-3 text-center text-sm font-medium text-white shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-md sm:text-base">
        Polar lets you deploy your web apps to Walrus in seconds
      </p>
    </div>
  )
}
