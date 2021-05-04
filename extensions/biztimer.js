class BusinessTimerExtension {
    nextCollection = this.getNextCollectionTime();

    constructor(rootID) {
        this.rootID = rootID;
        let style = this.getStyleElement();
        let root = this.getRootElement();
        let timer = document.createElement('p');
        let button = this.getButtonElement();
        root.appendChild(timer);
        root.appendChild(button);
        document.head.appendChild(style);
        document.body.appendChild(root);
    }

    getNextCollectionTime() {
        let now = new Date();
        let nextCollectionHour = Math.round((now.getUTCHours() + 2) / 3) * 3;
        if (nextCollectionHour >= 24) nextCollectionHour = 0;
        let nextCollection = now;
        nextCollection.setUTCHours(nextCollectionHour);
        nextCollection.setUTCMinutes(0);
        nextCollection.setUTCSeconds(0);
        return nextCollection;
    }

    tick() {
        let now = new Date();
        let diff = this.nextCollection - now;
        if (diff <= 0) {
            this.nextCollection = this.getNextCollectionTime();
            this.pauseInterval();
        }
        else this.setTimer(diff);
    }
    
    pauseInterval() {
        clearInterval(biztimerInterval);
        document.querySelector(`#${this.rootID} p`).innerHTML = '<span class="rainbow">Business stacks ready!</span>';
        document.querySelector(`#${this.rootID} button`).style.display = 'initial';
    }

    continueInterval() {
        document.querySelector(`#${this.rootID} p`).innerHTML = '';
        document.querySelector(`#${this.rootID} button`).style.display = 'none';
        biztimerInterval = setInterval(this.tick.bind(this), 1000);
    }

    setTimer(diff) {
        let h = Math.floor(diff / (1000 * 3600));
        let m = Math.floor((diff - h * 3600 * 1000) / (1000 * 60));
        let s = Math.floor((diff - h * 3600 * 1000 - m * 60 * 1000) / 1000);
        document.querySelector(`#${this.rootID} p`).innerHTML = `Next collection:<br><span class="pricedown large">${h}:${(m < 10 ? '0' : '') + m}:${(s < 10 ? '0' : '') + s}</span>`;
    }

    getStyleElement() {
        let style = document.createElement('style');
        style.appendChild(document.createTextNode(`
            @font-face {
                font-family: Pricedown;
                src: url(nui://vrp/gui/fonts/Pdown.woff);
            }

            #${this.rootID} {
                position: absolute;
                top: 155px;
                right: 10px;
                z-index: 25;
                text-align: right;
                color: white;
                font-family: sans-serif;
                font-size: 20px;
                text-shadow: rgb(0, 0, 0) 1px 0px 0px, rgb(0, 0, 0) 0.533333px 0.833333px 0px, rgb(0, 0, 0) -0.416667px 0.916667px 0px, rgb(0, 0, 0) -0.983333px 0.133333px 0px, rgb(0, 0, 0) -0.65px -0.75px 0px, rgb(0, 0, 0) 0.283333px -0.966667px 0px, rgb(0, 0, 0) 0.966667px -0.283333px 0px;
            }

            #${this.rootID} p {
                margin: 10px 0;
            }

            #${this.rootID} .large {
                font-size: 30px;
            }

            #${this.rootID} .pricedown {
                font-family: Pricedown;
            }

            #${this.rootID} .rainbow {
                animation: rainbow 5s infinite; 
                font-weight: bold;
                text-shadow: none;
            }

            #${this.rootID} button {
                display: none;
                float: right;
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                background-color: #28a745;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.075);
                color: white;
                font-size: 16px;
            }

            #${this.rootID} button:active, #${this.rootID} button:hover, #${this.rootID}:focus {
                border: none;
                background-color: #218838;
            }

            @keyframes rainbow{
                0% {color: orange;}	
                10% {color: purple;}	
                20% {color: red;}
                30% {color: cadetblue;}
                40% {color: yellow;}
                50% {color: coral;}
                60% {color: green;}
                70% {color: cyan;}
                80% {color: deeppink;}
                90% {color: dodgerblue;}
                100% {color: orange;}
            }
        `));
        return style;
    }

    getRootElement() {
        let root = document.createElement('div');
        root.id = this.rootID;
        return root;
    }

    getButtonElement() {
        let button = document.createElement('button');
        button.innerText = 'Collected';
        button.addEventListener('click', this.continueInterval.bind(this));
        return button;
    }
}

let biztimer = new BusinessTimerExtension('tthook-biztimer');
let biztimerInterval = setInterval(biztimer.tick.bind(biztimer), 1000);
