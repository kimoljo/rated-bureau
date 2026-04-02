// ═══════════════════════════════════════════════════════
// BUREAU STAR RATING QUIZ — JAVASCRIPT
// Complete quiz logic with scoring, screen management,
// and result calculation
// ═══════════════════════════════════════════════════════

// ── Quiz Data ──
const QUESTIONS = [
  {
    id: 1,
    text: "When someone in power lies and you can prove it, you:",
    answers: [
      { key: "A", text: "Stay quiet. It's not your problem.", points: 0 },
      { key: "B", text: "Tell a friend, but don't rock the boat.", points: 1 },
      { key: "C", text: "Leak receipts anonymously. Let the truth burn.", points: 2 },
      { key: "D", text: "Walk into their office with the evidence and dare them to deny it.", points: 3 }
    ]
  },
  {
    id: 2,
    text: "A stranger is being publicly humiliated online for something you're not sure they did. You:",
    answers: [
      { key: "A", text: "Scroll past. Not your business.", points: 0 },
      { key: "B", text: "Watch, but don't join in.", points: 1 },
      { key: "C", text: "Dig for the real story before you take a side.", points: 2 },
      { key: "D", text: "Start pulling records. If they're innocent, you'll blow the accuser up.", points: 3 }
    ]
  },
  {
    id: 3,
    text: "Rules are:",
    answers: [
      { key: "A", text: "There to keep everyone safe.", points: 0 },
      { key: "B", text: "There for most people, most of the time.", points: 1 },
      { key: "C", text: "Suggestions you weigh against the fallout.", points: 2 },
      { key: "D", text: "Bars on a cage. You're already looking for the weak points.", points: 3 }
    ]
  },
  {
    id: 4,
    text: "Someone you love is in danger because of a system \"too big to fight.\" You:",
    answers: [
      { key: "A", text: "Accept it. You can't change everything.", points: 0 },
      { key: "B", text: "Look for official appeal routes.", points: 1 },
      { key: "C", text: "Start planning an end-run around the rules.", points: 2 },
      { key: "D", text: "Kick the doors in and worry about consequences later.", points: 3 }
    ]
  },
  {
    id: 5,
    text: "If you could see your star rating, would you want to know?",
    answers: [
      { key: "A", text: "No. It would just stress me out.", points: 0 },
      { key: "B", text: "Maybe, if I could change it.", points: 1 },
      { key: "C", text: "Yes. Information is leverage.", points: 2 },
      { key: "D", text: "Absolutely. Then I'd know exactly what I'm fighting.", points: 3 }
    ]
  }
];

// Result data
const RESULTS = {
  1: {
    stars: "1 STAR",
    label: "QUIET CIVILIAN",
    color: "color-1",
    headline: "★ 1 STAR — QUIET CIVILIAN",
    extra: "The Bureau would like to thank you for your quiet cooperation.",
    secret: "Stay small, stay quiet, and the system may never see you coming."
  },
  3: {
    stars: "3 STARS",
    label: "CONTAINED ASSET",
    color: "color-3",
    headline: "★★★ 3 STARS — CONTAINED ASSET",
    extra: "",
    secret: "You are valuable, but only as long as you stay exactly where we've put you."
  },
  5: {
    stars: "5 STARS",
    label: "ENFORCEMENT-GRADE",
    color: "color-5",
    headline: "★★★★★ 5 STARS — ENFORCEMENT-GRADE",
    extra: "",
    secret: "You were never meant to be safe — you were built to be pointed at a target and released."
  }
};

// ── State Management ──
let userAnswers = {};
let userName = "";
let userEmail = "";
let optedIn = false;

// ── Screen Management ──
// FIX 5: after activating new screen, move focus to its heading (tabindex="-1" set in HTML)
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(screenId);
  screen.classList.add('active');
  window.scrollTo(0, 0);
  // Move focus to the screen's main heading for screen-reader announcement
  const heading = screen.querySelector('.bureau-title');
  if (heading) {
    heading.focus();
  }
}

