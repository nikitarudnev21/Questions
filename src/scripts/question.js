import { authWithEmailAndPassword } from './auth';
import { isValid, Utils } from './utils';

class Storage {
    static getFromLocal = () => JSON.parse(localStorage.getItem('questions') || '[]');

    static addToLocal(question) {
        const all = Storage.getFromLocal();
        all.push(question);
        localStorage.setItem('questions', JSON.stringify(all));
    }

    static removeFromLocal(response) {
        const all = Storage.getFromLocal();
        const ind = all.findIndex(q => q.id === response.id);
        localStorage.setItem('questions', JSON.stringify(all.filter((q, i) => i != ind)));
    }

    static editLocal(x, response, qText, isAdmin = false) {
        response.text = x.children[0].value;
        response.date = new Date().toJSON();
        if (isAdmin) {
            response.text = qText;
            response.answer = x.children[2].value;
        }
        const all = Storage.getFromLocal();
        const ind = all.findIndex(q => q.text === qText);
        all[ind] = response;
        localStorage.setItem('questions', JSON.stringify(all));
    }
}

export class Question {
    static baseQuery(qText) {
        return authWithEmailAndPassword('nikita123@gmail.com', 'nikita123')
            .then(Question.getQuestions)
            .then(response => (response.find(q => q.text === qText)))
    }

    static renderEvents() {
        document.querySelectorAll('.question-content').forEach(x => {
            const editBtn = x.querySelector('.edit-question');
            editBtn.onclick = () => {
                if (!editBtn.classList.contains('edited')) {
                    Question.renderEdit(x);
                }
            }
            x.querySelector('.delete-question').onclick = () => Question.deleteQuestion(x);
        });
    }

    static renderList() {
        const questions = Storage.getFromLocal();
        const html = questions.length
            ? questions.map(Utils.questionComponent).join('')
            : `<div class="mui--text-headline">Вы пока ничего не спрашивали</div>`;
        document.querySelector('#list').innerHTML = html;
        Question.renderEvents();
    }

    static createQuestion(question) {
        return fetch('https://questions-nikita.firebaseio.com/questions.json', {
            method: 'POST',
            body: JSON.stringify(question),
            headers: {
                'Content-Type': 'application-json'
            }
        })
            .then(response => response.json())
            .then(response => {
                question.id = response.name;
                return question;
            })
            .then(Storage.addToLocal)
            .then(Question.renderList);
    }

    static getQuestions(token) {
        if (!token) {
            return Promise.resolve('<p class = "error">У вас нет токена</p>');
        }
        return fetch(`https://questions-nikita.firebaseio.com/questions.json?auth=${token}`)
            .then(response => response.json())
            .then(response => {
                if (response && response.error) {
                    return `<p class = "error">${response.error}</p>`
                }
                return response ? Object.keys(response).map(key => ({
                    ...response[key],
                    id: key
                })) : [];
            })
    }

    static editQuestion(x, qText = x.children[0].innerText) {
        Question.baseQuery(qText)
            .then(response => {
                Storage.editLocal(x, response, qText);
                Question.renderList();
                fetch(`https://questions-nikita.firebaseio.com/questions/${response.id}/.json`, {
                    method: 'PUT',
                    body: JSON.stringify(response),
                    headers: {
                        'Content-Type': 'application-json',
                    }
                })
            })
    }

    static deleteQuestion(x, qText = x.children[0].innerText, isAdmin = false) {
        return Question.baseQuery(qText)
            .then(response => {
                Storage.removeFromLocal(response);
                !isAdmin ? x.parentNode.remove() : void (0);
                Question.renderList();
                fetch(`https://questions-nikita.firebaseio.com/questions/${response.id}/.json`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application-json',
                    }
                }).catch(err => console.log(`Ошибка при удалении вопроса ${isAdmin ? 'админом' : 'пользователем'}`, err));
            })
    }

    static answerQuestion(a, qText = a.children[1].innerText) {
        Question.baseQuery(qText)
            .then(response => {
                Storage.editLocal(a, response, qText, true);
                Question.renderList();
                fetch(`https://questions-nikita.firebaseio.com/questions/${response.id}/.json`, {
                    method: 'PUT',
                    body: JSON.stringify(response),
                    headers: {
                        'Content-Type': 'application-json',
                    }
                }).then(Question.renderAdmin);
            })
    }

    static renderAdmin() {
        authWithEmailAndPassword('nikita123@gmail.com', 'nikita123')
            .then(Question.getQuestions)
            .then(response => {
                document.querySelector('.modal-content').innerHTML = Utils.listToHTML(response);
                Question.renderAnswerEvents();
            });
    }

    static renderAnswerEvents() {
        document.querySelectorAll('.answbtn').forEach(a => {
            a.onclick = () => {
                Question.renderAnswer(a.parentElement);
            }
        });
        [...document.querySelectorAll('.answdelete')].map((a, ind, arr) => {
            Question.removeContent(a.parentElement, a.parentElement.children[4]);
        });
    }

    static removeContent(all, rem) {
        rem.onclick = async () => {
            const qText = all.children[1].innerText;
            all.remove();
            try {
                [...document.querySelectorAll('.question-text')]
                    .find(q => q.innerText = qText).parentNode.parentElement.remove();
                await Question.deleteQuestion(null, qText, true);
                await Question.renderAdmin();
            } catch (e) { throw e; }
        }
    }

    static renderAnswer(x) {
        const startHTML = x.innerHTML;
        const answerText = x.children[2].innerText;
        x.innerHTML = `${x.children[0].outerHTML + x.children[1].outerHTML + Utils.questionButtons() + x.children[4].outerHTML}`;
        x.children[2].value = answerText;
        x.children[3].onclick = () => {
            x.innerHTML = startHTML;
            Question.renderAnswerEvents();
        }
        x.children[4].onclick = () => Question.answerQuestion(x);
        Question.removeContent(x, x.children[5]);
    }

    static renderEdit(x) {
        const startContent = x.innerHTML;
        const qText = x.children[0].innerText;
        x.innerHTML = `${Utils.questionButtons() + x.children[2].outerHTML}`;
        x.children[0].value = qText;
        x.children[2].onclick = () => {
            const input = x.children[0];
            if (isValid(input.value)) {
                Question.editQuestion(x, qText);
            }
            else {
                input.style.boxShadow = '0 0 5px tomato';
                setTimeout(() => {
                    input.style.boxShadow = 'none';
                }, 2500);
            }
        }
        x.children[3].onclick = () => Question.deleteQuestion(x, qText);
        document.querySelector('#cancel').addEventListener('click', () => {
            x.innerHTML = startContent;
            Question.renderEvents();
        });
    }
}