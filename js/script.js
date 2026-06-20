const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const categorySelect = document.getElementById('category-select');
const taskDate = document.getElementById('task-date');
const addBtn = document.getElementById('add-btn');
    
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn:not(.priority-toggle):not(.priority-option)');
const taskList = document.getElementById('task-list');
const priorityBtn = document.getElementById('priority-btn');
const priorityDropdown = document.getElementById('priority-dropdown');
const priorityOptions = document.querySelectorAll('.priority-option');

const totalTasksSpan = document.getElementById('total-tasks');
const completedTasksSpan = document.getElementById('completed-tasks');
const pendingTasksSpan = document.getElementById('pending-tasks');
const progressPercentSpan = document.getElementById('progress-percent');
const progressFill = document.getElementById('progress-fill');

    let tasks = JSON.parse(localStorage.getItem('aeroleaf_tasks')) || [];
    let currentFilter = 'all';
    let searchQuery = '';
    let selectedPriority = null;

    function saveToLocalStorage() {
        
        localStorage.setItem('aeroleaf_tasks', JSON.stringify(tasks));
    }

    function updateDashboard() {
        const total = tasks.length;
        let completed = 0;

    for (let i = 0; i < tasks.length; i++) {

    if (tasks[i].completed) {
        completed++;
    }

    }
const pending = total - completed;
const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

     if (total > 0 && progressPercent === 100) {

    setTimeout(() => {
        alert(
            "🎉 Parabéns! Você concluiu todas as suas tarefas!"
        );
    }, 300);

}

totalTasksSpan.textContent = total;
completedTasksSpan.textContent = completed;
pendingTasksSpan.textContent = pending;
progressPercentSpan.textContent = `${progressPercent}%`;

        progressFill.style.width = `${progressPercent}%`;
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const dateObj = new Date(dateString);
        
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        
        return `${day}/${month} às ${hours}:${minutes}`;
    }

    function renderTasks() {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            const matchesFilter = 
                currentFilter === 'all' || 
                (currentFilter === 'pending' && !task.completed) || 
                (currentFilter === 'completed' && task.completed);
            
            const matchesPriority = !selectedPriority || task.priority === selectedPriority;
                
            const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesFilter && matchesPriority && matchesSearch;
            
        });

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            
            li.className = `task-card ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;

            let priorityClass = 'priority-low';
            if (task.priority === 'media') priorityClass = 'priority-medium';
            if (task.priority === 'alta') priorityClass = 'priority-high';

            li.innerHTML = `
                <div class="task-header">
                    <span class="task-title">${task.text}</span>
                </div>
                <div class="task-info">
                    <span class="badge ${priorityClass}">Prioridade ${task.priority}</span>
                    <span class="badge category">${task.category}</span>
                    ${task.date ? `<span class="badge date-tag">📅 ${formatDate(task.date)}</span>` : ''}
                </div>
                <div class="task-actions">
                    <button class="complete-btn">
                       ${task.completed ? '⏪ Refazer' : '✅ Concluir'}
                   </button>

                  <button class="edit-btn">
                        ✏️ Editar
                 </button>

                 <button class="delete-btn">
                 🗑️ Excluir
                 </button>
                </div>
            `;

            taskList.appendChild(li);
        });

        updateDashboard();
        saveToLocalStorage();
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;

        const newTask = {
            id: Date.now(),
            text: text,
            priority: prioritySelect.value,
            category: categorySelect.value,
            date: taskDate.value,
            completed: false
        };

        tasks.unshift(newTask);
        
        taskInput.value = '';
        taskDate.value = '';
        prioritySelect.value = 'baixa';
        categorySelect.value = 'Pessoal';

        renderTasks();
    }

    function toggleTaskStatus(id) {
        tasks = tasks.map(task => {
            if (task.id === parseInt(id)) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        renderTasks();
    }

    function deleteTask(id) {
        const item = document.querySelector(`[data-id="${id}"]`);
        if (item) {
            item.style.transform = 'scale(0.92)';
            item.style.opacity = '0';
            item.style.transition = 'all 0.25s ease';
            
            setTimeout(() => {
                tasks = tasks.filter(task => task.id !== parseInt(id));
                renderTasks();
            }, 250);
        } else {
            tasks = tasks.filter(task => task.id !== parseInt(id));
            renderTasks();
        }
    }

    function editTask(id) {

    const task = tasks.find(
        task => task.id === parseInt(id)
    );

    if (!task) return;

    const newText = prompt(
        'Editar tarefa:',
        task.text
    );

    if (
        newText !== null &&
        newText.trim() !== ''
    ) {
        task.text = newText.trim();
        renderTasks();
    }
}

    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderTasks();
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            currentFilter = button.getAttribute('data-filter');
            selectedPriority = null;
            priorityDropdown.classList.remove('active');
            renderTasks();
        });
    });

    // Botão para abrir/fechar dropdown de prioridades
    priorityBtn.addEventListener('click', () => {
        priorityDropdown.classList.toggle('active');
    });

    // Opções de prioridade
    priorityOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const priority = option.getAttribute('data-priority');
            
            priorityOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            selectedPriority = priority;
            priorityDropdown.classList.remove('active');
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            priorityBtn.classList.add('active');
            
            renderTasks();
        });
    });

    // Fechar dropdown quando clica fora
    document.addEventListener('click', (e) => {
        if (!priorityBtn.contains(e.target) && !priorityDropdown.contains(e.target)) {
            priorityDropdown.classList.remove('active');
        }
    });

    taskList.addEventListener('click', (e) => {
        const taskCard = e.target.closest('.task-card');
        if (!taskCard) return;
        const taskId = taskCard.dataset.id;
        
        if (e.target.classList.contains('complete-btn')) {
            toggleTaskStatus(taskId);
        }
        if (e.target.classList.contains('edit-btn')) {
            editTask(taskId);
        }
        if (e.target.classList.contains('delete-btn')) {
            deleteTask(taskId);
        }
    });

    renderTasks(); 
