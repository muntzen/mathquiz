$(document).ready(function () {
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
        }

    });

    $("#submitBtn").click(function () {
        checkAnswers();
    });
    $("#playAgainBtn").click(function () {
        initialize();
    });
    initialize();
});

function checkAnswers() {
    const vals = [];
    $("#bottomRow div").each(function () {
        let equation = $(this).text().trim();
        if (equation != '') {
            vals.push(eval($(this).text().trim()));
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

        if (correct) { 
            $("#submitBtn").hide();
            
            $("main").fireworks();
            setTimeout(function () {
                $("main").fireworks("destroy");
            }, 5000);
            setTimeout(function () {
                $("#playAgainBtn").show();
            }, 3000);
        } else {
            setTimeout(function () {
                alert("Incorrect!");
                setTimeout(function () {
                    clearResultColors();
                }, 1000);
            }, 500);
        }
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
    $("#playAgainBtn").hide();
}

function clearResultColors() {
    $("#bottomRow div").removeClass("correct");
    $("#bottomRow div").removeClass("incorrect");
}

function debug() {
    $("#topRow div").each(function () {
        $(this).html(eval($(this).text().trim()));
    });
}

function getRandomNumber(highest) {
    return Math.floor(Math.random() * highest);
}

function getGroupedOperation(operation, highest) {
    let equation = "";
    if (Math.floor(Math.random() * 2) == 0) {
        equation = "(" + getRandomNumber(highest) + " " + operation + " " + getRandomNumber(highest) + ")";
    } else {
        equation = getRandomNumber(highest);
    }
    return equation;
}

function getRandomOperation() {
    switch(Math.floor(Math.random() * 4)) {
        case 0:
            return "/";
        case 1:
            return "*";
        case 2:
            return "+";
        case 3:
            return "-";
    }
}

function buildEquation() {
    let highestNumber = 20;
    switch(Math.floor(Math.random() * 4)) {
        case 0: {// random division problem
            return getGroupedOperation(getRandomOperation(), highestNumber) + " / " + getGroupedOperation(getRandomOperation(), highestNumber);
        }
        case 1: {// random multiplication problem
            return getGroupedOperation(getRandomOperation(), highestNumber) + " * " + getGroupedOperation(getRandomOperation(), highestNumber);
        }
        case 2: {// random addition problem
            return getGroupedOperation(getRandomOperation(), highestNumber) + " + " + getGroupedOperation(getRandomOperation(), highestNumber);
        }
        case 3: {// random subtraction problem
            return getGroupedOperation(getRandomOperation(), highestNumber) + " - " + getGroupedOperation(getRandomOperation(), highestNumber);
        }
    }
}