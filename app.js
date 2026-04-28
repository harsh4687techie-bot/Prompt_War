/* ====================================================
   VOTEGUIDE AI — Application Logic
   ==================================================== */

// ==================== GLOBE RENDERER ====================
class DotGlobe {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dots = [];
    this.arcs = [];
    this.rotation = 0;
    this.targetRotation = 0;
    this.autoRotate = true;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.dpr = window.devicePixelRatio || 1;
    this.radius = 0;
    this.centerX = 0;
    this.centerY = 0;
    this.animationId = null;
    this.isVisible = true;

    this.generateDots();
    this.generateArcs();
    this.setupInteraction();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.render();
  }

  generateDots() {
    const count = 900;
    // Fibonacci sphere distribution
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < count; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      this.dots.push({
        theta,
        phi,
        x: 0, y: 0, z: 0,
        baseSize: 1.2 + Math.random() * 0.6,
        pulse: Math.random() < 0.03, // 3% are pulsing hotspots
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  generateArcs() {
    // Create a few arc connections (like flight paths)
    const arcPairs = [
      [50, 300], [120, 600], [200, 750], [400, 800], [10, 500],
      [350, 700], [150, 450], [550, 850]
    ];
    for (const [a, b] of arcPairs) {
      if (a < this.dots.length && b < this.dots.length) {
        this.arcs.push({ from: a, to: b, progress: Math.random() });
      }
    }
  }

  setupInteraction() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.autoRotate = false;
    });
    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      this.targetRotation += dx * 0.005;
      this.lastMouseX = e.clientX;
    });
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      setTimeout(() => { this.autoRotate = true; }, 2000);
    });

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.touches[0].clientX;
      this.autoRotate = false;
    }, { passive: true });
    this.canvas.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      const dx = e.touches[0].clientX - this.lastMouseX;
      this.targetRotation += dx * 0.005;
      this.lastMouseX = e.touches[0].clientX;
    }, { passive: true });
    this.canvas.addEventListener('touchend', () => {
      this.isDragging = false;
      setTimeout(() => { this.autoRotate = true; }, 2000);
    });
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const size = Math.min(rect.width, 480);
    this.canvas.width = size * this.dpr;
    this.canvas.height = size * this.dpr;
    this.canvas.style.width = size + 'px';
    this.canvas.style.height = size + 'px';
    this.ctx.scale(this.dpr, this.dpr);
    this.centerX = size / 2;
    this.centerY = size / 2;
    this.radius = size * 0.38;
  }

  projectDot(dot, rotY) {
    const sinPhi = Math.sin(dot.phi);
    const cosPhi = Math.cos(dot.phi);
    const sinTheta = Math.sin(dot.theta + rotY);
    const cosTheta = Math.cos(dot.theta + rotY);

    const x = sinPhi * cosTheta;
    const y = cosPhi;
    const z = sinPhi * sinTheta;

    return {
      x: this.centerX + x * this.radius,
      y: this.centerY - y * this.radius,
      z,
      screenX: this.centerX + x * this.radius,
      screenY: this.centerY - y * this.radius,
    };
  }

  render() {
    if (document.body.classList.contains('reduced-motion')) {
      // Still render one frame but don't animate
      this.renderFrame();
      return;
    }

    this.animationId = requestAnimationFrame(() => this.render());
    this.renderFrame();
  }

  renderFrame() {
    const ctx = this.ctx;
    const w = this.canvas.width / this.dpr;
    const h = this.canvas.height / this.dpr;
    ctx.clearRect(0, 0, w, h);

    // Auto rotation
    if (this.autoRotate) {
      this.targetRotation += 0.003;
    }
    this.rotation += (this.targetRotation - this.rotation) * 0.08;

    const time = Date.now() * 0.001;

    // Draw globe outline glow
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(79, 140, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Sort dots by z for depth rendering
    const projected = this.dots.map((dot, i) => ({
      ...this.projectDot(dot, this.rotation),
      dot,
      index: i,
    }));
    projected.sort((a, b) => a.z - b.z);

    // Draw arcs (behind dots)
    for (const arc of this.arcs) {
      const fromP = this.projectDot(this.dots[arc.from], this.rotation);
      const toP = this.projectDot(this.dots[arc.to], this.rotation);
      if (fromP.z > -0.2 && toP.z > -0.2) {
        const midX = (fromP.screenX + toP.screenX) / 2;
        const midY = (fromP.screenY + toP.screenY) / 2 - 30;
        const alpha = Math.min(fromP.z, toP.z) * 0.3;
        if (alpha > 0.02) {
          ctx.beginPath();
          ctx.moveTo(fromP.screenX, fromP.screenY);
          ctx.quadraticCurveTo(midX, midY, toP.screenX, toP.screenY);
          ctx.strokeStyle = `rgba(79, 140, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw dots
    for (const p of projected) {
      if (p.z < -0.1) continue; // behind sphere
      
      const alpha = 0.15 + p.z * 0.65;
      const size = p.dot.baseSize * (0.5 + p.z * 0.6);

      if (p.dot.pulse) {
        // Pulsing hotspot
        const pulseScale = 1 + Math.sin(time * 2 + p.dot.pulsePhase) * 0.5;
        const glowSize = size * 3 * pulseScale;
        
        // Glow
        const gg = ctx.createRadialGradient(
          p.screenX, p.screenY, 0,
          p.screenX, p.screenY, glowSize
        );
        gg.addColorStop(0, `rgba(251, 191, 36, ${alpha * 0.5})`);
        gg.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = gg;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, size * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 140, 255, ${alpha})`;
        ctx.fill();
      }
    }

    // Inner glow
    const ig = ctx.createRadialGradient(
      this.centerX - this.radius * 0.3,
      this.centerY - this.radius * 0.3,
      0,
      this.centerX,
      this.centerY,
      this.radius
    );
    ig.addColorStop(0, 'rgba(79, 140, 255, 0.03)');
    ig.addColorStop(0.7, 'rgba(79, 140, 255, 0.01)');
    ig.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = ig;
    ctx.fill();
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
}


// ==================== CHAT ASSISTANT ====================
class ChatAssistant {
  constructor() {
    this.state = 'welcome';
    this.userData = this.loadProgress();
    this.messagesEl = document.getElementById('chat-messages');
    this.quickRepliesEl = document.getElementById('chat-quick-replies');
    this.inputEl = document.getElementById('chat-input');
    this.isTyping = false;
    this.messageQueue = [];
    this.journeyStep = this.userData.journeyStep || 1;

    this.states = this.buildStates();
    
    // Bind enter key
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage();
      }
    });
  }

  buildStates() {
    return {
      welcome: {
        messages: [
          "👋 Welcome to VoteGuide AI! I'm your personal election assistant.",
          "I'll help you navigate the entire voting process — from registration to results.",
          "Let's start by getting to know you. How old are you?"
        ],
        inputType: 'text',
        inputPlaceholder: 'Enter your age...',
        process: (input) => {
          const age = parseInt(input);
          if (isNaN(age) || age < 1 || age > 150) {
            return { next: 'invalid_age' };
          }
          this.userData.age = age;
          if (age < 18) {
            return { next: 'underage' };
          }
          return { next: 'ask_location' };
        }
      },

      invalid_age: {
        messages: ["Hmm, that doesn't seem right. Please enter a valid age (a number between 1 and 150)."],
        inputType: 'text',
        inputPlaceholder: 'Enter your age...',
        process: (input) => {
          const age = parseInt(input);
          if (isNaN(age) || age < 1 || age > 150) {
            return { next: 'invalid_age' };
          }
          this.userData.age = age;
          if (age < 18) return { next: 'underage' };
          return { next: 'ask_location' };
        }
      },

      underage: {
        messages: [
          `You're currently not yet eligible to vote. The minimum voting age is 18.`,
          `But it's wonderful that you're interested in the democratic process! 🌟`,
          `You'll be eligible in ${18 - (this.userData?.age || 17)} year(s). Here's what you can do now:`,
        ],
        options: [
          { label: '📚 Learn about the process', value: 'learn_process' },
          { label: '⏰ Remind me when I turn 18', value: 'remind_18' },
          { label: '🔄 Start over', value: 'restart' },
        ]
      },

      learn_process: {
        messages: [
          "Great choice! Understanding the process early gives you a head start. Here's an overview:",
        ],
        richContent: {
          type: 'steps',
          steps: [
            'Register to vote when you turn 18 (or pre-register at 16-17 in some states)',
            'Verify your identity with valid documents',
            'Find your polling station or request a mail-in ballot',
            'Cast your vote on Election Day (or during early voting)',
            'Follow the results as they come in',
          ]
        },
        followUp: [
          "Each state has different rules, so it's good to research your specific state's requirements."
        ],
        options: [
          { label: '⏰ Set a reminder', value: 'remind_18' },
          { label: '🔄 Start over', value: 'restart' },
        ]
      },

      remind_18: {
        messages: [
          "Let's set a reminder for when you turn 18! 📅",
          "I'll create a Google Calendar event for you.",
        ],
        action: 'calendar_18',
        options: [
          { label: '📚 Learn about the process', value: 'learn_process' },
          { label: '🔄 Start over', value: 'restart' },
        ]
      },

      ask_location: {
        messages: [
          `At ${this.userData?.age || 18}, you're eligible to vote! 🎉`,
          "Which state are you in? This helps me provide accurate information.",
        ],
        inputType: 'text',
        inputPlaceholder: 'Enter your state (e.g., California)...',
        process: (input) => {
          this.userData.location = input.trim();
          return { next: 'ask_registered' };
        }
      },

      ask_registered: {
        messages: [
          `Thanks! Let me tailor the experience for ${this.userData?.location || 'your area'}.`,
          "Are you currently registered to vote?"
        ],
        options: [
          { label: '✅ Yes, I\'m registered', value: 'registered' },
          { label: '❌ No, not yet', value: 'not_registered' },
          { label: '🤔 I\'m not sure', value: 'check_registration' },
        ]
      },

      not_registered: {
        messages: [
          "No worries! Let's get you registered. It's easier than you think! 📋",
          `Here's how to register to vote in ${this.userData?.location || 'your state'}:`,
        ],
        richContent: {
          type: 'steps',
          steps: [
            'Visit your state\'s voter registration website or vote.gov',
            'Prepare your documents: State ID or driver\'s license, Social Security number',
            'Fill out the registration form with your name, address, and date of birth',
            'Submit your application online, by mail, or in person',
            'You\'ll receive a confirmation — save it for your records!',
          ]
        },
        followUp: [
          "Registration deadlines vary by state, so don't wait too long!"
        ],
        links: [
          { text: '🌐 Go to Vote.gov', url: 'https://vote.gov' },
        ],
        options: [
          { label: '📍 Find registration office', value: 'find_registration_office' },
          { label: '📅 Set registration deadline reminder', value: 'set_reg_reminder' },
          { label: '✅ I just registered!', value: 'just_registered' },
          { label: '🔄 Start over', value: 'restart' },
        ],
        onEnter: () => { this.setJourneyStep(1); }
      },

      check_registration: {
        messages: [
          "No problem! You can easily check your registration status online. 🔍",
          "Visit your state's Secretary of State website or use the National Voter Registration portal."
        ],
        links: [
          { text: '🔍 Check at Vote.gov', url: 'https://vote.gov' },
        ],
        options: [
          { label: '✅ I\'m registered!', value: 'registered' },
          { label: '❌ I need to register', value: 'not_registered' },
        ]
      },

      find_registration_office: {
        messages: [
          `Let me help you find a registration office near ${this.userData?.location || 'you'}! 📍`,
          "I'll open Google Maps to show nearby election offices.",
        ],
        action: 'maps_registration',
        options: [
          { label: '📅 Set deadline reminder', value: 'set_reg_reminder' },
          { label: '⬅️ Back to registration steps', value: 'not_registered' },
        ]
      },

      set_reg_reminder: {
        messages: [
          "Smart move! 📅 Let me create a calendar reminder for the registration deadline.",
          "I'll set it for 30 days before the typical deadline to give you plenty of time.",
        ],
        action: 'calendar_registration',
        options: [
          { label: '📋 Review registration steps', value: 'not_registered' },
          { label: '✅ I just registered!', value: 'just_registered' },
        ]
      },

      just_registered: {
        messages: [
          "Congratulations on registering! 🎊 You're one step closer to making your voice heard.",
          "Now let's make sure you're verified and ready for Election Day."
        ],
        options: [
          { label: '➡️ Next: Verification', value: 'verification' },
        ],
        onEnter: () => { this.setJourneyStep(2); }
      },

      registered: {
        messages: [
          "Awesome! You're already registered. 🎉 Let's make sure you're fully prepared.",
          "What would you like help with next?"
        ],
        options: [
          { label: '✅ Verify my registration', value: 'verification' },
          { label: '🗳️ Prepare to vote', value: 'voting_prep' },
          { label: '📍 Find my polling station', value: 'find_polling' },
          { label: '📅 Set Election Day reminder', value: 'set_election_reminder' },
        ],
        onEnter: () => { this.setJourneyStep(2); }
      },

      verification: {
        messages: [
          "Let's verify your voter registration! ✅",
          "Here's what you need to confirm:",
        ],
        richContent: {
          type: 'steps',
          steps: [
            'Your name is correctly spelled as it appears on your ID',
            'Your current address is up to date',
            'Your party affiliation (if applicable) is correct',
            'You have a valid photo ID that matches your registration',
          ]
        },
        followUp: [
          "If anything needs updating, contact your local election office well before Election Day."
        ],
        options: [
          { label: '✅ Everything looks good!', value: 'voting_prep' },
          { label: '🔄 Need to update info', value: 'update_info' },
          { label: '📍 Find election office', value: 'find_polling' },
        ],
        onEnter: () => { this.setJourneyStep(2); }
      },

      update_info: {
        messages: [
          "You can update your voter registration online or at your local election office.",
          `For ${this.userData?.location || 'your state'}, visit your Secretary of State's website.`,
          "Make sure to update well before any registration deadlines!"
        ],
        links: [
          { text: '🌐 Update at Vote.gov', url: 'https://vote.gov' },
        ],
        options: [
          { label: '✅ Updated! Next step', value: 'voting_prep' },
          { label: '📍 Find election office', value: 'find_polling' },
        ]
      },

      voting_prep: {
        messages: [
          "You're almost there! Let's prepare for voting day. 🗳️",
          "Here's your Election Day checklist:",
        ],
        richContent: {
          type: 'steps',
          steps: [
            'Bring a valid photo ID (driver\'s license, passport, or state ID)',
            'Know your polling station location and hours',
            'Review the candidates and ballot measures beforehand',
            'Bring proof of address if required in your state',
            'Allow enough time — lines can be long!',
          ]
        },
        options: [
          { label: '📍 Find my polling station', value: 'find_polling' },
          { label: '📅 Set Election Day reminder', value: 'set_election_reminder' },
          { label: '📊 What about results?', value: 'results_info' },
        ],
        onEnter: () => { this.setJourneyStep(3); }
      },

      find_polling: {
        messages: [
          `Let me find polling stations near ${this.userData?.location || 'you'}! 📍`,
          "I'll open Google Maps to show nearby polling locations."
        ],
        action: 'maps_polling',
        options: [
          { label: '📅 Set voting reminder', value: 'set_election_reminder' },
          { label: '🗳️ Voting checklist', value: 'voting_prep' },
          { label: '📊 Results info', value: 'results_info' },
        ],
        onEnter: () => { this.setJourneyStep(3); }
      },

      set_election_reminder: {
        messages: [
          "I'll set up an Election Day reminder for you! 📅",
          "You'll get a notification so you never miss your chance to vote."
        ],
        action: 'calendar_election',
        options: [
          { label: '📍 Find polling station', value: 'find_polling' },
          { label: '🗳️ Voting checklist', value: 'voting_prep' },
          { label: '📊 Results info', value: 'results_info' },
        ]
      },

      results_info: {
        messages: [
          "After you vote, you can track results in real-time! 📊",
          "Here's what to expect:",
        ],
        richContent: {
          type: 'steps',
          steps: [
            'Polls close at different times across time zones',
            'Early results come in from eastern states first',
            'Mail-in ballots may take days to fully count',
            'Official results are certified weeks after Election Day',
            'Your state\'s Secretary of State website has official results',
          ]
        },
        followUp: [
          "Remember: every vote counts, and patience is key while results are being tallied! 🇺🇸"
        ],
        options: [
          { label: '🔄 Start over', value: 'restart' },
          { label: '🗳️ Review voting checklist', value: 'voting_prep' },
        ],
        onEnter: () => { this.setJourneyStep(4); }
      },

      restart: {
        messages: ["Let's start fresh! 🔄"],
        process: () => {
          this.userData = {};
          this.saveProgress();
          return { next: 'welcome' };
        },
        autoProcess: true,
      }
    };
  }

  async start() {
    // Rebuild states with fresh user data
    this.states = this.buildStates();
    await this.enterState('welcome');
  }

  async enterState(stateName) {
    this.state = stateName;
    const state = this.states[stateName];
    if (!state) return;

    // Rebuild states to get fresh data interpolation
    this.states = this.buildStates();
    const freshState = this.states[stateName];

    // Run onEnter
    if (freshState.onEnter) freshState.onEnter();

    // Clear quick replies
    this.setQuickReplies([]);

    // Send messages with typing delay
    for (const msg of freshState.messages) {
      await this.showTyping(600 + msg.length * 15);
      this.addBotMessage(msg);
    }

    // Rich content
    if (freshState.richContent) {
      await this.showTyping(400);
      this.addRichContent(freshState.richContent);
    }

    // Follow up messages
    if (freshState.followUp) {
      for (const msg of freshState.followUp) {
        await this.showTyping(400);
        this.addBotMessage(msg);
      }
    }

    // Links
    if (freshState.links) {
      await this.showTyping(300);
      this.addLinks(freshState.links);
    }

    // Actions
    if (freshState.action) {
      this.executeAction(freshState.action);
    }

    // Auto process (for restart etc.)
    if (freshState.autoProcess && freshState.process) {
      const result = freshState.process();
      if (result?.next) {
        await this.delay(500);
        await this.enterState(result.next);
        return;
      }
    }

    // Set quick replies
    if (freshState.options) {
      this.setQuickReplies(freshState.options);
    }

    // Configure input
    if (freshState.inputType === 'text') {
      this.inputEl.placeholder = freshState.inputPlaceholder || 'Type your message...';
      this.inputEl.disabled = false;
      this.inputEl.focus();
    } else if (freshState.options) {
      this.inputEl.placeholder = 'Choose an option above or type...';
      this.inputEl.disabled = false;
    }

    this.saveProgress();
    updateJourneyUI(this.journeyStep);
  }

  async handleInput(input) {
    if (this.isTyping || !input.trim()) return;

    const trimmed = input.trim();
    this.addUserMessage(trimmed);

    const state = this.states[this.state];
    if (!state) return;

    // Check if input matches an option
    if (state.options) {
      const match = state.options.find(
        o => o.value === trimmed || o.label.toLowerCase().includes(trimmed.toLowerCase())
      );
      if (match) {
        await this.enterState(match.value);
        return;
      }
    }

    // Process text input
    if (state.process) {
      const result = state.process(trimmed);
      if (result?.next) {
        await this.enterState(result.next);
        return;
      }
    }

    // Fallback
    await this.showTyping(500);
    this.addBotMessage("I didn't quite understand that. Could you try again or choose one of the options?");
    if (state.options) {
      this.setQuickReplies(state.options);
    }
  }

  handleQuickReply(value) {
    this.addUserMessage(
      this.states[this.state]?.options?.find(o => o.value === value)?.label || value
    );
    this.enterState(value);
  }

  addBotMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'message bot';
    msg.innerHTML = `
      <div class="message-bubble">${text}</div>
      <div class="message-time">${this.formatTime()}</div>
    `;
    this.messagesEl.appendChild(msg);
    this.scrollToBottom();
  }

  addUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'message user';
    msg.innerHTML = `
      <div class="message-bubble">${this.escapeHtml(text)}</div>
      <div class="message-time">${this.formatTime()}</div>
    `;
    this.messagesEl.appendChild(msg);
    this.scrollToBottom();
  }

  addRichContent(content) {
    const msg = document.createElement('div');
    msg.className = 'message bot';

    if (content.type === 'steps') {
      const stepsHtml = content.steps.map((step, i) => `
        <div class="message-step">
          <span class="message-step-num">${i + 1}</span>
          <span>${step}</span>
        </div>
      `).join('');

      msg.innerHTML = `
        <div class="message-bubble">
          <div class="message-steps">${stepsHtml}</div>
        </div>
      `;
    }

    this.messagesEl.appendChild(msg);
    this.scrollToBottom();
  }

  addLinks(links) {
    const msg = document.createElement('div');
    msg.className = 'message bot';
    const linksHtml = links.map(l =>
      `<a href="${l.url}" target="_blank" rel="noopener" class="message-link">${l.text} ↗</a>`
    ).join('');
    msg.innerHTML = `<div class="message-bubble">${linksHtml}</div>`;
    this.messagesEl.appendChild(msg);
    this.scrollToBottom();
  }

  setQuickReplies(options) {
    this.quickRepliesEl.innerHTML = '';
    for (const opt of options) {
      const btn = document.createElement('button');
      btn.className = 'quick-reply-btn';
      btn.textContent = opt.label;
      btn.onclick = () => this.handleQuickReply(opt.value);
      this.quickRepliesEl.appendChild(btn);
    }
  }

  async showTyping(duration = 800) {
    this.isTyping = true;
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;
    this.messagesEl.appendChild(indicator);
    this.scrollToBottom();

    await this.delay(duration);

    indicator.remove();
    this.isTyping = false;
  }

  executeAction(action) {
    const location = this.userData.location || '';
    
    switch (action) {
      case 'maps_polling': {
        const query = encodeURIComponent(`polling stations near ${location}`);
        const url = `https://www.google.com/maps/search/${query}`;
        this.addActionButton('📍 Open Google Maps', url);
        break;
      }
      case 'maps_registration': {
        const query = encodeURIComponent(`voter registration office near ${location}`);
        const url = `https://www.google.com/maps/search/${query}`;
        this.addActionButton('📍 Open Google Maps', url);
        break;
      }
      case 'calendar_election': {
        const url = this.createCalendarUrl(
          'Election Day — Time to Vote! 🗳️',
          'Remember to vote today! Check your polling station and bring your ID.',
          '20261103T070000',
          '20261103T200000'
        );
        this.addActionButton('📅 Add to Google Calendar', url);
        break;
      }
      case 'calendar_registration': {
        const url = this.createCalendarUrl(
          'Voter Registration Deadline Reminder 📋',
          'Make sure your voter registration is complete before the deadline!',
          '20261004T090000',
          '20261004T100000'
        );
        this.addActionButton('📅 Add to Google Calendar', url);
        break;
      }
      case 'calendar_18': {
        const url = this.createCalendarUrl(
          '🎂 You can now register to vote!',
          'Happy 18th birthday! You are now eligible to register to vote. Visit vote.gov to get started.',
          '20271101T090000',
          '20271101T100000'
        );
        this.addActionButton('📅 Add Birthday Reminder', url);
        break;
      }
    }
  }

  addActionButton(text, url) {
    const msg = document.createElement('div');
    msg.className = 'message bot';
    msg.innerHTML = `
      <div class="message-bubble">
        <a href="${url}" target="_blank" rel="noopener" class="message-link">${text} ↗</a>
      </div>
    `;
    this.messagesEl.appendChild(msg);
    this.scrollToBottom();
  }

  createCalendarUrl(title, details, startDate, endDate) {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      details: details,
      dates: `${startDate}/${endDate}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  setJourneyStep(step) {
    this.journeyStep = step;
    this.userData.journeyStep = step;
    this.saveProgress();
  }

  // Persistence (localStorage, can be swapped for Firebase)
  saveProgress() {
    try {
      localStorage.setItem('voteguide_progress', JSON.stringify(this.userData));
      localStorage.setItem('voteguide_journey_step', this.journeyStep.toString());
    } catch (e) { /* Storage not available */ }
  }

  loadProgress() {
    try {
      const data = localStorage.getItem('voteguide_progress');
      const step = localStorage.getItem('voteguide_journey_step');
      if (step) this.journeyStep = parseInt(step);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  scrollToBottom() {
    requestAnimationFrame(() => {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    });
  }

  formatTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}


// ==================== BACKGROUND PARTICLES ====================
class Particles {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
    this.container.appendChild(this.canvas);
    this.particles = [];
    this.dpr = window.devicePixelRatio || 1;
    this.resize();
    this.createParticles();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth * this.dpr;
    this.canvas.height = window.innerHeight * this.dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.scale(this.dpr, this.dpr);
  }

  createParticles() {
    const count = Math.min(50, Math.floor(window.innerWidth / 30));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.05,
      });
    }
  }

  animate() {
    if (document.body.classList.contains('reduced-motion')) {
      return;
    }
    requestAnimationFrame(() => this.animate());
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.ctx.clearRect(0, 0, w, h);

    for (const p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(79, 140, 255, ${p.opacity})`;
      this.ctx.fill();
    }

    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(79, 140, 255, ${0.06 * (1 - dist / 120)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
  }
}


