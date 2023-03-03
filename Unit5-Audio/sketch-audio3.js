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
  const numsRects = 10;
  const numSlices = 2; 
  const slice = Math.PI * 2 / numSlices;

  const bins = [];
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
  const colorsFill = colormap({
    colormap: 'greys',
    nshades: amplitude, 
    format: 'hex',
    alpha: 1
  });
  for(let i = 0; i < numsRects * numSlices; i++){
    bin = random.rangeFloor(4, 64);
    bins.push(bin);
  }


  for(let i = 0; i < numsRects; i++){
    rotationOffsets.push(random.range(Math.PI * -0.25, Math.PI * 0.25) - Math.PI * 0.5);
  }
  return ({ context, width, height }) => {
    const patternCanvas = document.createElement("canvas");
    const patternContext = patternCanvas.getContext("2d");
    patternCanvas.width = 200;
    patternCanvas.height = 200;
    patternContext.translate(patternCanvas.width * 0.5, patternCanvas.height * 0.5);
    
    // // Give the pattern a background color and draw an arc
    // patternContext.fillStyle = "#black";
    // patternContext.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
    // patternContext.lineWidth = 1;
    // patternContext.arc(0, 0, 50, 0, 0.5 * Math.PI);
    // patternContext.stroke();


  


     context.fillStyle = 'black';
     context.fillRect(0, 0, width, height);
   
     if(!audioContext) return; 
   
    analyzerNode.getFloatFrequencyData(audioData);
    context.save(); 
    context.translate(width * 0.5, height * 0.5);
    //context.scale(1, -1);

    
    

    for(let i = 0; i < numsRects; i++){
      patternContext.save();
      //patternContext.rotate(rotationOffsets[i]);
      n = random.noise2D(random.range(1,10), random.range(20,90), frequency, amplitude);

      color = colors[Math.floor(math.mapRange(n, random.range(-120, -amplitude), random.range(amplitude,120), 0, random.range(amplitude,220)))];
      colorFill = colorsFill[Math.floor(math.mapRange(n, random.range(-120, -amplitude), random.range(amplitude,120), 0, random.range(amplitude,220))) % 20];
      console.log(colorsFill)
      console.log(colorFill)

      context.fillStyle = colorFill;
     context.fillRect(0, 0, width, height);
      for(let j =0; j < numSlices; j++){
        
        patternContext.rotate(slice);
        bin = bins[i * numSlices + j];
        patternContext.strokeStyle = color;
        mapped = math.mapRange(audioData[bin], minDb, maxDb, 0, 1, true);
        phi = slice * mapped;
        patternContext.beginPath(); 
       patternContext.shadowColor = "red";
       patternContext.shadowBlur = 3;
       //patternContext.fillStyle = "black";
      // patternContext.fillRect(0, 0, patternCanvas.width, patternCanvas.height);

       patternContext.fillStyle = color;
       patternContext.fillRect(0, 0, 150, 150);

   
       patternContext.restore();

      }
      context.restore();
    }
    context.restore();   
    const pattern = context.createPattern(patternCanvas, "repeat");
    context.fillStyle = pattern;
    context.fillRect(0, 0, width, height);
    
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
  audio.src = "/audio/Argy, Goom Gum - Pantheon.mp3";
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