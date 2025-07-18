
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
    $("#showAnswersBtn").click(function () {
        displayAnswers();
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

        $("#submitBtn").hide();
        displayAnswers();

        if (correct) { 
            setTimeout(function () {
                $("main").fireworks();
            }, 10);

            setTimeout(function () {
                $("main").fireworks("destroy");
                $("#playAgainBtn").show();
            }, 1500);
        } else {
            $("#playAgainBtn").show();
        }
    }
}

function saveResult(correct) {
    let results = JSON.parse(localStorage.getItem("results"));

    if (results == null) {
        results = {"attempts": 1};
        results["correct"] = correct ? 1 : 0;
        results["incorrect"] = correct ? 0 : 1;
        results["current_streak"] = correct ? 1 : 0;
        results["longest_streak"] = correct ? 1 : 0;
    } else {
        results["attempts"] = parseInt(results["attempts"]) + 1;
        if (correct) {
            results["correct"] = parseInt(results["correct"]) + 1;

            if (results["current_streak"] == null) {
                results["current_streak"] = 1;
            }
            if (results["longest_streak"] == null) {
                results["longest_streak"] = 1;
            }
            results["current_streak"] = parseInt(results["current_streak"]) + 1;
            if (results["current_streak"] > results["longest_streak"]) {
                results["longest_streak"] = results["current_streak"];
            }
        } else {
            results["incorrect"] = parseInt(results["incorrect"]) + 1;
            results["current_streak"] = 0;
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

        if (results["current_streak"] != null) {
            $("#currentStreak").text(results["current_streak"]);
        } else {
            $("#currentStreak").text("-");
        }
        if (results["longest_streak"] != null) {
            $("#longestStreak").text(results["longest_streak"]);
        } else {
            $("#longestStreak").text("-");
        }
    } else {
        $("#attempts").text("-");
        $("#correct").text("-");
        $("#percent").text("-");
        $("#currentStreak").text("-");
        $("#longestStreak").text("-");
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

function displayAnswers(consoleLog = false) {
    $("#topRow div").each(function (index) {
        let equation = $(this).text().trim();
        if (equation == '') { 
            equation = $($("#bottomRow div")[index]).text().trim();
        }
        let answerRaw = Number(solveEquation(equation));
        if (!Number.isInteger(answerRaw)) {
            answerRaw = answerRaw.toFixed(3);
        }

        if (consoleLog) {
            console.log(answerRaw);
        } else {
            $($("#answerRow div")[index]).html(answerRaw);
        }
    });
    if (!consoleLog) {
        $("#answerRow").show();
    }
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
    $("#showAnswersBtn").hide();
    $("#answerRow").hide();
}

function clearResultColors() {
    $("#bottomRow div").removeClass("correct");
    $("#bottomRow div").removeClass("incorrect");
}

function debug() {
    displayAnswers(true);
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
    if (solveEquation(parts) == 'Infinity' || solveEquation(parts) == 'NaN' || solveEquation(parts) == '-Infinity') { // javascript is weird
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