// ── Age Gate Handler ──
// FIX 9: replaced alert() with inline role="alert" error message
function handleAgeGate() {
  const selected = document.querySelector('input[name="age"]:checked');
  const ageError = document.getElementById('ageError');

  if (!selected) {
    ageError.textContent = 'Please select your age range to continue.';
    ageError.classList.add('visible');
    return;
  }

  // Clear any previous error
  ageError.classList.remove('visible');

  if (selected.value === '18plus') {
    showScreen('landing');
  } else {
    showScreen('under18');
  }
}

// ── Start Quiz ──
function startQuiz() {
  userName = document.getElementById('userName').value.trim();
  userEmail = document.getElementById('userEmail').value.trim();
  optedIn = document.getElementById('optIn').checked;

  let valid = true;

  // Clear all previous errors
  ['userName', 'userEmail'].forEach(id => {
    document.getElementById(id).classList.remove('input-error');
  });
  document.getElementById('optInWrap').classList.remove('opt-in-error');
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('visible'));

  // Name check
  if (!userName) {
    document.getElementById('userName').classList.add('input-error');
    document.getElementById('nameError').classList.add('visible');
    valid = false;
  }

  // Email check — empty
  if (!userEmail) {
    document.getElementById('userEmail').classList.add('input-error');
    document.getElementById('emailError').textContent = 'Please enter your email address.';
    document.getElementById('emailError').classList.add('visible');
    valid = false;

  // Email check — format
  } else if (!userEmail.includes('@') || !userEmail.includes('.') || userEmail.indexOf('@') > userEmail.lastIndexOf('.') - 1) {
    document.getElementById('userEmail').classList.add('input-error');
    document.getElementById('emailError').textContent = 'Please enter a valid email address (e.g. name@example.com).';
    document.getElementById('emailError').classList.add('visible');
    valid = false;
  }

  // Opt-in check
  if (!optedIn) {
    document.getElementById('optInWrap').classList.add('opt-in-error');
    document.getElementById('optInError').classList.add('visible');
    valid = false;
  }

  if (!valid) return;

  // Store user details for MailerLite submission after quiz completes
  window._quizUser = { name: userName, email: userEmail, optedIn };

  renderQuiz();
  showScreen('quiz');
}

// ── One-question-per-screen state ──
let currentQuestionIndex = 0;

// ── Render Quiz Questions ──
function renderQuiz() {
  currentQuestionIndex = 0;
  renderQuestion(0);
}

function renderQuestion(index) {
  const container = document.getElementById('questionsContainer');
  const q = QUESTIONS[index];
  const displayNum = String(index + 1).padStart(2, '0');
  const total = String(QUESTIONS.length).padStart(2, '0');
  const isLast = index === QUESTIONS.length - 1;
  const prevAnswer = userAnswers[q.id] ? userAnswers[q.id].key : null;

  container.innerHTML = `
    <div class="question-block answered-${!!prevAnswer}" id="q${q.id}">
      <div class="question-num">Query ${displayNum} of ${total}</div>
      <div class="question-text">${q.text}</div>
      <div class="answers">
        ${q.answers.map(a => `
          <button
            class="answer-btn${prevAnswer === a.key ? ' selected' : ''}"
            aria-pressed="${prevAnswer === a.key ? 'true' : 'false'}"
            onclick="selectAnswer(event, ${q.id}, '${a.key}', ${a.points})"
          >
            <span class="answer-key">${a.key}.</span>
            <span>${a.text}</span>
          </button>
        `).join('')}
      </div>
    </div>
    <div class="question-nav" style="display:flex; gap:10px; margin-top:4px;">
      ${index > 0 ? `<button class="btn" style="flex:0 0 auto; padding:13px 22px;" onclick="goToPrevQuestion()" aria-label="Back to previous question">← Back</button>` : ''}
      <button
        class="btn btn-primary"
        id="nextBtn"
        style="flex:1; margin-top:0;"
        onclick="${isLast ? 'calculateResult()' : 'goToNextQuestion()'}"
        ${!prevAnswer ? 'disabled' : ''}
      >${isLast ? 'Get My Bureau Star Rating →' : 'Next →'}</button>
    </div>
  `;

  // Hide the old submit button — navigation is now inline per question
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) submitBtn.style.display = 'none';

  updateProgressDots();

  // Focus the question heading for screen readers
  const qNum = container.querySelector('.question-num');
  if (qNum) { qNum.setAttribute('tabindex', '-1'); qNum.focus(); }
}

