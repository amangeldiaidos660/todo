// Основное приложение Todo календаря
class TodoCalendar {
    constructor() {
        this.currentDate = new Date();
        this.currentYear = this.currentDate.getFullYear();
        this.currentMonth = this.currentDate.getMonth();
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCalendar();
        this.updateMonthDisplay();
        this.setTodayDate();
    }

    // Привязка событий
    bindEvents() {
        // Навигация по месяцам
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.previousMonth();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.nextMonth();
        });

        // Добавление задачи
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.showAddTaskModal();
        });

        // Показать базу данных
        document.getElementById('showDatabaseBtn').addEventListener('click', () => {
            this.showDatabase();
        });

        // Сохранение задачи
        document.getElementById('saveTaskBtn').addEventListener('click', () => {
            this.saveTask();
        });

        // Обработка формы добавления задачи
        document.getElementById('addTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Установка текущей даты при открытии модального окна
        document.getElementById('addTaskModal').addEventListener('show.bs.modal', () => {
            this.setModalCurrentDate();
        });
    }

    // Переход к предыдущему месяцу
    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.renderCalendar();
        this.updateMonthDisplay();
    }

    // Переход к следующему месяцу
    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.renderCalendar();
        this.updateMonthDisplay();
    }

    // Обновление отображения текущего месяца
    updateMonthDisplay() {
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        
        document.getElementById('currentMonth').textContent = 
            `${monthNames[this.currentMonth]} ${this.currentYear}`;
    }

    // Рендеринг календаря
    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = '';

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        
        // Начинаем с понедельника
        const dayOfWeek = firstDay.getDay();
        const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setDate(startDate.getDate() - offset);

        // Получаем даты с задачами для текущего месяца
        const datesWithTasks = window.taskDB.getDatesWithTasks(this.currentYear, this.currentMonth);

        // Создаем сетку календаря (6 недель)
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (week * 7) + day);
                
                const dayElement = this.createDayElement(currentDate, datesWithTasks);
                calendarGrid.appendChild(dayElement);
            }
        }
    }

    // Создание элемента дня
    createDayElement(date, datesWithTasks) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const dayNumber = date.getDate();
        const isCurrentMonth = date.getMonth() === this.currentMonth;
        const isToday = this.isToday(date);
        const dateStr = window.taskDB.formatDateForStorage(date);
        
        // Проверяем, есть ли задачи на этот день
        const dayTasks = datesWithTasks.find(d => d.date === dateStr);
        const hasTasks = dayTasks !== undefined;
        
        if (!isCurrentMonth) {
            dayElement.classList.add('other-month');
        }
        
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        if (hasTasks) {
            // Проверяем статус задач для определения цвета
            if (dayTasks.allCompleted) {
                dayElement.classList.add('all-tasks-completed');
            } else {
                dayElement.classList.add('has-tasks');
            }
        }

        // Добавляем номер дня
        const dayNumberElement = document.createElement('div');
        dayNumberElement.className = 'day-number';
        dayNumberElement.textContent = dayNumber;
        dayElement.appendChild(dayNumberElement);

        // Добавляем индикатор задач
        if (hasTasks) {
            const taskCountElement = document.createElement('div');
            taskCountElement.className = 'task-count';
            taskCountElement.textContent = dayTasks.count;
            dayElement.appendChild(taskCountElement);
        }

        // Добавляем обработчик клика для просмотра задач
        dayElement.addEventListener('click', () => {
            this.showDayTasks(dateStr);
        });

        return dayElement;
    }

    // Проверка, является ли дата сегодняшней
    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    // Установка текущей даты в календаре
    setTodayDate() {
        const today = new Date();
        if (today.getMonth() !== this.currentMonth || today.getFullYear() !== this.currentYear) {
            this.currentYear = today.getFullYear();
            this.currentMonth = today.getMonth();
            this.renderCalendar();
            this.updateMonthDisplay();
        }
    }

    // Показ модального окна добавления задачи
    showAddTaskModal() {
        const modal = new bootstrap.Modal(document.getElementById('addTaskModal'));
        modal.show();
    }

    // Установка текущей даты в модальном окне
    setModalCurrentDate() {
        const today = new Date();
        const dateStr = window.taskDB.formatDateForStorage(today);
        document.getElementById('taskDate').value = dateStr;
    }

    // Сохранение задачи
    saveTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const date = document.getElementById('taskDate').value;

        if (!title || !date) {
            alert('Пожалуйста, заполните заголовок и дату!');
            return;
        }

        const task = {
            title: title,
            description: description,
            date: date
        };

        window.taskDB.addTask(task);
        
        // Очищаем форму
        document.getElementById('addTaskForm').reset();
        
        // Закрываем модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
        modal.hide();
        
        // Обновляем календарь
        this.renderCalendar();
        
        // Показываем уведомление
        this.showNotification('Задача успешно добавлена!', 'success');
    }

    // Показ задач на выбранный день
    showDayTasks(dateStr) {
        const tasks = window.taskDB.getTasksByDate(dateStr);
        const modal = new bootstrap.Modal(document.getElementById('dayTasksModal'));
        
        // Обновляем заголовок
        document.getElementById('dayTasksTitle').textContent = 
            `Задачи на ${window.taskDB.formatDateForDisplay(dateStr)}`;
        
        // Очищаем список задач
        const tasksList = document.getElementById('dayTasksList');
        tasksList.innerHTML = '';
        
        if (tasks.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-day';
            emptyMessage.textContent = 'На этот день задач нет';
            tasksList.appendChild(emptyMessage);
        } else {
            tasks.forEach(task => {
                const taskElement = this.createTaskElement(task);
                tasksList.appendChild(taskElement);
            });
        }
        
        modal.show();
    }

    // Создание элемента задачи
    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        taskElement.innerHTML = `
            <div class="task-title">${task.title}</div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-date">Создано: ${new Date(task.createdAt).toLocaleDateString('ru-RU')}</div>
            <div class="task-actions">
                <button class="btn btn-sm ${task.completed ? 'btn-warning' : 'btn-success'} toggle-task-btn" 
                        data-task-id="${task.id}">
                    ${task.completed ? 'Отменить' : 'Выполнить'}
                </button>
                <button class="btn btn-sm btn-primary edit-task-btn" 
                        data-task-id="${task.id}">
                    Редактировать
                </button>
                <button class="btn btn-sm btn-danger delete-task-btn" 
                        data-task-id="${task.id}">
                    Удалить
                </button>
            </div>
        `;
        
        // Добавляем обработчики событий для кнопок
        const toggleBtn = taskElement.querySelector('.toggle-task-btn');
        const editBtn = taskElement.querySelector('.edit-task-btn');
        const deleteBtn = taskElement.querySelector('.delete-task-btn');
        
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleTaskCompletion(task.id);
        });
        
        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.editTask(task);
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.deleteTask(task.id);
        });
        
        return taskElement;
    }

    // Переключение статуса выполнения задачи
    toggleTaskCompletion(taskId) {
        window.taskDB.toggleTaskCompletion(taskId);
        this.refreshDayTasksModal();
        this.renderCalendar();
        this.showNotification('Статус задачи изменен!', 'info');
    }

    // Редактирование задачи
    editTask(task) {
        // Создаем модальное окно для редактирования
        const editModal = document.createElement('div');
        editModal.className = 'modal fade';
        editModal.id = 'editTaskModal';
        editModal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Редактировать задачу</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editTaskForm">
                            <div class="mb-3">
                                <label for="editTaskTitle" class="form-label">Заголовок *</label>
                                <input type="text" class="form-control" id="editTaskTitle" value="${task.title}" required>
                            </div>
                            <div class="mb-3">
                                <label for="editTaskDescription" class="form-label">Описание</label>
                                <textarea class="form-control" id="editTaskDescription" rows="3">${task.description || ''}</textarea>
                            </div>
                            <div class="mb-3">
                                <label for="editTaskDate" class="form-label">Дата *</label>
                                <input type="date" class="form-control" id="editTaskDate" value="${task.date}" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-primary" id="updateTaskBtn">Обновить</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(editModal);
        
        const modal = new bootstrap.Modal(editModal);
        modal.show();
        
        // Обработчик обновления задачи
        document.getElementById('updateTaskBtn').addEventListener('click', () => {
            const updatedTask = {
                title: document.getElementById('editTaskTitle').value.trim(),
                description: document.getElementById('editTaskDescription').value.trim(),
                date: document.getElementById('editTaskDate').value
            };
            
            if (!updatedTask.title || !updatedTask.date) {
                alert('Пожалуйста, заполните заголовок и дату!');
                return;
            }
            
            window.taskDB.updateTask(task.id, updatedTask);
            modal.hide();
            editModal.remove();
            
            this.refreshDayTasksModal();
            this.renderCalendar();
            this.showNotification('Задача обновлена!', 'success');
        });
        
        // Удаляем модальное окно при закрытии
        editModal.addEventListener('hidden.bs.modal', () => {
            editModal.remove();
        });
    }

    // Удаление задачи
    deleteTask(taskId) {
        if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
            window.taskDB.deleteTask(taskId);
            this.refreshDayTasksModal();
            this.renderCalendar();
            this.showNotification('Задача удалена!', 'info');
        }
    }

    // Обновление модального окна с задачами дня
    refreshDayTasksModal() {
        const modal = document.getElementById('dayTasksModal');
        if (modal.classList.contains('show')) {
            const dateStr = document.getElementById('dayTasksTitle').textContent
                .match(/\d{1,2}\.\d{1,2}\.\d{4}/);
            if (dateStr) {
                const date = new Date(dateStr[0].split('.').reverse().join('-'));
                const dateStrFormatted = window.taskDB.formatDateForStorage(date);
                this.showDayTasks(dateStrFormatted);
            }
        }
    }

    // Показ уведомления
    showNotification(message, type = 'info') {
        // Создаем простое уведомление
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Автоматически скрываем через 3 секунды
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Показать JSON базу данных
    showDatabase() {
        const tasks = window.taskDB.getAllTasks();
        const jsonData = window.taskDB.exportTasks();
        
        const dbModal = document.createElement('div');
        dbModal.className = 'modal fade';
        dbModal.id = 'databaseModal';
        dbModal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">База данных задач (${tasks.length} задач)</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <button class="btn btn-success me-2" id="exportBtn">Экспорт JSON</button>
                            <button class="btn btn-warning me-2" id="clearAllBtn">Очистить все</button>
                            <button class="btn btn-info" id="importBtn">Импорт JSON</button>
                        </div>
                        <div class="mb-3">
                            <label for="importData" class="form-label">Вставить JSON для импорта:</label>
                            <textarea class="form-control" id="importData" rows="3" placeholder='[{"title":"Пример","description":"Описание","date":"2024-01-01"}]'></textarea>
                        </div>
                        <div class="mb-3">
                            <h6>Текущие задачи:</h6>
                            <div id="tasksList" class="border p-3" style="max-height: 400px; overflow-y: auto;"></div>
                        </div>
                        <div>
                            <h6>JSON данные:</h6>
                            <pre class="border p-3 bg-light" style="max-height: 300px; overflow-y: auto; font-size: 12px;">${jsonData}</pre>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dbModal);
        
        const modal = new bootstrap.Modal(dbModal);
        modal.show();
        
        // Отображение списка задач
        const tasksList = document.getElementById('tasksList');
        if (tasks.length === 0) {
            tasksList.innerHTML = '<p class="text-muted">Задач нет</p>';
        } else {
            tasks.forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.className = 'border-bottom pb-2 mb-2';
                taskDiv.innerHTML = `
                    <strong>${task.title}</strong> - ${task.date}
                    <br><small class="text-muted">${task.description || 'Без описания'}</small>
                    <br><small class="text-${task.completed ? 'success' : 'warning'}">${task.completed ? 'Выполнено' : 'Не выполнено'}</small>
                `;
                tasksList.appendChild(taskDiv);
            });
        }
        
        // Обработчики кнопок
        document.getElementById('exportBtn').addEventListener('click', () => {
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tasks.json';
            a.click();
            URL.revokeObjectURL(url);
        });
        
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите удалить ВСЕ задачи? Это действие нельзя отменить!')) {
                window.taskDB.clearAllTasks();
                modal.hide();
                dbModal.remove();
                this.renderCalendar();
                this.showNotification('Все задачи удалены!', 'warning');
            }
        });
        
        document.getElementById('importBtn').addEventListener('click', () => {
            const importData = document.getElementById('importData').value.trim();
            if (importData) {
                if (window.taskDB.importTasks(importData)) {
                    modal.hide();
                    dbModal.remove();
                    this.renderCalendar();
                    this.showNotification('Задачи успешно импортированы!', 'success');
                } else {
                    alert('Ошибка импорта. Проверьте формат JSON данных.');
                }
            } else {
                alert('Введите JSON данные для импорта.');
            }
        });
        
        // Удаляем модальное окно при закрытии
        dbModal.addEventListener('hidden.bs.modal', () => {
            dbModal.remove();
        });
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.todoCalendar = new TodoCalendar();
});
