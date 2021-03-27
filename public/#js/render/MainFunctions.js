export default function MainFunctions(content) {
    const angleBetween = function (p1, p2) {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    };

    const distBetween = function (p1, p2) {
        return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
    }

    const rndFloat = function (min, max) {
        return min + (max - min) * Math.random();
    }

    const rndInt = function (min, max) {
        return Math.floor(min + (max - min) * Math.random());
    }

    const randomTen = function (min, max) {
        return Math.round((Math.random() * (max - min) + min) / 10) * 10;
    }

    const getMousePos = function (canvas, evt) {
        let rect = canvas.getBoundingClientRect();

        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    const DistanceEuclidean = function (x1, y1, x2, y2) {
        let x_d = x2 - x1;
        let y_d = y2 - y1;

        return (Math.sqrt(Math.pow(x_d, 2) + Math.pow(y_d, 2)));
    }

    function ArrayOrder(arrayobj) {
        return arrayobj.sort(function (a, b) {
            return b.value - a.value
        });
    }

    function ArrayMax(arr) {
        let len = arr.length, max = -Infinity;
        let i = 0;

        while (len--) {
            if (Number(arr[len]) > max) {
                max = Number(arr[len]);
                i = len;
            }
        }

        return { max: max, pos: i };
    };

    function ArrayMin(arr) {
        let len = arr.length, min = Infinity;
        let i = 0;

        while (len--) {
            if (Number(arr[len]) < min) {
                min = Number(arr[len]);
                i = len;
            }
        }

        return { min: min, pos: i };
    };

    function ObjectOrderDesc(arrayobj, field) {
        return arrayobj.sort(function (a, b) {
            return b[field] - a[field]
        });
    }
    
    function ObjectOrderAsc(arrayobj, field) {
        return arrayobj.sort(function (a, b) {
            return a[field] - b[field]
        });
    }

    return {
        angleBetween,
        distBetween,
        rndFloat,
        rndInt,
        randomTen,
        getMousePos,
        DistanceEuclidean,
        ArrayMax,
        ArrayMin,
        ArrayOrder,
        ObjectOrderDesc,
        ObjectOrderAsc,
    };
}