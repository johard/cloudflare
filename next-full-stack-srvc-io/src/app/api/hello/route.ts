import type { NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function GET() {
  const db = getRequestContext().env.MY_DB
  const stmt = db.prepare("SELECT * FROM Todo");
  const { results } = await stmt.all();

  const kv = getRequestContext().env.MY_KV_NAMESPACE
  const res = await kv.get('hello')

  return new Response(JSON.stringify({ res, results }))
}