// ==================== SCROLL ANIMATIONS ====================
class ScrollAnimator {
  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      this.observer.observe(el);
    });
  }
}


// ==================== STAT COUNTER ====================
class StatCounter {
  constructor() {
    this.animated = false;
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animated) {
            this.animated = true;
            this.animateAll();
          }
        });
      },
      { threshold: 0.5 }
    );

    const statsContainer = document.querySelector('.hero-stats');
    if (statsContainer) this.observer.observe(statsContainer);
  }

  animateAll() {
    document.querySelectorAll('.stat').forEach(stat => {
      const target = parseInt(stat.dataset.target);
      const numEl = stat.querySelector('.stat-number');
      this.countUp(numEl, 0, target, 1500);
    });
  }

  countUp(el, start, end, duration) {
    const startTime = performance.now();
    const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = Math.round(start + (end - start) * easedProgress);
      el.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }
}


// ==================== JOURNEY UI ====================
function updateJourneyUI(currentStep) {
  const steps = document.querySelectorAll('.step-card');
  const progress = document.getElementById('journey-progress');

  steps.forEach((card, index) => {
    const stepNum = index + 1;
    card.classList.remove('active', 'completed');

    if (stepNum < currentStep) {
      card.classList.add('completed');
      const status = card.querySelector('.step-status span:last-child');
      if (status) status.textContent = 'Completed';
    } else if (stepNum === currentStep) {
      card.classList.add('active');
      const status = card.querySelector('.step-status span:last-child');
      if (status) status.textContent = 'Current';
    } else {
      const status = card.querySelector('.step-status span:last-child');
      if (status) status.textContent = 'Upcoming';
    }
  });

  if (progress) {
    const percent = ((currentStep - 1) / 3) * 100;
    progress.style.width = percent + '%';
  }
}


