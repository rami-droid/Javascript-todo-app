const btn = document.querySelector("button");
const input = document.querySelector("input");
const todoDiv = document.querySelector("div");
const progress = document.querySelector("progress")
const msg = document.querySelector("#msg")

const clearBtn = document.querySelector("#clear");
const sessionBtn = document.querySelector("#startBtn")
const endSessionBtn = document.querySelector("#endBtn")
const saveBtn = document.querySelector("#save")

const msgdel = document.querySelector("#discarded-msg")
const msgfnsh = document.querySelector("#finished-msg")


const maindiv = document.querySelector('#maindiv')

const todos =  JSON.parse(localStorage.getItem("tasks")) || [];

let FinishedCount = parseInt(localStorage.getItem("finish") || 0);

let deletedCount = parseInt(localStorage.getItem("delete") || 0);

const finishedTasks = []
const DeletedTasks = []


function init() {
    progress.style.display = "none";
    updateDeleted(); updateFinished();
    todos.forEach(task => {renderTask(task)});
    
}


init()

saveBtn.addEventListener("click", () => {
    saveTasks();
})

sessionBtn.addEventListener("click", () => {
    progress.style.display = "block";
    progress.max = todos.length;
    progress.value = 0;
    console.log(progress);
    endSessionBtn.style.display = "inline"
    sessionBtn.style.display = "none"
})

endSessionBtn.addEventListener("click", ()=> {
    progress.style.display = "none"
    endSessionBtn.style.display = "none"
    sessionBtn.style.display = "inline"
})

clearBtn.addEventListener("click", () => {
    localStorage.clear();
    FinishedCount = 0;
    updateFinished();
    finishedTasks.length = 0; 
    DeletedTasks.length = 0;
    console.log("storage cleared");

});

btn.addEventListener("click", () => {

    addToList();
})

input.addEventListener('keydown', (event) =>{
if(event.key === 'Enter') {
    addToList();
}
})

function updateFinished() {
    msgfnsh.innerHTML = `Finished tasks: ${FinishedCount}`;
    console.log(finishedTasks)
}

function updateDeleted() {
    msgdel.innerHTML = `Discarded tasks: ${deletedCount}`;
}


function editTask(id) {
    const index = todos.findIndex(todo => todo.id === id);
    if (index === -1) {
        console.error("Task not found for id:", id);
        return;
    }

    const currTask = maindiv.querySelector(`[data-id='${id}']`); // Find DOM element by data attribute
    if (!currTask) {
        console.error("currTask not found for id:", id);
        return;
    }

    const headerElement = currTask.querySelector("header");
    const currentText = todos[index].text;

    headerElement.innerHTML = `<input type="text" placeholder="edit..." value="${currentText}">`;
    const editInput = headerElement.querySelector("input");

    function saveEdit() {
        let newTask = editInput.value.trim();
        if (newTask === '') {
            newTask = currentText;
        }

        headerElement.textContent = newTask;
        todos[index].text = newTask;
    }

    editInput.addEventListener("blur", saveEdit);
    editInput.addEventListener("keydown", (event) => {
        if (event.key === 'Enter') {
            saveEdit();
            editInput.blur();
        }
    });

    editInput.focus();
}
function deleteFromList(id, isFinished) {
    const index = todos.findIndex(todo => todo.id === id);
    if (index === -1) return;

    const todoText = todos[index].text;

    if (isFinished) {
        finishedTasks.push(todoText);
        FinishedCount += 1;
        localStorage.setItem("finish", FinishedCount);
        updateFinished();
    } else {
        DeletedTasks.push(todoText);
        deletedCount++;
        localStorage.setItem("delete", deletedCount);
        updateDeleted();
    }

    todos.splice(index, 1);
    const taskElement = maindiv.querySelector(`[data-id='${id}']`);
    if (taskElement) {
        maindiv.removeChild(taskElement);
    }
    progress.value++;
    saveTasks();
}


