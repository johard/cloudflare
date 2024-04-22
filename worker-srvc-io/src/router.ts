import { Router, IRequest } from 'itty-router';

const router = Router();

router.all('/api/ping', async (request) => {
  const headers: any = {};
  for (let [key, value] of request.headers.entries()) {
    headers[key] = value;
  }
  return new Response(JSON.stringify({ headers }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

router.get('/api/hello', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const kv = env.MY_KV_NAMESPACE;
  const res = await kv.get('hello');

  const db = env.MY_DB;
  const stmt = db.prepare('SELECT * FROM Todo');
  const { results } = await stmt.all();

  return new Response(JSON.stringify({ res, results }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
