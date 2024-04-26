export const visualizersCount = 3;
const selectsWrapper = document.querySelector('.selects-wrapper');
const devicesSelects = selectsWrapper.querySelector('.devices-selects');

export const sensitivitiesArray = localStorage.getItem('sensitivities')?.split(',') || new Array(visualizersCount).fill(0);
export const typesArray = localStorage.getItem('types')?.split(',') || new Array(visualizersCount).fill('waves');
export const devicesArray = localStorage.getItem('devices')?.split(',') || new Array(visualizersCount).fill('default');

for (let i = 0; i < visualizersCount; i++) {
  const selects = document.createElement('div');
  selects.dataset.id = String(i);
  selects.className = 'selects selects_instance';

  const type = document.createElement('div');
  const typeLabel = document.createElement('label');
  typeLabel.textContent = 'Тип:';
  typeLabel.htmlFor = `type-${i}`;
  const typeSelect = document.createElement('select');
  typeSelect.className = 'type';
  typeSelect.id = `type-${i}`;
  typeSelect.append(
    createOption('waves', 'Волны'),
    createOption('lines', 'Линии'),
    createOption('rectangles', 'Прямоугольники'),
    createOption('ellipse', 'Круги'),
    createOption('roundedLines', 'Линии с закруглёнными краями')
  );
  typeSelect.value = typesArray[i];
  typeSelect.addEventListener('change', () => {
    typesArray[i] = typeSelect.value;
    localStorage.setItem('types', typesArray);
  })
  type.append(typeLabel, typeSelect);

  const devices = document.createElement('div');
  const devicesLabel = document.createElement('label');
  devicesLabel.textContent = 'Устройства:';
  devicesLabel.htmlFor = `devices-${i}`;
  const devicesSelect = document.createElement('select');
  devicesSelect.className = 'devices';
  devicesSelect.id = `devices-${i}`;
  devicesSelect.addEventListener('change', () => {
    devicesArray[i] = devicesSelect.value;
    localStorage.setItem('devices', devicesArray);
  })
  devices.append(devicesLabel, devicesSelect);

  const sensitivity = document.createElement('div');
  sensitivity.className = 'input-range-wrapper';
  const sensitivityLabel = document.createElement('label');
  sensitivityLabel.textContent = 'Чувствительность:';
  sensitivityLabel.htmlFor = `sensitivity-${i}`;
  const sensitivityInput = document.createElement('input');
  sensitivityInput.type = 'range';
  sensitivityInput.id = `sensitivity-${i}`;
  sensitivityInput.min = 0;
  sensitivityInput.max = 100;
  sensitivityInput.value = sensitivitiesArray[i];
  const sensitivityValueElement = document.createElement('div');
  sensitivityValueElement.textContent = `-${sensitivityInput.value}`;
  sensitivity.append(sensitivityLabel, sensitivityInput, sensitivityValueElement);
  sensitivityInput.addEventListener('change', () => {
    sensitivityValueElement.textContent = `-${sensitivityInput.value}`;
    sensitivitiesArray[i] = sensitivityInput.value;
    localStorage.setItem('sensitivities', sensitivitiesArray);
  })


  selects.append(type, devices, sensitivity);
  devicesSelects.append(selects);
}

function createOption(value, textContent) {
  const typeOption = document.createElement('option');
  typeOption.value = value;
  typeOption.textContent = textContent;
  return typeOption;
}

document.addEventListener('contextmenu', function (event) {
  event.preventDefault();
  selectsWrapper.style.display = selectsWrapper.style.display === 'none' ? 'flex' : 'none';
})
