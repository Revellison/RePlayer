document.addEventListener("DOMContentLoaded", function() {
    const allComponents = [
        { url: "../components/titlebar/title.html", placeholderId: "titlebar-placeholder", initFunction: initWindowControls },
        { url: "../components/sidebar/sidebar.html", placeholderId: "sidebar-placeholder", initFunction: setActiveSidebarItem },
        { url: "../components/bottomplayer/widget.html", placeholderId: "footer-placeholder" }
    ];
    
    loadComponents(allComponents, () => {
        const event = new CustomEvent('componentsLoaded');
        document.dispatchEvent(event);
    });
});

function loadComponents(components, callback) {
    let loaded = 0;
    
    if (!components || components.length === 0) {
        if (typeof callback === 'function') callback();
        return;
    }
    
    components.forEach(component => {
        const element = document.getElementById(component.placeholderId);
        
        if (!element) {
            loaded++;
            if (loaded === components.length && typeof callback === 'function') callback();
            return;
        }
        
        fetch(component.url)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.text();
            })
            .then(data => {
                element.innerHTML = data;
                
                if (typeof component.initFunction === 'function') {
                    setTimeout(() => component.initFunction(), 100);
                }
                
                loaded++;
                if (loaded === components.length && typeof callback === 'function') callback();
            })
            .catch(error => {
                loaded++;
                if (loaded === components.length && typeof callback === 'function') callback();
            });
    });
}

function setActiveSidebarItem() {
    const currentPath = window.location.pathname;
    
    if (!currentPath) return;
    
    const sidebarSections = document.querySelectorAll('.sidebar-section');
    if (sidebarSections && sidebarSections.length) {
        sidebarSections.forEach(section => {
            if (section) section.classList.remove('active');
        });
    }
    
    const safeAddActive = (selector) => {
        try {
            const element = document.querySelector(selector);
            if (element) element.classList.add('active');
        } catch (error) {
        }
    };
    
    if (currentPath.includes('favorites.html')) {
        safeAddActive('a.sidebar-section[href*="favorites.html"]');
    } else if (currentPath.includes('playlists.html')) {
        safeAddActive('a.sidebar-section[href*="playlists.html"]');
    } else if (currentPath.includes('settings.html')) {
        safeAddActive('a.sidebar-section[href*="settings.html"]');
    } else {
        safeAddActive('a.sidebar-section[href*="index.html"]');
    }
}

function initWindowControls() {
    const buttons = {
        minimize: { id: 'minimize-btn', action: 'minimizeWindow' },
        maximize: { id: 'maximize-btn', action: 'maximizeWindow' },
        close: { id: 'close-btn', action: 'closeWindow' }
    };
    
    Object.values(buttons).forEach(button => {
        const element = document.getElementById(button.id);
        if (element && window.electronAPI && typeof window.electronAPI[button.action] === 'function') {
            element.addEventListener('click', () => window.electronAPI[button.action]());
        }
    });
}

