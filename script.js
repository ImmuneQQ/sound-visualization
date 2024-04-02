let width = 12;
let spaceBetween = 12;
let color = '#000000';
let background = '#ffffff';
let num = calcNum();
const skip = num / 4;

const widthElement = document.getElementById('lineWidth');
const spaceBetweenElement = document.getElementById('spaceBetween');
const colorElement = document.getElementById('color');
const backgroundElement = document.getElementById('background');

widthElement.addEventListener('change', function ()  {
    if (+this.value < 1) {
        this.value = 1;
    }
    width = +this.value;
    num = calcNum();
});

spaceBetweenElement.addEventListener('change', function ()  {
    if (+this.value < 1) {
        this.value = 1;
    }
    spaceBetween = +this.value;
    num = calcNum();
});

colorElement.addEventListener('change', function ()  {
    color = this.value;
});

backgroundElement.addEventListener('change', function ()  {
    document.body.style.backgroundColor = this.value;
    background = this.value;
});

const selectsWrapper = document.querySelector('.selects-wrapper');
const selectsElements = document.querySelectorAll('.selects_instance');

const createMedia = async (devicesElement) => {
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
          });
    } catch(error) {
        console.error(error);
    }
};

selectsElements.forEach(async (selectsElement) => {
    const devicesElement = selectsElement.querySelector('.devices');

    await createMedia(devicesElement);
});

const startButton = document.getElementById('start');
startButton.onclick = start;

function start() {
    selectsElements.forEach(async (selectsElement) => {
        const type = selectsElement.querySelector('.type').value;
        const device = selectsElement.querySelector('.devices').value;

        const context = new AudioContext();
        const analyser = context.createAnalyser();
        analyser.fftSize = num*4;
        const bufferLength = analyser.frequencyBinCount;
        const array = new Uint8Array(bufferLength);

        navigator.mediaDevices.getUserMedia({
            audio: { deviceId: device }
        }).then(stream => {
            const src = context.createMediaStreamSource(stream);
            src.connect(analyser);
            if (type === 'lines') {
                visualizeLines(selectsElement.dataset.id, analyser, array);
            }
            if (type === 'rectangles') {
                visualizeLines(selectsElement.dataset.id, analyser, array, true);
            }
            if (type === 'waves') {
                visualizeWaves(selectsElement.dataset.id, analyser, array);
            }
        }).catch(error => {
            console.error(error);
        });
    });

    selectsWrapper.remove();
}

function visualizeLines(id, analyser, array, rectangle = false) {
    const visualizersWrappers = document.querySelectorAll('.visualizers-wrapper');
    const visualizer = visualizersWrappers[id].querySelector('.visualizer_lines');

    for(let i = 0 ; i < num ; i++){
        const logo = document.createElement('div');
        logo.className = 'logo';

        logo.style.border = `${width / 2}px solid ${color}`;
        logo.style.margin = `${spaceBetween / 2}px 0`;

        if (rectangle) {
            logo.style.border = `${width}px solid ${color}`;
            logo.style.padding = width / 2 + 'px';
        }

        visualizer.appendChild(logo);
    }

    const logos = visualizer.getElementsByClassName('logo');
    draw();

    function draw() {
        window.requestAnimationFrame(draw);
        analyser.getByteFrequencyData(array);
        for(let i = 0 ; i < num ; i++){
            logos[i].style.width = array[i+skip] * 2 + 'px';
        }
    }

    visualizer.style.display = 'flex';
}

function visualizeWaves(id, analyser, array) {
    const canvasElement = document.querySelectorAll('.visualizer_waves')[id];
    const canvasCtx = canvasElement.getContext("2d");
    draw();

    function draw() {
        const WIDTH = canvasElement.width;
        const HEIGHT = canvasElement.height;

        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(array);

        canvasCtx.fillStyle = background;
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        const slice = spaceBetween + width;
        const halfSlice = slice / 2;
        canvasCtx.lineWidth = width;
        canvasCtx.strokeStyle = color;

        canvasCtx.beginPath();

        let y = 0;


        for(let i = 0; i < num; i++) {
            const freq = array[i+skip];

            let x =  i % 2 === 0 ? WIDTH / 2 + freq : WIDTH / 2 - freq;

            if(i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.quadraticCurveTo(x, y - halfSlice, x, y);
            }

            canvasCtx.quadraticCurveTo(x, y + halfSlice, WIDTH / 2, y + halfSlice);

            y += slice;
        }

        canvasCtx.stroke();

    }

    canvasElement.style.display = 'flex';
}

function aroundSquareTwo(number) {
    let result = 2;

    while (result < number) {
        result *= 2;
    }

    return result;
}

function calcNum() {
    return aroundSquareTwo(2196 / (width + spaceBetween));
}
