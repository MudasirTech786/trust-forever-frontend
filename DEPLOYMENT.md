# Admin application deployment

Vercel project domain: `https://app.trustforevermarriagebureau.com`

Set this environment variable for the **Production** environment in the Vercel project, then redeploy:

```dotenv
NEXT_PUBLIC_API_URL=https://api.trustforevermarriagebureau.com/api
```

The admin uses Laravel Sanctum stateful session cookies and CSRF protection. It calls the API's `/sanctum/csrf-cookie` endpoint and sends credentials for login, session checks, and authenticated management requests. The Laravel VPS must allow this origin through CORS and include `app.trustforevermarriagebureau.com` in Sanctum's stateful domains. See `backend/DEPLOYMENT.md` for the server settings.

For local development, see `.env.example`.
