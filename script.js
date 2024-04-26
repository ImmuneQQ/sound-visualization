import {simpleColors, gradientColors, colorType, background} from "./colorSelects.js";
import {lineWidth, spaceBetween, num, skip} from "./lineSettings.js";
import {sensitivitiesArray, devicesArray} from "./visualizersSelects.js";

let started = false;

const createMedia = async (devicesElement, index) => {
  try {
    await navigator.mediaDevices.getUserMedia({audio: true});
    let devices = await navigator.mediaDevices.enumerateDevices();
    devices
      .filter((device) => device.kind === 'audioinput')
      .forEach((device) => {
        const option = document.createElement('option');
        option.innerHTML = device.label;
        option.value = device.deviceId;
        devicesElement.appendChild(option);
        if (option.value === devicesArray[index]) {
          devicesElement.value = option.value;
        }
      });
  } catch (error) {
    console.error(error);
  }
};

const selectsElements = document.querySelectorAll('.selects_instance');
selectsElements.forEach(async (selectsElement, index) => {
  const devicesElement = selectsElement.querySelector('.devices');
  await createMedia(devicesElement, index);
});

const startButton = document.getElementById('start');
startButton.onclick = start;

function start() {
  started = false;
  selectsElements.forEach(async (selectsElement) => {
    const visualizers = document.querySelectorAll('.visualizer');
    visualizers.forEach((visualizer) => visualizer.style.display = 'none');

    const type = selectsElement.querySelector('.type').value;
    const device = selectsElement.querySelector('.devices').value;

    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = num > 8 ? num * 4 : 32;
    const bufferLength = analyser.frequencyBinCount;
    const array = new Uint8Array(bufferLength);

    navigator.mediaDevices.getUserMedia({
      audio: {deviceId: device}
    }).then(stream => {
      const src = context.createMediaStreamSource(stream);
      src.connect(analyser);
      if (type === 'lines') {
        visualizeLines(selectsElement.dataset.id, analyser, array);
      }
      if (type === 'rectangles') {
        visualizeLines(selectsElement.dataset.id, analyser, array, 'rectangle');
      }
      if (type === 'ellipse') {
        visualizeLines(selectsElement.dataset.id, analyser, array, 'ellipse');
      }
      if (type === 'roundedLines') {
        visualizeLines(selectsElement.dataset.id, analyser, array, 'roundedLines');
      }
      if (type === 'waves') {
        visualizeWaves(selectsElement.dataset.id, analyser, array);
      }
    }).catch(error => {
      console.error(error);
    });
  });
}

function visualizeLines(id, analyser, array, type = 'lines') {
  started = true;
  const visualizersWrappers = document.querySelectorAll('.visualizers-wrapper');
  const visualizer = visualizersWrappers[id].querySelector('.visualizer_lines');
  let logos = visualizer.querySelectorAll('.logo');
  logos.forEach((logo) => logo.remove());

  for (let i = 0; i < num; i++) {
    const logo = document.createElement('div');
    const logoInner = document.createElement('div');
    logo.appendChild(logoInner);

    logo.style.background = colorType === 'gradient' ?
      `linear-gradient(to right, ${gradientColors[id][0]}, ${gradientColors[id][1]} 25%, ${gradientColors[id][2]} 50%, ${gradientColors[id][3]} 75%, ${gradientColors[id][4]} 100%)` :
      simpleColors[id];
    logo.className = 'logo';
    logo.style.margin = `${spaceBetween / 2}px 0`;
    logo.style.padding = lineWidth / 2 + 'px';

    logoInner.style.backgroundColor = background;

    if (type === 'roundedLines') {
      logo.style.borderRadius = lineWidth / 2 + 'px';
    }

    if (type === 'rectangle' || type === 'ellipse') {
      logo.style.boxSizing = 'border-box';
      logo.style.minWidth = lineWidth * 2 + spaceBetween + 'px';
      logo.style.padding = lineWidth + 'px';
      logoInner.style.padding = spaceBetween / 2 + 'px';
    }

    if (type === 'ellipse') {
      logo.style.borderRadius = lineWidth + spaceBetween / 2 + 'px';
      logoInner.style.borderRadius = lineWidth + spaceBetween / 2 + 'px';
    }

    visualizer.appendChild(logo);
  }

  logos = visualizer.querySelectorAll('.logo');
  draw();

  function draw() {
    if (!started) return;
    window.requestAnimationFrame(draw);
    analyser.getByteFrequencyData(array);
    for (let i = 0; i < num; i++) {
      const freq = array[i + skip] - sensitivitiesArray[id] > 0 ? array[i + skip] - sensitivitiesArray[id] : 0;
      logos[i].style.width = freq * 2 + 'px';
    }
  }

  visualizer.style.display = 'flex';
}

function visualizeWaves(id, analyser, array) {
  started = true;
  const canvasElement = document.querySelectorAll('.visualizer_waves')[id];
  const canvasCtx = canvasElement.getContext("2d");
  draw();

  function draw() {
    if (!started) return;
    const CANVAS_WIDTH = canvasElement.width;
    const CANVAS_HEIGHT = canvasElement.height;
    let gradient;

    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(array);

    canvasCtx.fillStyle = background;
    canvasCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const slice = spaceBetween + lineWidth;
    const halfSlice = slice / 2;
    canvasCtx.lineWidth = lineWidth;
    if (colorType === 'simple') {
      canvasCtx.strokeStyle = simpleColors[id];
    }
    if (colorType === 'gradient') {
      gradient = canvasCtx.createLinearGradient(CANVAS_WIDTH / 2 - Math.max(...array), 0, CANVAS_WIDTH / 2 + Math.max(...array), 0);
      gradient.addColorStop(0, gradientColors[id][0]);
      gradient.addColorStop(0.25, gradientColors[id][1]);
      gradient.addColorStop(0.5, gradientColors[id][2]);
      gradient.addColorStop(0.75, gradientColors[id][3]);
      gradient.addColorStop(1, gradientColors[id][4]);
    }

    canvasCtx.beginPath();

    let y = 0;


    for (let i = 0; i < num; i++) {
      const freq = array[i + skip] - sensitivitiesArray[id] > 0 ? array[i + skip] - sensitivitiesArray[id] : 0;

      let x = i % 2 === 0 ? CANVAS_WIDTH / 2 + freq : CANVAS_WIDTH / 2 - freq;

      let x2 = i % 2 === 0 ? x - (lineWidth + spaceBetween / 2) : x + (lineWidth + spaceBetween / 2);

      if (lineWidth + spaceBetween / 2 > freq) {
        if (i === 0) {
          canvasCtx.moveTo(CANVAS_WIDTH / 2, 0);
        }
        canvasCtx.lineTo(CANVAS_WIDTH / 2, y + halfSlice);
        y += slice;
        continue;
      }

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x2, y - halfSlice);
        canvasCtx.quadraticCurveTo(x, y - halfSlice, x, y);
      }

      canvasCtx.quadraticCurveTo(x, y + halfSlice, x2, y + halfSlice);
      canvasCtx.lineTo(CANVAS_WIDTH / 2, y + halfSlice);

      y += slice;
    }
    if (colorType === 'gradient') {
      canvasCtx.strokeStyle = gradient;
    }
    canvasCtx.stroke();

  }

  canvasElement.style.display = 'flex';
}
