export let lineWidth = +localStorage.getItem('lineWidth') || 12;
export let spaceBetween = +localStorage.getItem('spaceBetween') || 12;
export let num;
export let skip;
calcNum();
export let spaceBetweenVisualizers = +localStorage.getItem('spaceBetweenVisualizers') || 0;

const widthElement = document.getElementById('lineWidth');
const spaceBetweenElement = document.getElementById('spaceBetween');
const spaceBetweenVisualizersElement = document.getElementById('spaceBetweenVisualizers');

widthElement.value = lineWidth;
widthElement.addEventListener('change', function () {
  if (+this.value < 1) {
    this.value = 1;
  }
  lineWidth = +this.value;
  calcNum();
  localStorage.setItem('lineWidth', this.value);
});

spaceBetweenElement.value = spaceBetween;
spaceBetweenElement.addEventListener('change', function () {
  if (+this.value < 1) {
    this.value = 1;
  }
  spaceBetween = +this.value;
  calcNum();
  localStorage.setItem('spaceBetween', this.value);
});

spaceBetweenVisualizersElement.value = spaceBetweenVisualizers;
changeSpaceBetweenVisualizers(spaceBetweenVisualizers);
spaceBetweenVisualizersElement.addEventListener('change', function () {
  if (+this.value < 0) {
    this.value = 0;
  }
  spaceBetweenVisualizers = +this.value;
  changeSpaceBetweenVisualizers(spaceBetweenVisualizers);
  localStorage.setItem('spaceBetweenVisualizers', this.value);
});

function calcNum() {
  num = aroundSquareTwo(2196 / (lineWidth + spaceBetween));
  skip = num / 4;
}

function aroundSquareTwo(number) {
  let result = 2;

  while (result < number) {
    result *= 2;
  }

  return result;
}

function changeSpaceBetweenVisualizers(value) {
  document.querySelector('.visualizers').style.gap = `${value}%`;
  document.getElementById('spaceBetweenVisualizersWrapper').querySelector('.input__value').textContent = `${value}%`;
}
