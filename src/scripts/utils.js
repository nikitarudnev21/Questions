export const isValid = value => value.length >= 5;
export const createModal = (title, content) => {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
    <h1>${title}</h1>
    <div class = "modal-content">${content}</div>
    `;
    mui.overlay('on', modal);
}

export class Utils {
    static listToHTML(questions) {
        let counter = 0;
        return questions.length ?
            `<ol class="answer">${questions.map(x => `<li class = "answ"><span class = "answer-number">${++counter}.</span><span>${x.text}</span><span class = "admin-answerr">${x.answer ? x.answer : ''}</span><img src = "img/answer.png" alt = "Answer" class = "answer-image answbtn"><img src = "img/delete.png" alt = "Delete" class = "action-image answdelete"></li>`).join('')}</ol>`
            : '<p>Вопросов пока нет</p>';
    }
    static questionComponent(question) {
        return `
        <div class="question">
        <div class="mui--text-black-54">
        ${new Date(question.date).toLocaleDateString()}
        ${new Date(question.date).toLocaleTimeString()}
        </div>
        <div class="question-content">
        <div class="question-text">${question.text} </div>
        <span class="edit-question ${question.answer ? 'edited' : ''}"><img src="img/edit.png" alt="Edit" class="${question.answer ? 'disabled-img' : 'action-image'}"></span>
        <span class="delete-question"><img src="img/delete.png" alt="Delete" class="action-image"></span>
        </div>
        ${question.answer ? `<div class = "answer-content"><div>Ответ: ${question.answer}</div></div>` : `Ответа пока нет`}
        </div>
        <br>`;
    }
    static questionButtons() {
        return `<input type = "text" class = "input-question">
        <img src="img/cancel.png" alt="Cancel" class="action-image" id="cancel">
            <img src="img/save.png" alt="Save" class="action-image" id="save">`;
    }
}