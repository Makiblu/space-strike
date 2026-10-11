// SPACE STRIKE - Audio System
// Complete audio management with Web Audio API generated sounds

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.music = {};
        this.currentMusic = null;
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.masterVolume = 0.7;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.initialized = false;
        
        // Music control for smooth transitions
        this.musicGainNode = null;
        this.menuMusicTimeout = null;
        this.gameMusicTimeout = null;
        this.isFading = false;
        
        console.log('🔊 AudioManager created');
    }
    
    // Initialize audio context (requires user interaction)
    async initialize() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain node for music volume control
            this.musicGainNode = this.audioContext.createGain();
            this.musicGainNode.connect(this.audioContext.destination);
            this.musicGainNode.gain.setValueAtTime(1.0, this.audioContext.currentTime);
            
            console.log('✅ Audio Context initialized');
            this.initialized = true;
            
            // Generate all sound effects
            this.generateSounds();
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize audio:', error);
            return false;
        }
    }
    
    // Generate all sound effects using Web Audio API
    generateSounds() {
        console.log('🎵 Generating sound effects...');
        // Sounds are generated on-demand for better performance
    }
    
    // Play a sound effect
    play(soundName, volumeMultiplier = 1.0) {
        if (!this.initialized || !this.soundEnabled) return;
        
        try {
            const volume = this.masterVolume * this.sfxVolume * volumeMultiplier;
            
            switch(soundName) {
                case 'laser':
                    this.playLaser(volume);
                    break;
                case 'explosion':
                    this.playExplosion(volume);
                    break;
                case 'explosionBig':
                    this.playExplosionBig(volume);
                    break;
                case 'hit':
                    this.playHit(volume);
                    break;
                case 'shield':
                    this.playShield(volume);
                    break;
                case 'missile':
                    this.playMissile(volume);
                    break;
                case 'powerup':
                    this.playPowerup(volume);
                    break;
                case 'buttonClick':
                    this.playButtonClick(volume);
                    break;
                case 'buttonHover':
                    this.playButtonHover(volume);
                    break;
                case 'select':
                    this.playSelect(volume);
                    break;
                case 'coin':
                    this.playCoin(volume);
                    break;
                case 'error':
                    this.playError(volume);
                    break;
                case 'success':
                    this.playSuccess(volume);
                    break;
                case 'bossSpawn':
                    this.playBossSpawn(volume);
                    break;
                case 'bossLaser':
                    this.playBossLaser(volume);
                    break;
                default:
                    console.warn('Unknown sound:', soundName);
            }
        } catch (error) {
            console.error('Error playing sound:', soundName, error);
        }
    }
    
    // Individual sound generators
    
    playLaser(volume) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        
        gain.gain.setValueAtTime(volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    playExplosion(volume) {
        const now = this.audioContext.currentTime;
        const duration = 0.5;
        
        // White noise
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + duration);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        
        noise.start(now);
    }
    
    playExplosionBig(volume) {
        // Bigger explosion for bosses
        this.playExplosion(volume * 1.5);
        
        // Add low rumble
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.8);
        
        gain.gain.setValueAtTime(volume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start(now);
        osc.stop(now + 0.8);
    }
    
    playHit(volume) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
        
        gain.gain.setValueAtTime(volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }
    
    playShield(volume) {
        const now = this.audioContext.currentTime;
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(400, now);
        osc1.frequency.exponentialRampToValueAtTime(800, now + 0.3);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(600, now);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
        
        gain.gain.setValueAtTime(volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.3);
        osc2.stop(now + 0.3);
    }
    
    playMissile(volume) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
        
        gain.gain.setValueAtTime(volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start(now);
        osc.stop(now + 0.4);
    }
    
    playPowerup(volume) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
        
        gain.gain.setValueAtTime(volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }
    
    playButtonClick(volume) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        
        gain.gain.setValueAtTime(volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start(now);
        osc.stop(now + 0.05);
    }
    
    playButtonHover(volume) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        
        gain.gain.setValueAtTime(volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start(now);
        osc.stop(now + 0.03);
    }
    
    playSelect(volume) {
        const now = this.audioContext.currentTime;
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(600, now);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(800, now + 0.05);
        
        gain.gain.setValueAtTime(volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc1.start(now);
        osc2.start(now + 0.05);
        osc1.stop(now + 0.05);
        osc2.stop(now + 0.15);
    }
    
    playCoin(volume) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.setValueAtTime(1200, now + 0.05);
        
        gain.gain.setValueAtTime(volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    playError(volume) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        
        gain.gain.setValueAtTime(volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    playSuccess(volume) {
        const now = this.audioContext.currentTime;
        const frequencies = [523, 659, 784]; // C, E, G chord
        
        frequencies.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            
            gain.gain.setValueAtTime(volume * 0.2, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.start(now + i * 0.05);
            osc.stop(now + 0.3);
        });
    }
    
    playBossSpawn(volume) {
        // Epic boss entrance sound - deep rumble + rising siren
        const now = this.audioContext.currentTime;
        const duration = 2.5;
        
        // Deep rumbling bass
        const rumble = this.audioContext.createOscillator();
        const rumbleGain = this.audioContext.createGain();
        rumble.type = 'sine';
        rumble.frequency.setValueAtTime(40, now);
        rumble.frequency.exponentialRampToValueAtTime(30, now + duration);
        
        rumbleGain.gain.setValueAtTime(volume * 0.8, now);
        rumbleGain.gain.setValueAtTime(volume * 0.8, now + duration * 0.7);
        rumbleGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        rumble.connect(rumbleGain);
        rumbleGain.connect(this.audioContext.destination);
        rumble.start(now);
        rumble.stop(now + duration);
        
        // Rising siren (warning)
        const siren = this.audioContext.createOscillator();
        const sirenGain = this.audioContext.createGain();
        const sirenFilter = this.audioContext.createBiquadFilter();
        
        siren.type = 'sawtooth';
        siren.frequency.setValueAtTime(200, now);
        siren.frequency.exponentialRampToValueAtTime(800, now + duration);
        
        sirenFilter.type = 'bandpass';
        sirenFilter.frequency.setValueAtTime(400, now);
        sirenFilter.frequency.exponentialRampToValueAtTime(1200, now + duration);
        sirenFilter.Q.setValueAtTime(3, now);
        
        sirenGain.gain.setValueAtTime(0, now);
        sirenGain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.3);
        sirenGain.gain.setValueAtTime(volume * 0.5, now + duration * 0.8);
        sirenGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        siren.connect(sirenFilter);
        sirenFilter.connect(sirenGain);
        sirenGain.connect(this.audioContext.destination);
        siren.start(now);
        siren.stop(now + duration);
        
        // Impact hit at the end
        setTimeout(() => {
            const impact = this.audioContext.createOscillator();
            const impactGain = this.audioContext.createGain();
            
            impact.type = 'sine';
            impact.frequency.setValueAtTime(80, now + duration - 0.2);
            impact.frequency.exponentialRampToValueAtTime(40, now + duration);
            
            impactGain.gain.setValueAtTime(volume * 0.9, now + duration - 0.2);
            impactGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            impact.connect(impactGain);
            impactGain.connect(this.audioContext.destination);
            
            impact.start(now + duration - 0.2);
            impact.stop(now + duration);
        }, 0);
    }
    
    playBossLaser(volume) {
        // Powerful boss laser - deeper and more menacing than player laser
        const now = this.audioContext.currentTime;
        const duration = 0.4;
        
        // Main laser beam (thick and powerful)
        const laser1 = this.audioContext.createOscillator();
        const laser1Gain = this.audioContext.createGain();
        const laser1Filter = this.audioContext.createBiquadFilter();
        
        laser1.type = 'sawtooth';
        laser1.frequency.setValueAtTime(150, now);
        laser1.frequency.exponentialRampToValueAtTime(80, now + duration);
        
        laser1Filter.type = 'lowpass';
        laser1Filter.frequency.setValueAtTime(800, now);
        laser1Filter.frequency.exponentialRampToValueAtTime(200, now + duration);
        laser1Filter.Q.setValueAtTime(5, now);
        
        laser1Gain.gain.setValueAtTime(volume * 0.6, now);
        laser1Gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        laser1.connect(laser1Filter);
        laser1Filter.connect(laser1Gain);
        laser1Gain.connect(this.audioContext.destination);
        laser1.start(now);
        laser1.stop(now + duration);
        
        // Secondary harmonic (adds depth)
        const laser2 = this.audioContext.createOscillator();
        const laser2Gain = this.audioContext.createGain();
        
        laser2.type = 'square';
        laser2.frequency.setValueAtTime(300, now);
        laser2.frequency.exponentialRampToValueAtTime(150, now + duration);
        
        laser2Gain.gain.setValueAtTime(volume * 0.3, now);
        laser2Gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        laser2.connect(laser2Gain);
        laser2Gain.connect(this.audioContext.destination);
        laser2.start(now);
        laser2.stop(now + duration);
        
        // Deep sub-bass punch
        const bass = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();
        
        bass.type = 'sine';
        bass.frequency.setValueAtTime(60, now);
        
        bassGain.gain.setValueAtTime(volume * 0.7, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        bass.connect(bassGain);
        bassGain.connect(this.audioContext.destination);
        bass.start(now);
        bass.stop(now + 0.15);
    }
    
    // Background music with Web Audio API - WITH SMOOTH TRANSITIONS
    startMenuMusic() {
        if (!this.initialized || !this.musicEnabled) return;
        
        // If already playing menu music, don't restart
        if (this.currentMusic === 'menu' && !this.isFading) return;
        
        console.log('🎵 Transitioning to menu music...');
        this.fadeToMusic('menu');
    }
    
    startGameMusic() {
        if (!this.initialized || !this.musicEnabled) return;
        
        // If already playing game music, don't restart
        if (this.currentMusic === 'game' && !this.isFading) return;
        
        console.log('🎵 Transitioning to battle music...');
        this.fadeToMusic('game');
    }
    
    fadeToMusic(targetMusic) {
        if (this.isFading) return; // Prevent multiple simultaneous fades
        
        const now = this.audioContext.currentTime;
        const fadeOutDuration = 1.5; // 1.5 second fade out
        const fadeInDuration = 1.5; // 1.5 second fade in
        const silenceDuration = 0.3; // Brief silence between tracks
        
        // If music is currently playing, fade it out
        if (this.currentMusic && this.musicGainNode) {
            this.isFading = true;
            
            // Fade out current music
            this.musicGainNode.gain.cancelScheduledValues(now);
            this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, now);
            this.musicGainNode.gain.linearRampToValueAtTime(0.0, now + fadeOutDuration);
            
            // Clear any existing music timeouts
            if (this.menuMusicTimeout) {
                clearTimeout(this.menuMusicTimeout);
                this.menuMusicTimeout = null;
            }
            if (this.gameMusicTimeout) {
                clearTimeout(this.gameMusicTimeout);
                this.gameMusicTimeout = null;
            }
            
            // Stop old music and start new music after fade out
            setTimeout(() => {
                this.currentMusic = null;
                this.startNewMusic(targetMusic, fadeInDuration);
            }, (fadeOutDuration + silenceDuration) * 1000);
            
        } else {
            // No music playing, start immediately with fade in
            this.startNewMusic(targetMusic, fadeInDuration);
        }
    }
    
    startNewMusic(musicType, fadeInDuration) {
        if (!this.musicEnabled) return;
        
        const now = this.audioContext.currentTime;
        this.currentMusic = musicType;
        this.isFading = true;
        
        // Reset gain to 0 and fade in
        this.musicGainNode.gain.cancelScheduledValues(now);
        this.musicGainNode.gain.setValueAtTime(0.0, now);
        this.musicGainNode.gain.linearRampToValueAtTime(1.0, now + fadeInDuration);
        
        // Start the appropriate music
        if (musicType === 'menu') {
            this.playAmbientMusic();
        } else if (musicType === 'game') {
            this.playBattleMusic();
        }
        
        // Mark fading as complete after fade in
        setTimeout(() => {
            this.isFading = false;
            console.log('✅ Music transition complete:', musicType);
        }, fadeInDuration * 1000);
    }
    
    stopMusic() {
        if (!this.musicGainNode) return;
        
        const now = this.audioContext.currentTime;
        const fadeOutDuration = 1.0;
        
        // Fade out smoothly
        this.musicGainNode.gain.cancelScheduledValues(now);
        this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, now);
        this.musicGainNode.gain.linearRampToValueAtTime(0.0, now + fadeOutDuration);
        
        // Clear timeouts
        if (this.menuMusicTimeout) {
            clearTimeout(this.menuMusicTimeout);
            this.menuMusicTimeout = null;
        }
        if (this.gameMusicTimeout) {
            clearTimeout(this.gameMusicTimeout);
            this.gameMusicTimeout = null;
        }
        
        // Mark as stopped after fade
        setTimeout(() => {
            this.currentMusic = null;
            this.isFading = false;
        }, fadeOutDuration * 1000);
    }
    
    playAmbientMusic() {
        // GALACTIC ARCADE MENU MUSIC - Melodic, exciting, with changing notes
        const now = this.audioContext.currentTime;
        const volume = this.masterVolume * this.musicVolume * 0.28;
        const bpm = 130; // Energetic arcade tempo
        const beatDuration = 60 / bpm;
        const loopDuration = beatDuration * 32; // 32-beat loop (about 14.8 seconds)
        
        // LAYER 1: MELODIC LEAD SYNTH (Main catchy melody)
        this.playArcadeMelody(now, volume, beatDuration);
        
        // LAYER 2: BOUNCY BASS LINE (Rhythmic foundation)
        this.playArcadeBass(now, volume, beatDuration);
        
        // LAYER 3: ARPEGGIATED SYNTH (Sparkling electronic texture)
        this.playArcadeArpeggio(now, volume, beatDuration);
        
        // LAYER 4: LIGHT PERCUSSION (Electronic drums)
        this.playArcadePercussion(now, volume, beatDuration);
        
        // Auto-restart for seamless loop
        this.menuMusicTimeout = setTimeout(() => {
            if (this.currentMusic === 'menu') {
                this.playAmbientMusic();
            }
        }, loopDuration * 1000);
    }
    
    playArcadeMelody(startTime, volume, beat) {
        // Catchy lead melody in C minor scale
        // Musical phrase: Rising adventure theme with variation
        const melodyNotes = [
            // Bar 1-2: Opening phrase (mysterious)
            {freq: 523.25, time: 0, duration: beat * 2},      // C5
            {freq: 587.33, time: beat * 2, duration: beat},   // D5
            {freq: 659.25, time: beat * 3, duration: beat},   // E5
            {freq: 698.46, time: beat * 4, duration: beat * 2}, // F5
            {freq: 783.99, time: beat * 6, duration: beat * 2}, // G5
            
            // Bar 3-4: Response phrase (adventurous)
            {freq: 880.00, time: beat * 8, duration: beat * 1.5},  // A5
            {freq: 783.99, time: beat * 9.5, duration: beat * 0.5}, // G5
            {freq: 698.46, time: beat * 10, duration: beat},   // F5
            {freq: 659.25, time: beat * 11, duration: beat},   // E5
            {freq: 587.33, time: beat * 12, duration: beat * 2}, // D5
            {freq: 523.25, time: beat * 14, duration: beat * 2}, // C5
            
            // Bar 5-6: Build-up (exciting)
            {freq: 659.25, time: beat * 16, duration: beat},   // E5
            {freq: 698.46, time: beat * 17, duration: beat},   // F5
            {freq: 783.99, time: beat * 18, duration: beat},   // G5
            {freq: 880.00, time: beat * 19, duration: beat},   // A5
            {freq: 987.77, time: beat * 20, duration: beat * 2}, // B5
            {freq: 1046.5, time: beat * 22, duration: beat * 2}, // C6 (high)
            
            // Bar 7-8: Resolution (heroic)
            {freq: 783.99, time: beat * 24, duration: beat * 1.5}, // G5
            {freq: 698.46, time: beat * 25.5, duration: beat * 0.5}, // F5
            {freq: 659.25, time: beat * 26, duration: beat},   // E5
            {freq: 587.33, time: beat * 27, duration: beat},   // D5
            {freq: 523.25, time: beat * 28, duration: beat * 4}  // C5 (ending)
        ];
        
        melodyNotes.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'triangle'; // Warm synth lead
            osc.frequency.setValueAtTime(note.freq, startTime + note.time);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, startTime + note.time);
            filter.Q.setValueAtTime(2, startTime + note.time);
            
            // Envelope: Attack - Sustain - Release
            const noteStart = startTime + note.time;
            const noteEnd = noteStart + note.duration;
            const attack = 0.02;
            const release = 0.1;
            
            gain.gain.setValueAtTime(0, noteStart);
            gain.gain.linearRampToValueAtTime(volume * 0.8, noteStart + attack);
            gain.gain.setValueAtTime(volume * 0.7, noteEnd - release);
            gain.gain.linearRampToValueAtTime(0.001, noteEnd);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGainNode); // Connect to master music gain for smooth fades
            
            osc.start(noteStart);
            osc.stop(noteEnd);
        });
    }
    
    playArcadeBass(startTime, volume, beat) {
        // Bouncy bass pattern in C minor
        const bassPattern = [
            // Rhythmic bass line (on-beat and off-beat for groove)
            {freq: 130.81, time: 0, duration: beat * 0.8},      // C3
            {freq: 130.81, time: beat * 2, duration: beat * 0.8}, // C3
            {freq: 196.00, time: beat * 4, duration: beat * 0.8}, // G3
            {freq: 196.00, time: beat * 6, duration: beat * 0.8}, // G3
            
            {freq: 146.83, time: beat * 8, duration: beat * 0.8},  // D3
            {freq: 146.83, time: beat * 10, duration: beat * 0.8}, // D3
            {freq: 174.61, time: beat * 12, duration: beat * 0.8}, // F3
            {freq: 174.61, time: beat * 14, duration: beat * 0.8}, // F3
            
            {freq: 164.81, time: beat * 16, duration: beat * 0.8}, // E3
            {freq: 164.81, time: beat * 18, duration: beat * 0.8}, // E3
            {freq: 196.00, time: beat * 20, duration: beat * 0.8}, // G3
            {freq: 196.00, time: beat * 22, duration: beat * 0.8}, // G3
            
            {freq: 130.81, time: beat * 24, duration: beat * 0.8}, // C3
            {freq: 146.83, time: beat * 26, duration: beat * 0.8}, // D3
            {freq: 164.81, time: beat * 28, duration: beat * 0.8}, // E3
            {freq: 130.81, time: beat * 30, duration: beat * 1.8}  // C3 (ending)
        ];
        
        bassPattern.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.freq, startTime + note.time);
            
            // Punchy bass envelope
            const noteStart = startTime + note.time;
            const noteEnd = noteStart + note.duration;
            
            gain.gain.setValueAtTime(volume * 1.0, noteStart);
            gain.gain.exponentialRampToValueAtTime(volume * 0.3, noteStart + 0.05);
            gain.gain.setValueAtTime(volume * 0.3, noteEnd - 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);
            
            osc.connect(gain);
            gain.connect(this.musicGainNode); // Connect to master music gain
            
            osc.start(noteStart);
            osc.stop(noteEnd);
        });
    }
    
    playArcadeArpeggio(startTime, volume, beat) {
        // Fast sparkling arpeggio pattern (16th notes)
        const sixteenthNote = beat / 4;
        const arpPattern = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord
        
        // Play arpeggio throughout the loop with variations
        for (let bar = 0; bar < 8; bar++) {
            for (let note = 0; note < 16; note++) {
                const time = startTime + (bar * beat * 4) + (note * sixteenthNote);
                const freq = arpPattern[note % 4];
                
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                osc.type = 'sine'; // Bright, clean sparkle
                osc.frequency.setValueAtTime(freq, time);
                
                filter.type = 'highpass';
                filter.frequency.setValueAtTime(800, time);
                
                // Short, plucky envelope
                gain.gain.setValueAtTime(volume * 0.25, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + sixteenthNote * 0.8);
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.musicGainNode); // Connect to master music gain
                
                osc.start(time);
                osc.stop(time + sixteenthNote);
            }
        }
    }
    
    playArcadePercussion(startTime, volume, beat) {
        // Electronic kick drum (on beats 1 and 3)
        for (let bar = 0; bar < 8; bar++) {
            [0, 2].forEach(beatNum => {
                const time = startTime + (bar * beat * 4) + (beatNum * beat);
                
                const kick = this.audioContext.createOscillator();
                const kickGain = this.audioContext.createGain();
                
                kick.type = 'sine';
                kick.frequency.setValueAtTime(150, time);
                kick.frequency.exponentialRampToValueAtTime(40, time + 0.05);
                
                kickGain.gain.setValueAtTime(volume * 1.2, time);
                kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
                
                kick.connect(kickGain);
                kickGain.connect(this.musicGainNode); // Connect to master music gain
                
                kick.start(time);
                kick.stop(time + 0.15);
            });
        }
        
        // Hi-hat (8th notes for rhythm)
        for (let bar = 0; bar < 8; bar++) {
            for (let eighth = 0; eighth < 8; eighth++) {
                const time = startTime + (bar * beat * 4) + (eighth * beat * 0.5);
                
                // Create short noise burst for hi-hat
                const bufferSize = this.audioContext.sampleRate * 0.05;
                const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
                const data = buffer.getChannelData(0);
                
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
                }
                
                const noise = this.audioContext.createBufferSource();
                noise.buffer = buffer;
                
                const hihatGain = this.audioContext.createGain();
                const hihatFilter = this.audioContext.createBiquadFilter();
                
                hihatFilter.type = 'highpass';
                hihatFilter.frequency.setValueAtTime(8000, time);
                
                // Accent on off-beats
                const accentVolume = (eighth % 2 === 1) ? volume * 0.15 : volume * 0.08;
                hihatGain.gain.setValueAtTime(accentVolume, time);
                hihatGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
                
                noise.connect(hihatFilter);
                hihatFilter.connect(hihatGain);
                hihatGain.connect(this.musicGainNode); // Connect to master music gain
                
                noise.start(time);
            }
        }
    }
    
    playBattleMusic() {
        // Intense galactic battle theme with pulsing rhythm
        const now = this.audioContext.currentTime;
        const volume = this.masterVolume * this.musicVolume * 0.5;
        const duration = 10; // 10-second loop
        
        // Layer 1: PULSING BASS (rhythmic foundation with envelope)
        const bass = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();
        
        bass.type = 'triangle';
        bass.frequency.setValueAtTime(55, now); // A1
        
        // Create pulsing rhythm (not constant)
        for (let i = 0; i < 20; i++) {
            const time = now + (i * 0.5);
            bassGain.gain.setValueAtTime(volume * 0.7, time);
            bassGain.gain.exponentialRampToValueAtTime(volume * 0.15, time + 0.2);
            bassGain.gain.setValueAtTime(volume * 0.7, time + 0.25);
        }
        bassGain.gain.setValueAtTime(0.001, now + duration);
        
        bass.connect(bassGain);
        bassGain.connect(this.musicGainNode);
        bass.start(now);
        bass.stop(now + duration);
        
        // Layer 2: MELODIC LEAD (changing notes)
        const lead = this.audioContext.createOscillator();
        const leadGain = this.audioContext.createGain();
        const leadFilter = this.audioContext.createBiquadFilter();
        
        lead.type = 'sawtooth';
        leadFilter.type = 'lowpass';
        leadFilter.frequency.setValueAtTime(2000, now);
        leadFilter.Q.setValueAtTime(5, now);
        
        // MOVING MELODY PATTERN
        const melody = [220, 330, 370, 294, 220, 330, 370, 440]; // A, E, F#, D progression
        melody.forEach((freq, i) => {
            const time = now + (i * 1.25);
            lead.frequency.setValueAtTime(freq, time);
            
            // Note envelope
            leadGain.gain.setValueAtTime(0, time);
            leadGain.gain.linearRampToValueAtTime(volume * 0.6, time + 0.05);
            leadGain.gain.setValueAtTime(volume * 0.5, time + 1.1);
            leadGain.gain.linearRampToValueAtTime(0.001, time + 1.2);
        });
        
        lead.connect(leadFilter);
        leadFilter.connect(leadGain);
        leadGain.connect(this.musicGainNode);
        lead.start(now);
        lead.stop(now + duration);
        
        // Layer 3: FAST ARPEGGIO (sparkling movement)
        for (let i = 0; i < 40; i++) {
            const time = now + (i * 0.25);
            const freq = [440, 554, 659, 554][i % 4]; // A, C#, E, C#
            
            const arp = this.audioContext.createOscillator();
            const arpGain = this.audioContext.createGain();
            
            arp.type = 'square';
            arp.frequency.setValueAtTime(freq, time);
            
            arpGain.gain.setValueAtTime(volume * 0.4, time);
            arpGain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);
            
            arp.connect(arpGain);
            arpGain.connect(this.musicGainNode);
            
            arp.start(time);
            arp.stop(time + 0.25);
        }
        
        // Layer 4: RHYTHMIC PERCUSSION
        for (let i = 0; i < 20; i++) {
            const time = now + (i * 0.5);
            
            // Kick drum sound
            const kick = this.audioContext.createOscillator();
            const kickGain = this.audioContext.createGain();
            
            kick.type = 'sine';
            kick.frequency.setValueAtTime(120, time);
            kick.frequency.exponentialRampToValueAtTime(40, time + 0.1);
            
            kickGain.gain.setValueAtTime(volume * 0.8, time);
            kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
            
            kick.connect(kickGain);
            kickGain.connect(this.musicGainNode);
            
            kick.start(time);
            kick.stop(time + 0.15);
        }
        
        // Layer 5: LASER SWEEPS (sci-fi atmosphere)
        for (let i = 0; i < 5; i++) {
            const time = now + (i * 2);
            const sweep = this.audioContext.createOscillator();
            const sweepGain = this.audioContext.createGain();
            const sweepFilter = this.audioContext.createBiquadFilter();
            
            sweep.type = 'sawtooth';
            sweep.frequency.setValueAtTime(2000, time);
            sweep.frequency.exponentialRampToValueAtTime(4000, time + 0.5);
            
            sweepFilter.type = 'highpass';
            sweepFilter.frequency.setValueAtTime(3000, time);
            
            sweepGain.gain.setValueAtTime(0, time);
            sweepGain.gain.linearRampToValueAtTime(volume * 0.25, time + 0.1);
            sweepGain.gain.linearRampToValueAtTime(0.001, time + 0.5);
            
            sweep.connect(sweepFilter);
            sweepFilter.connect(sweepGain);
            sweepGain.connect(this.musicGainNode);
            
            sweep.start(time);
            sweep.stop(time + 0.5);
        }
        
        // Auto-restart for seamless loop
        this.gameMusicTimeout = setTimeout(() => {
            if (this.currentMusic === 'game') {
                this.playBattleMusic();
            }
        }, duration * 1000);
    }
    
    // Settings control
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        console.log('🔊 Sound effects:', enabled ? 'ON' : 'OFF');
    }
    
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        console.log('🎵 Music:', enabled ? 'ON' : 'OFF');
        
        if (!enabled) {
            this.stopMusic();
        } else if (this.currentMusic) {
            // Restart current music
            const current = this.currentMusic;
            this.currentMusic = null;
            if (current === 'menu') this.startMenuMusic();
            if (current === 'game') this.startGameMusic();
        }
    }
}

// Create global instance
const Audio = new AudioManager();

// Initialize on first user interaction
let audioInitialized = false;

function initAudioOnInteraction() {
    if (!audioInitialized) {
        Audio.initialize().then(success => {
            if (success) {
                audioInitialized = true;
                console.log('✅ Audio system ready!');
            }
        });
    }
}

// Listen for any user interaction to initialize
document.addEventListener('click', initAudioOnInteraction, { once: true });
document.addEventListener('keydown', initAudioOnInteraction, { once: true });
document.addEventListener('touchstart', initAudioOnInteraction, { once: true });

console.log('🎵 Audio system loaded. Waiting for user interaction...');
