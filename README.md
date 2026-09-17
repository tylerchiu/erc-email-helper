# ERC Email Helper

A lightweight, mobile-friendly, static web app for preparing ERC client emails. It runs entirely in the browser; no client names, notice details, or refund amounts are sent to a server.

## Share it without development setup

The simplest delivery path is **GitHub Pages** when the app’s source code may be public:

1. Create a new GitHub repository and add this `erc-email-helper` folder to it.
2. Move the contents of this folder to the repository root (or put them in a folder named `docs`). GitHub Pages can publish from `/root` or `/docs`, not an arbitrary folder.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and the matching `/root` or `/docs` folder.
4. Share the generated HTTPS link with the employee. They can save it to their phone home screen and use it like an app.

Because it is static, updates only require pushing changes to GitHub; the shared link stays the same. The app itself contains no client data, and entries stay in the user’s browser, but GitHub Pages sites are publicly reachable even when their source repository is private. If the application must only be available to employees, deploy the same folder to Cloudflare Pages and protect it with Cloudflare Access (company email sign-in), or use your company’s approved internal hosting.

## Included behavior

- Four exclusive email choices with large tap targets.
- Preset and custom LTR notice options.
- Quarter selector, paste-ready company name, and date input.
- Automatic dollar formatting (for example, `12500` becomes `$12,500.00`).
- Refund date and amount appear only for the Refund Information template.
- One-tap copy includes the subject line and body.
