# SISdar Apps

Public company site for [sisdarapps.co.in](https://sisdarapps.co.in), hosted on GitHub Pages.

## Pages

- Home, About, Products, Contact
- Privacy Policy and Terms & Conditions
- Admin catalog at `/admin.html` (not linked in the public nav)

## Product catalog

The Products page reads `data/products.json`. Staff can add, edit, or delete products in `/admin.html`, then publish by committing that file through the GitHub Contents API. GitHub Pages rebuilds in about a minute.

Admin sign-in is only a page lock. Publishing needs a fine-grained GitHub personal access token with **Contents: Read and write** on `Inder07it25/my-domain-site`. The token is stored in the browser session only. Do not commit it.

## GameSprite

Source lives in the `mysprite` repo. CI builds twice:

1. Existing public `GameSprite` repo (`base: /GameSprite/`)
2. This site’s `gamesprite/` folder (`base: /gamesprite/`) so the app is served at `https://sisdarapps.co.in/gamesprite/`

Add a `SITE_DEPLOY_TOKEN` secret on `mysprite` with write access to this repository (or give the existing `GAME_SPRITE_DEPLOY_TOKEN` access to both repos).
