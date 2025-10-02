// Reminders Management System
class ReminderManager {
    constructor() {
        this.reminders = this.loadReminders();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.setDefaultDate();
        this.updateReminderCount();
        this.filterReminders('all');
    }

    bindEvents() {
        // Add reminder button
        document.getElementById('add-reminder-btn').addEventListener('click', () => {
            this.addReminder();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterReminders(filter);
            });
        });

        // Reminder action buttons (using event delegation)
        document.getElementById('reminder-list').addEventListener('click', (e) => {
            const reminderItem = e.target.closest('.reminder-item');
            if (!reminderItem) return;

            const reminderId = reminderItem.dataset.id;
            
            if (e.target.closest('.complete')) {
                this.completeReminder(reminderId);
            } else if (e.target.closest('.edit')) {
                this.editReminder(reminderId);
            } else if (e.target.closest('.delete')) {
                this.deleteReminder(reminderId);
            }
        });

        // Form validation on input
        document.getElementById('reminder-title').addEventListener('input', this.validateForm);
        document.getElementById('reminder-date').addEventListener('change', this.validateForm);
    }

    setDefaultDate() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        document.getElementById('reminder-date').value = tomorrow.toISOString().split('T')[0];
    }

    validateForm() {
        const title = document.getElementById('reminder-title').value.trim();
        const date = document.getElementById('reminder-date').value;
        const addBtn = document.getElementById('add-reminder-btn');

        if (title && date) {
            addBtn.disabled = false;
            addBtn.style.opacity = '1';
        } else {
            addBtn.disabled = true;
            addBtn.style.opacity = '0.6';
        }
    }

    addReminder() {
        const title = document.getElementById('reminder-title').value.trim();
        const description = document.getElementById('reminder-description').value.trim();
        const category = document.getElementById('reminder-category').value;
        const date = document.getElementById('reminder-date').value;
        const time = document.getElementById('reminder-time').value;
        const repeat = document.getElementById('reminder-repeat').value;

        // Validation
        if (!title) {
            this.showAlert('Please enter a reminder title', 'error');
            return;
        }

        if (!date) {
            this.showAlert('Please select a reminder date', 'error');
            return;
        }

        // Create reminder object
        const reminder = {
            id: Date.now().toString(),
            title,
            description,
            category: category || 'other',
            date,
            time,
            repeat,
            completed: false,
            createdAt: new Date().toISOString()
        };

        // Add to reminders array
        this.reminders.push(reminder);
        this.saveReminders();
        this.renderReminders();
        this.updateReminderCount();
        this.clearForm();
        
        this.showAlert('Reminder added successfully!', 'success');
    }

    editReminder(id) {
        const reminder = this.reminders.find(r => r.id === id);
        if (!reminder) return;

        // Populate form with reminder data
        document.getElementById('reminder-title').value = reminder.title;
        document.getElementById('reminder-description').value = reminder.description || '';
        document.getElementById('reminder-category').value = reminder.category;
        document.getElementById('reminder-date').value = reminder.date;
        document.getElementById('reminder-time').value = reminder.time;
        document.getElementById('reminder-repeat').value = reminder.repeat;

        // Change button to update mode
        const addBtn = document.getElementById('add-reminder-btn');
        addBtn.innerHTML = '<i class="fas fa-save"></i> Update Reminder';
        addBtn.dataset.editId = id;

        // Scroll to form
        document.querySelector('.sidebar').scrollIntoView({ behavior: 'smooth' });
    }

    updateReminder(id) {
        const reminderIndex = this.reminders.findIndex(r => r.id === id);
        if (reminderIndex === -1) return;

        const title = document.getElementById('reminder-title').value.trim();
        const description = document.getElementById('reminder-description').value.trim();
        const category = document.getElementById('reminder-category').value;
        const date = document.getElementById('reminder-date').value;
        const time = document.getElementById('reminder-time').value;
        const repeat = document.getElementById('reminder-repeat').value;

        // Update reminder
        this.reminders[reminderIndex] = {
            ...this.reminders[reminderIndex],
            title,
            description,
            category: category || 'other',
            date,
            time,
            repeat,
            updatedAt: new Date().toISOString()
        };

        this.saveReminders();
        this.renderReminders();
        this.clearForm();
        this.resetAddButton();
        
        this.showAlert('Reminder updated successfully!', 'success');
    }

    completeReminder(id) {
        const reminderIndex = this.reminders.findIndex(r => r.id === id);
        if (reminderIndex === -1) return;

        this.reminders[reminderIndex].completed = true;
        this.reminders[reminderIndex].completedAt = new Date().toISOString();

        this.saveReminders();
        this.renderReminders();
        this.updateReminderCount();
        
        this.showAlert('Reminder marked as complete!', 'success');
    }

    deleteReminder(id) {
        if (!confirm('Are you sure you want to delete this reminder?')) return;

        this.reminders = this.reminders.filter(r => r.id !== id);
        this.saveReminders();
        this.renderReminders();
        this.updateReminderCount();
        
        this.showAlert('Reminder deleted successfully!', 'success');
    }

    filterReminders(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        this.renderReminders();
    }

    getFilteredReminders() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.reminders.filter(reminder => {
            if (reminder.completed) return false;

            const reminderDate = new Date(reminder.date);
            reminderDate.setHours(0, 0, 0, 0);

            switch (this.currentFilter) {
                case 'today':
                    return reminderDate.getTime() === today.getTime();
                case 'upcoming':
                    return reminderDate.getTime() > today.getTime();
                case 'overdue':
                    return reminderDate.getTime() < today.getTime();
                default:
                    return true;
            }
        });
    }

    renderReminders() {
        const reminderList = document.getElementById('reminder-list');
        const emptyState = document.getElementById('empty-state');
        const filteredReminders = this.getFilteredReminders();

        if (filteredReminders.length === 0) {
            reminderList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        reminderList.style.display = 'block';
        emptyState.style.display = 'none';

        reminderList.innerHTML = filteredReminders.map(reminder => {
            const status = this.getReminderStatus(reminder);
            const icon = this.getCategoryIcon(reminder.category);
            const formattedDate = this.formatDateTime(reminder.date, reminder.time);

            return `
                <div class="reminder-item ${status}" data-id="${reminder.id}">
                    <div class="reminder-icon ${reminder.category}">
                        <i class="${icon}"></i>
                    </div>
                    <div class="reminder-details">
                        <div class="reminder-title">${reminder.title}</div>
                        ${reminder.description ? `<div class="reminder-description">${reminder.description}</div>` : ''}
                        <div class="reminder-category">${this.getCategoryName(reminder.category)}</div>
                        <div class="reminder-datetime">${formattedDate}</div>
                    </div>
                    <div class="reminder-actions">
                        <button class="action-btn-small complete" title="Mark as Complete">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="action-btn-small edit" title="Edit Reminder">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn-small delete" title="Delete Reminder">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getReminderStatus(reminder) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const reminderDate = new Date(reminder.date);
        reminderDate.setHours(0, 0, 0, 0);

        if (reminderDate.getTime() === today.getTime()) return 'today';
        if (reminderDate.getTime() > today.getTime()) return 'upcoming';
        return 'overdue';
    }

    getCategoryIcon(category) {
        const icons = {
            bills: 'fas fa-bolt',
            income: 'fas fa-money-bill-wave',
            investment: 'fas fa-chart-line',
            savings: 'fas fa-piggy-bank',
            subscription: 'fas fa-tv',
            other: 'fas fa-bell'
        };
        return icons[category] || icons.other;
    }

    getCategoryName(category) {
        const names = {
            bills: 'Bills & Utilities',
            income: 'Income',
            investment: 'Investment',
            savings: 'Savings Goal',
            subscription: 'Subscription',
            other: 'Other'
        };
        return names[category] || 'Other';
    }

    formatDateTime(date, time) {
        const dateObj = new Date(date);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        const formattedDate = dateObj.toLocaleDateString('en-US', options);
        
        // Format time
        const [hours, minutes] = time.split(':');
        const timeObj = new Date();
        timeObj.setHours(parseInt(hours), parseInt(minutes));
        const formattedTime = timeObj.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });

        return `${formattedDate} • ${formattedTime}`;
    }

    updateReminderCount() {
        const activeReminders = this.reminders.filter(r => !r.completed).length;
        const countElement = document.querySelector('.reminder-count');
        countElement.textContent = `${activeReminders} reminder${activeReminders !== 1 ? 's' : ''}`;
    }

    clearForm() {
        document.getElementById('reminder-title').value = '';
        document.getElementById('reminder-description').value = '';
        document.getElementById('reminder-category').value = '';
        document.getElementById('reminder-time').value = '09:00';
        document.getElementById('reminder-repeat').value = 'none';
        this.setDefaultDate();
    }

    resetAddButton() {
        const addBtn = document.getElementById('add-reminder-btn');
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Reminder';
        delete addBtn.dataset.editId;
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;

        // Add styles
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#d1fae5' : type === 'error' ? '#fef2f2' : '#e0f2fe'};
            color: ${type === 'success' ? '#047857' : type === 'error' ? '#dc2626' : '#0369a1'};
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(alert);

        // Animate in
        setTimeout(() => {
            alert.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            alert.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(alert);
            }, 300);
        }, 3000);
    }

    loadReminders() {
        const saved = localStorage.getItem('coinflow-reminders');
        return saved ? JSON.parse(saved) : [];
    }

    saveReminders() {
        localStorage.setItem('coinflow-reminders', JSON.stringify(this.reminders));
    }
}

// Initialize the reminder manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ReminderManager();
});

// Handle add/update button click
document.addEventListener('click', (e) => {
    if (e.target.id === 'add-reminder-btn' || e.target.closest('#add-reminder-btn')) {
        const btn = e.target.closest('#add-reminder-btn');
        if (btn.dataset.editId) {
            // Update existing reminder
            window.reminderManager.updateReminder(btn.dataset.editId);
        }
    }
});

// Make reminder manager globally accessible
window.reminderManager = null;
document.addEventListener('DOMContentLoaded', () => {
    window.reminderManager = new ReminderManager();
});