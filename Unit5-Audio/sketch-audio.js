const canvasSketch = require('canvas-sketch');
const math = require("canvas-sketch-util/math");

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

let audio, audioContext, analyzerNode, audioData, sourceNode;
let manager; 

const sketch = () => {
  const bins = [4, 20, 40];

  return ({ context, width, height }) => {
    context.fillStyle = '#fff8e7';
    context.fillRect(0, 0, width, height);
   
    if(!audioContext) return; 
   
    analyzerNode.getFloatFrequencyData(audioData);
    for(let i = 0; i < bins.length; i++){

      const bin = bins[i];
      const mapped = math.mapRange(audioData[bin], analyzerNode.minDecibels, analyzerNode.maxDecibels, 0, 1, true);
      const radius = mapped * 300; 
  
      context.save(); 
      context.translate(width * 0.5, height * 0.5)
      context.lineWidth = 10; 
      context.beginPath(); 
      context.arc(0, 0, radius, 0, Math.PI * 2); 
      context.stroke(); 
      context.restore();
    }
   
    
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
  audio.src = "/audio/Radio_Premium_-_Feder_ft._Lyse_-_Goodbye_(Hydr0.org).mp3";
  audioContext = new AudioContext(); 
  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(audioContext.destination);
  analyzerNode = audioContext.createAnalyser();
  analyzerNode.fftSize = 512;
  analyzerNode.smoothingTimeConstant = 0.9;
  sourceNode.connect(analyzerNode);
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