class Sprite {
  constructor(dataObj) {
    this.src = dataObj.src;
    this.samples = dataObj.sprite;
    this.isPlayingFlag = false;
    this.remainingTones = 0;
    this.init();
  }

  get isPlaying() {
    return this.isPlayingFlag;
  }

  async init() {
    // Set up web audio
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();
    // Fetch source file
    this.audioBuffer = await this.fetchFile();
    console.log("Inited! 🦾");
  }

  async fetchFile() {
    let response;
    try {
      // Try to fetch the first file
      response = await fetch(this.src[0]);
      if (!response.ok) {
        throw new Error(`${response.url} ${response.statusText}`);
      } else {
        console.log("Source fetched ✅");
      }
    } catch (error) {
      console.log(
        `First file fetch error: ${error}, trying to fetch the second file...`
      );
      // If the first file fetch fails, fetch the second file
      response = await fetch(this.src[1]);

      if (!response.ok) {
        console.log(`${response.url} ${response.statusText}`);
        throw new Error(`${response.url} ${response.statusText}`);
      } else {
        console.log("Fallback source fetched ✅");
      }
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);

    return audioBuffer;
  }

  play(toneName, startTime) {
    const [offset, duration] = this.samples[toneName];
    const audioSource = this.ctx.createBufferSource();
    audioSource.buffer = this.audioBuffer;
    audioSource.connect(this.ctx.destination);

    if (!this.isPlayingFlag) {
      this.isPlayingFlag = true;
    }

    audioSource.onended = () => {
      this.remainingTones--;
      console.log(this.remainingTones);

      if (this.remainingTones === 0) {
        console.log("Last ♬");
        this.isPlayingFlag = false;
      }
    };

    audioSource.start(startTime, offset / 1000, duration / 1000);
  }

  playSingleTone(toneName) {
    const startTime = this.ctx.currentTime;
    const toneNames = [toneName];
    this.remainingTones = toneNames.length;

    this.play(toneNames[0], startTime);
  }

  playTonesSimultaneously(toneNames) {
    const startTime = this.ctx.currentTime;
    this.remainingTones = toneNames.length;

    toneNames.forEach((toneName) => {
      this.play(toneName, startTime);
    });
  }

  playTonesSequentially(toneNames) {
    let startTime = this.ctx.currentTime;
    const gapFactor = 0.5; // Shortens the gap between tones. Set to 1 for normal playback. ❗Less precise, use with caution❗
    this.remainingTones = toneNames.length;

    toneNames.forEach((toneName) => {
      this.play(toneName, startTime);
      startTime += (this.samples[toneName][1] / 1000) * gapFactor; // Update the start time for the next tone
    });
  }
}

//---------------------------********SAMPLE DATA********---------------------------

const audioData = {
  piano: {
    tenuto: new Sprite({
      src: ["./assets/piano-tenuto.webm", "./assets/piano-tenuto.mp3"],
      sprite: {
        c4: [0, 2229.115646258503],
        "c#4": [4000, 2229.1156462585027],
        d4: [8000, 2229.1156462585027],
        "d#4": [12000, 2229.1156462585027],
        e4: [16000, 2229.1156462585027],
        f4: [20000, 2229.1156462585027],
        "f#4": [24000, 2229.1156462585027],
        g4: [28000, 2229.1156462585027],
        "g#4": [32000, 2229.1156462585063],
        a4: [36000, 2229.1156462585063],
        "a#4": [40000, 2229.1156462585063],
        b4: [44000, 2229.1156462585063],
        c5: [48000, 2229.1156462585063],
        "c#5": [52000, 2229.1156462585063],
        d5: [56000, 2229.1156462585063],
        "d#5": [60000, 2229.1156462585063],
        e5: [64000, 2229.1156462585063],
        f5: [68000, 2229.1156462585063],
        "f#5": [72000, 2229.1156462585063],
        g5: [76000, 2229.1156462585063],
        "g#5": [80000, 2229.1156462585063],
        a5: [84000, 2229.1156462585063],
        "a#5": [88000, 2229.1156462585063],
        b5: [92000, 2229.1156462585063],
        c6: [96000, 2229.1156462585063],
      },
    }),
  },
};

document.querySelector("#sprite").addEventListener("click", () => {
  if (audioData.piano.tenuto.isPlaying) return;
  audioData.piano.tenuto.playSingleTone("f#4");
});

document.querySelector("#harmo").addEventListener("click", () => {
  if (audioData.piano.tenuto.isPlaying) return;
  audioData.piano.tenuto.playTonesSimultaneously(["c4", "f#4"]);
});

document.querySelector("#melo").addEventListener("click", () => {
  if (audioData.piano.tenuto.isPlaying) return;
  audioData.piano.tenuto.playTonesSequentially(["c4", "f#4", "d4", "a5"]);
});
