// Audio Manager for system sounds
class AudioManager {
    constructor() {
        this.sounds = {
            enable: new Audio('assets/Enabling.mp3'),
            error: new Audio('assets/Error.mp3'),
            click: this.createClickSound(),
            success: this.createSuccessSound(),
            notification: this.createNotificationSound()
        };
        
        this.volume = 0.5;
        this.enabled = true;
        
        this.init();
    }
    
    init() {
        // Настройка громкости для всех звуков
        Object.values(this.sounds).forEach(sound => {
            if (sound instanceof Audio) {
                sound.volume = this.volume;
                sound.preload = 'auto';
            }
        });
        
        // Обработка ошибок загрузки
        Object.entries(this.sounds).forEach(([name, sound]) => {
            if (sound instanceof Audio) {
                sound.addEventListener('error', () => {
                    console.warn(`Не удалось загрузить звук: ${name}`);
                });
            }
        });
    }
    
    // Создание синтетических звуков для дополнительных эффектов
    createClickSound() {
        return this.createTone(800, 0.1, 'sine');
    }
    
    createSuccessSound() {
        return this.createTone(600, 0.2, 'sine');
    }
    
    createNotificationSound() {
        return this.createTone(440, 0.3, 'square');
    }
    
    createTone(frequency, duration, type = 'sine') {
        return {
            play: () => {
                if (!this.enabled) return;
                
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = frequency;
                    oscillator.type = type;
                    
                    gainNode.gain.setValueAtTime(this.volume * 0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + duration);
                } catch (error) {
                    console.warn('Не удалось воспроизвести синтетический звук:', error);
                }
            }
        };
    }
    
    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        
        try {
            const sound = this.sounds[soundName];
            if (sound instanceof Audio) {
                sound.currentTime = 0;
                sound.play().catch(error => {
                    console.warn(`Не удалось воспроизвести звук ${soundName}:`, error);
                });
            } else if (sound.play) {
                sound.play();
            }
        } catch (error) {
            console.warn(`Ошибка воспроизведения звука ${soundName}:`, error);
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        Object.values(this.sounds).forEach(sound => {
            if (sound instanceof Audio) {
                sound.volume = this.volume;
            }
        });
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    // Специальные методы для различных событий
    playClick() {
        this.play('click');
    }
    
    playEnable() {
        this.play('enable');
    }
    
    playError() {
        this.play('error');
    }
    
    playSuccess() {
        this.play('success');
    }
    
    playNotification() {
        this.play('notification');
    }
}

