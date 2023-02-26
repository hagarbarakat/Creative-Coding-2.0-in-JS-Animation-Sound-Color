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
  const numsCircles = 6;
  const numSlices = 2; 
  const slice = Math.PI * 2 / numSlices;
  const radius = 200;

  const bins = [];
  const lineWidths = [];
  const rotationOffsets = []
  let lineWidth, bin, mapped, phi;
  let frequency = 0.002;
  let amplitude = 80;

  const colors = colormap({
    colormap: 'jet',
    nshades: amplitude, 
    format: 'hex',
    alpha: 1
  });

  for(let i = 0; i < numsCircles * numSlices; i++){
    bin = random.rangeFloor(4, 64);
    bins.push(bin);
  }

  for(let i = 0; i < numsCircles; i++){
    const t = i / (numsCircles - 1);
    lineWidth = eases.quadIn(t) * 200 + 10;
    lineWidths.push(lineWidth);
  }

  for(let i = 0; i < numsCircles; i++){
    rotationOffsets.push(random.range(Math.PI * -0.25, Math.PI * 0.25) - Math.PI * 0.5);
  }
  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
   
    if(!audioContext) return; 
   
    analyzerNode.getFloatFrequencyData(audioData);
    context.save(); 
    context.translate(width * 0.5, height * 0.5);
    context.scale(1, -1);

    let cradius = radius;

    for(let i = 0; i < numsCircles; i++){
      context.save();
      context.rotate(rotationOffsets[i]);
      n = random.noise2D(random.range(1,10), random.range(20,90), frequency, amplitude);

      color = colors[Math.floor(math.mapRange(n, random.range(-100, -amplitude), random.range(amplitude,100), 0, random.range(amplitude,150)))];
      cradius += lineWidths[i] * 0.5 + 2;
      for(let j =0; j < numSlices; j++){
        
        context.rotate(slice);
        context.lineWidth = lineWidths[i]; 
        bin = bins[i * numSlices + j];
        context.strokeStyle = color;
        mapped = math.mapRange(audioData[bin], minDb, maxDb, 0, 1, true);
        phi = slice * mapped;
        context.beginPath(); 
        context.arc(0, 0, cradius + context.lineWidth * 0.5, 0, phi); 
        context.stroke(); 

      }
      cradius += lineWidths[i] * 0.5;
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
  audio.src = "/audio/10convert.com_Rebuke - Along Came Polly_-kLvsKZMLh4.mp3";
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