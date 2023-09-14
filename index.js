const express = require("express");
const bodyparser = require("body-parser");
const app = express();
const mongoose = require("mongoose");

var uniqueSlug = require('unique-slug');
const { findSourceMap } = require("module");

var randomSlug = uniqueSlug();





// mongo connection
mongoose.connect("mongodb://localhost:27017/quizzoMasterDB");
const quizSchema = new mongoose.Schema({
    question: String,
    option1: String,
    option2: String,
    option3: String,
    option4: String,
})

// student register schema
const registerSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    studentEmail: String,
    studentPassword: String,

})








app.set("view engine", "ejs")
app.use(bodyparser.urlencoded({ extended: true }))
app.use(express.static("public"))


app.listen("3000", function () {
    console.log("Quiz app running")
})



// Student and Teacher Login Section
app.get("/main", function (req, res) {
    res.render("main.ejs")
})

// Teacher Login Area

teacherQuestions = [];
teacherAnswer = [];
app.get("/teacher", function (req, res) {
    res.render("teacher_login.ejs")
})

app.post("/teacher_login", function (req, res) {

    const subname = req.body.subject;
    res.render("createquiz.ejs")
})

app.get("/teacher_login", function (req, res) {
    res.render("teacher_login.ejs")
})


// creating quiz area.
app.post("/createquiz", function (req, res) {
    teacherQuestions.push(req.body.quest)
    const answers = [req.body.opt1, req.body.opt2, req.body.opt3, req.body.opt4]
    teacherAnswer.push(answers)

    res.render("createquiz.ejs")


})



// complete making quiz

app.post('/quiz_complete', function (req, res) {
    var quizId = "quizzoo" + randomSlug + "quizzes";





    const Question = mongoose.model(quizId, quizSchema);
    // quiz question schema

    for (i = 0; i < teacherQuestions.length; i++) {
        const question = new Question({
            question: teacherQuestions[i],
            option1: teacherAnswer[i][0],
            option2: teacherAnswer[i][1],
            option3: teacherAnswer[i][2],
            option4: teacherAnswer[i][3],

        });
        //Saving Set
        console.log("saving")
        question.save();
        console.log("saved")

    }

    res.render("show_quiz_code.ejs",{quizcode:quizId})


})


i = 0


var questList = []

var ansList = []

var userInp = []
var wrongQuest = []
var wrongInput = []
var buttonTextAfter = ["Next", "Submit"];
var buttonIndex = 0;
var score = 0;
var maxScore = ansList.length;
var flag = false;
var quizcodes = {};
var correctAnswer = [];




app.get("/", function (req, res) {
    res.redirect("/main")
})


// wrong quest area.
app.get("/wrongQuest", function (req, res) {
    res.render("wrongArea.ejs", { wrongQuestions: wrongQuest, correctAnswer: correctAnswer, wrongAnswers: wrongInput })
})
























// student login

app.get("/student-login", function (req, res) {
    res.render("student_login")
})

// student register

app.get("/student_register", function (req, res) {
    res.render("student_register")
})

// register student post request:
app.post("/student_register", function (req, res) {
    const Fname = req.body.firstName;
    const Lname = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    console.log(Fname, Lname, email, password);
    const StudentData = mongoose.model("student", registerSchema);
    const data = new StudentData({
        firstName: Fname,
        lastName: Lname,
        studentEmail: email,
        studentPassword: password,

    })

    data.save().then(function () {
        console.log("saved!")
        res.redirect("/student-login")
    })


})



// login student post request
var loginFlag = false
var quizCodeFlag = false
var startquizFlag = false
var emailforPage = "none"
app.post("/student_login", async function (req, res) {
    const allMail = [];
    const allPass = []
    const email = req.body.studentEmail;
    quizCodeFlag = false

    const password = req.body.studentPassword;
    console.log(email, password)
    const StudentData = mongoose.model("student", registerSchema);
    await StudentData.find({}).then(function (documents) {
        documents.forEach(function (document) {
            allMail.push(document.studentEmail)
            allPass.push(document.studentPassword)
        })
    })


    for (i = 0; i < allMail.length; i++) {
        if (allMail[i] == email && allPass[i] == password) {
            loginFlag = true
            emailforPage = allMail[i]
        }


    }
    if (loginFlag == true) {
        res.redirect("/quiz-login")
    } else {
        res.send("Enter correct credentials")
    }





})





