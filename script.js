// Debug: Check if script is loaded
console.log('Script loaded');

// Get DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalTasksEl = document.getElementById('totalTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const completedTasksEl = document.getElementById('completedTasks');
const editModal = document.getElementById('editModal');
const editTaskInput = document.getElementById('editTaskInput');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const closeModalBtn = document.querySelector('.close-modal');

// Debug: Log Elements
console.log("Elements found:");
console.log('taskInput:', taskInput);
console.log('addTaskBtn:', addTaskBtn);
console.log('taskList:', taskList);
console.log('filterBtns:', filterBtns);
console.log('editModal:', editModal);

// State Variables
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

// Initialize the app
function initApp() {
    console.log('Initializing app');

    // Load tasks from localStorage 
    loadTasks();

    // Setup event listeners
    setupEventListeners();

    // Render initial tasks
    renderTasks();
    updateStats();

    console.log('App initialized successfully!');
}

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('todoTasks');

    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        console.log("Loaded", tasks.length, "tasks from localStorage");
    } else {
        // Create sample tasks for first-time users
        createSampleTasks();
        console.log("Created sample tasks");
    }
}

// Create sample tasks
function createSampleTasks() {
    tasks = [
        {
            id: Date.now() + 1,
            text: "Welcome to your Todo List",
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 2,
            text: "Click on a task to mark it as completed",
            completed: true,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 3,
            text: "Use the edit button to modify tasks",
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 4,
            text: "Try filtering tasks using buttons",
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 5,
            text: "Add your own tasks using input above",
            completed: true,
            createdAt: new Date().toISOString()
        },
    ];
    saveTasks();
}

// Setup all event listeners
function setupEventListeners() {
    console.log("Setting up event listeners...");

    // Add Task button
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addTask);
        console.log("Add Task button listener added");
    }

    // Add task on Enter key
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    }

    // Filter buttons
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Get filter type from data-filter attribute
                const filter = btn.getAttribute('data-filter');
                setFilter(filter);
            });
        });
        console.log("Filter button listeners added");
    }

    // Edit modal buttons
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', saveEditedTask);
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeEditModal);
    }

    // Close modal when clicking outside
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });

    console.log("All event listeners setup complete");
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

