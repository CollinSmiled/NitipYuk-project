# Deploy NitipYuk to Vercel

Repository: https://github.com/CollinSmiled/NitipYuk-project

Deploy the `react-version` branch. The `main` branch contains the original static site.

## Vercel setup

1. Sign in to Vercel with the GitHub account that owns this fork.
2. Choose **Add New > Project** and import `CollinSmiled/NitipYuk-project`.
3. Keep the root directory at the repository root. `vercel.json` configures Vite, `npm ci`, `npm run build`, and the `dist` output directory. `package.json` selects Node.js 22.x.
4. Set **Settings > Environments > Production > Branch Tracking** to `react-version` and save. If the import initially builds `main`, that deployment is the original site; deploy `react-version` after setting branch tracking.
5. In **Deployments**, use **Create Deployment** with the Git reference `react-version` to deploy the prepared version. Later pushes to `react-version` trigger automatic deployments once the Git integration is connected.

No environment variables, database connection, or payment API keys are required for this demo.

Keep **Clean URLs** disabled. The application routes by filenames such as `produk.html`, `form.html`, and `payment.html`. The build emits each React HTML entry along with the remaining login and registration pages. A blanket rewrite to `index.html` would replace the separate login and registration documents and is unnecessary here.

## Verify before updating

```sh
npm ci
npm test
npm run build
npm run preview
```

Smoke-test the homepage, product catalogue, login, cart, checkout address selection, payment demo, success page, orders, notifications, and profile addresses. Direct URLs and page reloads should work, including `/login.html`, `/produk.html`, `/payment.html`, and `/notif.html`.

For later updates:

```sh
git switch react-version
git add .
git commit -m "Describe the update"
git push origin react-version
```

`origin` points to your fork. `upstream` points to your friend's original repository.

## Demo limits

Authentication, orders, addresses, payment preferences, and notification state use localStorage. They are specific to a browser and origin, so the Vercel domain starts with fresh data. Payment and delivery status changes are simulations. Deploying this frontend does not add a backend or real account verification.

## References

- https://vercel.com/docs/git#customizing-the-production-branch
- https://vercel.com/docs/project-configuration/vercel-json
