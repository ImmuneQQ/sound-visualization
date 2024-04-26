const colorTypeElement = document.getElementById('color-type');
const backgroundElement = document.getElementById('background');

export let background = localStorage.getItem('background') || '#ffffff';

export let colorType = localStorage.getItem('colorType') || 'simple';

document.body.style.backgroundColor = background;
backgroundElement.value = background;
backgroundElement.addEventListener('change', function () {
  document.body.style.backgroundColor = this.value;
  background = this.value;
  localStorage.setItem('background', this.value);
});

import {visualizersCount} from "./visualizersSelects.js";


// Simple color
export let simpleColors;
const localSimpleColors = localStorage.getItem('simpleColors')?.split(',');
if (localSimpleColors && (localSimpleColors.length === visualizersCount)) {
  simpleColors = localSimpleColors;
} else {
  simpleColors = new Array(visualizersCount);
  simpleColors.fill('#000000');
}

for (let i = 0; i < visualizersCount; i ++) {
  const selects = document.querySelectorAll('.selects_instance')
  const colorInput = document.createElement('input');
  colorInput.className = 'color-input_simple';
  colorInput.type = 'color';
  colorInput.value = simpleColors[i];
  selects[i].appendChild(colorInput);

  colorInput.addEventListener('change', () => {
    simpleColors[i] = colorInput.value;
    localStorage.setItem('simpleColors', simpleColors);
  })
}

// Gradient color
const gradientColorsCount = 5;
export let gradientColors;
const localGradientColors = localStorage.getItem('gradientColors')?.split(',');
if (localGradientColors && localGradientColors.length / gradientColorsCount === visualizersCount) {
  gradientColors = new Array(visualizersCount);
  for (let i = 0; i < localGradientColors.length / gradientColorsCount; i++) {
    gradientColors[i] = localGradientColors.slice(i * gradientColorsCount, i * gradientColorsCount + gradientColorsCount);
  }
} else {
  gradientColors = new Array(visualizersCount);
  for (let i = 0; i < visualizersCount; i++) {
    gradientColors[i] = new Array(gradientColorsCount);
    gradientColors[i].fill('#000000');
  }
}

for (let i = 0; i < visualizersCount; i ++) {
  const selects = document.querySelectorAll('.selects_instance');
  const gradientWrapper = document.createElement('div');
  gradientWrapper.className = 'gradient-wrapper';
  gradientColors[i].forEach((color, index) => {
    const colorInput = document.createElement('input');
    colorInput.className = 'color-input_gradient';
    colorInput.type = 'color';
    colorInput.value = color;
    gradientWrapper.appendChild(colorInput);

    colorInput.addEventListener('change', () => {
      gradientColors[i][index] = colorInput.value;
      localStorage.setItem('gradientColors', gradientColors);
    });
  });

  selects[i].appendChild(gradientWrapper);
}

colorTypeElement.value = colorType;
changeColorType();
colorTypeElement.addEventListener('change', changeColorType);

function changeColorType() {
  if (colorTypeElement.value === 'simple') {
    document.querySelectorAll('.color-input_simple').forEach((simpleColorElement) => {
      simpleColorElement.classList.remove('hidden');
    });
    document.querySelectorAll('.gradient-wrapper').forEach((gradientColorElement) => {
      gradientColorElement.classList.add('hidden');
    });
  } else if (colorTypeElement.value === 'gradient') {
    document.querySelectorAll('.color-input_simple').forEach((simpleColorElement) => {
      simpleColorElement.classList.add('hidden');
    });
    document.querySelectorAll('.gradient-wrapper').forEach((gradientColorElement) => {
      gradientColorElement.classList.remove('hidden');
    });
  }
  colorType = colorTypeElement.value;
  localStorage.setItem('colorType', colorTypeElement.value);
}
