import { Question } from './question';
import { isValid, createModal, Utils } from './utils';
import { getAuthForm, authWithEmailAndPassword } from './auth';
import '@/styles/style.scss';
const importAll = r => r.keys().map(r);
importAll(require.context('../img/', false, /\.(png|jpe?g|svg)$/));

const form = document.querySelector('#form');
const input = form.querySelector('#question-input');
const modalBtn = document.querySelector('#modal-btn');
const submitbtn = form.querySelector('#submit');

window.addEventListener('load', Question.renderList);

const renderModalAfterAuth = content => {
    if (typeof content === 'string') {
        createModal('Ошибка', content);
    } else {
        createModal('Список вопросов', Utils.listToHTML(content));
        Question.renderAnswerEvents();
    }
}

modalBtn.addEventListener('click', () => {
    createModal('Авторизация', getAuthForm());
    document
        .querySelector('#auth-form')
        .addEventListener('submit', e => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const email = e.target.querySelector('#email').value;
            const password = e.target.querySelector('#password').value;
            btn.disabled = true;
            authWithEmailAndPassword(email, password)
                .then(Question.getQuestions)
                .then(renderModalAfterAuth)
                .then(() => btn.disabled = false);
        }, { once: false })
});

const submitFormHandler = e => {
    e.preventDefault();
    if (isValid(input.value)) {
        const question = {
            text: input.value.trim(),
            date: new Date().toJSON()
        }
        submitbtn.disabled = true;
        Question.createQuestion(question).then(() => {
            input.value = input.className = '';
            submitbtn.disabled = false;
        })
    }
}
form.addEventListener('submit', submitFormHandler);

input.oninput = e => isValid(e.target.value) ? submitbtn.disabled = false : submitbtn.disabled = true;