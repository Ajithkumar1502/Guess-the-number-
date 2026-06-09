# 🎮 Guess The Number Pro

> A professional, feature-rich number-guessing game built with **pure HTML5, CSS3, and Vanilla JavaScript** — no frameworks, no build tools, deploy directly to GitHub Pages.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Play%20Now-6366f1?style=for-the-badge)](https://yourusername.github.io/guess-the-number-pro)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Ready-222?style=for-the-badge&logo=github)](https://pages.github.com)

-----

## ✨ Features at a Glance

|Feature            |Details                                                     |
|-------------------|------------------------------------------------------------|
|🎯 Difficulty Modes |Easy (1–50) · Medium (1–100) · Hard (1–500)                 |
|🏆 Leaderboard      |Top-10 per difficulty, filterable, persisted in localStorage|
|📊 Stats Dashboard  |Win rate, avg attempts, best score, games played            |
|🎉 Win Celebration  |Canvas confetti + victory modal + Web Audio API tones       |
|🌙 Dark / Light Mode|Smooth transition, preference saved                         |
|♿ Accessibility    |Full keyboard nav, ARIA labels, WCAG-AA contrast            |
|📱 Responsive       |Works on all screen sizes, mobile-first                     |
|🎨 Design           |Glassmorphism, gradient accents, animated hero              |

-----

## 📂 Project Structure

```
guess-the-number-pro/
├── index.html      # App markup, hero, game UI, modals, sections
├── style.css       # Full design system, responsive, dark/light
├── script.js       # Game logic, localStorage, audio, confetti
└── README.md       # This file
```

No `node_modules`. No build step. Upload and play.

-----

## 🚀 GitHub Pages Deployment

### Method 1 — Quick Upload (Beginner)

1. Create a new repository on GitHub named `guess-the-number-pro`
1. Click **“uploading an existing file”** on the empty repo page
1. Drag and drop all 4 files (`index.html`, `style.css`, `script.js`, `README.md`)
1. Click **“Commit changes”**
1. Go to **Settings → Pages**
1. Under **“Branch”**, select `main` and `/ (root)`, click **Save**
1. Visit `https://yourusername.github.io/guess-the-number-pro` in ~1 minute ✅

### Method 2 — Git CLI

```bash
# Clone the repo you created on GitHub
git clone https://github.com/yourusername/guess-the-number-pro.git
cd guess-the-number-pro

# Copy the project files into this folder, then:
git add .
git commit -m "feat: initial release of Guess The Number Pro"
git push origin main
```

Then enable GitHub Pages in repo Settings → Pages → Branch: `main` / `(root)`.

### Method 3 — GitHub CLI

```bash
gh repo create guess-the-number-pro --public --push --source=.
# Then enable Pages via Settings
```

-----

## 🎮 How to Play

1. **Enter your name** — gets saved for the leaderboard
1. **Pick a difficulty** — Easy, Medium, or Hard
1. **Guess the number** — type a number and hit **Guess** (or press Enter)
1. **Follow the hints** — “Too High ↓” or “Too Low ↑”
1. **Score** starts high and decreases with each attempt
1. **Win!** — the fewer attempts, the higher your score
1. **Leaderboard** — top scores across all players are saved locally

-----

## 🧠 Score Formula

```
score = base_score - (attempts - 1) × penalty

Base scores:
  Easy   → 1000  (penalty per attempt: ~50)
  Medium → 2000  (penalty per attempt: ~150)
  Hard   → 5000  (penalty per attempt: ~625)

Score never drops below 0.
```

-----

## 💾 localStorage Keys

|Key               |Contents                                                |
|------------------|--------------------------------------------------------|
|`gtnp_theme`      |`"dark"` or `"light"`                                   |
|`gtnp_stats`      |`{ gamesPlayed, gamesWon, totalAttempts, highestScore }`|
|`gtnp_leaderboard`|Array of `{ name, score, difficulty, attempts, date }`  |
|`gtnp_player_name`|Last used player name                                   |

-----

## 🏗️ Code Architecture

```
script.js (18 sections, ~350 lines)
│
├── Constants & Config      — DIFFICULTY_CONFIG, STORAGE_KEYS
├── State Management        — Single mutable `state` object
├── localStorage Helpers    — loadStorage(), saveStorage()
├── Game Initialization     — initGame(), generateNumber()
├── Game Core Logic         — submitGuess() — the main game loop
├── Score Calculation       — calculateScore()
├── Hint System             — showHint(), pulseOrb()
├── Guess History           — addGuessToHistory(), clearGuessHistory()
├── Leaderboard             — addLeaderboardEntry(), renderLeaderboard()
├── Statistics Dashboard    — renderStats(), recordGameResult()
├── Win / Modal Logic       — handleWin(), showWinModal()
├── Confetti Animation      — launchConfetti() — canvas-based
├── Sound Effects           — playTone(), playWinSound() — Web Audio API
├── Hero Particles          — createHeroParticles()
├── Theme System            — applyTheme(), toggleTheme()
├── Loading Screen          — hideLoadingScreen()
├── Event Listeners         — All DOM bindings in one place
└── UI Utilities            — escapeHtml(), shakeElement(), etc.
```

-----

## 🖼️ Suggested Screenshots for Portfolio

Capture these views for your portfolio/README:

1. **Hero section** — full page, dark mode, animated gradient title
1. **Game in progress** — active game with guess history chips visible
1. **Win modal** — victory popup with confetti and score breakdown
1. **Leaderboard** — top 10 entries, multiple difficulty badges
1. **Stats dashboard** — non-zero stats showing win rate & avg attempts
1. **Light mode** — same as #2 but in light theme to show the toggle
1. **Mobile view** — portrait phone screenshot (use browser dev tools)

-----

## 🔮 Future Enhancement Ideas

- [ ] **Multiplayer mode** — challenge a friend with a shared link
- [ ] **Daily Challenge** — same target number for all players each day
- [ ] **Animation themes** — choose between confetti, fireworks, balloons
- [ ] **Hint upgrades** — “warm/cold” distance hints, range narrowing helper
- [ ] **Achievement badges** — “First Win”, “Perfectionist” (1 attempt), “Persistent”
- [ ] **Timer mode** — race against the clock for bonus points
- [ ] **Global leaderboard** — backend integration (Firebase / Supabase)
- [ ] **PWA support** — install as app on mobile, offline play
- [ ] **Sound toggle** — mute button for audio effects
- [ ] **Infinite mode** — no score, just pure practice with unlimited tries

-----

## 🧑‍💻 Tech Skills Demonstrated

This project showcases:

- **Semantic HTML5** — `<main>`, `<aside>`, `<section>`, `<header>`, `<footer>`, ARIA roles
- **Modern CSS3** — CSS custom properties (variables), `clamp()`, Grid, Flexbox, `backdrop-filter`, `@keyframes`, `prefers-reduced-motion`
- **Vanilla JavaScript ES6+** — modules pattern, `const`/`let`, arrow functions, template literals, destructuring, `Array.sort/filter/map`, `localStorage`, `requestAnimationFrame`, Web Audio API, Canvas 2D
- **UX Design** — loading states, error states, keyboard accessibility, empty states, responsive breakpoints
- **No dependencies** — everything from scratch

-----

## 📄 License

MIT — free to use, modify, and showcase in your portfolio.

-----

## 👤 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- Portfolio: [yoursite.com](https://yoursite.com)
- LinkedIn: [linkedin.com/in/yourname](https://linkedin.com/in/yourname)

-----

*Built from scratch with ❤️ and no frameworks.*