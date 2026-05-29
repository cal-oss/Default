# Agent Prompt — Reusable Terminal Banner

Use this prompt to give another AI agent everything it needs to produce a
matching banner for any of your repos (claude-seo, claude-blog, etc.).

The deliverable is a static PNG at `assets/banner.png` in the target repo,
1680×720 (21:9), rendered from an animated HTML template.

---

## Copy-paste prompt

````
You are creating a terminal-style banner image for a GitHub repo. The
banner must visually match the established "claude-ads" v1.7.0 brand
(retro CRT terminal, monospace ASCII-Shadow figlet logo, command palette
on the right, breathing gradient, scanline overlay, deep espresso bg).

The template is `branding/banner-template.html` from the claude-ads repo
(copy this file into the target repo, OR open it directly and modify in
place). It has SIX "EDIT THIS" sections clearly marked in comments. Fill
each one in for the target repo, then render at 1680×720 and save as
`assets/banner.png`.

═══════════════════════════════════════════════════════════════════════
INPUTS — fill these for the target repo
═══════════════════════════════════════════════════════════════════════

  PRODUCT_NAME_LINE_1:   e.g. "CLAUDE"
  PRODUCT_NAME_LINE_2:   e.g. "SEO"           (max 4–5 chars)
  PRODUCT_SLUG:          e.g. "CLAUDE-SEO"    (used in top HUD)
  TAGLINE:               e.g. "AI-Powered SEO Analysis"
  SYSTEM_LINE:           e.g. "runtime ready · 18 sub-skills · 312 checks · 6 hosts"
  COMMANDS (exactly 7):  e.g.
    /seo audit
    /seo schema
    /seo geo
    /seo sitemap
    /seo plan <type>
    /seo hreflang
    /seo competitor-pages
  STATUS_TOKENS (3):     e.g. "link · stable", "buf 1024k", "v1.4.2"
  IDENTIFIER:            e.g. "208.140.MAINFRAME.AGRICIDANIEL"
  ACCENT_PALETTE:        one of: orange (default, Claude Ads),
                                 teal-green (Claude SEO),
                                 purple (Claude Blog),
                                 OR custom 5-step hex ramp.

═══════════════════════════════════════════════════════════════════════
PROCESS — exactly 4 steps
═══════════════════════════════════════════════════════════════════════

STEP 1 — Generate the ASCII logo (figlet ANSI Shadow font).

  Online generator: https://patorjk.com/software/taag/
    1. Type your product name (line 1, then return, then line 2)
    2. Select font: "ANSI Shadow"
    3. Copy the output verbatim.

  Or CLI:  figlet -f "ANSI Shadow" "CLAUDE"
           figlet -f "ANSI Shadow" "SEO"
           (concatenate output of both with a blank line between)

  Paste the output into the `.ascii-logo` <pre> block, replacing
  the existing CLAUDE + ADS art. Preserve exact whitespace.

STEP 2 — Set the accent palette.

  In :root, ONE accent block is active. Comment out "Claude Ads"
  and uncomment the variant that matches the target product.
  (Or paste a custom 5-step ramp using --accent / --accent-bright /
  --accent-mid / --accent-deep / --accent-darker.)

STEP 3 — Fill the six EDIT THIS sections.

  Each section is bracketed by ASCII comment boxes. Replace the
  example text with the inputs above. Keep all 7 commands — the
  CSS animation-delay values are hardcoded for 7. If you must use
  more/fewer, update `.cmd:nth-child(N)` animation-delay values to
  evenly distribute across the 5.7s loop (0.7s per command works well).

STEP 4 — Render at 1680×720 and save.

  Two render options:

  (A) Headless Playwright (preferred — reproducible):
      ```python
      from playwright.sync_api import sync_playwright
      with sync_playwright() as p:
          b = p.chromium.launch()
          page = b.new_page(viewport={'width': 1680, 'height': 720})
          page.goto('file:///absolute/path/to/banner-template.html')
          page.wait_for_load_state('networkidle')
          page.wait_for_timeout(2900)  # let one scan cycle play; /seo geo or
                                       # equivalent middle command will be active
          page.screenshot(path='assets/banner.png', full_page=False)
          b.close()
      ```

  (B) Manual browser screenshot:
      - Open the HTML in Chrome at viewport 1680×720
      - Wait ~3 seconds for animations to play
      - Use Chrome DevTools "Capture full size screenshot" (Cmd+Shift+P)
      - Save as `assets/banner.png` in the target repo

