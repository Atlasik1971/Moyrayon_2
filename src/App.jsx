import { useMemo, useState } from "react";
import { quizQuestions } from "./data/questions";

const getResultRank = (score) => {
  if (score <= 3) {
    return {
      title: "Гость района",
      message: "Отличный повод открыть для себя Московский район заново. Начало уже положено!",
    };
  }

  if (score <= 6) {
    return {
      title: "Внимательный житель",
      message: "Вы хорошо ориентируетесь в районе и знаете важные места. Совсем немного до уровня эксперта!",
    };
  }

  if (score <= 8) {
    return {
      title: "Знаток Московского района",
      message: "Сильный результат! Вы уверенно знаете историю и знаковые точки района.",
    };
  }

  return {
    title: "Легенда Московского района",
    message: "Вы на высшем уровне: ваш результат впечатляет даже местных краеведов.",
  };
};

const initialState = {
  screen: "start",
  currentQuestionIndex: 0,
  score: 0,
};

function App() {
  const [quizState, setQuizState] = useState(initialState);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const totalQuestions = quizQuestions.length;
  const currentQuestion = quizQuestions[quizState.currentQuestionIndex];
  const resultRank = useMemo(() => getResultRank(quizState.score), [quizState.score]);

  const startQuiz = () => {
    setQuizState(initialState);
    setQuizState((prev) => ({ ...prev, screen: "quiz" }));
    setIsAnswered(false);
    setSelectedIndex(null);
  };

  const handleSelectAnswer = (optionIndex) => {
    if (isAnswered) {
      return;
    }

    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    setSelectedIndex(optionIndex);
    setIsAnswered(true);
    setQuizState((prev) => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
    }));
  };

  const goToNextQuestion = () => {
    const isLastQuestion = quizState.currentQuestionIndex === totalQuestions - 1;

    if (isLastQuestion) {
      setQuizState((prev) => ({ ...prev, screen: "result" }));
      return;
    }

    setQuizState((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
    }));
    setIsAnswered(false);
    setSelectedIndex(null);
  };

  const restartQuiz = () => {
    setQuizState(initialState);
    setQuizState((prev) => ({ ...prev, screen: "quiz" }));
    setIsAnswered(false);
    setSelectedIndex(null);
  };

  const shareResult = async () => {
    const shareText = `Я прошел(а) викторину «Знаток Московского района» и набрал(а) ${quizState.score} из ${totalQuestions}.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Знаток Московского района",
          text: shareText,
        });
      } catch {
        // Ignore user cancellation.
      }
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      alert("Результат скопирован в буфер обмена.");
      return;
    }

    alert(shareText);
  };

  return (
    <main className="page">
      <section className="quiz-card">
        {quizState.screen === "start" && (
          <div className="content-block">
            <p className="badge">Викторина для сообщества ВК</p>
            <h1>Знаток Московского района</h1>
            <p className="description">
              Проверьте, насколько хорошо вы знаете историю и знаковые места Московского района Санкт-Петербурга.
            </p>
            <button className="btn btn-primary" onClick={startQuiz}>
              Начать
            </button>
          </div>
        )}

        {quizState.screen === "quiz" && currentQuestion && (
          <div className="content-block">
            <p className="progress">
              Вопрос {quizState.currentQuestionIndex + 1} из {totalQuestions}
            </p>

            <h2>{currentQuestion.question}</h2>

            <div className="options">
              {currentQuestion.options.map((option, index) => {
                const isCorrect = index === currentQuestion.correctAnswer;
                const isSelected = selectedIndex === index;

                let className = "option-btn";

                if (isAnswered && isCorrect) {
                  className += " correct";
                } else if (isAnswered && isSelected && !isCorrect) {
                  className += " wrong";
                }

                return (
                  <button
                    key={option}
                    type="button"
                    className={className}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={isAnswered}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="actions">
              <button className="btn btn-secondary" onClick={goToNextQuestion} disabled={!isAnswered}>
                {quizState.currentQuestionIndex === totalQuestions - 1 ? "Показать результат" : "Следующий вопрос"}
              </button>
            </div>
          </div>
        )}

        {quizState.screen === "result" && (
          <div className="content-block">
            <p className="badge">Ваш итог</p>
            <h2>
              {quizState.score} из {totalQuestions}
            </h2>
            <p className="result-rank">{resultRank.title}</p>
            <p className="description">{resultRank.message}</p>
            <p className="hint">Напишите свой результат в комментариях под постом ВК</p>

            <div className="actions dual">
              <button className="btn btn-primary" onClick={restartQuiz}>
                Пройти ещё раз
              </button>
              <button className="btn btn-secondary" onClick={shareResult}>
                Поделиться результатом
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
