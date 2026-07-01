export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/api/health') {
            return Response.json({
                ok: true,
                app: 'velarium',
                mode: 'static-assets',
                data: 'mock',
                updatedAt: new Date().toISOString()
            });
        }

        return env.ASSETS.fetch(request);
    }
};
