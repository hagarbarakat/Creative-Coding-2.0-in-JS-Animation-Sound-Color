const canvasSketch = require('canvas-sketch');
const math = require("canvas-sketch-util/math");
const eases = require('eases');
const random = require("canvas-sketch-util/random");
let colormap = require('colormap')

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

let audio, audioContext, analyzerNode, audioData, sourceNode;
let manager;
let maxDb, minDb, color; 

const sketch = () => {
  const numsCircles = 5;
  const numSlices = 9; 
  const slice = Math.PI * 2 / numSlices;
  const radius = 200;

  const bins = [];
  const lineWidths = [];
  let lineWidth, bin, mapped;
  let frequency = 0.002;
  let amplitude = 90;

  const colors = colormap({
    colormap: 'viridis',
    nshades: amplitude, 
    format: 'hex',
    alpha: 1
  });

  for(let i = 0; i < numsCircles * numSlices; i++){
    bin = random.rangeFloor(4, 64);
    if(random.value() > 0.8) bin = 0;
    bins.push(bin);
  }

  for(let i = 0; i < numsCircles; i++){
    const t = i / (numsCircles - 1);
    lineWidth = eases.quadIn(t) * 200 + 20;
    lineWidths.push(lineWidth);
  }

  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
   
    if(!audioContext) return; 
   
    analyzerNode.getFloatFrequencyData(audioData);
    context.save(); 
    context.translate(width * 0.5, height * 0.5);
    let cradius = radius;

    for(let i = 0; i < numsCircles; i++){
      context.save();
      n = random.noise2D(random.range(1,10), random.range(20,90), frequency, amplitude);

      color = colors[Math.floor(math.mapRange(n, random.range(-120, -amplitude), random.range(amplitude,120), 0, random.range(amplitude,185)))];

      for(let j =0; j < numSlices; j++){
        
        context.rotate(slice);
        context.lineWidth = lineWidths[i]; 
        bin = bins[i * numSlices + j];
        context.strokeStyle = color;
        if(!bin) continue;
        mapped = math.mapRange(audioData[bin], minDb, maxDb, 0, 1, true);
        lineWidth = lineWidths[i] * mapped; 
        if(lineWidth < 1) continue;

        context.lineWidth = lineWidth;
        context.beginPath(); 
        context.arc(0, 0, cradius + context.lineWidth * 0.5, 0, slice); 
        context.stroke(); 

      }
      cradius += lineWidths[i];
      context.restore();
    }
    context.restore();   
    
  };
};

const addListeners = () => {
  window.addEventListener('mouseup', () => {
    if(!audioContext) createAudio();

    if(audio.paused) {
      audio.play();
      manager.play();
    }
    else{
      audio.pause();
      manager.pause();
    } 
  });
}

const createAudio = () => {

  audio = document.createElement('audio');
  audio.src = "/audio/Fred-again..-feat.-The-Blessed-Madonna-Marea-Weve-Lost-Dancing-Official-Audio.mp3";
  audioContext = new AudioContext(); 
  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(audioContext.destination);
  analyzerNode = audioContext.createAnalyser();
  analyzerNode.fftSize = 512;
  analyzerNode.smoothingTimeConstant = 0.9;
  sourceNode.connect(analyzerNode);

  minDb = analyzerNode.minDecibels;
  maxDb = analyzerNode.maxDecibels;

  audioData = new Float32Array(analyzerNode.frequencyBinCount);

}

const getAverage = (data) => {
  let sum = 0; 
  for(i = 0; i < data.length; i++){
    sum += data[i]
  }
  return sum / data.length
}

const start = async()  => {
  addListeners();
  manager = await canvasSketch(sketch, settings);
  manager.pause();
}
start();