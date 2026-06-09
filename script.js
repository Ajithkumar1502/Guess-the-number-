/**
 * GUESS THE NUMBER PRO
 * script.js — Main game logic
 *
 * Architecture: Module-pattern with a central state object.
 * All sections are clearly labeled with comments.
 *
 * Sections:
 *  1. Constants & Config
 *  2. State Management
 *  3. localStorage Helpers
 *  4. Game Initialization
 *  5. Game Core Logic
 *  6. Score Calculation
 *  7. Hint System
 *  8. Guess History
 *  9. Leaderboard
 * 10. Statistics Dashboard
 * 11. Win / Modal Logic
 * 12. Confetti Animation
 * 13. Sound Effects (Web Audio API)
 * 14. Hero Particles
 * 15. Theme System
 * 16. Loading Screen
 * 17. Event Listeners
 * 18. UI Utilities
 */

/* =============================================
   1. CONSTANTS & CONFIG
   ============================================= */

const DIFFICULTY_CONFIG = {
  easy:   { min: 1,   max: 50,  baseScore: 1000, multiplier: 1 },
  medium: { min: 1,   max: 100, baseScore: 2000, multiplier: 1.5 },
  hard:   { min: 1,   max: 500, baseScore: 5000, multiplier: 2.5 },
};

const STORAGE_KEYS = {
  theme:       'gtnp_theme',
  stats:       'gtnp_stats',
  leaderboard: 'gtnp_leaderboard',
  playerName:  'gtnp_player_name',
};

const MAX_LEADERBOARD_ENTRIES = 10;

/* =============================================
   2. STATE MANAGEMENT
   State is the single source of truth for a session.
   Persistent data lives in localStorage.
   ============================================= */

const state = {
  playerName:   '',
  difficulty:   'easy',
  targetNumber: 0,
  attempts:     0,
  maxAttempts:  0,
  gameActive:   false,
  currentScore: 0,
  guesses:      [],   // array of {value, result: 'high'|'low'}
};

/* =============================================
   3. LOCALSTORAGE HELPERS
   ============================================= */

/** Load a JSON value from localStorage, returning fallback on failure */
function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Save a value to localStorage as JSON */
function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

/** Default statistics object — used when no stats exist yet */
function defaultStats() {
  return {
    gamesPlayed:  0,
    gamesWon:     0,
    totalAttempts: 0,
    highestScore:  0,
  };
}

/* =============================================
   4. GAME INITIALIZATION
   ============================================= */

/**
 * Called when the player clicks "Start Game".
 * Validates name input, sets up state, and switches screens.
 */
function initGame() {
  const nameInput  = document.getElementById('player-name-input');
  const rawName    = nameInput.value.trim();

  // Validate name
  if (!rawName || rawName.length < 2 || !/^[a-zA-Z0-9 _-]+$/.test(rawName)) {
    shakeElement(nameInput);
    nameInput.focus();
    return;
  }

  // Determine difficulty from radio buttons
  const selectedDiff = document.querySelector('input[name="difficulty"]:checked')?.value || 'easy';
  const config       = DIFFICULTY_CONFIG[selectedDiff];

  // Persist player name
  saveStorage(STORAGE_KEYS.playerName, rawName);

  // Update state
  state.playerName   = rawName;
  state.difficulty   = selectedDiff;
  state.targetNumber = generateNumber(config.min, config.max);
  state.attempts     = 0;
  state.guesses      = [];
  state.currentScore = config.baseScore;
  state.gameActive   = true;

  console.log(`🎯 Target: ${state.targetNumber} (${selectedDiff})`); // dev hint

  // Update UI
  updateGameScreenMeta();
  resetHintDisplay();
  clearGuessHistory();
  updateScoreDisplay();
  switchToGameScreen();
}

/**
 * Generate a cryptographically-flavoured random integer in [min, max]
 */
function generateNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Start a new game — returns to name screen with pre-filled name
 * and the same difficulty pre-selected.
 */