function addToList() {
    const todoText = input.value.trim();
    if (todoText === "") return;

    const todoId = Date.now() + Math.random(); 
    todos.push({ id: todoId, text: todoText });
    progress.max = todos.length;

    const newTodo = document.createElement('article');
    newTodo.dataset.id = todoId;
    newTodo.innerHTML = `
        <header style="display: flex;">
					<p style="flex:12;">${todoText}</p>
					<details class="dropdown">
						<summary>priority</summary>
						<ul>
							<li>
								<label>
								  <input type="radio" name="phase" value="high" id="highRadio"/>
								  High
								</label>
							  </li>
							  <li>
								<label>
								  <input type="radio" name="phase" value="mid" id="midRadio"/>
								  Mid
								</label>
							  </li>
							  <li>
								<label>
								  <input type="radio" name="phase" value="low" id="lowRadio"/>
								  Low	
								</label>
							  </li>
					</details>
				</header>
				<button id="complete-btn">Complete</button>
				<button id="edit-btn">Edit</button>
				<button id="remove-btn" class="secondary">Remove</button>
    `;

    const removeBtn = newTodo.querySelector('#remove-btn');
    const completeBtn = newTodo.querySelector('#complete-btn');
    const editBtn = newTodo.querySelector("#edit-btn");

    const highVal = newTodo.querySelector("#highRadio");
    const midVal = newTodo.querySelector("#midRadio");
    const lowVal = newTodo.querySelector("#lowRadio");
    const todoHeader = newTodo.querySelector("header");

    const radioValues = [highVal, midVal, lowVal]

    radioValues.forEach((radio)=> {
        radio.addEventListener("click", () => {
            if (radio.checked == true) {
                switch (radio.value) {
                    case "low":
                        todoHeader.className = "pico-background-green-350"
                        newTodo.querySelector("summary").innerText = "low"
                        break;
                    case "mid":
                        todoHeader.className = "pico-background-amber-300"
                        newTodo.querySelector("summary").innerText = "mid"
                        break;
                    case "high":
                        todoHeader.className = "pico-background-red-550"
                        newTodo.querySelector("summary").innerText = "high"
                        break;
                    default:
                        break;
                }
            }
        })
    })

    removeBtn.addEventListener("click", () => {
        deleteFromList(todoId, false);
    });

    completeBtn.addEventListener("click", () => {
        deleteFromList(todoId, true);
    });

    editBtn.addEventListener("click", () => {
        editTask(todoId);
    });

    maindiv.appendChild(newTodo);
    input.value = "";
    saveTasks();
}

function saveTasks () {
    localStorage.removeItem("tasks")
    localStorage.setItem("tasks", JSON.stringify(todos))
}

function renderTask(task) {
    const newTodo = document.createElement('article');
    newTodo.dataset.id = task.id;
    newTodo.innerHTML = 
    `
        <header style="display: flex;">
					<p style="flex:10;">${task.text}</p>
					<details class="dropdown">
						<summary>priority</summary>
						<ul>
							<li>
								<label>
								  <input type="radio" name="phase" value="high" id="highRadio"/>
								  High
								</label>
							  </li>
							  <li>
								<label>
								  <input type="radio" name="phase" value="mid" id="midRadio"/>
								  Mid
								</label>
							  </li>
							  <li>
								<label>
								  <input type="radio" name="phase" value="low" id="lowRadio"/>
								  Low	
								</label>
							  </li>
					</details>
				</header>
				<button id="complete-btn">Complete</button>
				<button id="edit-btn">Edit</button>
				<button id="remove-btn" class="secondary">Remove</button>
    `;

    const removeBtn = newTodo.querySelector('#remove-btn');
    const completeBtn = newTodo.querySelector('#complete-btn');
    const editBtn = newTodo.querySelector("#edit-btn");

    removeBtn.addEventListener("click", () => deleteFromList(task.id, false));
    completeBtn.addEventListener("click", () => deleteFromList(task.id, true));
    editBtn.addEventListener("click", () => editTask(task.id));

    const highVal = newTodo.querySelector("#highRadio");
    const midVal = newTodo.querySelector("#midRadio");
    const lowVal = newTodo.querySelector("#lowRadio");
    const todoHeader = newTodo.querySelector("header");

    const radioValues = [highVal, midVal, lowVal]

    radioValues.forEach((radio)=> {
        radio.addEventListener("click", () => {
            if (radio.checked == true) {
                switch (radio.value) {
                    case "low":
                        todoHeader.className = "pico-background-green-350"
                        newTodo.querySelector("summary").innerText = "low"
                        break;
                    case "mid":
                        todoHeader.className = "pico-background-amber-300"
                        newTodo.querySelector("summary").innerText = "mid"
                        break;
                    case "high":
                        todoHeader.className = "pico-background-red-550"
                        newTodo.querySelector("summary").innerText = "high"
                        break;
                    default:
                        break;
                }
            }
        })
    })

    maindiv.appendChild(newTodo);
}