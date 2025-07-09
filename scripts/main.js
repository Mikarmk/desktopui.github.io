// Desktop Application Manager
class DesktopManager {
    constructor() {
        this.modalOverlay = document.getElementById('modalOverlay');
        this.appModal = document.getElementById('appModal');
        this.folderModal = document.getElementById('folderModal');
        this.documentModal = document.getElementById('documentModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalContent = document.getElementById('modalContent');
        
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
                const appName = e.currentTarget.dataset.app;
                this.openApp(appName);
            });
        });
        
        // Folder clicks
        document.querySelectorAll('.desktop-item.folder').forEach(item => {
            item.addEventListener('click', () => {
                this.openFolder();
            });
        });
        
        // Document clicks inside folder - using event delegation
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target.closest('.folder-item.document-item')) {
                e.stopPropagation();
                this.openDocument();
            }
        });
        
        // Close button events
        document.getElementById('closeBtn').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('folderCloseBtn').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('docCloseBtn').addEventListener('click', () => {
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
            'app1': 'Приложение 1',
            'app2': 'Приложение 2', 
            'app3': 'Приложение 3',
            'app4': 'Приложение 4'
        };
        
        this.modalTitle.textContent = appTitles[appName] || 'Приложение';
        
        // Set modal content
        this.modalContent.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h2>Добро пожаловать в ${appTitles[appName]}</h2>
                <p style="margin-top: 16px; color: #666;">
                    Это окно приложения. Здесь будет содержимое приложения.
                </p>
            </div>
        `;
        
        this.showModal(this.appModal);
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