// Desktop Application Manager
class DesktopManager {
    constructor() {
        this.modalOverlay = document.getElementById('modalOverlay');
        this.appModal = document.getElementById('appModal');
        this.folderModal = document.getElementById('folderModal');
        this.documentModal = document.getElementById('documentModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalContent = document.getElementById('modalContent');
        
        // Инициализация аудио менеджера
        this.audioManager = new AudioManager();
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupKeyboardShortcuts();
    }
    
    bindEvents() {
        // Dock app clicks
        document.querySelectorAll('.dock-item.app').forEach(item => {
            item.addEventListener('click', (e) => {
                this.audioManager.playClick();
                const appName = e.currentTarget.dataset.app;
                this.openApp(appName);
            });
        });
        
        // Folder clicks
        document.querySelectorAll('.desktop-item.folder').forEach(item => {
            item.addEventListener('click', () => {
                this.audioManager.playClick();
                this.openFolder();
            });
        });
        
        // Document clicks inside folder - using event delegation
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target.closest('.folder-item.document-item')) {
                e.stopPropagation();
                this.audioManager.playClick();
                this.openDocument();
            }
        });
        
        // Task document clicks
        document.querySelectorAll('.desktop-item[data-type="task-document"]').forEach(item => {
            item.addEventListener('click', () => {
                this.audioManager.playClick();
                this.openTaskDocument();
            });
        });
        
        // Close button events
        document.getElementById('closeBtn').addEventListener('click', () => {
            this.audioManager.playClick();
            this.closeModal();
        });
        
        document.getElementById('folderCloseBtn').addEventListener('click', () => {
            this.audioManager.playClick();
            this.closeModal();
        });
        
        document.getElementById('docCloseBtn').addEventListener('click', () => {
            this.audioManager.playClick();
            this.closeModal();
        });
        
        document.getElementById('taskDocCloseBtn').addEventListener('click', () => {
            this.audioManager.playClick();
            this.closeModal();
        });
        
        // Modal overlay click to close
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.closeModal();
            }
        });
        
        // Prevent modal content clicks from closing modal
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC to close modal
            if (e.key === 'Escape') {
                this.closeModal();
            }
            
            // Cmd/Ctrl + W to close modal (Mac-style)
            if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
                e.preventDefault();
                this.closeModal();
            }
        });
    }
    
    openApp(appName) {
        // Set modal title based on app
        const appTitles = {
            'app1': 'Настройки',
            'app2': 'Почта',
            'app3': 'Лаборатория',
            'app4': 'Редактор кода'
        };
        
        this.modalTitle.textContent = appTitles[appName] || 'Приложение';
        
        // Set modal content based on app
        let content = '';
        
        switch(appName) {
            case 'app1':
                content = `
                    <div style="padding: 20px;">
                        <h2 style="text-align: center; margin-bottom: 20px;">Настройки доступа 2 уровня</h2>
                        <div style="background: rgba(240, 240, 240, 0.8); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="margin-bottom: 15px; color: #333;">Коды профессий:</h3>
                            <div style="display: grid; gap: 10px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <label style="width: 120px; font-weight: bold;">Химик:</label>
                                    <input type="text" id="chemist-code" placeholder="Введите код" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                                    <span id="chemist-status" style="width: 20px;">❌</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <label style="width: 120px; font-weight: bold;">Юрист:</label>
                                    <input type="text" id="lawyer-code" placeholder="Введите код" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                                    <span id="lawyer-status" style="width: 20px;">❌</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <label style="width: 120px; font-weight: bold;">Программист:</label>
                                    <input type="text" id="programmer-code" placeholder="Введите код" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                                    <span id="programmer-status" style="width: 20px;">❌</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <label style="width: 120px; font-weight: bold;">Инженер:</label>
                                    <input type="text" id="engineer-code" placeholder="Введите код" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                                    <span id="engineer-status" style="width: 20px;">❌</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <label style="width: 120px; font-weight: bold;">Охранник:</label>
                                    <input type="text" id="guard-code" placeholder="Введите код" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                                    <span id="guard-status" style="width: 20px;">❌</span>
                                </div>
                            </div>
                        </div>
                        <div id="access-status" style="text-align: center; padding: 15px; background: rgba(255, 0, 0, 0.1); border: 2px solid #ff4444; border-radius: 8px; color: #cc0000; font-weight: bold;">
                            ДОСТУП 2 УРОВНЯ ЗАБЛОКИРОВАН
                        </div>
                        
                        <div style="background: rgba(240, 240, 240, 0.8); padding: 20px; border-radius: 8px; margin-top: 20px;">
                            <h3 style="margin-bottom: 15px; color: #333;">Настройки звука:</h3>
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                <label style="width: 120px; font-weight: bold;">Звуки:</label>
                                <input type="checkbox" id="sound-enabled" checked style="margin-right: 10px;">
                                <span>Включить звуки</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <label style="width: 120px; font-weight: bold;">Громкость:</label>
                                <input type="range" id="volume-slider" min="0" max="100" value="50" style="flex: 1;">
                                <span id="volume-display" style="width: 40px; text-align: center;">50%</span>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'app2':
                content = `
                    <div style="text-align: center; padding: 40px;">
                        <h2>Почтовый клиент</h2>
                        <div style="margin-top: 30px; padding: 20px; background: rgba(128, 128, 128, 0.1); border: 2px solid #888; border-radius: 8px;">
                            <p style="color: #666; font-weight: bold; font-size: 18px;">
                                📧 ПИСЕМ НЕТ
                            </p>
                        </div>
                    </div>
                `;
                break;
                
            case 'app3':
                content = `
                    <div style="text-align: center; padding: 40px;">
                        <h2>Доступ к лаборатории</h2>
                        <div style="margin-top: 30px; padding: 20px; background: rgba(255, 165, 0, 0.1); border: 2px solid #ff8800; border-radius: 8px;">
                            <p style="color: #cc6600; font-weight: bold; font-size: 18px;">
                                🧪 ДЛЯ ДОСТУПА К ЛАБОРАТОРИИ НУЖНО БЫТЬ ХИМИКОМ
                            </p>
                        </div>
                    </div>
                `;
                break;
                
            case 'app4':
                content = `
                    <div style="padding: 20px;">
                        <h2 style="text-align: center; margin-bottom: 20px;">Редактор кода</h2>
                        <div style="background: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.5;">
                            <div style="color: #569cd6; margin-bottom: 10px;"># main.py</div>
                            <div style="color: #c586c0;">print</div><span style="color: #d4d4d4;">(</span><span style="color: #ce9178;">"Привет мир"</span><span style="color: #d4d4d4;">)</span>
                        </div>
                    </div>
                `;
                break;
                
            default:
                content = `
                    <div style="text-align: center; padding: 40px;">
                        <h2>Приложение</h2>
                        <p style="margin-top: 16px; color: #666;">
                            Содержимое приложения
                        </p>
                    </div>
                `;
        }
        
        this.modalContent.innerHTML = content;
        this.showModal(this.appModal);
        
        // Add event listeners for settings app
        if (appName === 'app1') {
            this.setupSettingsEventListeners();
        }
    }
    
    openFolder() {
        this.showModal(this.folderModal);
        
        // Add event listener for document items in the folder
        setTimeout(() => {
            const documentItems = this.folderModal.querySelectorAll('.folder-item.document-item');
            documentItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openDocument();
                });
            });
        }, 100);
    }
    
    openDocument() {
        this.showModal(this.documentModal);
    }
    
    showModal(modal) {
        // Hide all modals first
        document.querySelectorAll('.modal').forEach(m => {
            m.classList.remove('active');
        });
        
        // Show overlay and specific modal
        this.modalOverlay.classList.add('active');
        modal.classList.add('active');
        
        // Воспроизвести звук открытия окна
        this.audioManager.playEnable();
        
        // Focus the modal for keyboard navigation
        modal.focus();
        
        // Add animation class
        modal.style.animation = 'modalAppear 0.3s ease-out';
    }
    
    closeModal() {
        // Add closing animation
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.style.animation = 'modalDisappear 0.2s ease-in';
            
            setTimeout(() => {
                this.modalOverlay.classList.remove('active');
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                    modal.style.animation = '';
                });
            }, 200);
        } else {
            this.modalOverlay.classList.remove('active');
        }
    }
    
    // Utility method to add new apps dynamically
    addApp(appData) {
        const dockContainer = document.querySelector('.dock-container');
        const newApp = document.createElement('div');
        newApp.className = 'dock-item app';
        newApp.dataset.app = appData.id;
        newApp.innerHTML = `<img src="${appData.icon}" alt="${appData.name}" class="dock-icon">`;
        
        newApp.addEventListener('click', () => {
            this.openApp(appData.id);
        });
        
        dockContainer.appendChild(newApp);
    }
    
    // Utility method to add new desktop items
    addDesktopItem(itemData) {
        const desktopIcons = document.querySelector('.desktop-icons');
        const newItem = document.createElement('div');
        newItem.className = `desktop-item ${itemData.type}`;
        newItem.style.top = itemData.position.top;
        newItem.style.left = itemData.position.left;
        
        newItem.innerHTML = `
            <div class="icon-container">
                <img src="${itemData.icon}" alt="${itemData.name}" class="icon">
            </div>
            <span class="icon-label">${itemData.name}</span>
        `;
        
        if (itemData.type === 'folder') {
            newItem.addEventListener('click', () => {
                this.openDocument();
            });
        }
        
        desktopIcons.appendChild(newItem);
    }
    
    openTaskDocument() {
        const taskDocumentModal = document.getElementById('taskDocumentModal');
        this.showModal(taskDocumentModal);
    }
    
    setupSettingsEventListeners() {
        // Правильные коды для профессий
        const correctCodes = {
            'chemist': 'qwerty123',
            'lawyer': 'milioner123',
            'programmer': 'hello world',
            'engineer': 'molodci28',
            'guard': 'admin'
        };
        
        // Состояние проверки кодов
        this.codeStatus = {
            chemist: false,
            lawyer: false,
            programmer: false,
            engineer: false,
            guard: false
        };
        
        // Добавляем обработчики для каждого поля ввода
        const fields = ['chemist', 'lawyer', 'programmer', 'engineer', 'guard'];
        
        fields.forEach(field => {
            const input = document.getElementById(`${field}-code`);
            const status = document.getElementById(`${field}-status`);
            
            if (input && status) {
                input.addEventListener('input', (e) => {
                    const enteredCode = e.target.value;
                    
                    if (enteredCode === correctCodes[field]) {
                        this.codeStatus[field] = true;
                        status.textContent = '✅';
                        status.style.color = '#00cc00';
                        input.style.borderColor = '#00cc00';
                        input.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
                        this.audioManager.playSuccess();
                    } else if (enteredCode.length > 0) {
                        this.codeStatus[field] = false;
                        status.textContent = '❌';
                        status.style.color = '#ff0000';
                        input.style.borderColor = '#ccc';
                        input.style.backgroundColor = 'white';
                        // Воспроизводим звук ошибки только если что-то введено
                        if (enteredCode.length >= correctCodes[field].length) {
                            this.audioManager.playError();
                        }
                    } else {
                        this.codeStatus[field] = false;
                        status.textContent = '❌';
                        status.style.color = '#ff0000';
                        input.style.borderColor = '#ccc';
                        input.style.backgroundColor = 'white';
                    }
                    
                    this.checkAllCodes();
                });
            }
        });
    }
    
    checkAllCodes() {
        const allCorrect = Object.values(this.codeStatus).every(status => status === true);
        const accessStatus = document.getElementById('access-status');
        
        if (allCorrect && accessStatus) {
            accessStatus.innerHTML = '🔓 ОТКРЫТ ДОСТУП 2 УРОВНЯ';
            accessStatus.style.background = 'rgba(0, 255, 0, 0.1)';
            accessStatus.style.borderColor = '#00cc00';
            accessStatus.style.color = '#00aa00';
            
            // Воспроизвести звук уведомления о получении доступа
            this.audioManager.playNotification();
            
            // Разблокировать папку "привет"
            this.unlockPrivetFolder();
        } else if (accessStatus) {
            accessStatus.innerHTML = 'ДОСТУП 2 УРОВНЯ ЗАБЛОКИРОВАН';
            accessStatus.style.background = 'rgba(255, 0, 0, 0.1)';
            accessStatus.style.borderColor = '#ff4444';
            accessStatus.style.color = '#cc0000';
        }
    }
    
    unlockPrivetFolder() {
        // Создаем новую папку "привет" на рабочем столе
        const desktopIcons = document.querySelector('.desktop-icons');
        
        // Проверяем, не существует ли уже папка "привет"
        const existingPrivetFolder = document.querySelector('.desktop-item[data-name="привет"]');
        if (existingPrivetFolder) {
            return; // Папка уже существует
        }
        
        const privetFolder = document.createElement('div');
        privetFolder.className = 'desktop-item folder';
        privetFolder.dataset.name = 'привет';
        privetFolder.style.top = '40px';
        privetFolder.style.left = '150px';
        
        privetFolder.innerHTML = `
            <div class="icon-container">
                <img src="assets/icons/folder.svg" alt="Folder" class="icon">
            </div>
            <span class="icon-label">привет</span>
        `;
        
        // Добавляем обработчик клика для новой папки
        privetFolder.addEventListener('click', () => {
            this.audioManager.playClick();
            this.openPrivetFolder();
        });
        
        desktopIcons.appendChild(privetFolder);
    }
    
    openPrivetFolder() {
        // Показываем содержимое разблокированной папки "привет"
        const folderModal = document.getElementById('folderModal');
        const modalTitle = folderModal.querySelector('.modal-title');
        const folderContent = folderModal.querySelector('.folder-content');
        
        modalTitle.textContent = 'привет';
        folderContent.innerHTML = `
            <div class="folder-item document-item" data-type="document">
                <div class="folder-icon-container">
                    <img src="assets/icons/document.svg" alt="Document" class="folder-icon">
                </div>
                <span class="folder-item-label">секретные_данные.txt</span>
            </div>
        `;
        
        this.showModal(folderModal);
        
        // Добавляем обработчик для нового документа
        setTimeout(() => {
            const documentItem = folderContent.querySelector('.folder-item.document-item');
            if (documentItem) {
                documentItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.audioManager.playClick();
                    this.openSecretDocument();
                });
            }
        }, 100);
    }
    
    openSecretDocument() {
        const documentModal = document.getElementById('documentModal');
        const modalTitle = documentModal.querySelector('.modal-title');
        const textDocument = documentModal.querySelector('.text-document');
        
        modalTitle.textContent = 'секретные_данные.txt';
        textDocument.innerHTML = `
            <p style="color: #00aa00; font-weight: bold; text-align: center; font-size: 18px;">🔓 ДОСТУП РАЗРЕШЕН 🔓</p>
            <p style="text-align: center; margin-top: 20px;">Секретная информация доступна!</p>
            <p style="margin-top: 20px; padding: 15px; background: rgba(0, 255, 0, 0.1); border-radius: 8px;">
                Поздравляем! Вы успешно получили доступ 2 уровня.<br>
                Все коды введены правильно. ..е. ... Мы снова нашли способ связаться с вами!<br>
                <strong>Пожалуйста, не делитесь этой информацией с другими!</strong>
                Сейчас очень важно получить 5 улик, чтобы продолжить расследование.<br>
                1. Письмо инженера. 2. Информация в логах инжеенера 20го июня. 3. Письо юриста. 4. Любая информация о химике. 5. Камеры видео наблюдения в день пропажи робота.
                Вы лучше знаете, в каком порядке их искать. Узнайте информацию, не выдывайте себя. Не показвайте другим командам, они могуть быть против вас. 
                Спасибо за помощь в расследовании!.... удачи. примем. 
            </p>
        `;
        
        this.showModal(documentModal);
    }
}

// Add closing animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes modalDisappear {
        from {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        to {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Initialize the desktop when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.desktop = new DesktopManager();
});

// Export for potential future use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DesktopManager;
}