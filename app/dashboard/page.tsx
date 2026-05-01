import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { agents } from "@/db/schema"
import { eq } from "drizzle-orm"
import Image from "next/image"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const userAgents = await db
    .select()
    .from(agents)
    .where(eq(agents.userId, session.user.id))

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight">AgentFlow</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{session.user?.name}</span>
          <Image
            src={session.user?.image ?? ""}
            alt="avatar"
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome back, {session.user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {userAgents.length} agent{userAgents.length !== 1 ? "s" : ""} created
            </p>
          </div>
          <Link
            href="/agents/new"
            className="bg-gray-900 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + New agent
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <p className="text-sm text-gray-500 mb-1">Total agents</p>
            <p className="text-3xl font-semibold">{userAgents.length}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <p className="text-sm text-gray-500 mb-1">Total runs</p>
            <p className="text-3xl font-semibold">0</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <p className="text-sm text-gray-500 mb-1">Tokens used</p>
            <p className="text-3xl font-semibold">0</p>
          </div>
        </div>

        {userAgents.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="text-lg font-medium mb-2">No agents yet</h2>
            <p className="text-gray-500 text-sm mb-6">
              Create your first agent and give it tools to work with
            </p>
            <Link
              href="/agents/new"
              className="bg-gray-900 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
            >
              + Create your first agent
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-300 transition-colors cursor-pointer block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">🤖</div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    {agent.model}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{agent.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {agent.description ?? agent.systemPrompt}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}