function newGame() {
  state.gameActive = false;

  // Pre-fill the name field
  const nameInput = document.getElementById('player-name-input');
  nameInput.value = state.playerName || loadStorage(STORAGE_KEYS.playerName, '');

  // Re-select the same difficulty
  const diffRadio = document.querySelector(`input[name="difficulty"][value="${state.difficulty}"]`);
  if (diffRadio) diffRadio.checked = true;

  // Switch back to start screen
  document.getElementById('game-screen').classList.remove('active');
  document.getElementById('name-screen').classList.add('active');
  nameInput.focus();
}

/* =============================================
   5. GAME CORE LOGIC
   ============================================= */

/**
 * Process the player's submitted guess.
 * This is the central game loop function.
 */
function submitGuess() {
  if (!state.gameActive) return;

  const input     = document.getElementById('guess-input');
  const rawValue  = input.value.trim();
  const config    = DIFFICULTY_CONFIG[state.difficulty];
  const guess     = parseInt(rawValue, 10);

  // Validate input
  if (isNaN(guess) || guess < config.min || guess > config.max) {
    shakeElement(input);
    showHint(`Enter a number between ${config.min} and ${config.max}`, '');
    return;
  }

  state.attempts++;
  updateAttemptsDisplay();

  // Recalculate score (decreases with each attempt)
  state.currentScore = calculateScore(state.attempts, state.difficulty);
  updateScoreDisplay();

  if (guess === state.targetNumber) {
    // ✅ CORRECT
    handleWin();
  } else if (guess > state.targetNumber) {
    // 📈 TOO HIGH
    addGuessToHistory(guess, 'high');
    showHint('Too High! ↓', 'hint-high');
    pulseOrb('pulse-high');
    playTone(440, 'sawtooth', 0.15);
  } else {
    // 📉 TOO LOW
    addGuessToHistory(guess, 'low');
    showHint('Too Low! ↑', 'hint-low');
    pulseOrb('pulse-low');
    playTone(280, 'sawtooth', 0.15);
  }

  // Clear input and refocus for next guess
  input.value = '';
  input.focus();
}

/* =============================================
   6. SCORE CALCULATION
   ============================================= */

/**
 * Calculate score based on attempts and difficulty.
 * Formula: base - (attempts-1) * penalty, never below 0.
 */
function calculateScore(attempts, difficulty) {
  const config  = DIFFICULTY_CONFIG[difficulty];
  const penalty = Math.floor(config.baseScore / 20) * config.multiplier;
  const score   = Math.max(0, Math.floor(config.baseScore - (attempts - 1) * penalty));
  return score;
}

/* =============================================
   7. HINT SYSTEM
   ============================================= */

/**
 * Update the hint display element with text and styling class.
 * @param {string} message  — display text
 * @param {string} cssClass — 'hint-high' | 'hint-low' | 'hint-win' | ''
 */
function showHint(message, cssClass) {
  const el = document.getElementById('hint-display');
  el.className    = `hint-display${cssClass ? ' ' + cssClass : ''}`;
  el.textContent  = message;
}

function resetHintDisplay() {
  showHint("Make your first guess!", '');
}

/**
 * Trigger CSS pulse animation on the number orb.
 * Classes: 'pulse-high' | 'pulse-low' | 'pulse-win'
 */
function pulseOrb(pulseClass) {
  const orb = document.getElementById('number-orb');
  orb.classList.remove('pulse-high', 'pulse-low', 'pulse-win');
  // Force reflow so CSS animation restarts
  void orb.offsetWidth;
  orb.classList.add(pulseClass);
  setTimeout(() => orb.classList.remove(pulseClass), 600);
}

/* =============================================
   8. GUESS HISTORY
   ============================================= */

/**
 * Add a coloured chip to the guess history strip.
 * Shows the number with colour coding (red=too high, cyan=too low).
 */
