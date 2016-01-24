function getMessage(a,b) {
    if (typeof a == "boolean") {
        if (a) {
            return "Переданное GIF-изображение анимировано и содержит [" + b + "] кадров";
        }
        else {
            return "Переданное GIF-изображение не анимировано";
        }
    }
    if (typeof a == "number") {
        return "Переданное SVG-изображение содержит [" + a + "] объектов и [" + (parseInt(b) * 4) + "] аттрибутов";
    }

    if (a instanceof Array)
    {
        if (b instanceof Array)
        {
            return "Общая площадь артефактов сжатия: [" + calculateSquare(a, b) + "] пикселей";
        }
        else
        {
            return "Количество красных точек во всех строчках изображения: [" + arraySum(a) + "]";
        }
    }

}

function arraySum(arr)
{
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum;
}

function calculateSquare(aArr,bArr)
{
    var sum=0;
    if (aArr.length == bArr.length)
    {
        for (var i = 0; i < (aArr.length); i++)
        {
            sum += aArr[i]*bArr[i];
        }
    }
    return sum;
}


