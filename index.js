// SillyTavern CSS Inspector
(function() {
    if (document.getElementById('st-css-inspector-ball')) return;

    console.log('[ST CSS Inspector] Loading plugin...');

    const ball = document.createElement('div');
    ball.id = 'st-css-inspector-ball';
    ball.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><circle cx="12" cy="12" r="3"/></svg>';
    // 提高 bottom 值避免被酒馆底部的聊天输入框挡住，设置最大 z-index
    ball.style.cssText = 'position:fixed;bottom:120px;right:20px;width:50px;height:50px;border-radius:25px;background:rgba(30, 41, 59, 0.9);color:#fff;display:flex;align-items:center;justify-content:center;z-index:2147483647;box-shadow:0 4px 12px rgba(0,0,0,0.5);cursor:pointer;backdrop-filter:blur(4px);transition:all 0.2s;-webkit-tap-highlight-color:transparent;';
    
    // 确保DOM加载后注入
    const inject = () => {
        document.body.appendChild(ball);
        console.log('[ST CSS Inspector] Bubble injected successfully!');
    };
    if (document.body) inject();
    else document.addEventListener('DOMContentLoaded', inject);

    let isActive = false;
    let hoveredEl = null;

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483646;border:2px dashed #00ffd5;background:rgba(0, 255, 213, 0.1);display:none;transition:all 0.05s;';
    if (document.body) document.body.appendChild(overlay);
    else document.addEventListener('DOMContentLoaded', () => document.body.appendChild(overlay));

    const tooltip = document.createElement('div');
    tooltip.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;background:#1e293b;color:#00ffd5;padding:6px 10px;border-radius:6px;font-family:monospace;font-size:13px;display:none;box-shadow:0 4px 6px rgba(0,0,0,0.3);max-width:300px;word-wrap:break-word;text-align:left;line-height:1.2;';
    if (document.body) document.body.appendChild(tooltip);
    else document.addEventListener('DOMContentLoaded', () => document.body.appendChild(tooltip));

    ball.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        isActive = !isActive;
        ball.style.background = isActive ? 'rgba(0, 255, 213, 0.9)' : 'rgba(30, 41, 59, 0.9)';
        ball.style.color = isActive ? '#000' : '#fff';
        if (!isActive) {
            overlay.style.display = 'none';
            tooltip.style.display = 'none';
            hoveredEl = null;
        }
    });

    const updateHighlight = (el) => {
        if (!el || !isActive) return;
        const rect = el.getBoundingClientRect();
        overlay.style.top = rect.top + 'px';
        overlay.style.left = rect.left + 'px';
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
        overlay.style.display = 'block';

        let classStr = "";
        if (typeof el.className === 'string') classStr = el.className;
        else if (el.className && el.className.baseVal) classStr = el.className.baseVal;
        
        let displayStr = el.tagName.toLowerCase();
        if (classStr) displayStr += '.' + classStr.trim().replace(/\s+/g, '.');

        tooltip.textContent = displayStr;
        tooltip.style.left = Math.max(10, rect.left) + 'px';
        tooltip.style.top = Math.max(10, Math.min(window.innerHeight - 30, rect.top - 30)) + 'px';
        tooltip.style.display = 'block';
    };

    document.addEventListener('touchstart', (e) => {
        if (!isActive || ball.contains(e.target) || e.target === overlay || e.target === tooltip) return;
        hoveredEl = e.target;
        updateHighlight(hoveredEl);
    }, { capture: true, passive: true });

    document.addEventListener('mouseover', (e) => {
        if (!isActive || ball.contains(e.target) || e.target === overlay || e.target === tooltip) return;
        hoveredEl = e.target;
        updateHighlight(hoveredEl);
    }, true);

    document.addEventListener('click', (e) => {
        if (!isActive || ball.contains(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
        
        let classStr = "";
        if (typeof e.target.className === 'string') classStr = e.target.className;
        else if (e.target.className && e.target.className.baseVal) classStr = e.target.className.baseVal;

        let extract = classStr.trim();
        let selector = extract ? '.' + extract.replace(/\s+/g, '.') : e.target.tagName.toLowerCase();
        
        const fallbackCopy = (text) => {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try { document.execCommand('copy'); } catch (err) {}
            textArea.remove();
        };

        if (navigator.clipboard) navigator.clipboard.writeText(selector).catch(() => fallbackCopy(selector));
        else fallbackCopy(selector);
        
        const oldText = tooltip.textContent;
        tooltip.style.background = '#22c55e';
        tooltip.style.color = '#fff';
        tooltip.textContent = 'Copied: ' + selector;
        
        setTimeout(() => {
            tooltip.style.background = '#1e293b';
            tooltip.style.color = '#00ffd5';
            tooltip.textContent = oldText;
            
            // Auto close after copy
            isActive = false;
            ball.style.background = 'rgba(30, 41, 59, 0.9)';
            ball.style.color = '#fff';
            overlay.style.display = 'none';
            tooltip.style.display = 'none';
        }, 1200);
    }, true);
})();
