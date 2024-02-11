import { Router } from 'itty-router';

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

router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
