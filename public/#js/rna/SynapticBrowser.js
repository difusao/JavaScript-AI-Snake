var { Trainer, Architect, Neuron } = synaptic;

export default function SynapticBrowser(layers) {
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

    function DrawLayer(draw, ctx) {
        let nodeSize = draw.nodeSize;
        let nodeColorInput = draw.nodeColorInput;
        let nodeColorHidden = draw.nodeColorHidden;
        let nodeColorOutput = draw.nodeColorOutput;
        let nodeBorder = draw.nodeBorder;
        let distNode = draw.distNode;
        let distNodeHidden = draw.distNodeHidden;
        let distLayer = draw.distLayer;
        let posX = draw.posX;
        let posY = draw.posY;
        let colorLines = draw.colorLines;
        let widthInputLines = draw.widthInputLines;
        let colorHiddenLines = draw.colorHiddenLines;
        let widthHiddenLines = draw.widthHiddenLines;
        let colorOutputLines = draw.colorOutputLines;
        let widthOutputLines = draw.widthOutputLines;
        let lastInputX = 0;
        let lastHiddenX = 0;
        let c = 0;
        let c2 = distNodeHidden;

        // -------------------------------------------------

        let Inputs = layers.inputs;
        let Hiddens = layers.hiddens[0];
        let Outputs = layers.outputs;

        let HiddenLayer = layers.hiddens.length - 1;
        let HiddenTotal = HiddenLayer > 0 ? Math.pow(Hiddens, 2) * HiddenLayer : 0;

        let TotalWeightInput = Inputs * Hiddens;
        let TotalWeightHidden = HiddenTotal;
        // let TotalWeightOutput = Hiddens * Outputs;

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

        // -------------------------------------------------

        // Inputs
        for (let i = 0; i < layers.inputs; i++) {
            ctx.beginPath();
            ctx.fillStyle = (draw.inputs[i] >= draw.limitInputs[i] ? nodeColorInput[0] : nodeColorInput[1]);
            ctx.strokeStyle = nodeColorInput[1];
            ctx.arc(posX, posY + (i * distNode), nodeSize, 0 * Math.PI, 2.0 * Math.PI, true);
            ctx.fill();
            ctx.lineWidth = nodeBorder;
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = (draw.inputs[i] >= draw.limitInputs[i] ? nodeColorInput[0] : nodeColorInput[1]);
            ctx.font = draw.font;
            ctx.textAlign = "right";
            ctx.fillText(draw.inputs[i], posX - 110, posY + (i * distNode) - nodeSize / 2);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = (draw.inputs[i] >= draw.limitInputs[i] ? nodeColorInput[0] : nodeColorInput[1]);
            ctx.font = draw.font;
            ctx.textAlign = "right";
            ctx.fillText(draw.inputlabel[i], posX - 20, posY + (i * distNode) - nodeSize / 2);
            ctx.closePath();

            lastInputX = posX;
        }

        // Hidden
        for (let i = 0; i < layers.hiddens.length; i++) {
            for (let j = 0; j < layers.hiddens[0]; j++) {
                ctx.beginPath();
                ctx.fillStyle = nodeColorHidden[0];
                ctx.strokeStyle = nodeColorHidden[2];
                ctx.arc(lastInputX + distLayer + (i * distNodeHidden), posY + (j * distNode), nodeSize, 0 * Math.PI, 2.0 * Math.PI, true);
                ctx.fill();
                ctx.lineWidth = nodeBorder;
                ctx.stroke();
                ctx.closePath();

                lastHiddenX = lastInputX + distLayer + (i * distNodeHidden);
            }
        }

        // Outputs
        for (let i = 0; i < layers.outputs; i++) {
            ctx.beginPath();
            ctx.fillStyle = (draw.outputs[i] >= draw.limitOutput[i] ? nodeColorOutput[0] : nodeColorOutput[1]);
            ctx.strokeStyle = nodeColorOutput[0];
            ctx.arc(lastHiddenX + distLayer, posY + (i * distNode), nodeSize, 0 * Math.PI, 2.0 * Math.PI, true);
            ctx.fill();
            ctx.lineWidth = nodeBorder;
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = (draw.outputs[i] >= draw.limitOutput[i] ? nodeColorOutput[0] : nodeColorOutput[1]);
            ctx.font = draw.font;
            ctx.textAlign = "left";
            ctx.fillText(draw.outputlabel[i], lastHiddenX + distLayer + 20, posY + (i * distNode) - nodeSize / 2);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = (draw.outputs[i] >= draw.limitOutput[i] ? nodeColorOutput[0] : nodeColorOutput[1]);
            ctx.font = draw.font;
            ctx.textAlign = "left";
            ctx.fillText(draw.outputs[i], lastHiddenX + distLayer + 70, posY + (i * distNode) - nodeSize / 2);
            ctx.closePath();
        }

        // Input lines
        c = 0;
        for (let i = 0; i < layers.inputs; i++) {
            for (let j = 0; j < layers.hiddens[0]; j++) {
                ctx.beginPath();
                ctx.strokeStyle = (rndWeightIn[c] > 0 ? colorLines[0] : colorLines[1]);
                ctx.moveTo(lastInputX + nodeSize + 2, posY + i * distNode);
                ctx.lineTo(lastInputX + distLayer - nodeSize - 2, posY + (j * distNode));
                ctx.lineWidth = widthInputLines;
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
                    ctx.strokeStyle = (rndWeightHid[c] > 0 ? colorHiddenLines[0] : colorHiddenLines[1]);
                    ctx.moveTo(lastInputX + distLayer + (i * distNodeHidden) + nodeSize + 2, posY + (j * distNode));
                    ctx.lineTo(lastInputX + distLayer + (i * distNodeHidden) + c2 - nodeSize - 2, posY + (k * distNode));
                    ctx.lineWidth = widthHiddenLines;
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
                ctx.strokeStyle = (rndWeightOut[c] > 0 ? colorOutputLines[0] : colorOutputLines[1]);
                ctx.moveTo(lastHiddenX + nodeSize + 2, posY + (j * distNode));
                ctx.lineTo(lastHiddenX + distLayer - nodeSize - 2, posY + (i * distNode));
                ctx.lineWidth = widthOutputLines;
                ctx.stroke();
                ctx.closePath();

                c++;
            }
        }
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
    };
}