function addGuessToHistory(value, result) {
  state.guesses.push({ value, result });
  const container = document.getElementById('guess-history');
  const chip      = document.createElement('span');
  chip.className  = `guess-chip ${result}`;
  chip.textContent = value;
  chip.setAttribute('aria-label', `${value} was ${result === 'high' ? 'too high' : 'too low'}`);
  container.appendChild(chip);
}

function clearGuessHistory() {
  document.getElementById('guess-history').innerHTML = '';
  state.guesses = [];
}

/* =============================================
   9. LEADERBOARD
   ============================================= */

/**
 * Add an entry to the leaderboard in localStorage.
 * Maintains only top MAX_LEADERBOARD_ENTRIES scores (all difficulties combined).
 */
function addLeaderboardEntry(name, score, difficulty, attempts) {
  const board = loadStorage(STORAGE_KEYS.leaderboard, []);

  board.push({
    name,
    score,
    difficulty,
    attempts,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  });

  // Sort descending by score, then ascending by attempts as tiebreaker
  board.sort((a, b) => b.score - a.score || a.attempts - b.attempts);

  // Keep top entries (global cap: 50 across all difficulties to not limit per-difficulty filtering)
  const trimmed = board.slice(0, 50);
  saveStorage(STORAGE_KEYS.leaderboard, trimmed);

  return trimmed;
}

/**
 * Render the leaderboard UI for a given difficulty filter.
 * @param {string} filter — 'all' | 'easy' | 'medium' | 'hard'
 */
function renderLeaderboard(filter = 'all') {
  const container = document.getElementById('leaderboard-list');
  let board = loadStorage(STORAGE_KEYS.leaderboard, []);

  if (filter !== 'all') {
    board = board.filter(e => e.difficulty === filter);
  }

  board = board.slice(0, MAX_LEADERBOARD_ENTRIES);

  if (board.length === 0) {
    container.innerHTML = `<div class="lb-empty">No ${filter === 'all' ? '' : filter + ' '}scores yet.<br/>Be the first! 🎯</div>`;
    return;
  }

  const rankEmojis  = ['🥇', '🥈', '🥉'];
  const rankClasses = ['gold', 'silver', 'bronze'];

  container.innerHTML = board.map((entry, index) => {
    const rank        = index + 1;
    const isTop       = index < 3;
    const rankDisplay = isTop ? rankEmojis[index] : `#${rank}`;
    const rankCls     = isTop ? rankClasses[index] : '';
    const rankLabelCls = `lb-rank${rank <= 3 ? ' rank-' + rank : ''}`;
    const isCurrentPlayer = entry.name === state.playerName;
    const nameCls   = isCurrentPlayer ? 'lb-name current-player' : 'lb-name';

    return `
      <div class="lb-item ${rankCls}" role="listitem" aria-label="Rank ${rank}: ${entry.name}, score ${entry.score}">
        <span class="${rankLabelCls}" aria-hidden="true">${rankDisplay}</span>
        <span class="${nameCls}">${escapeHtml(entry.name)}</span>
        <span class="lb-score">${entry.score}</span>
        <span class="lb-diff-badge ${entry.difficulty}">${entry.difficulty}</span>
      </div>
    `.trim();
  }).join('');
}

/**
 * Return the player's rank position in a given leaderboard snapshot.
 * Returns null if not on the board.
 */
function getPlayerRank(score, difficulty) {
  const board = loadStorage(STORAGE_KEYS.leaderboard, [])
    .filter(e => e.difficulty === difficulty)
    .sort((a, b) => b.score - a.score);

  const idx = board.findIndex(e => e.score === score && e.name === state.playerName);
  return idx === -1 ? null : idx + 1;
}

/* =============================================
   10. STATISTICS DASHBOARD
   ============================================= */

