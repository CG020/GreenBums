import * as tmImage from '@teachablemachine/image';
let prediction_text;
let n;

class PlantModel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        this.render();
        await this.initModel();
    }

    async initModel() {
        const modelURL = './assets/model/model.json';
        const metadataURL = './assets/model/metadata.json';
        
        this.model = await tmImage.load(modelURL, metadataURL);
        this.maxPredictions = this.model.getTotalClasses();
        //console.log(this.maxPredictions)

        const flip = true; 
        this.webcam = new tmImage.Webcam(400, 400, flip); 
        await this.webcam.setup();
        await this.webcam.play();

        const buttonContainer = this.shadowRoot.querySelector('#button-container');
        
        const webcamContainer = this.shadowRoot.querySelector('#webcam-container');
        webcamContainer.appendChild(this.webcam.canvas);

        const labelContainer = this.shadowRoot.querySelector('#label-container');
        
        /*
        for (let i = 0; i < this.maxPredictions; i++) {
            labelContainer.appendChild(document.createElement('div'));
        }*/
        labelContainer.appendChild(document.createElement('div'));
        labelContainer.appendChild(document.createElement('div'));
        labelContainer.childNodes[0].innerHTML = "Plant Prediction:";
        n = labelContainer.childNodes[1];

        this.shadowRoot.querySelector('#predict-button').onclick = this.update_prediction;

        this.loop();
    }

    async loop() {
        this.webcam.update(); 
        await this.predict();
        window.requestAnimationFrame(() => this.loop());
    }

    async predict() {
        const predictions = await this.model.predict(this.webcam.canvas);
        //console.log(predictions)
        const labelContainer = this.shadowRoot.querySelector('#label-container');
        let max_pred = Math.max(...predictions.map(o => o.probability));
        let max_label;
        predictions.forEach((prediction, i) => {
            //const classPrediction = `${prediction.className}: ${prediction.probability.toFixed(2)}`;
            //labelContainer.childNodes[i].innerHTML = classPrediction;
            if (prediction.probability === max_pred){
                max_label = prediction.className;
            }
        });
        //labelContainer.childNodes[0].innerHTML = "Plant Prediction:";
        //labelContainer.childNodes[1].innerHTML = max_label;
        prediction_text = max_label;
    }

    async update_prediction(){
        //console.log(this.shadowRoot);
        //const labelContainer = this.shadowRoot.querySelector('#label-container');
        n.innerHTML = prediction_text;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    text-align: center;
                    font-family: serif;
                    max-width: 800px; 
                    margin: 0 auto;
                }
        
                .card-container {
                    background-color: rgba(255, 255, 255, 0.9);
                    border-radius: 16px; 
                    padding: 2rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    margin: 1.5rem;
                }
        
                .title {
                    font-size: 2.5rem;
                    color: #2d3436;
                    margin-bottom: 2rem;
                    font-family: cursive;
                }
        
                #button-container {
                    margin: 1.5rem 0;
                }
        
                #predict-button {
                    background-color: #31d53d;
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    font-size: 1.1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
        
                #predict-button:hover {
                    background-color: #2ab834;
                }
        
                #predict-button:active {
                    transform: translateY(1px);
                }
        
                #webcam-container {
                    margin: 1.5rem auto;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    background-color: #f5f5f5;
                    width: fit-content;
                }
        
                #webcam-container canvas {
                    display: block;
                }
        
                #label-container {
                    margin-top: 1.5rem;
                    padding: 1rem;
                    border-radius: 8px;
                    background-color: rgba(255, 255, 255, 0.9);
                }
        
                #label-container div:first-child {
                    color: #2d3436;
                    font-size: 1.4rem;
                    margin-bottom: 0.5rem;
                }
        
                #label-container div:last-child {
                    color: #31d53d;
                    font-size: 1.6rem;
                    font-weight: 500;
                }
        
                @media (max-width: 768px) {
                    .card-container {
                        margin: 1rem;
                        padding: 1rem;
                    }
        
                    .title {
                        font-size: 2rem;
                    }
        
                    #webcam-container {
                        width: 100%;
                    }
        
                    #webcam-container canvas {
                        width: 100%;
                        height: auto;
                    }
                }
            </style>
            <div class="card-container">
                <div class="title">Plant Health Checker</div>
                <div id="button-container">
                    <button id="predict-button">Predict</button>
                </div>
                <div id="webcam-container"></div>
                <div id="label-container"></div>
            </div>
        `;
    }
}

customElements.define('plant-model', PlantModel);
