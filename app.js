$(document).ready(function () {

    var firebaseConfig = {
        apiKey: "AIzaSyCdgCTkHDsKFskFFi8R2EoIAgYojT4as1A",
        authDomain: "train-scheduler-f310c.firebaseapp.com",
        databaseURL: "https://train-scheduler-f310c.firebaseio.com",
        projectId: "train-scheduler-f310c",
        storageBucket: "",
        messagingSenderId: "916604522720",
        appId: "1:916604522720:web:14e8e21ac79b64c2"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // A variable to reference the database.
    var database = firebase.database();

    // Clock
    function startTime() {
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        var s = today.getSeconds();
        m = checkTime(m);
        s = checkTime(s);
        document.getElementById('clock').innerHTML = "Current (military) time: " +
            h + ":" + m + ":" + s;
        var t = setTimeout(startTime, 500);
    }
    function checkTime(i) {
        if (i < 10) { i = "0" + i };
        return i;
    }
    startTime();

    // Grabs user input
    $("#submit-button").on("click", function (event) {
        event.preventDefault();

        var trainName = $("#train-name-input").val().trim();
        var destination = $("#destination-input").val().trim();
        var firstTrain = $("#first-train-input").val().trim();
        var frequency = $("#frequency-input").val().trim();



        // Store input data in an object to be uploaded to database.
        var trainSchedule = {
            trainName: trainName,
            destination: destination,
            firstTrain: firstTrain,
            frequency: frequency
        };

        database.ref().push(trainSchedule);

        console.log(trainSchedule.trainName);

        // Clears boxes in form
        $("#train-name-input").val("");
        $("#destination-input").val("");
        $("#first-train-input").val("");
        $("#frequency-input").val("");
    });


    // Creates Firebase event that adds input data to the database, and appends the data to create a new row in HTML.

    database.ref().on("child_added", function (childSnapshot) {
        var trainName = childSnapshot.val().trainName;
        var destination = childSnapshot.val().destination;
        var firstTrain = childSnapshot.val().firstTrain;
        var frequency = childSnapshot.val().frequency;

        console.log(trainName);

        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(firstTrain, "HH:mm").subtract(1, "years");

        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        console.log("DIFFERENCE IN TIME: " + diffTime);

        // Time apart (remainder)
        var tRemainder = diffTime % frequency;
        console.log(tRemainder);

        // Minute Until Train
        var tMinutesTillTrain = frequency - tRemainder;
        console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

        // Next Train
        var nextTrain = moment().add(tMinutesTillTrain, "minutes");
        console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));


        var newRow = $("<tr>").append(
            $("<td>").text(trainName),
            $("<td>").text(destination),
            $("<td>").text(frequency),
            $("<td>").text(moment(nextTrain).format("hh:mm")),
            $("<td>").text(tMinutesTillTrain),
        );
        $("#train-table > tbody").append(newRow);

    });
});