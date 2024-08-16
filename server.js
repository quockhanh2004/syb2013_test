const express = require("express");
const bodyParser = require("body-parser");
const app = express();

//Dữ liệu câu hỏi từ file JSON của bạn
const questions = require("./SYB3012.json");

// Cấu hình template engine
app.set("view engine", "ejs");

// Cấu hình thư mục public cho các assets (css, js, ...)
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Route trang chủ
app.get("/", (req, res) => {
  res.render("index", { questions: questions });
});

// Route xử lý kết quả bài tập
app.post("/submit", (req, res) => {
  let score = 10; // Bắt đầu với 10 điểm
  let total = questions.length;
  let incorrectAnswers = [];
  const userAnswers = req.body;

  // So sánh đáp án của người dùng với đáp án đúng
  for (let i = 0; i < total; i++) {
    const userAnswer = userAnswers[`question${i + 1}`];
    const questionScore = 10 / total; // Điểm trừ cho mỗi câu hỏi sai

    if (userAnswer) {
      if (Array.isArray(questions[i].correctAnswer)) {
        // Câu hỏi nhiều đáp án
        let isCompletelyCorrect = true; // Giả sử ban đầu trả lời đúng hết
        const correctAnswers = questions[i].correctAnswer;

        userAnswer.forEach((answer) => {
          if (!correctAnswers.includes(answer)) {
            // Nếu có đáp án sai
            isCompletelyCorrect = false;
            score -= questionScore / correctAnswers.length;
          }
        });

        // Kiểm tra xem user có chọn thiếu đáp án đúng hay không
        if (!isCompletelyCorrect || userAnswer.length !== correctAnswers.length) { 
          incorrectAnswers.push({
            question: questions[i].question,
            correctAnswer: correctAnswers.join(", "),
            userAnswer: userAnswer.join(", "),
          });
        }

      } else {
        // Câu hỏi một đáp án
        if (userAnswer !== questions[i].correctAnswer) {
          score -= questionScore; 
          incorrectAnswers.push({
            question: questions[i].question,
            correctAnswer: questions[i].correctAnswer,
            userAnswer: userAnswer,
          });
        }
      }
    } else {
      // Câu hỏi chưa được trả lời
      score -= questionScore;
      incorrectAnswers.push({
        question: questions[i].question,
        correctAnswer: Array.isArray(questions[i].correctAnswer)
          ? questions[i].correctAnswer.join(", ")
          : questions[i].correctAnswer,
        userAnswer: "Chưa trả lời",
      });
    }
  }

  let finalScore = score; 
  finalScore = Math.round(finalScore * 100) / 100;

  console.log("Điểm: " + finalScore);

  res.render("result", {
    score: finalScore,
    incorrectAnswers: incorrectAnswers,
  });
});

// Khởi động server
const PORT = process.env.PORT || 3012;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
