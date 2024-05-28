document.addEventListener('DOMContentLoaded', () => {

    // Get references to input fields and buttons
    const taskTitle = document.getElementById('taskTitle');
    const taskDescription = document.getElementById('taskDescription');
    const taskDueDate = document.getElementById('taskDueDate');
    const taskPriority = document.getElementById('taskPriority');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const filterTitle = document.getElementById('filterTitle');
    const filterDueDate = document.getElementById('filterDueDate');
    const filterPriority = document.getElementById('filterPriority');
    const sortTasks = document.getElementById('sortTasks');

    let editMode = false;
    let editTaskId = null;

   // Event listener for the "Add Task" button
addTaskButton.addEventListener('click', () => {
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const dueDate = taskDueDate.value;
    const priority = taskPriority.value;

    if (!title || !description || !dueDate || !priority) {
        alert('Please fill in all fields');
        return;
    }

    const id = new Date().getTime().toString();
    addTask(id, title, description, dueDate, priority, false);

    saveTasks();
    clearInputs();
});

    // Function to add a task to the list
function addTask(id, title, description, dueDate, priority, completed) {
    const taskItem = document.createElement('div');
    taskItem.classList.add('taskItem');
    taskItem.setAttribute('data-id', id);
    if (completed) {
        taskItem.classList.add('completed');
    }
    taskItem.innerHTML = `
        <h3>${title}</h3>
        <p>${description}</p>
        <small>Due: ${dueDate}</small>
        <span class="taskPriority ${priority}">${priority}</span>
        <div class="taskActions">
            <button class="editButton">Edit</button>
            <button class="deleteButton">Delete</button>
            <button class="completeButton">${completed ? 'Undo' : 'Complete'}</button>
        </div>
    `;

    taskItem.querySelector('.deleteButton').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this task?')) {
            taskItem.remove();
            saveTasks();
        }
    });

    taskItem.querySelector('.editButton').addEventListener('click', () => {
        editMode = true;
        editTaskId = id;
        taskTitle.value = title;
        taskDescription.value = description;
        taskDueDate.value = dueDate;
        taskPriority.value = priority;
        addTaskButton.textContent = 'Update Task';
    });

    taskItem.querySelector('.completeButton').addEventListener('click', () => {
        taskItem.classList.toggle('completed');
        saveTasks();
    });

    taskList.appendChild(taskItem);
}

    // Function to update an existing task
    function updateTask(id, title, description, dueDate, priority) {
        const taskItem = document.querySelector(`.taskItem[data-id="${id}"]`);
        taskItem.querySelector('h3').innerText = title;
        taskItem.querySelector('p').innerText = description;
        taskItem.querySelector('small').innerText = `Due: ${dueDate}`;
        const prioritySpan = taskItem.querySelector('.taskPriority');
        prioritySpan.className = `taskPriority ${priority}`;
        prioritySpan.innerText = priority;
    }

    // Function to save tasks to localStorage
    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('.taskItem').forEach(taskItem => {
            tasks.push({
                id: taskItem.getAttribute('data-id'),
                title: taskItem.querySelector('h3').innerText,
                description: taskItem.querySelector('p').innerText,
                dueDate: taskItem.querySelector('small').innerText.replace('Due: ', ''),
                priority: taskItem.querySelector('.taskPriority').innerText,
                completed: taskItem.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Function to load tasks from localStorage
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => addTask(task.id, task.title, task.description, task.dueDate, task.priority, task.completed));
    }

    // Function to clear input fields
    function clearInputs() {
        taskTitle.value = '';
        taskDescription.value = '';
        taskDueDate.value = '';
        taskPriority.value = 'Low';
    }

    // Event listeners for filtering and sorting tasks
    filterTitle.addEventListener('input', filterAndSortTasks);
    filterDueDate.addEventListener('change', filterAndSortTasks);
    filterPriority.addEventListener('change', filterAndSortTasks);
    sortTasks.addEventListener('change', filterAndSortTasks);

    // Function to filter and sort tasks
    function filterAndSortTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let filteredTasks = tasks.filter(task => {
            const titleFilter = filterTitle.value.toLowerCase();
            const dueDateFilter = filterDueDate.value;
            const priorityFilter = filterPriority.value;
            return (
                (titleFilter === '' || task.title.toLowerCase().includes(titleFilter)) &&
                (dueDateFilter === '' || task.dueDate === dueDateFilter) &&
                (priorityFilter === '' || task.priority === priorityFilter)
            );
        });
        filteredTasks = sortTasksList(filteredTasks);
        taskList.innerHTML = '';
        filteredTasks.forEach(task => addTask(task.id, task.title, task.description, task.dueDate, task.priority, task.completed));
    }

    // Function to sort tasks list
    function sortTasksList(tasks) {
        const sortBy = sortTasks.value;
        return tasks.sort((a, b) => {
            if (sortBy === 'alphabetical') {
                return a.title.localeCompare(b.title);
            } else if (sortBy === 'reverseAlphabetical') {
                return b.title.localeCompare(a.title);
            } else if (sortBy === 'soonest') {
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else if (sortBy === 'latest') {
                return new Date(b.dueDate) - new Date(a.dueDate);
            }
        });
    }

    // Load tasks on page load
    loadTasks();
});
