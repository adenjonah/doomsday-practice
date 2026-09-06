/* ===========================================================
   Doomsday Speed Games — four isolated sub-drills, one at a time.
   Every game's answer is a single digit 0–6, so the whole thing
   is driven by the 0–6 keys (or the seven on-screen keys).

   All values are taken straight from the main practice method
   (script.js) so the drills teach the same numbers:
     - month values  : Jan 4, Feb 0, Mar 0, Apr 3, May 5, Jun 1,
                        Jul 3, Aug 6, Sep 2, Oct 4, Nov 0, Dec 2
     - century anchor : (5 * (c mod 4) + 2) mod 7, c = floor(year/100)
     - combine        : (day + monthVal + centuryAnchor) mod 7
                        (year term is deliberately left out)
   =========================================================== */

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// month number (1–12) -> doomsday month value
const MONTH_VALUES = {
    1: 4, 2: 0, 3: 0, 4: 3, 5: 5, 6: 1,
    7: 3, 8: 6, 9: 2, 10: 4, 11: 0, 12: 2
};

// centuries covered by the century + combine drills: 1500s–2100s
const CENTURIES = [15, 16, 17, 18, 19, 20, 21];

function mod7(n) {
    return ((n % 7) + 7) % 7;
}

function centuryAnchor(centuryNum) {
    // Gregorian century anchor day. Matches script.js's hardcoded
    // 1600–2100 values and extends cleanly down to the 1500s (=3).
    return mod7(5 * (centuryNum % 4) + 2);
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---- Game definitions -------------------------------------------------
// Each game builds a question: { promptHTML, sub, answer, key }.
// `key` lets us avoid showing the same prompt twice in a row.
const GAMES = {
    mod7: {
        title: 'Mod 7 · 8→40',
        sub: 'N mod 7',
        make() {
            const n = randInt(8, 40);
            return {
                promptHTML: String(n),
                sub: `${n} mod 7`,
                answer: mod7(n),
                key: `n${n}`
            };
        }
    },
    month: {
        title: 'Month Values',
        sub: 'month value',
        make() {
            const m = randInt(1, 12);
            return {
                promptHTML: MONTH_NAMES[m - 1],
                sub: 'month value',
                answer: MONTH_VALUES[m],
                key: `m${m}`
            };
        }
    },
    century: {
        title: 'Century Anchors · 1500–2100',
        sub: 'century anchor',
        make() {
            const c = CENTURIES[randInt(0, CENTURIES.length - 1)];
            return {
                promptHTML: `${c}00s`,
                sub: 'century anchor',
                answer: centuryAnchor(c),
                key: `c${c}`
            };
        }
    },
    combine: {
        title: 'Combine · Day + Month + Century',
        sub: '(day + month + century) mod 7',
        make() {
            const day = randInt(1, 31);
            const m = randInt(1, 12);
            const c = CENTURIES[randInt(0, CENTURIES.length - 1)];
            const answer = mod7(mod7(day) + MONTH_VALUES[m] + centuryAnchor(c));
            const promptHTML =
                `<span class="combine-row">Day ${day}</span>` +
                `<span class="combine-row">${MONTH_NAMES[m - 1]}</span>` +
                `<span class="combine-row">${c}00s</span>`;
            return {
                promptHTML,
                sub: '(day + month + century) mod 7',
                answer,
                key: `${day}-${m}-${c}`
            };
        }
    }
};

const CORRECT_ADVANCE_MS = 260;
const WRONG_ADVANCE_MS = 1200;

class SpeedGames {
    constructor() {
        this.gameId = null;
        this.current = null;      // active question
        this.startTime = null;
        this.locked = false;      // true while feedback is showing
        this.advanceTimer = null;
        this.stats = this.loadStats();

        this.cacheEls();
        this.bindEvents();
        this.showMenu();
    }

    cacheEls() {
        this.menuView = document.getElementById('gameMenu');
        this.playView = document.getElementById('gamePlay');
        this.gameTitle = document.getElementById('gameTitle');
        this.counterEl = document.getElementById('questionCounter');
        this.promptEl = document.getElementById('promptDisplay');
        this.subEl = document.getElementById('promptSub');
        this.feedbackEl = document.getElementById('feedback');
        this.numButtons = Array.from(document.querySelectorAll('.num-btn'));
        this.backBtn = document.getElementById('backToMenuBtn');
        this.resetBtn = document.getElementById('resetStatsBtn');

        this.stat = {
            attempts: document.getElementById('statAttempts'),
            correct: document.getElementById('statCorrect'),
            accuracy: document.getElementById('statAccuracy'),
            streak: document.getElementById('statStreak'),
            fastest: document.getElementById('statFastest'),
            average: document.getElementById('statAverage'),
            last: document.getElementById('statLast')
        };
    }

    bindEvents() {
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => this.startGame(card.dataset.game));
        });
        this.numButtons.forEach(btn => {
            btn.addEventListener('click', () => this.answer(parseInt(btn.dataset.val, 10)));
        });
        this.backBtn.addEventListener('click', () => this.showMenu());
        this.resetBtn.addEventListener('click', () => this.resetStats());
        document.addEventListener('keydown', (e) => this.onKey(e));
    }

    // ---- View switching ------------------------------------------------
    showMenu() {
        this.clearAdvance();
        this.gameId = null;
        this.current = null;
        this.menuView.style.display = 'grid';
        this.playView.style.display = 'none';
    }

    startGame(gameId) {
        if (!GAMES[gameId]) return;
        this.gameId = gameId;
        this.menuView.style.display = 'none';
        this.playView.style.display = 'grid';
        this.gameTitle.textContent = GAMES[gameId].title;
        this.renderStats();
        this.nextQuestion();
    }

    // ---- Question flow -------------------------------------------------
    nextQuestion() {
        this.clearAdvance();
        this.locked = false;

        let q;
        do {
            q = GAMES[this.gameId].make();
        } while (this.current && q.key === this.current.key);
        this.current = q;

        this.promptEl.innerHTML = q.promptHTML;
        this.subEl.textContent = q.sub;
        this.feedbackEl.textContent = '';
        this.feedbackEl.className = 'feedback';

        this.numButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('flash-correct', 'flash-wrong', 'flash-answer');
        });

        this.startTime = performance.now();
    }

    answer(value) {
        if (this.locked || !this.current) return;
        this.locked = true;

        const responseTime = performance.now() - this.startTime;
        const correct = value === this.current.answer;

        this.numButtons.forEach(btn => (btn.disabled = true));

        const s = this.gameStats();
        s.attempts++;
        if (correct) {
            s.correct++;
            s.streak++;
            s.times.push(responseTime);
            this.flash(value, 'flash-correct');
            this.feedbackEl.innerHTML =
                `<div class="result">✓ ${value} &nbsp;(${this.fmt(responseTime)})</div>`;
            this.feedbackEl.className = 'feedback correct';
        } else {
            s.streak = 0;
            this.flash(value, 'flash-wrong');
            this.flash(this.current.answer, 'flash-answer');
            this.feedbackEl.innerHTML =
                `<div class="result">✗ ${value} &nbsp;—&nbsp; answer was ${this.current.answer}</div>`;
            this.feedbackEl.className = 'feedback incorrect';
        }
        s.last = responseTime;

        this.saveStats();
        this.renderStats();

        this.advanceTimer = setTimeout(
            () => this.nextQuestion(),
            correct ? CORRECT_ADVANCE_MS : WRONG_ADVANCE_MS
        );
    }

    flash(value, cls) {
        const btn = this.numButtons.find(b => parseInt(b.dataset.val, 10) === value);
        if (btn) btn.classList.add(cls);
    }

    clearAdvance() {
        if (this.advanceTimer) {
            clearTimeout(this.advanceTimer);
            this.advanceTimer = null;
        }
    }

    // ---- Keyboard ------------------------------------------------------
    onKey(e) {
        if (e.key === 'Escape') {
            this.showMenu();
            return;
        }
        if (!this.gameId) return;
        // 1–6 answer themselves; both 7 and 0 answer 0.
        if (e.key >= '0' && e.key <= '7') {
            e.preventDefault();
            this.answer(e.key === '7' ? 0 : parseInt(e.key, 10));
        }
    }

    // ---- Stats ---------------------------------------------------------
    gameStats() {
        if (!this.stats[this.gameId]) {
            this.stats[this.gameId] = { attempts: 0, correct: 0, streak: 0, last: null, times: [] };
        }
        return this.stats[this.gameId];
    }

    renderStats() {
        const s = this.gameStats();
        const acc = s.attempts > 0 ? ((s.correct / s.attempts) * 100).toFixed(1) + '%' : '0%';
        this.counterEl.textContent = `Attempts: ${s.attempts}`;
        this.stat.attempts.textContent = s.attempts;
        this.stat.correct.textContent = s.correct;
        this.stat.accuracy.textContent = acc;
        this.stat.streak.textContent = s.streak;
        this.stat.last.textContent = s.last != null ? this.fmt(s.last) : '-';

        if (s.times.length > 0) {
            const avg = s.times.reduce((a, b) => a + b, 0) / s.times.length;
            this.stat.fastest.textContent = this.fmt(Math.min(...s.times));
            this.stat.average.textContent = this.fmt(avg);
        } else {
            this.stat.fastest.textContent = '-';
            this.stat.average.textContent = '-';
        }
    }

    resetStats() {
        if (!this.gameId) return;
        this.stats[this.gameId] = { attempts: 0, correct: 0, streak: 0, last: null, times: [] };
        this.saveStats();
        this.renderStats();
    }

    fmt(ms) {
        return `${(ms / 1000).toFixed(1)}s`;
    }

    loadStats() {
        try {
            return JSON.parse(sessionStorage.getItem('doomsdaySpeedStats')) || {};
        } catch {
            return {};
        }
    }

    saveStats() {
        sessionStorage.setItem('doomsdaySpeedStats', JSON.stringify(this.stats));
    }
}

document.addEventListener('DOMContentLoaded', () => new SpeedGames());