// ── Select Answer (one-question-per-screen) ──
function selectAnswer(event, questionId, answerKey, points) {
  userAnswers[questionId] = { key: answerKey, points };

  // Update button states in current view
  const block = document.getElementById(`q${questionId}`);
  block.querySelectorAll('.answer-btn').forEach(btn => {
    btn.classList.remove('selected');
    btn.setAttribute('aria-pressed', 'false');
  });
  const clicked = event.target.closest('.answer-btn');
  clicked.classList.add('selected');
  clicked.setAttribute('aria-pressed', 'true');

  // Enable the Next/Submit button
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) nextBtn.disabled = false;

  updateProgressDots();
}

function goToNextQuestion() {
  if (currentQuestionIndex < QUESTIONS.length - 1) {
    currentQuestionIndex++;
    renderQuestion(currentQuestionIndex);
    window.scrollTo(0, 0);
  }
}

function goToPrevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion(currentQuestionIndex);
    window.scrollTo(0, 0);
  }
}

// ── Update Progress Dots ──
// FIX 7: update hidden aria-live region with progress text
function updateProgressDots() {
  const dots = document.querySelectorAll('.dot');
  const answered = Object.keys(userAnswers).length;

  dots.forEach((dot, index) => {
    if (index < answered) {
      dot.classList.add('answered');
    } else {
      dot.classList.remove('answered');
    }
  });

  // FIX 7: announce progress to screen readers
  const progressStatus = document.getElementById('progressStatus');
  if (progressStatus) {
    progressStatus.textContent = `${answered} of ${QUESTIONS.length} questions answered.`;
  }
}

// ── Calculate Result ──
function calculateResult() {
  const totalPoints = Object.values(userAnswers).reduce((sum, answer) => sum + answer.points, 0);

  // Score banding:
  // 0–4  points → 1 star
  // 5–10 points → 3 stars
  // 11–15 points → 5 stars
  let rating;
  if (totalPoints <= 4) {
    rating = 1;
  } else if (totalPoints <= 10) {
    rating = 3;
  } else {
    rating = 5;
  }

  // Submit to MailerLite — fire-and-forget, never blocks result screen
  const quizUser = window._quizUser || {};
  if (quizUser.email) {
    fetch('/.netlify/functions/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: quizUser.name,
        email: quizUser.email,
        rating: rating,
        opted_in: quizUser.optedIn === false ? false : true
      })
    }).catch(function() {
      // Silently ignore — result always shows regardless
    });
  }

  showResult(rating);
}

// ── Toggle Secret Note ──
// FIX 8: update aria-expanded on toggle button
function toggleSecret() {
  const text = document.getElementById('secretText');
  const button = document.querySelector('.secret-toggle');

  if (text.style.display === 'block') {
    text.style.display = 'none';
    button.textContent = '▼ Secret Note from the Bureau — click to reveal';
    button.setAttribute('aria-expanded', 'false');  // FIX 8
  } else {
    text.style.display = 'block';
    button.textContent = '▲ Secret Note from the Bureau — click to hide';
    button.setAttribute('aria-expanded', 'true');   // FIX 8
  }
}

// ── Close Quiz — returns to Bureau HQ ──
function closeQuiz() {
  window.location.href = 'rated-revenge-is-starred-2.html';
}