═══════════════════════════════════════════════════════════════════════
QA CHECKLIST — verify before committing
═══════════════════════════════════════════════════════════════════════

  [ ] File saved to `assets/banner.png` (1680×720, ~250–400 KB)
  [ ] Product name reads clearly — gradient flows top→bottom across letters
  [ ] One command is highlighted in white (the scanner caught it)
  [ ] Top HUD shows "SYS · <PRODUCT_SLUG>" (not "CLAUDE-ADS" still)
  [ ] Status bar bottom-left shows the 3 status tokens
  [ ] Tagline + system-line are visible below the divider
  [ ] No console errors when opening the HTML
  [ ] README.md references `assets/banner.png` with width="100%"
````

---

## Pre-built palette presets

These are tested 5-step ramps that work well with the gradient text +
accent-driven chrome. Copy the block matching your product into the
template's `:root` and comment out the others.

### Orange (Claude Ads — default, "warm CRT phosphor")

```css
--accent:         #D97757;
--accent-bright:  #F5B095;
--accent-mid:     #E89270;
--accent-deep:    #7A3A1F;
--accent-darker:  #5C2A14;
```

### Teal / sea-green (Claude SEO — "ops console")

```css
--accent:         #4F7B6E;
--accent-bright:  #8BC0A8;
--accent-mid:     #6FA38F;
--accent-deep:    #2B4A41;
--accent-darker:  #1B302A;
```

### Purple (Claude Blog — "publishing terminal")

```css
--accent:         #7B5EA7;
--accent-bright:  #B49DD6;
--accent-mid:     #9075BD;
--accent-deep:    #3F2C5C;
--accent-darker:  #2A1C3F;
```

### Cobalt blue (Claude Code-API-style)

```css
--accent:         #4A77C7;
--accent-bright:  #8DAEDD;
--accent-mid:     #6790CD;
--accent-deep:    #234176;
--accent-darker:  #16294D;
```

### Crimson (high-attention launch banners)

```css
--accent:         #C94A2C;
--accent-bright:  #F09078;
--accent-mid:     #DC6E50;
--accent-deep:    #6E2415;
--accent-darker:  #4A170A;
```

---

## What stays constant across all variants

These elements form the cross-repo brand identity — **do not change**:

- **Canvas background**: deep espresso `#16130F` (radial gradient
  `#1A1612 → #110E0B → #060504`). All products share this.
- **Top + bottom bar background**: `#0A0807` solid fill.
- **Aspect ratio**: 21:9 (1680×720 at render time).
- **Typography**: JetBrains Mono for terminal text, Inter 500 for the
  tagline. No other fonts.
- **CRT effects layered z-order**: noise grain (z47) → drift scanline
  (z49) → CRT scanlines (z50) → vignette (z51) → content (z10).
  Animations: gradient breath 4.2s, scanner 5.7s, drift 10s, divider 4.2s.
- **HUD layout**: top-left = `SYS · <PRODUCT> · NODE 0x__ · ACTIVE`,
  top-right = `UPTIME hh:mm:ss`. Bottom-left = live dot + 3 status tokens.
  Bottom-right = mainframe identifier + live UTC clock.
- **Letterbox bars**: solid `#050403` outside the 21:9 canvas if the
  viewport is wider/taller than 21:9.

The ONLY things that change per product are: ASCII logo text, slug,
tagline, system-line stats, command list (7 verbs), status tokens,
identifier, and the 5-step accent palette.

---

## Why this works as a brand system

`★ Insight ─────────────────────────────────────`
- **Constant chrome + variable accent = product family**: every banner
  feels like the same OS booted with a different module. The viewer's
  brain reads "another tool in the same family" before they even read
  the product name. That's the brand-system payoff.
- **One palette swap, one figlet generation = full re-skin**: no other
  edits needed. An agent can produce a new repo banner end-to-end in
  under 90 seconds given the inputs above.
- **The breathing gradient does cross-repo storytelling for free**:
  same physical animation rhythm across all products signals "made by
  the same maker" without needing a literal logo.
`─────────────────────────────────────────────────`

---

## File checklist for the target repo

After running through the process, the target repo should have:

```
target-repo/
├── assets/
│   ├── banner.png                  ← NEW, 1680×720, ~300KB
│   └── banner-pre-vX.X.X.png       ← OLD banner (backup, optional)
├── branding/                       ← optional but recommended
│   ├── banner-template.html        ← the customized HTML
│   └── AGENT-PROMPT.md             ← this file
└── README.md                       ← references banner.png at top
```

If you want the source HTML to live in the repo (so future updates are
trivial), copy `banner-template.html` and `AGENT-PROMPT.md` into a
`branding/` folder in every target repo. If you only want the static
PNG, drop just `assets/banner.png` and discard the template.
