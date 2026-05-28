# Security notes

## npm audit status

`npm audit` shows a small number of moderate and low findings. I reviewed each
one and left them in place on purpose because none of them can be triggered by
this site. This project is a static export with no server, so I documented the
decision here instead of forcing a fix that would break the build.

### Astro define:vars XSS and server islands replay (moderate)

These affect the `define:vars` script feature and the server islands feature.
This site does not use either one. It is a static build with no server rendering.
The only available fix moves the project to Astro 6, which is not currently
compatible with the `@astrojs/tailwind` integration. Because of that, upgrading
would break the build to patch an issue that cannot be triggered here.

### yaml stack overflow inside @astrojs/check (moderate and low)

This issue lives in the type checker tooling chain through `@astrojs/check` and
its language server. It only runs during local development when I run
`npm run check`. It never builds into the site and never ships to visitors. The
only fix downgrades the checker to an older version, so I left it as is.

## Review routine

- Run `npm audit` after adding any dependency
- Keep `package-lock.json` committed so installs stay reproducible
- GitHub Dependabot watches the repo for new advisories