var { Trainer, Architect, Neuron } = synaptic;

export default function SynapticBrowser(layers, ctx) {
    let arrLayer = [];
    arrLayer.push(layers.inputs);

    for (var i in layers.hiddens)
        arrLayer.push(layers.hiddens[i]);

    arrLayer.push(layers.outputs);

    const totalbias = layers.inputs + layers.hiddens[0] + layers.outputs;
    const totalweights = layers.inputs * layers.hiddens[0] + layers.hiddens[0] * layers.outputs;

    var network = new synaptic.Architect.Perceptron(...arrLayer);
    var FuncActiv;
    
    const neurons = network.neurons();
    const trainner = new synaptic.Trainer(network);
    const networkJson = network.toJSON();

    function DrawLayer(draw) {
        let nodeSize = 12;
        let distNode = 31;
        let distNodeHidden = 200;
        let distLayer = 250;
        let posX = 100;
        let posY = 25;
        let lastInputX = 0;
        let lastHiddenX = 0;
        let c = 0;
        let c2 = distNodeHidden;

        // clear
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.fillStyle = draw.bgFillStyle;
        ctx.strokeStyle = draw.bgStrokeStyle;
        ctx.fillRect(0, 0, draw.bgWidth, draw.bgHeight);
        ctx.strokeRect(0, 0, draw.bgWidth, draw.bgHeight);
        ctx.closePath();

        // Info
        ctx.beginPath();
        ctx.fillStyle = "#ffffff";
        ctx.font = "Bold 10px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Function: " + FuncActiv, draw.bgWidth - 300, draw.bgHeight - 200);
        ctx.fillText("Layers: " + layers.inputs + ", " + layers.hiddens + ", " + layers.outputs, draw.bgWidth - 300, draw.bgHeight - 180);
        ctx.closePath();

        // Inputs
        for (let i = 0; i < layers.inputs; i++) {
            ctx.beginPath();
            ctx.fillStyle = (draw.inputs[i] > 0 ? "#00ff00" : "#000000");
            ctx.strokeStyle = (draw.inputs[i] > 0 ? "#ffffff" : "#606060");
            ctx.arc(posX, posY + (i * distNode), nodeSize, 0 * Math.PI, 2.0 * Math.PI, true);
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = (draw.inputs[i] > 0 ? "#00ff00" : "#606060");
            ctx.font = "14px Arial";
            ctx.textAlign = "right";
            ctx.fillText(draw.inputs[i].toFixed(4), posX - 20, posY + (i * distNode) + nodeSize / 2 - 8);
            ctx.closePath();

            lastInputX = posX;
        }

        // Hidden
        for (let i = 0; i < layers.hiddens.length; i++) {
            for (let j = 0; j < layers.hiddens[0]; j++) {
                ctx.beginPath();
                ctx.fillStyle = "#C0C0C0";
                ctx.strokeStyle = "#606060";
                ctx.arc(lastInputX + distLayer + (i * distNodeHidden), posY + (j * distNode), nodeSize, 0 * Math.PI, 2.0 * Math.PI, true);
                ctx.fill();
                ctx.lineWidth = 4;
                ctx.stroke();
                ctx.closePath();

                lastHiddenX = lastInputX + distLayer + (i * distNodeHidden);
            }
        }

        // Outputs
        for (let i = 0; i < layers.outputs; i++) {
            ctx.beginPath();
            // ctx.fillStyle = (draw.inputs[i] > 0.1 ? "#00ff00" : "#000000");
            // ctx.strokeStyle = (draw.outputs[i] > draw.limitOutput[i] ? "#00ff00" : "#ffffff");
            ctx.fillStyle = (draw.limitOutput[i] == 1 > 0 ? "#00ff00" : "#000000");
            ctx.strokeStyle = (draw.limitOutput[i] == 1 > 0 ? "#ffffff" : "#606060");
            ctx.arc(lastHiddenX + distLayer, posY + (i * distNode), nodeSize, 0 * Math.PI, 2.0 * Math.PI, true);
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.closePath();

            // if (draw.limitOutput[i] == 1)
            //     console.log(draw.limitOutput[i]);

            ctx.beginPath();
            // ctx.fillStyle = (draw.outputs[i] > draw.limitOutput[i] ? "#00ff00" : "#ffffff");
            ctx.fillStyle = (draw.limitOutput[i] == 1 ? "#00ff00" : "#606060");
            ctx.font = "20px 'Wingdings 3'";
            ctx.textAlign = "center";
            ctx.fillText(draw.outputsSymbol[i], lastHiddenX + distLayer + 30, posY + (i * distNode) + nodeSize / 2);
            ctx.closePath();

            ctx.beginPath();
            // ctx.fillStyle = (draw.outputs[i] > draw.limitOutput[i] ? "#00ff00" : "#ffffff");
            ctx.fillStyle = (draw.limitOutput[i] == 1 ? "#00ff00" : "#606060");
            ctx.font = "14px Arial";
            ctx.textAlign = "left";
            ctx.fillText(draw.outputs[i].toFixed(4), lastHiddenX + distLayer + 50, posY + (i * distNode) + nodeSize / 2);
            ctx.closePath();
        }

        // Input lines
        c = 0;
        for (let i = 0; i < layers.inputs; i++) {
            for (let j = 0; j < layers.hiddens[0]; j++) {
                ctx.beginPath();
                ctx.strokeStyle = (draw.linesInputs[c] < 0 ? "#ff0000" : "#0000ff");
                ctx.moveTo(lastInputX + nodeSize + 2, posY + i * distNode);
                ctx.lineTo(lastInputX + distLayer - nodeSize - 2, posY + (j * distNode));
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.closePath();

                c++;
            }
        }

        // Linhas Hidden
        c = 0;
        for (let i = 0; i < layers.hiddens.length - 1; i++) {
            for (let j = 0; j < layers.hiddens[0]; j++) {
                for (let k = 0; k < layers.hiddens[0]; k++) {
                    ctx.beginPath();
                    ctx.strokeStyle = (draw.linesHidden[c] < 0 ? "#ff0000" : "#0000ff");
                    ctx.moveTo(lastInputX + distLayer + (i * distNodeHidden) + nodeSize + 2, posY + (j * distNode));
                    ctx.lineTo(lastInputX + distLayer + (i * distNodeHidden) + c2 - nodeSize - 2, posY + (k * distNode));
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.closePath();

                    c++;
                }
            }
            c2 = c2 + 0;
        }

        // Linhas Output
        c = 0;
        for (let i = 0; i < layers.outputs; i++) {
            for (let j = 0; j < layers.hiddens[0]; j++) {
                ctx.beginPath();
                ctx.strokeStyle = (draw.linesOutputs[c] < 0 ? "#ff0000" : "#0000ff");
                ctx.moveTo(lastHiddenX + nodeSize + 2, posY + (j * distNode));
                ctx.lineTo(lastHiddenX + distLayer - nodeSize - 2, posY + (i * distNode));
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.closePath();

                c++;
            }
        }
    }

    function ShowDiagram(params) {
        let rndInput = [];
        let rndOutput = [];

        let Inputs = layers.inputs;
        let Hiddens = layers.hiddens[0];
        let Outputs = layers.outputs;

        let HiddenLayer = layers.hiddens.length - 1;
        let HiddenTotal = HiddenLayer > 0 ? Math.pow(Hiddens, 2) * HiddenLayer : 0;

        let TotalWeightInput = Inputs * Hiddens;
        let TotalWeightHidden = HiddenTotal;
        let TotalWeightOutput = Hiddens * Outputs;

        // setWeights(getRandomFloat(-1, 1, (TotalWeightInput + TotalWeightHidden + TotalWeightOutput)));
        // rndInput = getRandomFloat(-1, 1, Inputs);
        // rndOutput = network.activate(rndInput);
        // rndOutput = network.activate(params.inputs);

        let rndWeightIn = [];
        let rndWeightHid = [];
        let rndWeightOut = [];
        let weights = getWeights();

        for (var i in weights)
            if (i < TotalWeightInput)
                rndWeightIn.push(weights[i]);

        for (var i in weights)
            if (i >= TotalWeightInput && i < (TotalWeightInput + TotalWeightHidden) && TotalWeightHidden > 0)
                rndWeightHid.push(weights[i]);

        for (var i in weights)
            if (i >= (TotalWeightInput + TotalWeightHidden))
                rndWeightOut.push(weights[i]);

        var draw = {
            inputs: params.inputs,
            outputs: params.outputs,
            linesInputs: rndWeightIn,
            linesHidden: rndWeightHid,
            linesOutputs: rndWeightOut,
            limitOutput: params.limitOutput,
            bgWidth: params.bgWidth,
            bgHeight: params.bgHeight,
            bgFillStyle: params.bgFillStyle,
            bgStrokeStyle: params.bgStrokeStyle,
            outputsSymbol: ["Å", "Ç", "Æ", "È"]
        };

        /*
  LEFT_KEY = 37;
  UP_KEY = 38;
  RIGHT_KEY = 39;
  DOWN_KEY = 40;
  */

        DrawLayer(draw);
    }

    function getRandomFloat(min, max, length) {
        let value = [];

        for (let i = 0; i < length; i++)
            // value.push(Number((Math.random() * (max - min) + min).toFixed(4)));
            // value.push(parseFloat((Math.random() * (max - min) + min).toFixed(5)));
            value.push(Math.random() * (max - min) + min);

        return value;
    }

    function getRandomInt(min, max, length) {
        let value = [];

        for (let i = 0; i < length; i++) {
            value.push(Math.floor(Math.random() * max) + min);
        }

        return value;
    }

    function getJSON() {
        return networkJson;
    }

    function getWeights() {
        let weights = [];

        for (let i = 0; i < networkJson.connections.length; i++)
            weights.push(networkJson.connections[i].weight);

        return weights;
    }

    function getBias() {
        let weights = [];

        for (let i = 0; i < networkJson.neurons.length; i++)
            weights.push(networkJson.neurons[i].bias);

        return weights;
    }

    function setWeights(weights) {
        for (let i = 0; i < networkJson.connections.length; i++)
            if (typeof (weights[i]) != 'undefined')
                networkJson.connections[i].weight = weights[i];

        network = synaptic.Network.fromJSON(networkJson);
    }

    function setBias(weights) {
        for (let i = 0; i < networkJson.neurons.length; i++)
            if (typeof (weights[i]) != 'undefined')
                networkJson.neurons[i].bias = weights[i];

        network = synaptic.Network.fromJSON(networkJson);
    }

    function setBiasDefault(value) {
        for (let i = 0; i < networkJson.neurons.length; i++)
            networkJson.neurons[i].bias = value;

        network = synaptic.Network.fromJSON(networkJson);
    }

    function setBiasRnd(min, max) {
        let biaslist = getRandomFloat(min, max, totalbias);
        setBias(biaslist);
    }

    function setWeightsRnd(min, max) {
        let weightlist = getRandomFloat(min, max, totalweights);
        setWeights(weightlist);
        network = synaptic.Network.fromJSON(networkJson);
    }

    function setWeightsAndBiasRnd(min, max) {
        let weightlist = getRandomFloat(min, max, totalweights);
        let biaslist = getRandomFloat(min, max, totalbias);

        setWeights(weightlist);
        setBias(biaslist);
    }

    function TrainnerTest(dataset, rateLearn, errorMax, epochMax, shuffle, jump) {
        let cnt = 0;
        trainner.train(dataset, {
            iterations: epochMax,
            rate: rateLearn,
            error: errorMax,
            shuffle: shuffle,
            log: jump,
            schedule: {
                every: jump,
                do: function (data) {
                    cnt++;
                    // console.log(getWeights());
                }
            }
        });
        trainner.iterations = cnt;
    }

    function Trainner(dataset, rateLearn, errorMax, epochMax, shuffle, jump, chart) {
        const trainner = new synaptic.Trainer(network);
        let axys = [];
        let cnt = 0;

        if (chart) {
            network.setOptimize(true);
            trainner.train(dataset, {
                iterations: epochMax,
                rate: rateLearn,
                error: errorMax,
                shuffle: shuffle,
                log: jump,
                schedule: {
                    every: jump,
                    do: function (data) {
                        axys.push({
                            x: data.iterations,
                            y: data.error,
                            lineColor: "#C0504E",
                            includeZero: false,
                            minimum: 0,
                        });
                        cnt++;
                        // console.log("error:", data.error, "epochs:", data.iterations, "rate:", data.rate);
                        // if (someCondition)
                        //     return true;
                    }
                },
            });
            trainner.iterations = cnt;
        } else {
            trainner.train(dataset, {
                iterations: epochMax,
                rate: rateLearn,
                error: errorMax,
                shuffle: shuffle,
                log: jump,
                schedule: {
                    every: jump,
                    do: function (data) {
                        cnt++
                    }
                }
            });
            trainner.iterations = cnt;
        }

        return {
            trainner,
            axys,
        }
    }

    function TestSimple(dataset) {
        let out = [];

        for (let i = 0; i < dataset.length; i++)
            out.push({
                input: dataset[i].input,
                ideal: dataset[i].output,
                output: network.activate(dataset[i].input)
            });

        return out;
    }

    function Output(input) {
        return network.activate(input);
    }

    function setActivateFunction(actFunc) {
        let af = null;
        let afText = null;

        if (actFunc == 0) {
            af = Neuron.squash.HLIM;
            afText = "HLIM";
        } else if (actFunc == 1) {
            af = Neuron.squash.IDENTITY;
            afText = "IDENTITY";
        } else if (actFunc == 2) {
            af = Neuron.squash.LOGISTIC;
            afText = "LOGISTIC";
        } else if (actFunc == 3) {
            af = Neuron.squash.ReLU;
            afText = "ReLU";
        } else {
            af = Neuron.squash.TANH;
            afText = "TANH";
        }
        
        for (let i = 0; i < neurons.length; i++)
            neurons[i].neuron.squash = af;

        FuncActiv = afText;
    }

    function stringCsv(stringCsv) {
        let data = [];
        let csvheader = [];
        let cols = getcolsCSV(layers.inputs, layers.outputs);

        csvtojson({
            headers: cols,
            trim: true,
            flatKeys: false,
            delimiter: ",",
        })
            .fromString(stringCsv, 'utf-8')
            .preFileLine((fileLineString, lineIdx) => {
                if (lineIdx === 0) {
                    csvheader = fileLineString.split(/\s*,\s*/);
                }
                return fileLineString;
            })
            .subscribe((jsonObj, lineNumber) => {
                data.push(jsonObj);
            })
            .then((jsonObj) => {
                return new Promise((resolve, reject) => {
                    resolve(data);
                });
            })

        return data;
    }

    function importCsv(csvFilePath) {
        let data = [];
        let csvheader = [];
        let cols = getcolsCSV(layers.inputs, layers.outputs);

        csvtojson({
            headers: cols,
            trim: true,
            flatKeys: false,
            delimiter: ",",
        })
            .fromFile(csvFilePath, 'utf-8')
            .preFileLine((fileLineString, lineIdx) => {
                if (lineIdx === 0) {
                    csvheader = fileLineString.split(/\s*,\s*/);
                }
                return fileLineString;
            })
            .subscribe((jsonObj, lineNumber) => {
                data.push(jsonObj);
            })
            .then((jsonObj) => {
                return new Promise((resolve, reject) => {
                    resolve(data);
                });
            })

        return data;
    }

    function getcolsCSV(inputs, outputs) {
        let cols = [];

        for (var i = 0; i < (inputs); i++) {
            cols.push("input." + i);
        }

        for (var i = 0; i < (outputs); i++) {
            cols.push("output." + i);
        }

        return cols;
    }

    return {
        totalbias,
        totalweights,
        getJSON,
        getWeights,
        getBias,
        setWeights,
        setBias,
        setWeightsRnd,
        setBiasRnd,
        setBiasDefault,
        Trainner,
        Output,
        TestSimple,
        setActivateFunction,
        importCsv,
        stringCsv,
        getRandomFloat,
        setWeightsAndBiasRnd,
        DrawLayer,
        TrainnerTest,
        getRandomInt,
        ShowDiagram,
    };
}