// ==================== NAVIGATION ====================
function setupNavigation() {
  const nav = document.getElementById('main-nav');
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('nav-links');

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // Mobile menu
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      const isOpen = navLinks.classList.contains('mobile-open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}


// ==================== ACCESSIBILITY ====================
function setupAccessibility() {
  // Reduced motion toggle
  const motionToggle = document.getElementById('motion-toggle');
  const isReduced = localStorage.getItem('voteguide_reduced_motion') === 'true';

  if (isReduced) {
    document.body.classList.add('reduced-motion');
  }

  if (motionToggle) {
    motionToggle.addEventListener('click', toggleReducedMotion);
  }

  // Step cards keyboard support
  document.querySelectorAll('.step-card').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
    card.addEventListener('click', () => {
      const step = parseInt(card.dataset.step);
      openChat();
      // Navigate to relevant state
      const stateMap = {
        1: 'not_registered',
        2: 'verification',
        3: 'voting_prep',
        4: 'results_info'
      };
      if (chatAssistant && stateMap[step]) {
        setTimeout(() => chatAssistant.enterState(stateMap[step]), 600);
      }
    });
  });
}

function toggleReducedMotion() {
  document.body.classList.toggle('reduced-motion');
  const isReduced = document.body.classList.contains('reduced-motion');
  localStorage.setItem('voteguide_reduced_motion', isReduced);

  // Restart globe if motion enabled
  if (!isReduced && globe) {
    globe.render();
  }
}


