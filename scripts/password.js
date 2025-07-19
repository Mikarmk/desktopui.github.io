// Password Page Manager
class PasswordManager {
    constructor() {
        this.correctPassword = 'eNot278GHq';
        
        // Get DOM elements with error checking
        this.passwordButton = document.getElementById('passwordButton');
        this.passwordModal = document.getElementById('passwordModal');
        this.passwordInput = document.getElementById('passwordInput');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.submitBtn = document.getElementById('submitBtn');
        this.dayDateElement = document.getElementById('dayDate');
        this.timeElement = document.getElementById('currentTime');
        
        // Check if all elements exist
        if (!this.passwordButton || !this.passwordModal || !this.passwordInput ||
            !this.cancelBtn || !this.submitBtn || !this.dayDateElement || !this.timeElement) {
            console.error('Some DOM elements not found');
            return;
        }
        
        console.log('All DOM elements found, initializing...');
        this.init();
    }
    
    init() {
        this.updateDateTime();
        this.bindEvents();
        this.startTimeUpdate();
    }
    
    bindEvents() {
        console.log('Binding events...');
        
        // Password button click
        if (this.passwordButton) {
            this.passwordButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Password button clicked');
                this.showPasswordModal();
            });
        }
        
        // Cancel button click
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Cancel button clicked');
                this.hidePasswordModal();
            });
        }
        
        // Submit button click
        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Submit button clicked');
                this.checkPassword();
            });
        }
        
        // Enter key in password input
        this.passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.checkPassword();
            }
            if (e.key === 'Escape') {
                this.hidePasswordModal();
            }
        });
        
        // Modal overlay click to close
        this.passwordModal.addEventListener('click', (e) => {
            if (e.target === this.passwordModal) {
                this.hidePasswordModal();
            }
        });
        
        // Prevent modal content clicks from closing modal
        document.querySelector('.password-modal-content').addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.passwordModal.classList.contains('active')) {
                this.hidePasswordModal();
            }
        });
    }
    
    updateDateTime() {
        const now = new Date();
        
        // Russian day names
        const dayNames = [
            'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 
            'Четверг', 'Пятница', 'Суббота'
        ];
        
        // Russian month names
        const monthNames = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        
        const dayName = dayNames[now.getDay()];
        const day = now.getDate();
        const month = monthNames[now.getMonth()];
        
        // Format time
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        // Update elements
        this.dayDateElement.textContent = `${dayName}, ${day} ${month}`;
        this.timeElement.textContent = `${hours}:${minutes}`;
    }
    
    startTimeUpdate() {
        // Update time every minute
        setInterval(() => {
            this.updateDateTime();
        }, 60000);
        
        // Update time every second for more precise display
        setInterval(() => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            this.timeElement.textContent = `${hours}:${minutes}`;
        }, 1000);
    }
    
    showPasswordModal() {
        console.log('Showing password modal');
        this.passwordModal.classList.add('active');
        this.passwordInput.value = '';
        this.clearError();
        
        // Focus the input after animation
        setTimeout(() => {
            this.passwordInput.focus();
        }, 300);
    }
    
    hidePasswordModal() {
        console.log('Hiding password modal');
        this.passwordModal.classList.remove('active');
        this.passwordInput.value = '';
        this.clearError();
    }
    
    checkPassword() {
        const enteredPassword = this.passwordInput.value;
        console.log('Checking password:', enteredPassword.length, 'characters');
        console.log('Expected password:', this.correctPassword);
        
        if (enteredPassword === this.correctPassword) {
            console.log('Password correct!');
            this.showSuccess();
            setTimeout(() => {
                this.redirectToDesktop();
            }, 1500);
        } else {
            console.log('Password incorrect!');
            this.showError();
        }
    }
    
    showError() {
        const container = document.querySelector('.password-input-container');
        container.classList.add('error');
        this.passwordInput.value = '';
        this.passwordInput.focus();
        
        // Remove error class after animation
        setTimeout(() => {
            container.classList.remove('error');
        }, 500);
    }
    
    clearError() {
        const container = document.querySelector('.password-input-container');
        container.classList.remove('error');
        
        // Remove any existing success message
        const existingSuccess = container.querySelector('.success-message');
        if (existingSuccess) {
            existingSuccess.remove();
        }
    }
    
    showSuccess() {
        this.clearError();
        const container = document.querySelector('.password-input-container');
        
        // Create success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Пароль верный! Перенаправление...';
        container.appendChild(successMessage);
        
        // Disable input and buttons
        this.passwordInput.disabled = true;
        this.submitBtn.disabled = true;
        this.cancelBtn.disabled = true;
    }
    
    redirectToDesktop() {
        // Redirect to main desktop page
        window.location.href = 'index.html';
    }
    
    // Utility method to add custom avatar image
    setAvatarImage(imageSrc) {
        const avatarPlaceholder = document.querySelector('.avatar-placeholder');
        avatarPlaceholder.innerHTML = `<img src="${imageSrc}" alt="User Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    }
    
    // Utility method to set custom background
    setBackground(imageSrc) {
        document.body.style.backgroundImage = `url('${imageSrc}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
    }
}

// Initialize the password manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure all elements are ready
    setTimeout(() => {
        window.passwordManager = new PasswordManager();
    }, 100);
});

// Export for potential future use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PasswordManager;
}