// ── Initialize ──
// FIX 10: no console.log() statements
document.addEventListener('DOMContentLoaded', function() {
  // Quiz ready
});

// ── Copy Quiz Link (Under-18 Page) ──
function copyQuizLink() {
  const input = document.getElementById('quizLinkInput');
  input.select();
  input.setSelectionRange(0, 99999); // For mobile
  navigator.clipboard.writeText(input.value).then(() => {
    const msg = document.getElementById('linkCopied');
    msg.style.display = 'block';
    setTimeout(() => {
      msg.style.display = 'none';
    }, 3000);
  });
}

// ── Text to Parent (Under-18 Page) ──
function textParent() {
  const message = encodeURIComponent(
    "Can you take this quiz and show me your Bureau Star Rating? I want to see what you get.\n\n" +
    "yoursite.com/bureau-star-rating\n\n" +
    "#RatedRevengeIsStarred"
  );
  // Try native share first (mobile)
  if (navigator.share) {
    navigator.share({
      title: 'Bureau Star Rating Quiz',
      text: "Can you take this quiz and show me your Bureau Star Rating? I want to see what you get.",
      url: 'yoursite.com/bureau-star-rating'
    }).catch(() => {
      // Fallback to SMS
      window.open(`sms:?body=${message}`, '_blank');
    });
  } else {
    // Desktop/older browsers: open SMS
    window.open(`sms:?body=${message}`, '_blank');
  }
}

// ── Global result data ──
let currentRating = 1;
let currentLabel = "";
let selectedAvatar = "";

// ── Show Result ──
function showResult(rating) {
  const result = RESULTS[rating];
  currentRating = rating;
  currentLabel = `${result.stars} — ${result.label}`;
  selectedAvatar = "";

  document.getElementById('resultHeadline').textContent = result.headline;
  document.getElementById('resultHeadline').className = `result-headline ${result.color}`;

  const extraEl = document.getElementById('resultExtra');
  if (result.extra) {
    extraEl.textContent = result.extra;
    extraEl.style.display = 'block';
  } else {
    extraEl.style.display = 'none';
  }

  document.getElementById('secretText').textContent = result.secret;

  // Populate caption placeholders
  document.getElementById('captionLong').textContent = currentLabel;
  document.getElementById('captionShort').textContent = currentLabel;

  // Reset avatar selector
  document.querySelectorAll('.avatar-card').forEach(function(c) {
    c.classList.remove('selected');
    c.setAttribute('aria-pressed', 'false');
    var badge = c.querySelector('.avatar-star-badge');
    if (badge) badge.remove();
  });
  const status = document.getElementById('avatarStatus');
  if (status) status.textContent = 'No file assigned · result still shareable';

  showScreen('result');
}

// ── Select Avatar ──
function selectAvatar(card, code) {
  selectedAvatar = code;

  // Clear all cards: remove selected state and any existing star badges
  document.querySelectorAll('.avatar-card').forEach(function(c) {
    c.classList.remove('selected');
    c.setAttribute('aria-pressed', 'false');
    var existing = c.querySelector('.avatar-star-badge');
    if (existing) existing.remove();
  });

  // Apply selected state to clicked card
  card.classList.add('selected');
  card.setAttribute('aria-pressed', 'true');

  // Inject star badge using '★'.repeat(currentRating)
  var stars = '★'.repeat(currentRating);
  var badge = document.createElement('span');
  badge.className = 'avatar-star-badge';
  badge.setAttribute('aria-hidden', 'true');
  badge.textContent = stars;
  card.insertBefore(badge, card.firstChild);
  // Trigger fade-in on next frame
  requestAnimationFrame(function() { badge.classList.add('visible'); });

  // Update status line
  var status = document.getElementById('avatarStatus');
  if (status) {
    status.textContent = '[' + code + '] · FILE ASSIGNED · CLASSIFICATION: ACTIVE';
  }
}

// ── Toggle Share Captions ──
function toggleShareCaptions() {
  const chooser = document.getElementById('captionChooser');
  chooser.style.display = chooser.style.display === 'none' ? 'block' : 'none';
}

