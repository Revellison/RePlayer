

(function() {

    const state = {
        currentPage: '',
        pageCache: new Map(),
        isNavigating: false,
        mainContainer: null,
        fallbackPage: 'home.html',
        defaultPage: 'home.html'
    };

    function init() {
        state.mainContainer = document.getElementById('spa-container');
        if (!state.mainContainer) {
            console.error('Контейнер SPA не найден');
            return;
        }

        if (state.mainContainer.childElementCount === 0) {
            const initialPath = window.location.pathname;
            let initialPage = state.defaultPage;
            
            const pathMatch = initialPath.match(/([^/]+\.html)$/);
            if (pathMatch) {
                initialPage = pathMatch[1];
            }
                
            navigateTo(initialPage, false);
        }

        document.addEventListener('click', handleLinkClick);
        window.addEventListener('popstate', handlePopState);
    }

    function handleLinkClick(event) {
        const link = event.target.closest('a');
        
        if (link && link.href && !link.getAttribute('target')) {
            if (link.hasAttribute('data-spa-link') || link.href.includes('/pages/')) {
                event.preventDefault();
                
                let pageUrl;
                
                if (link.href.includes('/pages/')) {
                    pageUrl = link.href.split('/pages/')[1];
                } else {
                    const url = new URL(link.href, window.location.href);
                    pageUrl = url.pathname.split('/').pop();
                }
                
                if (pageUrl && pageUrl.endsWith('.html')) {
                    navigateTo(pageUrl);
                }
            }
        }
    }

    function handlePopState(event) {
        const pathname = window.location.pathname;
        const pageMatch = pathname.match(/([^/]+\.html)$/);
        const pageUrl = event.state?.page || (pageMatch ? pageMatch[1] : state.defaultPage);
        
        navigateTo(pageUrl, false);
    }

    async function navigateTo(pageUrl, updateHistory = true) {
        if (state.isNavigating) return;
        
        if (pageUrl === state.currentPage) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        state.isNavigating = true;
        
        showLoadingIndicator(true);
        
        try {
            const content = await loadPage(pageUrl);
            
            updatePageContent(content);
            
            if (updateHistory) {
                const newUrl = new URL(window.location.href);
                const basePath = newUrl.pathname.split('/pages/')[0] || '';
                const newPath = `${basePath}/pages/${pageUrl}`;
                history.pushState({ page: pageUrl }, '', newPath);
            }
            
            state.currentPage = pageUrl;
            
            updateSidebarActive(pageUrl);
            
            window.scrollTo({ top: 0, behavior: 'auto' });
        } catch (error) {
            console.error('Ошибка при навигации:', error);
            
            if (pageUrl === state.fallbackPage) {
                state.mainContainer.innerHTML = `
                    <div class="error-container">
                        <h2>Произошла ошибка при загрузке страницы</h2>
                        <p>${error.message}</p>
                        <button class="btn primary" onclick="window.spaNavigator.navigateTo('${state.defaultPage}')">
                            Вернуться на главную
                        </button>
                    </div>
                `;
            } else {
                try {
                    navigateTo(state.fallbackPage, false);
                } catch (fallbackError) {
                    state.mainContainer.innerHTML = `
                        <div class="error-container">
                            <h2>Критическая ошибка</h2>
                            <p>Не удалось загрузить страницу.</p>
                            <button class="btn primary" onclick="location.reload()">
                                Перезагрузить приложение
                            </button>
                        </div>
                    `;
                }
            }
        } finally {
            showLoadingIndicator(false);
            state.isNavigating = false;
        }
    }

    function showLoadingIndicator(show) {
        let loader = document.getElementById('spa-loader');
        
        if (show && !loader) {
            loader = document.createElement('div');
            loader.id = 'spa-loader';
            loader.innerHTML = '<div class="spinner"></div>';
            loader.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:3px;background:linear-gradient(to right,transparent,#1db954,transparent);z-index:9999;animation:loading 2s infinite linear;';
            document.body.appendChild(loader);
            
            if (!document.getElementById('spa-loader-style')) {
                const style = document.createElement('style');
                style.id = 'spa-loader-style';
                style.textContent = `
                    @keyframes loading {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                `;
                document.head.appendChild(style);
            }
        } 
        else if (!show && loader) {
            loader.remove();
        }
    }

    async function loadPage(pageUrl) {
        const cleanUrl = pageUrl.split('#')[0].split('?')[0];
        
        if (state.pageCache.has(cleanUrl)) {
            return state.pageCache.get(cleanUrl);
        }
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const pagePath = `../pages/${cleanUrl}`;
            
            const response = await fetch(pagePath, {
                signal: controller.signal,
                headers: { 'X-Requested-With': 'SPA' }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Страница не найдена: ${cleanUrl} (${response.status})`);
            }
            
            const html = await response.text();
            
            if (cleanUrl !== state.fallbackPage) {
                state.pageCache.set(cleanUrl, html);
                
                if (state.pageCache.size > 20) {
                    const firstKey = Array.from(state.pageCache.keys())[0];
                    state.pageCache.delete(firstKey);
                }
            }
            
            return html;
        } catch (error) {
            console.error('Ошибка загрузки страницы:', error);
            throw error;
        }
    }

    function clearPageCache(pageUrl = null) {
        if (pageUrl) {
            state.pageCache.delete(pageUrl);
        } else {
            state.pageCache.clear();
        }
    }

    function updatePageContent(html) {
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;
        
        const content = extractMainContentKeepPlayer(tempContainer);
        
        if (content) {
            state.mainContainer.innerHTML = content;
            
            initPageEvents();
            loadDeferredResources();
        }
    }
    
    function extractMainContentKeepPlayer(container) {
        const currentPlayer = document.querySelector('.music-player');
        const bottomPlayer = document.querySelector('.bottom-player');
        
        let newContent = container.querySelector('.content');
        
        if (!newContent) {
            if (container.querySelector('.music-player')) {
                newContent = container.querySelector('.music-player');
                
                if (currentPlayer) {
                    return currentPlayer.outerHTML;
                }
            } else {
                const body = container.querySelector('body');
                if (body) {
                    newContent = document.createElement('div');
                    newContent.className = 'content';
                    
                    Array.from(body.children).forEach(child => {
                        if (!['titlebar-placeholder', 'sidebar-placeholder', 'footer-placeholder'].includes(child.id) 
                            && !child.classList.contains('titlebar') 
                            && !child.classList.contains('sidebar') 
                            && !child.id !== 'footer-placeholder') {
                            
                            if (child.tagName !== 'SCRIPT') {
                                newContent.appendChild(child.cloneNode(true));
                            }
                        }
                    });
                }
            }
        }
        
        if (container.querySelector('.music-player') && currentPlayer) {
            return currentPlayer.outerHTML;
        }
        
        return newContent ? newContent.outerHTML : null;
    }

    function initPageEvents() {
        const event = new CustomEvent('pageLoaded', { 
            detail: { page: state.currentPage } 
        });
        
        document.dispatchEvent(event);
        
        initPlaylistEvents();
        
        loadDeferredResources();
    }

    function loadDeferredResources() {
        const lazyImages = state.mainContainer.querySelectorAll('img[data-src]');
        if (lazyImages.length > 0) {
            lazyImages.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
        }
        
        const scripts = state.mainContainer.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            
            Array.from(script.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            
            newScript.textContent = script.textContent;
            
            script.parentNode.replaceChild(newScript, script);
        });
    }

    function initPlaylistEvents() {
        const playlistItems = document.getElementById('playlist-items');
        
        if (playlistItems && window.audioPlayerAPI) {
        }
    }

    function updateSidebarActive(pageUrl) {
        const sidebarLinks = document.querySelectorAll('.sidebar-section');
        sidebarLinks.forEach(link => link.classList.remove('active'));
        
        let targetSelector = '';
        
        if (pageUrl.includes('favorites.html')) {
            targetSelector = 'a[href*="favorites.html"]';
        } else if (pageUrl.includes('playlists.html')) {
            targetSelector = 'a[href*="playlists.html"]';
        } else if (pageUrl.includes('settings.html')) {
            targetSelector = 'a[href*="settings.html"]';
        } else {
            targetSelector = 'a[href*="index.html"], a[href*="home.html"]';
        }
        
        const activeLink = document.querySelector(targetSelector);
        if (activeLink) {
            const parentSection = activeLink.closest('.sidebar-section');
            if (parentSection) {
                parentSection.classList.add('active');
            }
        }
    }

    document.addEventListener('DOMContentLoaded', init);
    
    document.addEventListener('componentsLoaded', init);
    
    window.spaNavigator = {
        init,
        navigateTo,
        clearPageCache,
        getCurrentPage: () => state.currentPage,
        reload: () => {
            if (state.currentPage) {
                clearPageCache(state.currentPage);
                navigateTo(state.currentPage, false);
            }
        }
    };
})();