let array, logo, myElements, analyser, src, height;
let linesVisualizer = document.getElementById('lines');
let num = 64;
let width = 12;
let color = '#000000';

const freqElement = document.getElementById('freq');
const widthElement = document.getElementById('lineWidth');
const colorElement = document.getElementById('color');

freqElement.addEventListener('change', function ()  {
    if (+this.value < 8) {
        this.value = 8;
    }
    num = +this.value;
});

widthElement.addEventListener('change', function ()  {
    if (+this.value < 1) {
        this.value = 1;
    }
    width = +this.value;
});

colorElement.addEventListener('change', function ()  {
    color = this.value;
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
    } catch (error) {
        alert(error + '\r\n\ Отклонено. Страница будет обновлена!');
        location.reload();
    }
};

selectsElements.forEach(async (selectsElement) => {
    const typeElement = selectsElement.querySelector('.type');
    const devicesElement = selectsElement.querySelector('.devices');

    await createMedia(devicesElement);

    devicesElement.addEventListener('change', function () {
        const context = new AudioContext();
        analyser = context.createAnalyser();
        analyser.fftSize = num*4;
        const bufferLength = analyser.frequencyBinCount;
        array = new Uint8Array(bufferLength);

        navigator.mediaDevices.getUserMedia({
            audio: { deviceId: this.value }
        }).then(stream => {
            src = context.createMediaStreamSource(stream);
            src.connect(analyser);
            if (typeElement.value === 'lines') {
                linesVisualizer.style.display = 'flex';
                visualizeLines();
            }
            if (typeElement.value === 'waves') {
                canvasElement.style.display = 'block';
                visualizeWaves();
            }
        }).catch(error => {
            alert(error + '\r\n\ Отклонено. Страница будет обновлена!');
            location.reload();
        });

        selectsWrapper.remove();
    });
});

function visualizeLines() {
    for(let i = 0 ; i < num ; i++){
        logo = document.createElement('div');
        logo.className = 'logo';
        logo.style.background = color;
        logo.style.minWidth = width+'px';
        logo.style.margin = `0 ${width / 2}px`;
        linesVisualizer.appendChild(logo);
    }
    myElements = document.getElementsByClassName('logo');
    draw();

    function draw() {
        window.requestAnimationFrame(draw);
        analyser.getByteFrequencyData(array);
        for(let i = 0 ; i < num ; i++){
            height = array[i];
            myElements[i].style.minHeight = height+'px';
        }
    }
}

function visualizeWaves() {
    const canvasElement = document.getElementById('waves');
    const canvasCtx = canvasElement.getContext("2d");
    draw();

    function draw() {
        const WIDTH = canvasElement.width;
        const HEIGHT = canvasElement.height;

        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(array);

        canvasCtx.fillStyle = 'rgb(255, 255, 255)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = width;
        canvasCtx.strokeStyle = color;

        canvasCtx.beginPath();

        let sliceWidth = WIDTH * 1.0 / num;
        let x = 0;


        for(let i = 0; i < num; i++) {
            const freq = array[i];
            const halfSlice = sliceWidth / 2;

            let y =  i % 2 === 0 ? HEIGHT / 2 + freq : HEIGHT / 2 - freq;

            if(i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.quadraticCurveTo(x - halfSlice, y, x, y);
            }

            canvasCtx.quadraticCurveTo(x + halfSlice, y, x + halfSlice, HEIGHT / 2);

            x += sliceWidth;
        }

        canvasCtx.stroke();

    }
}
