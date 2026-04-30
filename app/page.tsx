export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <span className="text-lg font-semibold tracking-tight">AgentFlow</span>
        <div className="flex items-center gap-4">
          <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Features
          </a>
          <a
          
            href="/login"
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Get started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-28 max-w-3xl mx-auto">
        <span className="text-xs font-medium bg-purple-50 text-purple-700 px-3 py-1 rounded-full mb-6">
          AI agents, built by you
        </span>
        <h1 className="text-5xl font-semibold leading-tight tracking-tight mb-6">
          Build and run AI agents <br /> that actually do things
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-xl">
          Create custom AI agents with tools like web search, code execution,
          and API calls. Watch them think, act, and deliver results in real time.
        </p>
        <div className="flex gap-3">
          <a
          
            href="/dashboard"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Start building free
          </a>
          <a
          
            href="#features"
            className="border border-gray-200 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            See how it works
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-4">
            Everything your agent needs
          </h2>
          <p className="text-center text-gray-500 mb-14 text-base">
            Give your agents real tools, real memory, and real power.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-gray-100 rounded-2xl p-7"
              >
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="font-medium text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl font-semibold mb-4">Ready to build your first agent?</h2>
        <p className="text-gray-500 mb-8">No setup headaches. Just create, run, and ship.</p>
        <a
          href="/login"
          className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Get started for free
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        AgentFlow — built as a portfolio project
      </footer>

    </main>
  )
}

const features = [
  {
    icon: "🧠",
    title: "ReAct agent loop",
    desc: "Agents reason step by step, pick the right tool, observe the result, and keep going until the job is done.",
  },
  {
    icon: "🔧",
    title: "Pluggable tools",
    desc: "Web search, code execution, and HTTP calls out of the box. Add your own tools with a simple schema.",
  },
  {
    icon: "💾",
    title: "Long-term memory",
    desc: "Agents remember past conversations using vector search — no more repeating yourself every session.",
  },
  {
    icon: "⚡",
    title: "Real-time streaming",
    desc: "Watch your agent think token by token. See every tool call and observation as it happens.",
  },
  {
    icon: "📊",
    title: "Run history",
    desc: "Every agent run is logged. See what worked, what didn't, and how much it cost.",
  },
  {
    icon: "🔒",
    title: "Auth built in",
    desc: "Sign in with Google or GitHub. Each user gets their own isolated agents and run history.",
  },
]