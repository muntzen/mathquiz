
function setupGame() {
    $(".box").draggable({
        revert: "invalid",
        helper: "clone", // when you drag, it'll clone it instead of take it with you
        zIndex: 10000 // this is to make sure the dragged element is always on top
    });

    $(".box").droppable({
        accept: ".draggable",
        drop: function (_event, ui) {
            if ($(this).hasClass("draggable")) {
                ui.draggable.draggable("option", "revert", true);
            } else {
                $(this).html(ui.draggable.html());
                $(this).removeClass("droppable");
                $(this).addClass("draggable");

                ui.draggable.html("&nbsp;");
                ui.draggable.removeClass("draggable");
                ui.draggable.addClass("droppable");
            }

            // if all the boxes are filled, then submit button should be enabled
            let allFilled = true;
            $("#bottomRow div").each(function () {
                if ($(this).text().trim() == "") {
                    allFilled = false;
                }
            });
            $("#submitBtn").prop("disabled", !allFilled);
            $("#submitBtn").addClass(allFilled ? "enabled" : "disabled");
            $("#submitBtn").removeClass(allFilled ? "disabled" : "enabled");
        }

    });

    $("#submitBtn").click(function () {
        checkAnswers();
    });
    $("#playAgainBtn").click(function () {
        initialize();
    });
    initialize();
}

function checkAnswers() {
    const vals = [];
    $("#bottomRow div").each(function () {
        let equation = $(this).text().trim();
        if (equation != '') {
            vals.push(solveEquation($(this).text()));
        }
    });
    if (vals.length < $("#bottomRow div").length) {
        alert("Please fill in all the boxes");
    } else {
        let correct = true;
        let previousVal = vals[0];
        for (let i = 1; i < vals.length; i++) {
            if (previousVal > vals[i]) {
                correct = false;
                if (i > 1) {
                    $("#bottomRow div").eq(i-1).addClass("correct");        
                }
                $("#bottomRow div").eq(i-1).addClass("incorrect");
                break;
            }

            $("#bottomRow div").eq(i-1).addClass("correct");
            if (i == vals.length - 1) {
                $("#bottomRow div").eq(i).addClass("correct");    
            }
            previousVal = vals[i];
        }

        saveResult(correct);

        if (correct) { 
            setTimeout(function () {
                $("#submitBtn").hide();
                $("main").fireworks();
            }, 10);

            setTimeout(function () {
                $("main").fireworks("destroy");
                $("#playAgainBtn").show();
            }, 3000);
        } else {
            setTimeout(function () {
                clearResultColors();
            }, 2000);
        }
    }
}

function saveResult(correct) {
    let results = JSON.parse(localStorage.getItem("results"));

    if (results == null) {
        results = {"attempts": 1};
        results["correct"] = correct ? 1 : 0;
        results["incorrect"] = correct ? 0 : 1;
    } else {
        results["attempts"] = parseInt(results["attempts"]) + 1;
        if (correct) {
            results["correct"] = parseInt(results["correct"]) + 1;
        } else {
            results["incorrect"] = parseInt(results["incorrect"]) + 1;
        }
    }
    
    localStorage.setItem("results", JSON.stringify(results));
}

function showStats() {
    let results = JSON.parse(localStorage.getItem("results"));
    if (results != null) {
        $("#attempts").text(results["attempts"]);
        $("#correct").text(results["correct"]);
        let percent = (results["correct"] / results["attempts"]) * 100;
        if (Number.isInteger(percent)) {
            $("#percent").text(percent + "%");
        } else {
            $("#percent").text(percent.toFixed(2) + "%");
        }
    } else {
        $("#attempts").text(0);
        $("#correct").text(0);
    }

    $("#playAgainBtn").click(function () {
        window.location.href = "index.html";
    });

    $("#clearStatsBtn").click(function () {
        if (confirm("Are you sure you want to clear your stats?")) {
            localStorage.removeItem("results");
            $("#attempts").text(0);
            $("#correct").text(0);
            $("#percent").text("--");
        }
    });
}

