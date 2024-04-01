let linesVisualizer, num, array, width, context, logo, myElements, analyser, src, height;
linesVisualizer = document.getElementById('lines');
num = 64;
array = new Uint8Array(num*2);
width = 2;
devicesElement = document.getElementById('devices');
const canvas = document.getElementById('waves');
const canvasCtx = canvas.getContext("2d");
const typeElement = document.getElementById('type');

(async () => {
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
})();

devicesElement.addEventListener('change', function () {
    if(context) return;

    for(let i = 0 ; i < num ; i++){
        logo = document.createElement('div');
        logo.className = 'logo';
        logo.style.background = '#000';
        logo.style.minWidth = width+'px';
        linesVisualizer.appendChild(logo);
    }

    myElements = document.getElementsByClassName('logo');
    context = new AudioContext();
    analyser = context.createAnalyser();

    navigator.mediaDevices.getUserMedia({
        audio: { deviceId: this.value }
    }).then(stream => {
        src = context.createMediaStreamSource(stream);
        src.connect(analyser);
        if (typeElement.value === 'lines') {
            linesVisualizer.style.display = 'flex';
            loop();
        }
        if (typeElement.value === 'waves') {
            canvas.style.display = 'block';
            visualize();
        }
    }).catch(error => {
        alert(error + '\r\n\ Отклонено. Страница будет обновлена!');
        location.reload();
    });

    devicesElement.remove();
    typeElement.remove();
})

function loop() {
    window.requestAnimationFrame(loop);
    analyser.getByteFrequencyData(array);
    for(let i = 0 ; i < num ; i++){
        height = array[i+num];
        myElements[i].style.minHeight = height+'px';
        myElements[i].style.opacity = 0.008*height;
    }
}

function visualize() {
    draw()

    function draw() {
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(array);

        canvasCtx.fillStyle = 'rgb(255, 255, 255)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
        canvasCtx.lineCap = 'round';

        canvasCtx.beginPath();

        let sliceWidth = WIDTH * 1.0 / num;
        let x = 0;


        for(let i = 0; i < num + 3; i++) {
            const freq = array[i+num];
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
