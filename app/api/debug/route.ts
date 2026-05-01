export async function GET() {
  return Response.json({
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasGithubId: !!process.env.GITHUB_CLIENT_ID,
    hasGithubSecret: !!process.env.GITHUB_CLIENT_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
  })
}