/** Muted electric notes, stereo chorus and a chord-following warm drone. */
export class StringAudio {
  context: AudioContext | null = null;
  gain: GainNode | null = null;
  enabled = false;
  droneVoices: { oscillator: OscillatorNode; overtone: OscillatorNode }[] = [];
  droneGain: GainNode | null = null;
  droneFilter: BiquadFilterNode | null = null;
  droneLfo: OscillatorNode | null = null;
  droneDepth: GainNode | null = null;
  droneFrequencies = [98, 123.47, 146.83, 185];

  async enable() {
    if (!this.context) {
      this.context = new AudioContext({ latencyHint: 'interactive' });
      const compressor = this.context.createDynamicsCompressor();
      compressor.threshold.value = -12;
      compressor.knee.value = 15;
      compressor.ratio.value = 8;
      compressor.attack.value = .003;
      compressor.release.value = .18;
      this.gain = this.context.createGain();
      this.gain.gain.value = 0;
      this.gain.connect(compressor);
      const chorus = this.context.createDelay(.1);
      chorus.delayTime.value = .021;
      const wet = this.context.createGain();
      wet.gain.value = .18;
      const chorusFilter = this.context.createBiquadFilter();
      chorusFilter.type = 'lowpass';
      chorusFilter.frequency.value = 1700;
      const chorusLfo = this.context.createOscillator();
      chorusLfo.frequency.value = .24;
      const chorusDepth = this.context.createGain();
      chorusDepth.gain.value = .003;
      chorusLfo.connect(chorusDepth);
      chorusDepth.connect(chorus.delayTime);
      this.gain.connect(chorus);
      chorus.connect(chorusFilter);
      chorusFilter.connect(wet);
      wet.connect(compressor);
      chorusLfo.start();
      compressor.connect(this.context.destination);
      this.createDrone();
    }
    this.enabled = true;
    this.gain!.gain.setTargetAtTime(.36, this.context.currentTime, .18);
    await this.context.resume();
    this.enabled = this.context.state === 'running';
    return this.enabled;
  }

  createDrone() {
    const context = this.context!;
    this.droneFilter = context.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.value = 490;
    this.droneFilter.Q.value = .45;
    this.droneGain = context.createGain();
    this.droneGain.gain.value = .11;
    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.gain!);
    this.droneLfo = context.createOscillator();
    this.droneLfo.type = 'sine';
    this.droneLfo.frequency.value = .075;
    this.droneDepth = context.createGain();
    this.droneDepth.gain.value = .009;
    this.droneLfo.connect(this.droneDepth);
    this.droneDepth.connect(this.droneGain.gain);
    this.droneLfo.start();
    this.droneFrequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const overtone = context.createOscillator();
      oscillator.type = 'sine';
      overtone.type = 'triangle';
      oscillator.frequency.value = frequency;
      overtone.frequency.value = frequency;
      overtone.detune.value = [-5, 4, -3, 6][index];
      const voice = context.createGain();
      voice.gain.value = .34;
      const pan = context.createStereoPanner();
      pan.pan.value = [-.5, -.18, .18, .5][index];
      const overtoneGain = context.createGain();
      overtoneGain.gain.value = .24;
      oscillator.connect(voice);
      overtone.connect(overtoneGain);
      overtoneGain.connect(voice);
      voice.connect(pan);
      pan.connect(this.droneFilter!);
      oscillator.start();
      overtone.start();
      this.droneVoices.push({ oscillator, overtone });
    });
  }

  setChord(frequencies: number[]) {
    this.droneFrequencies = frequencies.map(frequency => frequency / 2);
    if (!this.context) return;
    this.droneVoices.forEach((voice, index) => {
      const frequency = this.droneFrequencies[index];
      voice.oscillator.frequency.setTargetAtTime(frequency, this.context!.currentTime, 1.3);
      voice.overtone.frequency.setTargetAtTime(frequency, this.context!.currentTime, 1.4);
    });
  }

  setMotion(speed: number) {
    if (!this.context || !this.droneLfo || !this.droneGain || !this.droneFilter || !this.droneDepth) return;
    const motion = Math.min(1, Math.max(0, speed / 1.8));
    const time = this.context.currentTime;
    this.droneLfo.frequency.setTargetAtTime(.075 + motion * 4.5, time, motion > .05 ? .16 : .8);
    this.droneDepth.gain.setTargetAtTime(.009 + motion * .028, time, .35);
    this.droneFilter.frequency.setTargetAtTime(490 + motion * 1050, time, .45);
    this.droneGain.gain.setTargetAtTime(.11 + motion * .035, time, .5);
  }

  mute() {
    this.enabled = false;
    if (this.context && this.gain) this.gain.gain.setTargetAtTime(0, this.context.currentTime, .025);
  }

  note(frequency: number, row = 0, delay = 0, strength = 1) {
    if (!this.enabled || !this.context || !this.gain) return;
    const start = this.context.currentTime + delay;
    const source = this.context.createOscillator();
    source.type = 'sine';
    source.frequency.value = frequency;
    const twin = this.context.createOscillator();
    twin.type = 'sine';
    twin.frequency.value = frequency;
    twin.detune.value = row % 2 ? 5 : -5;
    const harmonic = this.context.createOscillator();
    harmonic.type = 'sine';
    harmonic.frequency.value = frequency * 2;
    const harmonicLevel = this.context.createGain();
    harmonicLevel.gain.value = .12;
    const tone = this.context.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.setValueAtTime(1500, start);
    tone.frequency.exponentialRampToValueAtTime(560, start + 1.4);
    tone.Q.value = .3;
    const envelope = this.context.createGain();
    envelope.gain.setValueAtTime(.0001, start);
    envelope.gain.linearRampToValueAtTime(Math.min(.15, strength * .11), start + .035);
    envelope.gain.exponentialRampToValueAtTime(.025, start + .7);
    envelope.gain.exponentialRampToValueAtTime(.0001, start + 2.8);
    const pan = this.context.createStereoPanner();
    pan.pan.value = [-.36, -.12, .12, .36][row];
    source.connect(tone);
    twin.connect(tone);
    harmonic.connect(harmonicLevel);
    harmonicLevel.connect(tone);
    tone.connect(envelope);
    envelope.connect(pan);
    pan.connect(this.gain);
    source.start(start);
    twin.start(start);
    harmonic.start(start);
    source.stop(start + 2.9);
    twin.stop(start + 2.9);
    harmonic.stop(start + 2.9);
    source.onended = () => { source.disconnect(); twin.disconnect(); harmonic.disconnect(); harmonicLevel.disconnect(); tone.disconnect(); envelope.disconnect(); pan.disconnect(); };
  }
}