/** Load stats from storage and update all stat UI elements */
function renderStats() {
  const stats = loadStorage(STORAGE_KEYS.stats, defaultStats());
  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;
  const avgAttempts = stats.gamesWon > 0
    ? (stats.totalAttempts / stats.gamesWon).toFixed(1)
    : '—';

  document.getElementById('stat-games-played').textContent = stats.gamesPlayed;
  document.getElementById('stat-games-won').textContent    = stats.gamesWon;
  document.getElementById('stat-win-rate').textContent     = `${winRate}%`;
  document.getElementById('stat-avg-attempts').textContent = avgAttempts;
  document.getElementById('stat-best-score').textContent   = stats.highestScore;
  document.getElementById('stat-difficulty').textContent   =
    state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);
}

/** Increment stats on game completion */
function recordGameResult(won, attempts, score) {
  const stats = loadStorage(STORAGE_KEYS.stats, defaultStats());
  stats.gamesPlayed++;
  if (won) {
    stats.gamesWon++;
    stats.totalAttempts += attempts;
    if (score > stats.highestScore) stats.highestScore = score;
  }
  saveStorage(STORAGE_KEYS.stats, stats);
  renderStats();
}

/** Reset all statistics */
function resetStats() {
  saveStorage(STORAGE_KEYS.stats, defaultStats());
  renderStats();
}

/* =============================================
   11. WIN / MODAL LOGIC
   ============================================= */

/** Called when the player guesses correctly */
function handleWin() {
  state.gameActive = false;

  // Update orb to show the number
  const orb = document.getElementById('number-orb');
  orb.textContent = state.targetNumber;
  pulseOrb('pulse-win');
  showHint('Correct! 🎉', 'hint-win');

  // Record stats
  recordGameResult(true, state.attempts, state.currentScore);

  // Add to leaderboard
  addLeaderboardEntry(state.playerName, state.currentScore, state.difficulty, state.attempts);
  renderLeaderboard(getCurrentLeaderboardFilter());

  // Play win sound
  playWinSound();

  // Show win modal after brief delay for dramatic effect
  setTimeout(() => showWinModal(), 500);
}

/** Populate and show the win modal */
function showWinModal() {
  document.getElementById('win-number').textContent   = state.targetNumber;
  document.getElementById('win-attempts').textContent = state.attempts;
  document.getElementById('win-score').textContent    = state.currentScore;

  // Show leaderboard rank
  const rank = getPlayerRank(state.currentScore, state.difficulty);
  const rankEl = document.getElementById('win-rank-display');
  if (rank && rank <= 3) {
    const emojis = ['🥇 1st', '🥈 2nd', '🥉 3rd'];
    rankEl.textContent = `You ranked ${emojis[rank - 1]} on the leaderboard!`;
  } else if (rank) {
    rankEl.textContent = `You ranked #${rank} on the leaderboard!`;
  } else {
    rankEl.textContent = '';
  }

  const modal = document.getElementById('win-modal');
  modal.hidden = false;
  modal.querySelector('.btn-primary').focus();

  // Launch confetti
  launchConfetti();
}

function closeWinModal() {
  document.getElementById('win-modal').hidden = true;
}

/** Show the generic confirm modal with custom message */
function showConfirmModal(message, onConfirm) {
  document.getElementById('confirm-desc').textContent = message;
  const modal = document.getElementById('confirm-modal');
  modal.hidden = false;

  const yesBtn = document.getElementById('confirm-yes-btn');
  const noBtn  = document.getElementById('confirm-no-btn');

  // Remove old listeners
  yesBtn.replaceWith(yesBtn.cloneNode(true));
  noBtn.replaceWith(noBtn.cloneNode(true));

  const newYes = document.getElementById('confirm-yes-btn');
  const newNo  = document.getElementById('confirm-no-btn');

  newYes.addEventListener('click', () => {
    modal.hidden = true;
    onConfirm();
  });
  newNo.addEventListener('click', () => { modal.hidden = true; });
  newNo.focus();
}

/* =============================================
   12. CONFETTI ANIMATION
   Uses canvas for performance. Spawns N particles
   that fall and fade over a short duration.
   ============================================= */

