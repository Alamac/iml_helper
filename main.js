const queryDict = {
    orderNumber: '#MainPanel-body > fieldset:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2)',
    orderCreateDate: '#MainPanel-body > fieldset:nth-child(1) > table > tbody > tr:nth-child(4) > td:nth-child(2)',
    orderSum: '#MainPanel-body > fieldset:nth-child(3) > table > tbody > tr:nth-child(3) > td:nth-child(2)',
    transactionSum: '#MainPanel-body > fieldset:nth-child(3) > table > tbody > tr:nth-child(10) > td:nth-child(2) > span',
    commissionSum: '#MainPanel-body > fieldset:nth-child(3) > table > tbody > tr:nth-child(5) > td:nth-child(2)',
    deliverySum: '#MainPanel-body > fieldset:nth-child(3) > table > tbody > tr:nth-child(4) > td:nth-child(2)',
    deliveryToCitySum: '#MainPanel-body > fieldset:nth-child(3) > table > tbody > tr:nth-child(9) > td:nth-child(2)',
    buttonSelector: '#ctl01 > table > tbody > tr > td.left',
    positionSelector = '.x-tab-inner',
    rowsSelector = '#tabdoppanel-body > .x-grid-with-row-lines > .x-panel-body > div > table > tbody > .x-grid-row'
};

const copyTextToClipboard = text => {
    var textArea = document.createElement("textarea");
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = text;

    document.body.appendChild(textArea);

    textArea.select();
    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying template ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);

    var copiedText = document.getElementById('copied');
    copiedText.style.display = 'block';
    copiedText.style.opacity = '1.0';
    setTimeout(function () {
        copiedText.style.opacity = '0';
    }, 100);
    setTimeout(function () {
        copiedText.style.display = 'none';
    }, 1000);
};

const getTextContentByQuery = query => {
    let node = document.querySelector(query);
    let textContent = node.textContent;
    return textContent;
};

const getProcessedData = dict => {
    const result = {};
    for (key in dict) {
        value = getTextContentByQuery(dict[key]);
        value = value.replace(',', '.');
        if (key == 'deliverySum' && getTextContentByQuery(queryDict.deliveryToCitySum) != 0) {
            let a = Number(value) + Number(getTextContentByQuery(queryDict.deliveryToCitySum).replace(',', '.'))
            result[key] = a.toFixed(2);
        }
        else {
            result[key] = value
        }
    }
    return result;
};

const prepareInsertString = dict => {
    let result = '';
    for (key in dict) {
        value = dict[key];
        if (key == 'orderCreateDate') {
            result += value + ';;'
        }
        else if (key == 'deliverySum') {
            result += value;
        }
        else {
            result += value + ';'
        }
    }
    return result;
};

const changeTabToPositions = () => {
    const pos = document.querySelectorAll(queryDict.positionSelector)[1];
    pos.click();
}

const prepareGoodsDict = () => {
    const goodsDict = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0
    };
    let rows = document.querySelectorAll(queryDict.rowsSelector);
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].querySelector('td:nth-child(5) > div').textContent == 'Товар') {
            let goodName = rows[i].querySelector('td:nth-child(2) > div').textContent;
            let good = findGoodInString(goodName);
            ++goodsDict[good];
        }
    }
    return goodsDict;
}

function findGoodInString(s) {
    const lowerS = s.toLowerCase();
    if (lowerS.startsWith("планка")) {
        return 1;
    }
    else if (lowerS.startsWith("валик")) {
        return 2;
    }
    else if (lowerS.startsWith("бэк") || lowerS.startsWith("бек")) {
        return 4;
    }
    else if (lowerS.startsWith("хед") || lowerS.startsWith("хэд")) {
        return 5;
    }
    else if (lowerS.startsWith("блок")) {
        return 3;
    }
    else if (lowerS.startsWith("чехол")) {
        return 7;
    }
    else if (lowerS.startsWith("книга")) {
        return 6;
    }
    else {
        return "ERROR";
    }
}

const prepareGoodsString = dict => {
    let s = '';
    for (key in dict) {
        if (dict[key] == 0) {
            s = s + ';'
        }
        else {
            s = s + dict[key] + ';'
        }
    }
    s = s.substring(0, s.length - 1);
    return s;
}

const sleep = milliseconds => {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

const copyString = dict => {
    let processedData = getProcessedData(dict);
    let processedString = prepareInsertString(processedData);
    changeTabToPositions();
    sleep(1000);
    let goodsString = prepareGoodsString(prepareGoodsDict());
    let resultString = processedString + ";;;" + goodsString;
    copyTextToClipboard(resultString);
};

const createButton = selector => {
    let parent = document.querySelector(selector);
    let div = document.createElement('div');
    let p = document.createElement('p');
    div.appendChild(p);
    p.textValue = 'COPY';
    div.style.width = '300px';
    div.style.height = '50px';
    div.style.backgroundColor = 'blue';
    div.style.cursor = 'pointer';
    div.style.left = '0px';
    div.style.top = '0px';
    div.style.position = 'fixed';
    div.style.zIndex = 999;
    parent.appendChild(div);
    div.addEventListener('click', function() {
        copyString(queryDict);
    });
};

setTimeout(createButton(queryDict.buttonSelector), 10000);