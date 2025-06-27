class InfiniteScroller {
    constructor(container, direction = 'left', speed = 20) {
        this.container = container;
        this.content = container.querySelector('.scroll-content');
        this.direction = direction;
        this.speed = speed;
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        // Клонируем контент для бесконечного эффекта
        this.cloneContent();
        
        // Запускаем анимацию
        this.start();
        
        // Слушаем события для оптимизации
        this.setupEventListeners();
    }
    
    cloneContent() {
        // Клонируем весь контент
        const clone = this.content.cloneNode(true);
        this.content.appendChild(clone);
    }
    
    start() {
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    animate() {
        if (!this.isRunning) return;
        
        const currentTransform = this.content.style.transform || 'translateX(0px)';
        const currentX = parseInt(currentTransform.match(/-?\d+/) || 0);
        
        let newX;
        if (this.direction === 'left') {
            newX = currentX - 1;
            // Если прошли половину контента, сбрасываем позицию
            if (newX <= -this.content.scrollWidth / 2) {
                newX = 0;
            }
        } else {
            newX = currentX + 1;
            // Если прошли половину контента, сбрасываем позицию
            if (newX >= 0) {
                newX = -this.content.scrollWidth / 2;
            }
        }
        
        this.content.style.transform = `translateX(${newX}px)`;
        
        requestAnimationFrame(() => this.animate());
    }
    
    setupEventListeners() {
        // Останавливаем анимацию когда вкладка не активна
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop();
            } else {
                this.start();
            }
        });
        
        // Оптимизация при скролле
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            
            this.stop();
            scrollTimeout = setTimeout(() => {
                this.start();
            }, 100);
        });
    }
    
    // Метод для добавления новых элементов
    addElement(text) {
        const newSpan = document.createElement('span');
        newSpan.className = 'replayer-text';
        newSpan.textContent = text;
        
        this.content.appendChild(newSpan);
        
        // Также добавляем в клон
        const clone = newSpan.cloneNode(true);
        this.content.appendChild(clone);
    }
    
    // Метод для удаления элементов
    removeElement() {
        const elements = this.content.querySelectorAll('.replayer-text');
        if (elements.length > 2) { // Оставляем минимум 2 элемента
            this.content.removeChild(elements[0]);
            this.content.removeChild(elements[elements.length - 1]); // Удаляем клон
        }
    }
}

// Инициализация скроллеров
document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.querySelector('.left-scroll');
    const footerContainer = document.querySelector('.right-scroll');
    
    const headerScroller = new InfiniteScroller(headerContainer, 'left', 2);
    const footerScroller = new InfiniteScroller(footerContainer, 'right', 2);
    
    // Пример добавления новых элементов
    setTimeout(() => {
        headerScroller.addElement('RE:PLAYER!');
        footerScroller.addElement('RE:PLAYER!');
    }, 5000);
    
    // Пример удаления элементов
    setTimeout(() => {
        headerScroller.removeElement();
        footerScroller.removeElement();
    }, 10000);
    
    // Глобальные переменные для доступа из консоли
    window.headerScroller = headerScroller;
    window.footerScroller = footerScroller;
}); 