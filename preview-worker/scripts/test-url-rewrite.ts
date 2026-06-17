import assert from 'node:assert/strict'
import { rewritePortalCss, rewritePortalHtml } from '../../worker/src/portal/urls'

const prefix = '/m/1f1itb0yx8w7mjw50qp0oyikwcu9ysgn9xwvm5v21nk3kiu3wj'

const html = `<!DOCTYPE html>
<html><head>
<link rel="icon" href="/assets/favicon.png" />
<script type="module" src="/assets/index.js"></script>
<link rel="stylesheet" href="/assets/index.css">
<a href="https://example.com">external</a>
</head><body></body></html>`

const rewritten = rewritePortalHtml(html, prefix)
assert.match(rewritten, /href="\/m\/1f1itb0[^"]+\/assets\/favicon\.png"/)
assert.match(rewritten, /src="\/m\/1f1itb0[^"]+\/assets\/index\.js"/)
assert.match(rewritten, /href="https:\/\/example\.com"/)
assert.doesNotMatch(rewritten, /href="\/assets\//)

const css = `@font-face{font-family:Koulen;src:url(/assets/Koulen-Regular.ttf) format("truetype")}`
const rewrittenCss = rewritePortalCss(css, prefix)
assert.match(rewrittenCss, /url\(\/m\/1f1itb0[^)]+\/assets\/Koulen-Regular\.ttf\)/)

console.log('url rewrite tests passed')
