/**
 * SPACE INVADERS — Clássico Arcade 1978
 * Engine nativa HTML5 Canvas & Web Audio API
 * Desenvolvido para 4U.IA.BR
 */

(function () {
    'use strict';

    // ==========================================
    // CONFIGURAÇÕES E CONSTANTES
    // ==========================================
    const CANVAS_WIDTH = 480;
    const CANVAS_HEIGHT = 600;

    // Bitmap dos Sprites Clássicos (1978 Arcade)
    const BITMAPS = {
        // Squid (Top Alien - 8x8)
        squid: [
            [
                '00011000',
                '00111100',
                '01111110',
                '11011011',
                '11111111',
                '00100100',
                '01011010',
                '10100101'
            ],
            [
                '00011000',
                '00111100',
                '01111110',
                '11011011',
                '11111111',
                '01011010',
                '10000001',
                '01000010'
            ]
        ],
        // Crab (Middle Alien - 11x8)
        crab: [
            [
                '00100000100',
                '00010001000',
                '00111111100',
                '01101110110',
                '11111111111',
                '10111111101',
                '10100000101',
                '00011011000'
            ],
            [
                '00100000100',
                '10010001001',
                '10111111101',
                '11101110111',
                '11111111111',
                '00111111100',
                '00100000100',
                '01000000010'
            ]
        ],
        // Octopus (Bottom Alien - 12x8)
        octopus: [
            [
                '000011110000',
                '011111111110',
                '111111111111',
                '111001100111',
                '111111111111',
                '000110011000',
                '001101101100',
                '110000000011'
            ],
            [
                '000011110000',
                '011111111110',
                '111111111111',
                '111001100111',
                '111111111111',
                '001100110000',
                '011011011000',
                '001100110000'
            ]
        ],
        // Player Cannon (13x8)
        player: [
            '0000001000000',
            '0000011100000',
            '0000011100000',
            '0111111111110',
            '1111111111111',
            '1111111111111',
            '1111111111111',
            '1111111111111'
        ],
        // UFO (Flying Saucer - 16x7)
        ufo: [
            '0000011111100000',
            '0001111111111000',
            '0011111111111100',
            '0110110110110110',
            '1111111111111111',
            '0001110001110000',
            '0010000000000100'
        ],
        // Alien Explosion (11x8)
        alienExplosion: [
            '10001010001',
            '01000100010',
            '00100000100',
            '00010001000',
            '00001010000',
            '00010001000',
            '00100100100',
            '01010001010'
        ],
        // Player Explosion (16x8)
        playerExplosion: [
            [
                '0000010001000000',
                '0100001010000100',
                '0010000000001000',
                '0001011110100000',
                '1000110011000010',
                '0101001100101000',
                '0010100001010000',
                '0001000000100000'
            ],
            [
                '0001000000100000',
                '0010100001010000',
                '0101001100101000',
                '1000110011000010',
                '0001011110100000',
                '0010000000001000',
                '0100001010000100',
                '0000010001000000'
            ]
        ],
        // Bunker / Shield (22x16)
        bunker: [
            '00001111111111110000',
            '00111111111111111100',
            '01111111111111111110',
            '11111111111111111111',
            '11111111111111111111',
            '11111111111111111111',
            '11111111111111111111',
            '11111111111111111111',
            '11111111111111111111',
            '11111111111111111111',
            '11111100000000111111',
            '11111000000000011111',
            '11110000000000001111',
            '11110000000000001111',
            '11110000000000001111',
            '11110000000000001111'
        ]
    };

    // Cores clássicas dos Invasores
    const COLORS = {
        squid: '#00ffff',     // Ciano
        crab: '#ffff00',      // Amarelo
        octopus: '#ff66cc',   // Rosa
        player: '#00ff66',    // Verde Arcade
        bunker: '#00ff66',    // Verde Arcade
        ufo: '#ff3344',       // Vermelho
        bullet: '#ffffff',    // Branco
        alienBomb: '#ffffff'  // Branco
    };

    // ==========================================
    // SISTEMA DE ÁUDIO NATIVO (WAV + POOLING)
    // ==========================================
    class SoundEngine {
        constructor() {
            this.muted = localStorage.getItem('space_sound_muted') === 'true';
            this.marchIndex = 0;
            this.sounds = {};
            this.ufoAudio = null;
            this.unlocked = false;

            this.loadSounds();
        }

        loadSounds() {
            const createAudio = (src, loop = false) => {
                const a = new Audio(src);
                a.loop = loop;
                a.preload = 'auto';
                return a;
            };

            // Pool para efeitos rápidos
            this.shootPool = [createAudio('assets/sound/shoot.wav'), createAudio('assets/sound/shoot.wav'), createAudio('assets/sound/shoot.wav')];
            this.shootIndex = 0;

            this.killedPool = [createAudio('assets/sound/invaderkilled.wav'), createAudio('assets/sound/invaderkilled.wav')];
            this.killedIndex = 0;

            this.explosionAudio = createAudio('assets/sound/explosion.wav');
            this.ufoHitAudio = createAudio('assets/sound/ufo_highpitch.wav');

            this.marchSounds = [
                createAudio('assets/sound/fastinvader1.wav'),
                createAudio('assets/sound/fastinvader2.wav'),
                createAudio('assets/sound/fastinvader3.wav'),
                createAudio('assets/sound/fastinvader4.wav')
            ];

            this.ufoAudio = createAudio('assets/sound/ufo_lowpitch.wav', true);
            this.ufoAudio.volume = 0.6;
        }

        unlock() {
            if (this.unlocked) return;
            this.unlocked = true;
            // Desbloqueia áudio no mobile através de um play silencioso
            const test = this.shootPool[0];
            test.volume = 0;
            test.play().then(() => {
                test.pause();
                test.currentTime = 0;
                test.volume = 1;
            }).catch(() => {});
        }

        toggleMute() {
            this.muted = !this.muted;
            localStorage.setItem('space_sound_muted', this.muted);
            if (this.muted && this.ufoAudio) {
                this.ufoAudio.pause();
            }
            return this.muted;
        }

        playShoot() {
            if (this.muted) return;
            const a = this.shootPool[this.shootIndex];
            this.shootIndex = (this.shootIndex + 1) % this.shootPool.length;
            a.currentTime = 0;
            a.play().catch(() => {});
        }

        playInvaderKilled() {
            if (this.muted) return;
            const a = this.killedPool[this.killedIndex];
            this.killedIndex = (this.killedIndex + 1) % this.killedPool.length;
            a.currentTime = 0;
            a.play().catch(() => {});
        }

        playExplosion() {
            if (this.muted) return;
            this.explosionAudio.currentTime = 0;
            this.explosionAudio.play().catch(() => {});
        }

        playMarch() {
            if (this.muted) return;
            const sound = this.marchSounds[this.marchIndex];
            this.marchIndex = (this.marchIndex + 1) % this.marchSounds.length;
            sound.currentTime = 0;
            sound.play().catch(() => {});
        }

        startUfo() {
            if (this.muted) return;
            this.ufoAudio.currentTime = 0;
            this.ufoAudio.play().catch(() => {});
        }

        stopUfo() {
            if (this.ufoAudio) {
                this.ufoAudio.pause();
                this.ufoAudio.currentTime = 0;
            }
        }

        playUfoHit() {
            this.stopUfo();
            if (this.muted) return;
            this.ufoHitAudio.currentTime = 0;
            this.ufoHitAudio.play().catch(() => {});
        }
    }

    // ==========================================
    // RENDERIZADOR DE SPRITES BITMAP
    // ==========================================
    function drawBitmap(ctx, matrix, x, y, pixelSize, color) {
        ctx.fillStyle = color;
        for (let r = 0; r < matrix.length; r++) {
            const row = matrix[r];
            for (let c = 0; c < row.length; c++) {
                if (row[c] === '1') {
                    ctx.fillRect(x + c * pixelSize, y + r * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    }

    // ==========================================
    // CLASSE DE BUNKERS / DEFESAS DESTRUTÍVEIS
    // ==========================================
    class Bunker {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = 44;
            this.height = 32;

            this.canvas = document.createElement('canvas');
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

            this.initGraphic();
        }

        initGraphic() {
            this.ctx.clearRect(0, 0, this.width, this.height);
            drawBitmap(this.ctx, BITMAPS.bunker, 0, 0, 2, COLORS.bunker);
        }

        // Verifica colisão e desgasta a barreira pixel por pixel
        checkHit(bx, by, radius = 5) {
            if (bx >= this.x && bx <= this.x + this.width && by >= this.y && by <= this.y + this.height) {
                const lx = Math.floor(bx - this.x);
                const ly = Math.floor(by - this.y);

                // Checa se acertou um pixel sólido
                const pixel = this.ctx.getImageData(lx, ly, 1, 1).data;
                if (pixel[3] > 50) {
                    // Abre cratera na barreira
                    this.ctx.globalCompositeOperation = 'destination-out';
                    this.ctx.beginPath();
                    this.ctx.arc(lx, ly, radius, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Adiciona pequenos fragmentos irregulares
                    for (let i = 0; i < 4; i++) {
                        const ox = lx + (Math.random() * 8 - 4);
                        const oy = ly + (Math.random() * 8 - 4);
                        this.ctx.beginPath();
                        this.ctx.arc(ox, oy, 2, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                    this.ctx.globalCompositeOperation = 'source-over';
                    return true;
                }
            }
            return false;
        }

        // Quando alien invade e come a barreira
        erodeByAlien(ax, ay, aw, ah) {
            if (ax < this.x + this.width && ax + aw > this.x && ay < this.y + this.height && ay + ah > this.y) {
                const lx = Math.max(0, ax - this.x);
                const ly = Math.max(0, ay - this.y);
                const lw = Math.min(this.width - lx, aw);
                const lh = Math.min(this.height - ly, ah);
                this.ctx.clearRect(lx, ly, lw, lh);
            }
        }

        draw(mainCtx) {
            mainCtx.drawImage(this.canvas, this.x, this.y);
        }
    }

    // ==========================================
    // ENGINE PRINCIPAL DO JOGO
    // ==========================================
    class SpaceInvadersGame {
        constructor() {
            this.canvas = document.getElementById('space-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.audio = new SoundEngine();

            // Elementos DOM
            this.scoreEl = document.getElementById('current-score');
            this.highScoreEl = document.getElementById('high-score');
            this.waveEl = document.getElementById('current-wave');
            this.livesIconsEl = document.getElementById('lives-icons');
            this.soundBtn = document.getElementById('btn-sound');
            this.soundLabel = document.getElementById('sound-label');

            // Estado do Jogo
            this.score = 0;
            this.highScore = parseInt(localStorage.getItem('space_highscore')) || 1000;
            this.wave = 1;
            this.lives = 3;
            this.extraLifeAwarded = false;

            // Fases do Loop
            this.gameState = 'READY'; // READY, PLAYING, PAUSED, PLAYER_DYING, WAVE_CLEARED, GAME_OVER
            this.stateTimer = 0;

            // Jogador
            this.player = {
                x: CANVAS_WIDTH / 2 - 13,
                y: 550,
                width: 26,
                height: 16,
                speed: 4,
                bullet: null
            };

            // Invasores (Frota)
            this.aliens = [];
            this.fleetDir = 1;
            this.fleetStepTimer = 0;
            this.fleetStepDelay = 50;
            this.alienFrame = 0;
            this.alienBombs = [];
            this.alienExplosion = null; // { x, y, timer }

            // Disco Voador (UFO)
            this.ufo = null;
            this.ufoTimer = 0;
            this.ufoScoreText = null; // { text, x, y, timer }

            // Bunkers de Defesa
            this.bunkers = [];

            // Input / Controles
            this.keys = {};
            this.touchMoveLeft = false;
            this.touchMoveRight = false;

            // Background Estrelas
            this.stars = [];
            this.generateStars();

            this.initDOMEvents();
            this.initWave(true);
            this.updateHeaderUI();

            // Inicia Loop do Jogo
            this.lastTime = performance.now();
            requestAnimationFrame((t) => this.gameLoop(t));
        }

        generateStars() {
            this.stars = [];
            for (let i = 0; i < 60; i++) {
                this.stars.push({
                    x: Math.random() * CANVAS_WIDTH,
                    y: Math.random() * CANVAS_HEIGHT,
                    size: Math.random() > 0.8 ? 2 : 1,
                    alpha: 0.3 + Math.random() * 0.7,
                    twinkleSpeed: 0.02 + Math.random() * 0.04
                });
            }
        }

        initWave(resetPlayer = true) {
            if (resetPlayer) {
                this.player.x = CANVAS_WIDTH / 2 - 13;
                this.player.bullet = null;
            }

            this.alienBombs = [];
            this.alienExplosion = null;
            this.ufo = null;
            this.ufoTimer = 0;
            this.ufoScoreText = null;
            this.audio.stopUfo();

            // Cria Bunkers
            this.bunkers = [
                new Bunker(45, 470),
                new Bunker(155, 470),
                new Bunker(265, 470),
                new Bunker(375, 470)
            ];

            // Cria Frota de Aliens (5 Linhas x 11 Colunas = 55 Aliens)
            this.aliens = [];
            const startY = Math.min(90 + (this.wave - 1) * 14, 160);
            const startX = 35;

            for (let row = 0; row < 5; row++) {
                let type, points, width, height, color;
                if (row === 0) {
                    type = 'squid';
                    points = 30;
                    width = 16;
                    height = 16;
                    color = COLORS.squid;
                } else if (row === 1 || row === 2) {
                    type = 'crab';
                    points = 20;
                    width = 22;
                    height = 16;
                    color = COLORS.crab;
                } else {
                    type = 'octopus';
                    points = 10;
                    width = 24;
                    height = 16;
                    color = COLORS.octopus;
                }

                for (let col = 0; col < 11; col++) {
                    this.aliens.push({
                        type,
                        points,
                        width,
                        height,
                        color,
                        x: startX + col * 36,
                        y: startY + row * 28,
                        row,
                        col,
                        alive: true
                    });
                }
            }

            this.fleetDir = 1;
            this.fleetStepDelay = 50;
            this.fleetStepTimer = 0;
            this.alienFrame = 0;
        }

        updateHeaderUI() {
            this.scoreEl.textContent = String(this.score).padStart(4, '0');
            this.highScoreEl.textContent = String(this.highScore).padStart(4, '0');
            this.waveEl.textContent = String(this.wave).padStart(2, '0');

            // Ícones de vida
            this.livesIconsEl.innerHTML = '';
            for (let i = 0; i < Math.max(0, this.lives); i++) {
                const icon = document.createElement('span');
                icon.className = 'lives-icon';
                this.livesIconsEl.appendChild(icon);
            }

            if (this.soundLabel) {
                this.soundLabel.textContent = this.audio.muted ? '🔇 MUDO' : '🔊 SOM';
            }
        }

        initDOMEvents() {
            // Teclado
            window.addEventListener('keydown', (e) => {
                this.audio.unlock();
                if (['ArrowLeft', 'ArrowRight', ' ', 'KeyA', 'KeyD'].includes(e.code)) {
                    e.preventDefault();
                }
                this.keys[e.code] = true;

                if (e.code === 'KeyN') this.startNewGame();
                if (e.code === 'KeyP') this.togglePause();
                if (e.code === 'KeyS' || e.code === 'KeyM') this.toggleSound();
                if (e.code === 'Space') this.fireBullet();
            });

            window.addEventListener('keyup', (e) => {
                this.keys[e.code] = false;
            });

            // Botões de Ação Arcade
            document.getElementById('btn-new-game').addEventListener('click', () => {
                this.audio.unlock();
                this.startNewGame();
            });

            document.getElementById('btn-pause').addEventListener('click', () => {
                this.audio.unlock();
                this.togglePause();
            });

            this.soundBtn.addEventListener('click', () => {
                this.audio.unlock();
                this.toggleSound();
            });

            // Modal de Ajuda
            const modal = document.getElementById('help-modal');
            const overlay = document.getElementById('modal-overlay');
            const openModal = () => {
                this.audio.unlock();
                modal.classList.add('active');
                overlay.classList.add('active');
                if (this.gameState === 'PLAYING') this.togglePause();
            };
            const closeModal = () => {
                modal.classList.remove('active');
                overlay.classList.remove('active');
            };

            document.getElementById('btn-help').addEventListener('click', openModal);
            document.getElementById('close-help-btn').addEventListener('click', closeModal);
            document.getElementById('btn-modal-ok').addEventListener('click', closeModal);
            overlay.addEventListener('click', closeModal);

            // Controles Touch no Celular (Botões)
            const bindTouch = (btnId, onDown, onUp) => {
                const el = document.getElementById(btnId);
                if (!el) return;
                const down = (e) => {
                    if (e.cancelable) e.preventDefault();
                    this.audio.unlock();
                    onDown();
                };
                const up = (e) => {
                    if (e.cancelable) e.preventDefault();
                    onUp();
                };
                el.addEventListener('touchstart', down, { passive: false });
                el.addEventListener('touchend', up, { passive: false });
                el.addEventListener('mousedown', down);
                el.addEventListener('mouseup', up);
                el.addEventListener('mouseleave', up);
            };

            bindTouch('btn-left', () => { this.touchMoveLeft = true; }, () => { this.touchMoveLeft = false; });
            bindTouch('btn-right', () => { this.touchMoveRight = true; }, () => { this.touchMoveRight = false; });
            bindTouch('btn-fire', () => { this.fireBullet(); }, () => {});

            // Toque direto no Canvas (Lado Esquerdo move esq, Lado Direito move dir, Toque duplo dispara)
            this.canvas.addEventListener('touchstart', (e) => {
                if (e.cancelable) e.preventDefault();
                this.audio.unlock();

                if (this.gameState === 'READY' || this.gameState === 'GAME_OVER') {
                    this.startNewGame();
                    return;
                }

                const rect = this.canvas.getBoundingClientRect();
                const touchX = e.touches[0].clientX - rect.left;
                const canvasX = (touchX / rect.width) * CANVAS_WIDTH;

                if (canvasX < CANVAS_WIDTH * 0.45) {
                    this.touchMoveLeft = true;
                    this.touchMoveRight = false;
                } else if (canvasX > CANVAS_WIDTH * 0.55) {
                    this.touchMoveRight = true;
                    this.touchMoveLeft = false;
                } else {
                    this.fireBullet();
                }
            }, { passive: false });

            this.canvas.addEventListener('touchend', (e) => {
                if (e.cancelable) e.preventDefault();
                this.touchMoveLeft = false;
                this.touchMoveRight = false;
            }, { passive: false });
        }

        startNewGame() {
            this.score = 0;
            this.wave = 1;
            this.lives = 3;
            this.extraLifeAwarded = false;
            this.initWave(true);
            this.gameState = 'PLAYING';
            this.updateHeaderUI();
        }

        togglePause() {
            if (this.gameState === 'PLAYING') {
                this.gameState = 'PAUSED';
                this.audio.stopUfo();
            } else if (this.gameState === 'PAUSED') {
                this.gameState = 'PLAYING';
                if (this.ufo) this.audio.startUfo();
            }
        }

        toggleSound() {
            const isMuted = this.audio.toggleMute();
            if (this.soundLabel) {
                this.soundLabel.textContent = isMuted ? '🔇 MUDO' : '🔊 SOM';
            }
        }

        fireBullet() {
            if (this.gameState === 'READY') {
                this.startNewGame();
                return;
            }
            if (this.gameState !== 'PLAYING') return;

            // Clássico do Arcade: Apenas 1 projétil do jogador ativo por vez
            if (!this.player.bullet) {
                this.player.bullet = {
                    x: this.player.x + 12,
                    y: this.player.y - 4,
                    width: 2,
                    height: 8,
                    speed: 9
                };
                this.audio.playShoot();
            }
        }

        // ==========================================
        // UPDATE LOOP
        // ==========================================
        update(dt) {
            // Atualiza brilho das estrelas
            this.stars.forEach(s => {
                s.alpha += s.twinkleSpeed;
                if (s.alpha > 1 || s.alpha < 0.2) s.twinkleSpeed = -s.twinkleSpeed;
            });

            if (this.gameState === 'READY' || this.gameState === 'PAUSED' || this.gameState === 'GAME_OVER') {
                return;
            }

            if (this.gameState === 'PLAYER_DYING') {
                this.stateTimer -= dt;
                if (this.stateTimer <= 0) {
                    if (this.lives > 0) {
                        this.player.x = CANVAS_WIDTH / 2 - 13;
                        this.player.bullet = null;
                        this.gameState = 'PLAYING';
                    } else {
                        this.gameState = 'GAME_OVER';
                        if (this.score > this.highScore) {
                            this.highScore = this.score;
                            localStorage.setItem('space_highscore', this.highScore);
                        }
                    }
                    this.updateHeaderUI();
                }
                return;
            }

            if (this.gameState === 'WAVE_CLEARED') {
                this.stateTimer -= dt;
                if (this.stateTimer <= 0) {
                    this.wave++;
                    this.initWave(true);
                    this.gameState = 'PLAYING';
                    this.updateHeaderUI();
                }
                return;
            }

            // Movimento do Canhão do Jogador
            const moveLeft = this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touchMoveLeft;
            const moveRight = this.keys['ArrowRight'] || this.keys['KeyD'] || this.touchMoveRight;

            if (moveLeft) this.player.x -= this.player.speed;
            if (moveRight) this.player.x += this.player.speed;

            // Limites de tela
            this.player.x = Math.max(15, Math.min(CANVAS_WIDTH - 15 - this.player.width, this.player.x));

            // Atualiza Projétil do Jogador
            if (this.player.bullet) {
                this.player.bullet.y -= this.player.bullet.speed;

                // Saiu da tela
                if (this.player.bullet.y < 30) {
                    this.player.bullet = null;
                } else {
                    this.checkPlayerBulletCollisions();
                }
            }

            // Marcha da Frota de Aliens
            this.updateFleet();

            // Bombas dos Aliens
            this.updateAlienBombs();

            // Disco Voador (UFO)
            this.updateUFO(dt);

            // Explosão de Alien ativa
            if (this.alienExplosion) {
                this.alienExplosion.timer -= dt;
                if (this.alienExplosion.timer <= 0) this.alienExplosion = null;
            }

            // Texto de Score do UFO
            if (this.ufoScoreText) {
                this.ufoScoreText.timer -= dt;
                if (this.ufoScoreText.timer <= 0) this.ufoScoreText = null;
            }
        }

        updateFleet() {
            const aliveAliens = this.aliens.filter(a => a.alive);

            // Vitória da Onda!
            if (aliveAliens.length === 0) {
                this.gameState = 'WAVE_CLEARED';
                this.stateTimer = 1.5;
                this.audio.stopUfo();
                return;
            }

            // Velocidade proporcional: quanto menos invasores, mais veloz e frenética a marcha
            this.fleetStepDelay = Math.max(2, Math.floor((aliveAliens.length / 55) * 44) + 2);

            this.fleetStepTimer++;
            if (this.fleetStepTimer >= this.fleetStepDelay) {
                this.fleetStepTimer = 0;
                this.alienFrame = (this.alienFrame + 1) % 2;
                this.audio.playMarch();

                // Verifica se a frota precisa inverter a direção e descer
                let hitEdge = false;
                const stepX = this.fleetDir * 8;

                for (let a of aliveAliens) {
                    const nextX = a.x + stepX;
                    if (nextX <= 15 || nextX + a.width >= CANVAS_WIDTH - 15) {
                        hitEdge = true;
                        break;
                    }
                }

                if (hitEdge) {
                    this.fleetDir *= -1;
                    for (let a of aliveAliens) {
                        a.y += 14;
                        // Desgasta bunkers se alien colidir fisicamente com eles
                        this.bunkers.forEach(b => b.erodeByAlien(a.x, a.y, a.width, a.height));

                        // Alien encostou na linha de defesa do jogador: INVASÃO TOTAL
                        if (a.y + a.height >= 540) {
                            this.lives = 0;
                            this.gameState = 'GAME_OVER';
                            this.audio.playExplosion();
                            this.audio.stopUfo();
                            if (this.score > this.highScore) {
                                this.highScore = this.score;
                                localStorage.setItem('space_highscore', this.highScore);
                            }
                            this.updateHeaderUI();
                            return;
                        }
                    }
                } else {
                    for (let a of aliveAliens) {
                        a.x += stepX;
                    }
                }
            }
        }

        updateAlienBombs() {
            const aliveAliens = this.aliens.filter(a => a.alive);
            if (aliveAliens.length === 0) return;

            // Frequência de disparo dos aliens
            const maxBombs = Math.min(2 + Math.floor(this.wave / 2), 4);
            if (this.alienBombs.length < maxBombs && Math.random() < 0.035) {
                // Apenas os aliens mais baixos de cada coluna disparam
                const columns = {};
                aliveAliens.forEach(a => {
                    if (!columns[a.col] || columns[a.col].y < a.y) {
                        columns[a.col] = a;
                    }
                });

                const shooters = Object.values(columns);
                const shooter = shooters[Math.floor(Math.random() * shooters.length)];

                if (shooter) {
                    this.alienBombs.push({
                        x: shooter.x + shooter.width / 2,
                        y: shooter.y + shooter.height,
                        width: 3,
                        height: 9,
                        speed: 3.5 + Math.min(this.wave * 0.4, 2.5),
                        frame: 0
                    });
                }
            }

            // Movimenta e colide bombas
            for (let i = this.alienBombs.length - 1; i >= 0; i--) {
                const b = this.alienBombs[i];
                b.y += b.speed;
                b.frame = (b.frame + 0.2) % 2;

                // Colisão com chão
                if (b.y > 585) {
                    this.alienBombs.splice(i, 1);
                    continue;
                }

                // Colisão com Projétil do Jogador (se chocam no ar)
                if (this.player.bullet && Math.abs(b.x - this.player.bullet.x) < 5 && Math.abs(b.y - this.player.bullet.y) < 6) {
                    this.player.bullet = null;
                    this.alienBombs.splice(i, 1);
                    continue;
                }

                // Colisão com Bunkers
                let hitBunker = false;
                for (let bunker of this.bunkers) {
                    if (bunker.checkHit(b.x, b.y + b.height, 4)) {
                        this.alienBombs.splice(i, 1);
                        hitBunker = true;
                        break;
                    }
                }
                if (hitBunker) continue;

                // Colisão com Jogador
                if (b.x >= this.player.x && b.x <= this.player.x + this.player.width &&
                    b.y + b.height >= this.player.y && b.y <= this.player.y + this.player.height) {
                    this.alienBombs.splice(i, 1);
                    this.onPlayerHit();
                    break;
                }
            }
        }

        onPlayerHit() {
            this.lives--;
            this.gameState = 'PLAYER_DYING';
            this.stateTimer = 1.4;
            this.audio.playExplosion();
            this.updateHeaderUI();
        }

        updateUFO(dt) {
            if (!this.ufo) {
                this.ufoTimer += dt;
                // Surge a cada 22-30 segundos
                if (this.ufoTimer > 25) {
                    this.ufoTimer = 0;
                    const fromLeft = Math.random() > 0.5;
                    this.ufo = {
                        x: fromLeft ? -35 : CANVAS_WIDTH + 10,
                        y: 42,
                        width: 32,
                        height: 14,
                        speed: fromLeft ? 2.2 : -2.2
                    };
                    this.audio.startUfo();
                }
            } else {
                this.ufo.x += this.ufo.speed;
                // Saiu da tela
                if ((this.ufo.speed > 0 && this.ufo.x > CANVAS_WIDTH + 20) ||
                    (this.ufo.speed < 0 && this.ufo.x < -40)) {
                    this.ufo = null;
                    this.audio.stopUfo();
                }
            }
        }

        checkPlayerBulletCollisions() {
            const pb = this.player.bullet;
            if (!pb) return;

            // 1. Colisão com UFO
            if (this.ufo && pb.x >= this.ufo.x && pb.x <= this.ufo.x + this.ufo.width &&
                pb.y >= this.ufo.y && pb.y <= this.ufo.y + this.ufo.height) {
                const bonusPoints = [50, 100, 150, 300][Math.floor(Math.random() * 4)];
                this.addScore(bonusPoints);
                this.audio.playUfoHit();

                this.ufoScoreText = {
                    text: String(bonusPoints),
                    x: this.ufo.x + 8,
                    y: this.ufo.y + 10,
                    timer: 1.2
                };
                this.ufo = null;
                this.player.bullet = null;
                return;
            }

            // 2. Colisão com Aliens
            for (let a of this.aliens) {
                if (a.alive && pb.x >= a.x && pb.x <= a.x + a.width &&
                    pb.y >= a.y && pb.y <= a.y + a.height) {
                    a.alive = false;
                    this.addScore(a.points);
                    this.audio.playInvaderKilled();

                    this.alienExplosion = {
                        x: a.x + a.width / 2 - 11,
                        y: a.y,
                        timer: 0.15
                    };
                    this.player.bullet = null;
                    return;
                }
            }

            // 3. Colisão com Bunkers
            for (let bunker of this.bunkers) {
                if (bunker.checkHit(pb.x, pb.y, 4)) {
                    this.player.bullet = null;
                    return;
                }
            }
        }

        addScore(points) {
            this.score += points;
            if (!this.extraLifeAwarded && this.score >= 1500) {
                this.extraLifeAwarded = true;
                this.lives++;
            }
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('space_highscore', this.highScore);
            }
            this.updateHeaderUI();
        }

        // ==========================================
        // RENDER LOOP
        // ==========================================
        render() {
            // Limpa Tela
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Estrelas piscantes
            this.stars.forEach(s => {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
                this.ctx.fillRect(s.x, s.y, s.size, s.size);
            });

            // Linha Verde Inferior do Solo
            this.ctx.fillStyle = COLORS.player;
            this.ctx.fillRect(10, 575, CANVAS_WIDTH - 20, 2);

            // Bunkers
            this.bunkers.forEach(b => b.draw(this.ctx));

            // Invasores (Aliens)
            const frameIdx = this.alienFrame;
            for (let a of this.aliens) {
                if (a.alive) {
                    drawBitmap(this.ctx, BITMAPS[a.type][frameIdx], a.x, a.y, 2, a.color);
                }
            }

            // Explosão de Alien
            if (this.alienExplosion) {
                drawBitmap(this.ctx, BITMAPS.alienExplosion, this.alienExplosion.x, this.alienExplosion.y, 2, '#ffffff');
            }

            // Disco Voador (UFO)
            if (this.ufo) {
                drawBitmap(this.ctx, BITMAPS.ufo, this.ufo.x, this.ufo.y, 2, COLORS.ufo);
            }

            // Texto de Score do UFO
            if (this.ufoScoreText) {
                this.ctx.font = '10px "Press Start 2P", monospace';
                this.ctx.fillStyle = '#ff3344';
                this.ctx.fillText(this.ufoScoreText.text, this.ufoScoreText.x, this.ufoScoreText.y);
            }

            // Projétil do Jogador
            if (this.player.bullet) {
                this.ctx.fillStyle = COLORS.bullet;
                this.ctx.fillRect(this.player.bullet.x, this.player.bullet.y, this.player.bullet.width, this.player.bullet.height);
            }

            // Bombas dos Aliens
            this.ctx.fillStyle = COLORS.alienBomb;
            for (let b of this.alienBombs) {
                // Desenha feixe de bomba zig-zag
                const ox = Math.floor(b.frame) % 2 === 0 ? 1 : -1;
                this.ctx.fillRect(b.x + ox, b.y, 2, 3);
                this.ctx.fillRect(b.x - ox, b.y + 3, 2, 3);
                this.ctx.fillRect(b.x + ox, b.y + 6, 2, 3);
            }

            // Jogador (Canhão ou Explosão)
            if (this.gameState === 'PLAYER_DYING') {
                const expFrame = Math.floor(performance.now() / 100) % 2;
                drawBitmap(this.ctx, BITMAPS.playerExplosion[expFrame], this.player.x - 3, this.player.y, 2, '#ffffff');
            } else if (this.gameState !== 'GAME_OVER') {
                drawBitmap(this.ctx, BITMAPS.player, this.player.x, this.player.y, 2, COLORS.player);
            }

            // Mensagens na Tela (READY, PAUSED, GAME OVER)
            this.ctx.textAlign = 'center';
            if (this.gameState === 'READY') {
                this.ctx.font = '14px "Press Start 2P", monospace';
                this.ctx.fillStyle = '#00ff66';
                this.ctx.fillText('SPACE INVADERS', CANVAS_WIDTH / 2, 280);

                this.ctx.font = '9px "Press Start 2P", monospace';
                this.ctx.fillStyle = '#ffff00';
                const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
                this.ctx.fillText(isTouch ? 'TOQUE P/ INICIAR' : 'PRESSIONE ESPAÇO', CANVAS_WIDTH / 2, 320);

                this.ctx.font = '8px "Press Start 2P", monospace';
                this.ctx.fillStyle = '#00ffff';
                this.ctx.fillText('*4U.IA.BR ARCADE 1978*', CANVAS_WIDTH / 2, 360);
            } else if (this.gameState === 'PAUSED') {
                this.ctx.font = '16px "Press Start 2P", monospace';
                this.ctx.fillStyle = '#ffff00';
                this.ctx.fillText('PAUSADO', CANVAS_WIDTH / 2, 300);
            } else if (this.gameState === 'GAME_OVER') {
                this.ctx.font = '16px "Press Start 2P", monospace';
                this.ctx.fillStyle = '#ff3344';
                this.ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, 290);

                this.ctx.font = '9px "Press Start 2P", monospace';
                this.ctx.fillStyle = '#ffffff';
                const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
                this.ctx.fillText(isTouch ? 'TOQUE P/ REJOGAR' : 'PRESSIONE N', CANVAS_WIDTH / 2, 330);
            } else if (this.gameState === 'WAVE_CLEARED') {
                this.ctx.font = '14px "Press Start 2P", monospace';
                this.ctx.fillStyle = '#00ff66';
                this.ctx.fillText(`WAVE ${this.wave} CONCLUÍDA!`, CANVAS_WIDTH / 2, 300);
            }
            this.ctx.textAlign = 'start';
        }

        gameLoop(currentTime) {
            const dt = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;

            this.update(dt);
            this.render();

            requestAnimationFrame((t) => this.gameLoop(t));
        }
    }

    // Inicialização ao carregar o DOM
    document.addEventListener('DOMContentLoaded', () => {
        window.SpaceInvaders = new SpaceInvadersGame();
    });
})();