// quiz access area
app.get("/quiz-login", async function (req, res) {
    if (loginFlag == true) {
        var name = "none";
        const StudentData = mongoose.model("student", registerSchema);
        await StudentData.find({ studentEmail: emailforPage }).then(function (documents) {
            documents.forEach(function (document) {
                name = document.firstName
            })
        })
        res.render("quizaccess.ejs", { studentName: name })
        loginFlag = false
        quizCodeFlag = true
    } else {
        res.redirect("/student-login")
    }

})


app.post("/quiz-login", function (req, res) {
   
    const quizcode = req.body.quiz_code; ``
    const route_address = "/quiz/" + quizcode;
    const Question = mongoose.model(quizcode, quizSchema);

    Question.find({}).then(function (data) {

        if (data.length == 0) {
            res.send("no quiz found with this code")
        }
        else {
            res.redirect(route_address)
            
        }
    })
})


// get request of route address

app.get("/quiz/:quizcode", async function (req, res) {

    if(quizCodeFlag==true){
    
        startquizFlag = true
        console.log(quizCodeFlag)

    


    i = 0
    questList = []
    ansList = []
    userInp = []
    wrongQuest = []
    wrongInput = []
    correctAnswer = []
    buttonIndex = 0;
    score = 0;
    maxScore = ansList.length;
    flag = false;

    const quizcode = req.params.quizcode;

    const Question = mongoose.model(quizcode, quizSchema);



    Question.find({}).then(function (data) {




        data.forEach(function (element) {
            questList.push(element.question)
            const ansSet = [element.option1, element.option2, element.option3, element.option4]

            ansList.push(ansSet)

            correctAnswer.push(element.option1)

        })



        quizflag = true;
        const quizareacode = "/quizarea/" + quizcode;
        res.redirect(quizareacode);
      
    }
    ).catch(function (e) {
        console.log(e.message)
    })

}else{
    res.redirect("/student-login")
}

}




)



// quiz loading and evaluating area
app.get("/quizarea/:quiz_code", function (req, res) {

if(startquizFlag != true){
    res.redirect("/student-login")
}
else{

    // submit route
    if (userInp.length == ansList.length && flag == false) {


startquizFlag =false

        for (var j = 0; j < questList.length; j++) {


            if (userInp[j] == correctAnswer[j]) {

                score = score + 1;

            } else {
                wrongQuest.push(questList[j])
                wrongInput.push(userInp[j])
            }
        }
        const Accuracy = Math.floor((score / questList.length) * 100)

        if (Accuracy <= 100 && Accuracy >= 90) {
            var Quote = "Excellent Performance, Keep it Up !";
        } else if (Accuracy < 90 && Accuracy >= 75) {
            var Quote = "";
        } else {
            var Quote = "";
        }


        flag = true
        if (wrongInput.length == 0) {
            var displayValue = ""
        } else {
            var displayValue = "Wrong Questions"
        }



        res.render("output.ejs", { number: score, wrongList: wrongQuest, total: questList.length, accuracy: Accuracy, quote: Quote, buttonToggle: displayValue })




    }

    else if (flag == true && userInp.length == ansList.length) {
        console.log("refreshed")
        buttonIndex = 0;
        score = 0;
        userInp = [];
        wrongQuest = [];
        i = 0;
        res.redirect("/quizarea/:quiz_code")
    }




    else {
        const ans = [];
        // collecting all answers
        const quizcode = req.params.quiz_code;
        const Question = mongoose.model(quizcode, quizSchema);
        Question.find({}).then(function (data) {




            data.forEach(function (element) {

                const ansSet = [element.option1, element.option2, element.option3, element.option4]

                ans.push(ansSet)



            })
        })



        flag = false
        // Shuffle Answer List
        function shuffleArray(array) {

            for (var i = array.length - 1; i > 0; i--) {

                // Generate random number 
                var j = Math.floor(Math.random() * (i + 1));

                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }

            return array;
        }

        res.render("quiz.ejs", { quest: questList[i], buttonText: buttonTextAfter[buttonIndex], options: shuffleArray(ansList[i]) })
    }
}
}


)

// next route for quiz

app.post("/quizarea/next", function (req, res) {



    const userAns = req.body.value
    userInp.push(userAns)

    if (userInp.length == questList.length - 1) {
        buttonIndex = 1

    }
    i = i + 1
    res.redirect("/quizarea/:quiz_code")


})


