// Модуль базы данных для хранения задач
class TaskDatabase {
    constructor() {
        this.storageKey = 'todo_tasks';
        this.scheduleKey = 'todo_schedule';
        this.tasks = this.loadTasks();
        this.schedule = this.loadSchedule();
    }

    // Загрузка задач из localStorage
    loadTasks() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Ошибка загрузки задач:', e);
                return [];
            }
        }
        return [];
    }

    // Загрузка расписания
    loadSchedule() {
        const stored = localStorage.getItem(this.scheduleKey);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Ошибка загрузки расписания:', e);
                return [];
            }
        }
        return [];
    }

    // Сохранение задач в localStorage
    saveTasks() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
        } catch (e) {
            console.error('Ошибка сохранения задач:', e);
        }
    }

    // Сохранение расписания
    saveSchedule() {
        try {
            localStorage.setItem(this.scheduleKey, JSON.stringify(this.schedule));
        } catch (e) {
            console.error('Ошибка сохранения расписания:', e);
        }
    }

    // Добавление новой задачи
    addTask(task) {
        const newTask = {
            id: Date.now() + Math.random(),
            title: task.title,
            description: task.description || '',
            date: task.date,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(newTask);
        this.saveTasks();
        return newTask;
    }

    // Получение всех задач
    getAllTasks() {
        return this.tasks;
    }

    // Получение задач по дате
    getTasksByDate(date) {
        return this.tasks.filter(task => task.date === date);
    }

    // Получение задачи по ID
    getTaskById(id) {
        return this.tasks.find(task => task.id === id);
    }

    // Обновление задачи
    updateTask(id, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
            this.saveTasks();
            return this.tasks[taskIndex];
        }
        return null;
    }

    // Удаление задачи
    deleteTask(id) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            const deletedTask = this.tasks.splice(taskIndex, 1)[0];
            this.saveTasks();
            return deletedTask;
        }
        return null;
    }

    // Переключение статуса выполнения
    toggleTaskCompletion(id) {
        const task = this.getTaskById(id);
        if (task) {
            return this.updateTask(id, { completed: !task.completed });
        }
        return null;
    }

    // Получение количества задач по дате
    getTaskCountByDate(date) {
        return this.getTasksByDate(date).length;
    }

    // Получение дат с задачами для текущего месяца
    getDatesWithTasks(year, month) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        const datesWithTasks = [];
        
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateStr = this.formatDateForStorage(date);
            const tasks = this.getTasksByDate(dateStr);
            if (tasks.length > 0) {
                const allCompleted = tasks.every(task => task.completed);
                datesWithTasks.push({
                    date: dateStr,
                    count: tasks.length,
                    allCompleted: allCompleted
                });
            }
        }
        
        return datesWithTasks;
    }

    // ---------- Расписание (Schedule) ----------
    // Элемент расписания: { id, subject, weekday (0-6, 0-Пн), startTime, endTime, teacher, room }

    addSchedule(entry) {
        const newEntry = {
            id: Date.now() + Math.random(),
            subject: entry.subject.trim(),
            weekday: Number(entry.weekday),
            startTime: entry.startTime,
            endTime: entry.endTime,
            teacher: (entry.teacher || '').trim(),
            room: (entry.room || '').trim()
        };
        this.schedule.push(newEntry);
        this.saveSchedule();
        return newEntry;
    }

    getAllSchedule() {
        return this.schedule;
    }

    getScheduleByWeekday(weekday) {
        return this.schedule
            .filter(s => s.weekday === Number(weekday))
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    getScheduleById(id) {
        return this.schedule.find(s => s.id === id);
    }

    updateSchedule(id, updates) {
        const idx = this.schedule.findIndex(s => s.id === id);
        if (idx !== -1) {
            this.schedule[idx] = { ...this.schedule[idx], ...updates };
            this.saveSchedule();
            return this.schedule[idx];
        }
        return null;
    }

    deleteSchedule(id) {
        const idx = this.schedule.findIndex(s => s.id === id);
        if (idx !== -1) {
            const removed = this.schedule.splice(idx, 1)[0];
            this.saveSchedule();
            return removed;
        }
        return null;
    }

    clearSchedule() {
        this.schedule = [];
        this.saveSchedule();
    }

    // Форматирование даты для хранения (YYYY-MM-DD)
    formatDateForStorage(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Форматирование даты для отображения
    formatDateForDisplay(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Очистка всех задач
    clearAllTasks() {
        this.tasks = [];
        this.saveTasks();
    }

    // Экспорт задач
    exportTasks() {
        return JSON.stringify(this.tasks, null, 2);
    }

    // Экспорт расписания
    exportSchedule() {
        return JSON.stringify(this.schedule, null, 2);
    }

    // Импорт задач
    importTasks(jsonData) {
        try {
            const importedTasks = JSON.parse(jsonData);
            if (Array.isArray(importedTasks)) {
                this.tasks = importedTasks;
                this.saveTasks();
                return true;
            }
            return false;
        } catch (e) {
            console.error('Ошибка импорта задач:', e);
            return false;
        }
    }

    // Импорт расписания
    importSchedule(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            if (Array.isArray(imported)) {
                this.schedule = imported;
                this.saveSchedule();
                return true;
            }
            return false;
        } catch (e) {
            console.error('Ошибка импорта расписания:', e);
            return false;
        }
    }
}

// Создание глобального экземпляра базы данных
window.taskDB = new TaskDatabase();
