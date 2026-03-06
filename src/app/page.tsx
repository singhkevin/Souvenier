import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col selection:bg-purple-500/30">
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-8 h-24 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-lg shadow-lg shadow-purple-500/20" />
          <span className="text-xl font-black tracking-tighter uppercase italic">Souvenier</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/login" className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Client Login</Link>
          <Link href="/admin" className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Admin Portal</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center relative z-10 px-8 py-20">
        <div className="max-w-4xl w-full text-center space-y-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md mb-4">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">The Future of B2B Gifting</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
              Corporate Gifting, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Reimagined.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/40 font-medium leading-relaxed">
              A curated B2B platform for premium brands to manage gifting, selection, and procurement with seamless automation and rich analytics.
            </p>
          </div>

          {/* Quick Access Cards */}
          <div className="grid md:grid-cols-2 gap-6 pt-8">
            {/* Client Portal Card */}
            <Link href="/login" className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2.5rem] opacity-20 group-hover:opacity-100 transition duration-500 blur-xl group-hover:blur-2xl" />
              <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 h-full flex flex-col items-start text-left hover:border-white/20 transition-colors">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-6 h-6 text-white/60 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 118 0m-4 5v2a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black mb-2">Client Portal</h3>
                <p className="text-white/40 text-sm font-medium leading-relaxed mb-8">
                  Access your brand's exclusive storefront, manage your curated selection, and track gift distributions.
                </p>
                <span className="mt-auto inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                  Enter Storefront
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Admin Dashboard Card */}
            <Link href="/admin" className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[2.5rem] opacity-20 group-hover:opacity-100 transition duration-500 blur-xl group-hover:blur-2xl" />
              <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 h-full flex flex-col items-start text-left hover:border-white/20 transition-colors">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-6 h-6 text-white/60 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black mb-2">Admin Dashboard</h3>
                <p className="text-white/40 text-sm font-medium leading-relaxed mb-8">
                  Monitor platform health, manage client accounts, analyze procurement data, and oversee all orders.
                </p>
                <span className="mt-auto inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                  Manage Platform
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-12 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-white/20 gap-8">
        <div>© 2026 Souvenier Technologies. All Rights Reserved.</div>
        <div className="flex items-center gap-8">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact Inquiry</a>
        </div>
      </footer>
    </div>
  )
}