// Set active filter
function setFilter(filter) {
    console.log("Setting filter to:", filter);

    // Update current filter
    currentFilter = filter;

    // Update button active states
    filterBtns.forEach(btn => {
        const btnFilter = btn.getAttribute('data-filter');
        if (btnFilter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Re-render tasks 
    renderTasks();
}

// Add a new task
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert('Please enter a task!');
        taskInput.focus();
        return;
    }

    // Create new task object
    const newTask = {
        id: Date.now(), // Use timestamp as unique ID
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };

    // Add to beginning of tasks array
    tasks.unshift(newTask);

    // Save to localStorage
    saveTasks();

    // Clear input
    taskInput.value = "";

    // Re-render tasks and update stats
    renderTasks();
    updateStats();

    // Show visual feedback
    showNotification('Task added successfully!', 'success');

    console.log("Task added:", newTask);
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    if (totalTasksEl) totalTasksEl.textContent = total;
    if (completedTasksEl) completedTasksEl.textContent = completed;
    if (pendingTasksEl) pendingTasksEl.textContent = pending;
}

// Render tasks based on current filter
function renderTasks() {
    console.log("Rendering tasks with filter:", currentFilter);

    // Clear task list
    if (taskList) {
        taskList.innerHTML = "";
    } else {
        console.error("taskList element not found");
        return;
    }

    // Filter tasks
    let filteredTasks = [];

    switch (currentFilter) {
        case 'all':
            filteredTasks = [...tasks];
            break;
        case 'pending':
            filteredTasks = tasks.filter(task => !task.completed);
            break;
        case 'completed':
            filteredTasks = tasks.filter(task => task.completed);
            break;
    }

    // Check if no tasks
    if (filteredTasks.length === 0) {
        let message = "";
        let icon = 'fas fa-clipboard-list';

        switch (currentFilter) {
            case 'all':
                message = 'No tasks yet. Add a task to get started!';
                break;
            case 'pending':
                message = 'No pending tasks. All tasks are completed!';
                icon = 'fas fa-check-circle';
                break;
            case 'completed':
                message = 'No completed tasks yet. Complete some tasks!';
                icon = 'fas fa-hourglass-start';
                break;
        }

        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="${icon}"></i>
            <p>${message}</p>
        `;
        taskList.appendChild(emptyState);
        return;
    }

    // Render each task
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        if (taskElement) {
            taskList.appendChild(taskElement);
        }
    });

    console.log('Rendered', filteredTasks.length, "tasks");
}

// Create a task element
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskElement.dataset.id = task.id;

    // Format date
    const createdDate = new Date(task.createdAt);
    const dateString = createdDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    taskElement.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <div class="task-content">
            <span class="task-text">${task.text}</span>
            <small class="task-date">Added: ${dateString}</small>
        </div>
        <div class="task-actions">
            <button class="edit-btn" title="Edit task">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" title="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    // Add event listeners
    const checkbox = taskElement.querySelector('.task-checkbox');
    const editBtn = taskElement.querySelector('.edit-btn');
    const deleteBtn = taskElement.querySelector('.delete-btn');
    const taskText = taskElement.querySelector('.task-text');

    // Toggle completion
    checkbox.addEventListener('change', () => {
        toggleTaskCompletion(task.id);
    });

    // Click task text to toggle (alternative)
    taskText.addEventListener('click', () => {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
    });

    // Edit task
    editBtn.addEventListener('click', () => {
        openEditModal(task);
    });

    // Delete task
    deleteBtn.addEventListener('click', () => {
        deleteTask(task.id);
    });

    return taskElement;
}

// Toggle task completion
function toggleTaskCompletion(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
        updateStats();

        const status = tasks[taskIndex].completed ? 'completed' : 'pending';
        showNotification(`Task marked as ${status}!`, 'info');
    }
}

// Delete a task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
            saveTasks();
            renderTasks();
            updateStats();
            showNotification('Task deleted!', 'info');
            console.log("Task deleted with ID:", taskId);
        }
    }
}

// Open edit modal
function openEditModal(task) {
    editingTaskId = task.id;
    editTaskInput.value = task.text;
    editModal.style.display = 'flex';
    editTaskInput.focus();
    editTaskInput.select();
}

// Close edit modal
function closeEditModal() {
    editModal.style.display = 'none';
    editingTaskId = null;
    editTaskInput.value = "";
}

// Save edited task
function saveEditedTask() {
    const newText = editTaskInput.value.trim();

    if (newText === "") {
        alert('Task cannot be empty!');
        return;
    }

    const taskIndex = tasks.findIndex(task => task.id === editingTaskId);

    if (taskIndex !== -1) {
        tasks[taskIndex].text = newText;
        tasks[taskIndex].updatedAt = new Date().toISOString();
        saveTasks();
        renderTasks();
        closeEditModal();
        showNotification('Task updated successfully!', 'success');
    }
}

// Show notification
function showNotification(message, type) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    // Set icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';

    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add notification styles
function addNotificationStyles() {
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            
            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .notification-success {
                background: linear-gradient(to right, #28a745, #20c997);
            }
            
            .notification-info {
                background: linear-gradient(to right, #17a2b8, #20c997);
            }
            
            .notification-error {
                background: linear-gradient(to right, #dc3545, #e83e8c);
            }
            
            @media (max-width: 768px) {
                .notification {
                    left: 20px;
                    right: 20px;
                    transform: translateY(-100%);
                }
                
                .notification.show {
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Add task list styles
function addTaskListStyles() {
    if (!document.querySelector('#task-list-styles')) {
        const style = document.createElement('style');
        style.id = 'task-list-styles';
        style.textContent = `
            .task-item {
                display: flex;
                align-items: center;
                padding: 12px 15px;
                background: white;
                border-radius: 8px;
                margin-bottom: 10px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }
            
            .task-item:hover {
                box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                transform: translateY(-2px);
            }
            
            .task-item.completed {
                opacity: 0.7;
                background: #f8f9fa;
            }
            
            .task-checkbox {
                margin-right: 15px;
                width: 20px;
                height: 20px;
                cursor: pointer;
            }
            
            .task-content {
                flex: 1;
            }
            
            .task-text {
                display: block;
                font-size: 16px;
                color: #333;
                cursor: pointer;
            }
            
            .task-item.completed .task-text {
                text-decoration: line-through;
                color: #6c757d;
            }
            
            .task-date {
                display: block;
                font-size: 12px;
                color: #6c757d;
                margin-top: 4px;
            }
            
            .task-actions {
                display: flex;
                gap: 10px;
            }
            
            .edit-btn, .delete-btn {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 16px;
                color: #6c757d;
                transition: color 0.3s;
                padding: 5px;
                border-radius: 4px;
            }
            
            .edit-btn:hover {
                color: #007bff;
                background: rgba(0, 123, 255, 0.1);
            }
            
            .delete-btn:hover {
                color: #dc3545;
                background: rgba(220, 53, 69, 0.1);
            }
            
            .empty-state {
                text-align: center;
                padding: 40px 20px;
                color: #6c757d;
            }
            
            .empty-state i {
                font-size: 48px;
                margin-bottom: 20px;
                opacity: 0.5;
            }
            
            .empty-state p {
                font-size: 16px;
                margin: 0;
            }
            
            .filter-buttons {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .filter-btn {
                padding: 8px 16px;
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .filter-btn.active {
                background: #007bff;
                color: white;
                border-color: #007bff;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // Add custom styles
    addNotificationStyles();
    addTaskListStyles();

    // Initialize app
    initApp();

    // Make functions available for debugging
    window.debug = {
        tasks: tasks,
        addTask: addTask,
        renderTasks: renderTasks,
        updateStats: updateStats,
        showNotification: showNotification,
        deleteTask: deleteTask
    };

    console.log("Debug functions available. Try: debug.addTask()");
});

// Fallback: if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}