// ── Copy Caption ──
function copyCaption(e, type) {
  let text = "";
  const avatarSuffix = selectedAvatar ? ' · ' + selectedAvatar : '';
  if (type === 'long') {
    text = "The Bureau just filed my Bureau Star Rating. I got " + currentLabel + avatarSuffix + ". I'm officially part of the experiment — want in? Take the quiz and tell me what you get. #RatedRevengeIsStarred";
  } else {
    text = "The Bureau rated me " + currentLabel + avatarSuffix + ". You in? #RatedRevengeIsStarred";
  }

  navigator.clipboard.writeText(text).then(function() {
    document.querySelectorAll('.caption-btn').forEach(function(btn) {
      btn.classList.remove('selected');
    });
    if (e) { // ← guard: only highlight button when called from a real click
      var clickedBtn = e.target.closest('.caption-btn');
      if (clickedBtn) {
        clickedBtn.classList.add('selected');
      }
    }
    showMessage('captionCopied');
  });
}

// ── Share to Social Platforms ──
function shareToX() {
  const text = encodeURIComponent("The Bureau rated me " + currentLabel + ". You in? #RatedRevengeIsStarred\n\nyoursite.com/bureau-star-rating");
  window.open("https://twitter.com/intent/tweet?text=" + text, "_blank");
}

function shareToFacebook() {
  window.open("https://www.facebook.com/sharer/sharer.php?u=yoursite.com/bureau-star-rating", "_blank");
}

function shareToInstagram() {
  copyCaption(null, 'short');
  showMessage('socialCopied');
}

function shareToTikTok() {
  copyCaption(null, 'short');
  showMessage('socialCopied');
}

function shareToLinkedIn() {
  window.open("https://www.linkedin.com/sharing/share-offsite/?url=yoursite.com/bureau-star-rating", "_blank");
}

function shareToPinterest() {
  const desc = encodeURIComponent("The Bureau rated me " + currentLabel + ". Take the quiz!");
  window.open("https://pinterest.com/pin/create/button/?url=yoursite.com/bureau-star-rating&description=" + desc, "_blank");
}

// ── Invite Functions ──
function copyInviteLink() {
  const input = document.getElementById('resultQuizLink');
  input.select();
  navigator.clipboard.writeText(input.value).then(function() {
    showMessage('inviteCopied');
  });
}

function inviteViaText() {
  const msg = encodeURIComponent("I just got my Bureau Star Rating — " + currentLabel + ". What's yours? Take the quiz: yoursite.com/bureau-star-rating #RatedRevengeIsStarred");
  window.open("sms:?body=" + msg, "_blank");
}

function inviteViaWhatsApp() {
  const msg = encodeURIComponent("I just got my Bureau Star Rating — " + currentLabel + ". What's yours? Take the quiz: yoursite.com/bureau-star-rating");
  window.open("https://wa.me/?text=" + msg, "_blank");
}

function inviteViaEmail() {
  const subject = encodeURIComponent("The Bureau just rated me — what's your score?");
  const body = encodeURIComponent("I just got my Bureau Star Rating — " + currentLabel + ". What's yours?\n\nTake the quiz: yoursite.com/bureau-star-rating\n\n#RatedRevengeIsStarred");
  window.open("mailto:?subject=" + subject + "&body=" + body, "_blank");
}

function inviteMore() {
  if (navigator.share) {
    navigator.share({
      title: "Bureau Star Rating Quiz",
      text: "I just got my Bureau Star Rating — " + currentLabel + ". What's yours?",
      url: "yoursite.com/bureau-star-rating"
    });
  } else {
    copyInviteLink();
  }
}

// ── Helper: Show confirmation message ──
function showMessage(id) {
  const msg = document.getElementById(id);
  msg.style.display = 'block';
  setTimeout(function() {
    msg.style.display = 'none';
  }, 3000);
}
