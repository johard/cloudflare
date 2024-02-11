import apiRouter from './router';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return apiRouter.handle(request);
    }

    return new Response(JSON.stringify({ hello: 'world' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