function launchConfetti() {
  const canvas  = document.getElementById('confetti-canvas');
  const ctx     = canvas.getContext('2d');
  const wrapper = canvas.parentElement;

  // Resize canvas to parent
  canvas.width  = wrapper.offsetWidth;
  canvas.height = wrapper.offsetHeight;

  const COLORS = [
    '#6366f1', '#22d3ee', '#4ade80',
    '#fbbf24', '#f87171', '#a78bfa',
  ];
  const PARTICLE_COUNT = 80;
  const particles      = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x:     Math.random() * canvas.width,
      y:     Math.random() * -canvas.height * 0.5,
      vx:    (Math.random() - 0.5) * 3,
      vy:    Math.random() * 3 + 2,
      size:  Math.random() * 8 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: Math.random() * 360,
      spin:  (Math.random() - 0.5) * 6,
      alpha: 1,
    });
  }

  let frame;
  let tick = 0;
  const MAX_TICKS = 120;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tick++;

    particles.forEach(p => {
      p.x     += p.vx;
      p.y     += p.vy;
      p.angle += p.spin;
      p.vy    += 0.08; // gravity
      p.alpha  = Math.max(0, 1 - tick / MAX_TICKS);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (tick < MAX_TICKS) {
      frame = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(frame);
    }
  }

  animate();
}

/* =============================================
   13. SOUND EFFECTS (Web Audio API)
   No external files needed — generates tones programmatically.
   ============================================= */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null; // Audio not supported
    }
  }
  return audioCtx;
}

/**
 * Play a simple synthesised tone.
 * @param {number} freq       — frequency in Hz
 * @param {string} type       — oscillator type ('sine'|'square'|'sawtooth'|'triangle')
 * @param {number} volume     — gain 0–1
 * @param {number} duration   — seconds
 */
function playTone(freq, type = 'sine', volume = 0.2, duration = 0.18) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type      = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* Silent fail */ }
}

/** Play a celebratory multi-note sequence on win */
function playWinSound() {
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 'sine', 0.18, 0.25), i * 120);
  });
}

/* =============================================
   14. HERO PARTICLES
   Ambient floating dots in the hero section.
   ============================================= */

function createHeroParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  const COUNT = 18;
  for (let i = 0; i < COUNT; i++) {
    const p   = document.createElement('div');
    const size = Math.random() * 6 + 2;
    const left = Math.random() * 100;
    const delay  = Math.random() * 8;
    const dur    = Math.random() * 10 + 12;

    p.className = 'hero-particle';
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      bottom: -10px;
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
    `;
    container.appendChild(p);
  }
}

/* =============================================
   15. THEME SYSTEM
   ============================================= */

/** Apply the given theme and persist it */
function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  document.getElementById('theme-toggle').querySelector('.theme-icon').textContent =
    theme === 'dark' ? '☀️' : '🌙';
  saveStorage(STORAGE_KEYS.theme, theme);
}

function toggleTheme() {
  const current = document.body.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/* =============================================
   16. LOADING SCREEN
   ============================================= */

function hideLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  document.body.classList.remove('loading');
  screen.classList.add('hidden');
  // Remove from DOM after transition
  setTimeout(() => screen.remove(), 700);
}

/* =============================================
   17. EVENT LISTENERS
   All DOM bindings in one place for clarity.
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ── Loading screen ──────────────────────────
  document.body.classList.add('loading');
  setTimeout(hideLoadingScreen, 1200);

  // ── Theme: restore saved preference ─────────
  const savedTheme = loadStorage(STORAGE_KEYS.theme, 'dark');
  applyTheme(savedTheme);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // ── Hero particles ───────────────────────────
  createHeroParticles();

  // ── Hero Play button → scroll to game ────────
  document.getElementById('hero-play-btn').addEventListener('click', () => {
    document.getElementById('game-section').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => document.getElementById('player-name-input').focus(), 600);
  });

  // ── Restore player name if available ─────────
  const savedName = loadStorage(STORAGE_KEYS.playerName, '');
  if (savedName) document.getElementById('player-name-input').value = savedName;

  // ── Start game ───────────────────────────────
  document.getElementById('start-game-btn').addEventListener('click', initGame);

  // Allow Enter key to start game from name input
  document.getElementById('player-name-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') initGame();
  });

  // ── Submit guess ─────────────────────────────
  document.getElementById('submit-guess-btn').addEventListener('click', submitGuess);

  document.getElementById('guess-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitGuess();
  });

  // ── New game button ───────────────────────────
  document.getElementById('new-game-btn').addEventListener('click', () => {
    if (state.gameActive) {
      showConfirmModal('Abandon the current game?', newGame);
    } else {
      newGame();
    }
  });

  // ── Win modal actions ─────────────────────────
  document.getElementById('modal-play-again-btn').addEventListener('click', () => {
    closeWinModal();
    newGame();
  });
  document.getElementById('modal-close-btn').addEventListener('click', closeWinModal);

  // Close modal on overlay click
  document.getElementById('win-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeWinModal();
  });

  // ── Reset stats ───────────────────────────────
  document.getElementById('reset-stats-btn').addEventListener('click', () => {
    showConfirmModal('Reset all statistics to zero?', resetStats);
  });

  // ── Clear leaderboard ─────────────────────────
  document.getElementById('clear-leaderboard-btn').addEventListener('click', () => {
    showConfirmModal('Clear the entire leaderboard?', () => {
      saveStorage(STORAGE_KEYS.leaderboard, []);
      renderLeaderboard(getCurrentLeaderboardFilter());
    });
  });

  // ── Leaderboard tabs ──────────────────────────
  document.querySelectorAll('.lb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.lb-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      renderLeaderboard(tab.dataset.diff);
    });
  });

  // ── Keyboard shortcut: Enter on name screen ───
  document.addEventListener('keydown', (e) => {
    // Escape closes modals
    if (e.key === 'Escape') {
      if (!document.getElementById('win-modal').hidden) closeWinModal();
      if (!document.getElementById('confirm-modal').hidden) {
        document.getElementById('confirm-modal').hidden = true;
      }
    }
  });

  // ── Initial render ────────────────────────────
  renderStats();
  renderLeaderboard('all');
  updateScoreDisplay();
});

/* =============================================
   18. UI UTILITIES
   ============================================= */

/** Switch from the name-entry screen to the active game screen */
function switchToGameScreen() {
  document.getElementById('name-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  document.getElementById('guess-input').focus();
}

/** Update the attempts counter in the game header */
function updateAttemptsDisplay() {
  document.getElementById('attempts-display').textContent = state.attempts;
}

/** Update the live score display */
function updateScoreDisplay() {
  document.getElementById('current-score').textContent = state.currentScore;
}

/** Populate the game header with current mode / range */
function updateGameScreenMeta() {
  const config = DIFFICULTY_CONFIG[state.difficulty];
  const diffLabel = state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);

  document.getElementById('badge-name-display').textContent    = state.playerName;
  document.getElementById('game-difficulty-label').textContent = diffLabel;
  document.getElementById('game-range-label').textContent      = `${config.min}–${config.max}`;
  document.getElementById('guess-input').min                   = config.min;
  document.getElementById('guess-input').max                   = config.max;
  document.getElementById('guess-input').placeholder          = `${config.min}–${config.max}`;
  document.getElementById('number-orb').textContent           = '?';
  document.getElementById('attempts-display').textContent     = '0';

  // Update stat panel difficulty label
  renderStats();
}

/** Returns the currently active leaderboard filter tab value */
function getCurrentLeaderboardFilter() {
  return document.querySelector('.lb-tab.active')?.dataset.diff || 'all';
}

/** Apply shake animation to an element (invalid input feedback) */
function shakeElement(el) {
  el.classList.remove('shake');
  void el.offsetWidth; // force reflow
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
}

/** Escape HTML to prevent XSS in leaderboard names */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