// ==================== CHAT CONTROLS ====================
let chatAssistant = null;
let chatInitialized = false;

function toggleChat() {
  const widget = document.getElementById('chat-widget');
  const toggle = document.getElementById('chat-toggle');
  const badge = document.getElementById('chat-badge');
  const panel = document.getElementById('chat-panel');

  if (widget.classList.contains('chat-closed')) {
    widget.classList.remove('chat-closed');
    widget.classList.add('chat-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close election guide chat');
    badge.classList.add('hidden');

    if (!chatInitialized) {
      chatInitialized = true;
      chatAssistant = new ChatAssistant();
      chatAssistant.start();
    }

    // Focus the input
    setTimeout(() => {
      document.getElementById('chat-input')?.focus();
    }, 400);
  } else {
    widget.classList.remove('chat-open');
    widget.classList.add('chat-closed');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open election guide chat');
  }
}

function openChat() {
  const widget = document.getElementById('chat-widget');
  if (widget.classList.contains('chat-closed')) {
    toggleChat();
  }
}

function sendUserMessage() {
  const input = document.getElementById('chat-input');
  const value = input.value.trim();
  if (!value || !chatAssistant) return;
  input.value = '';
  chatAssistant.handleInput(value);
}

function resetChat() {
  if (!chatAssistant) return;
  const messagesEl = document.getElementById('chat-messages');
  messagesEl.innerHTML = '';
  chatAssistant.userData = {};
  chatAssistant.journeyStep = 1;
  chatAssistant.saveProgress();
  chatAssistant.states = chatAssistant.buildStates();
  chatAssistant.enterState('welcome');
  updateJourneyUI(1);
}

// Close chat with Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const widget = document.getElementById('chat-widget');
    if (widget.classList.contains('chat-open')) {
      toggleChat();
    }
  }
});


// ==================== INITIALIZE ====================
let globe = null;

document.addEventListener('DOMContentLoaded', () => {
  // Globe
  const globeCanvas = document.getElementById('globe-canvas');
  if (globeCanvas) {
    globe = new DotGlobe(globeCanvas);
  }

  // Background particles
  const particlesContainer = document.getElementById('hero-particles');
  if (particlesContainer) {
    new Particles(particlesContainer);
  }

  // Navigation
  setupNavigation();

  // Scroll animations
  new ScrollAnimator();

  // Stat counter
  new StatCounter();

  // Accessibility
  setupAccessibility();

  // Journey UI
  const savedStep = parseInt(localStorage.getItem('voteguide_journey_step') || '1');
  updateJourneyUI(savedStep);

  // Theme color for mobile
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = '#060b18';
});