function prettyPrintAnswers(appendAnswer = true) {
    $("#topRow div").each(function () {
        let answerRaw = Number(solveEquation($(this).text()));
        if (!Number.isInteger(answerRaw)) {
            answerRaw = answerRaw.toFixed(3);
        }

        if (appendAnswer) {
            $(this).html($(this).text() + " <br/><br/>= " + answerRaw);
        } else {
            $(this).html(answerRaw);
        }
    });
}

function initialize() {
    $("main").fireworks("destroy");
    clearResultColors();

    $("#topRow div").each(function () {
        $(this).html(buildEquation());
        $(this).removeClass("droppable");
        $(this).addClass("draggable");
    });

    $("#bottomRow div").each(function () {
        $(this).html("&nbsp;");
        $(this).removeClass("draggable");
        $(this).addClass("droppable");
    });

    $("#submitBtn").show();
    $("#submitBtn").prop("disabled", true);
    $("#submitBtn").addClass("disabled");
    $("#submitBtn").removeClass("enabled");

    $("#playAgainBtn").hide();
}

function clearResultColors() {
    $("#bottomRow div").removeClass("correct");
    $("#bottomRow div").removeClass("incorrect");
}

function debug() {
    prettyPrintAnswers(false);
}

function getRandomNumber(highestNumber) {
    return Math.floor(Math.random() * highestNumber);
}

function getGroupedOperation(operation, highestNumber) {
    let equation = "";
    if (Math.floor(Math.random() * 2) == 0) {
        equation = "(" + getRandomNumber(highestNumber) + " " + operation + " " + getRandomNumber(highestNumber) + ")";
    } else {
        equation = getRandomNumber(highestNumber);
    }
    return equation;
}

function buildEquationParts(mainOperation, highestNumber) {
    let parts = "";
    let complex = Math.floor(Math.random() * 2) == 0;
    if (complex) {
        parts += "(" + getRandomNumber(highestNumber) + " " + getRandomOperation() + " " + getRandomNumber(highestNumber) + ")";
    } else {
        parts += getRandomNumber(highestNumber);
    }

    parts += " " + mainOperation + " ";

    // if already complex, or we randomly decide to be complex, then just add a number
    if (complex || Math.floor(Math.random() * 2) == 0) {
        parts += getRandomNumber(highestNumber);
    } else {
        parts += "(" + getRandomNumber(highestNumber) + " " + getRandomOperation() + " " + getRandomNumber(highestNumber) + ")";
    }

    // let's make sure things are sane
    if (solveEquation(parts) == 'Infinity') {
        return buildEquationParts(mainOperation, highestNumber);
    } else {
        return parts;
    }
}

function solveEquation(equation) {
    equation = equation.trim();
    let replacements = {"&divide;": "/", "&times;": "*", "&plus;": "+", "&minus;": "-", 
        "÷": "/", "×": "*", "−": "-"};// maybe put in unicode?
    for (let key in replacements) {
        let regex = RegExp(key, "g");
        equation = equation.replace(regex, replacements[key]);
    }
    return eval(equation);
}

function getRandomOperation() {
    switch(Math.floor(Math.random() * 4)) {
        case 0:
            return "&divide;";
        case 1:
            return "&times;";
        case 2:
            return "&plus;";
        case 3:
            return "&minus;";
    }
}

function buildEquation() {
    let highestNumber = 20;
    switch(Math.floor(Math.random() * 4)) {
        case 0: {// random division problem
            // return getGroupedOperation(getRandomOperation(), highestNumber) + " / " + getGroupedOperation(getRandomOperation(), highestNumber);
            return buildEquationParts("&divide;", highestNumber);
        }
        case 1: {// random multiplication problem
            // return getGroupedOperation(getRandomOperation(), highestNumber) + " * " + getGroupedOperation(getRandomOperation(), highestNumber);
            return buildEquationParts("&times;", highestNumber);
        }
        case 2: {// random addition problem
            // return getGroupedOperation(getRandomOperation(), highestNumber) + " + " + getGroupedOperation(getRandomOperation(), highestNumber);
            return buildEquationParts("&plus;", highestNumber);
        }
        case 3: {// random subtraction problem
            // return getGroupedOperation(getRandomOperation(), highestNumber) + " - " + getGroupedOperation(getRandomOperation(), highestNumber);
            return buildEquationParts("&minus;", highestNumber);
        }
    }
}