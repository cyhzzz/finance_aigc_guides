/**
 * 幻灯片逻辑 - 延迟加载，非关键JS
 * 应用 Vercel React 最佳实践
 */

// 使用立即执行函数避免全局污染
(function() {
    'use strict';

    // 缓存DOM查询结果
    let currentSlide = 0;
    const totalSlides = 24;
    let isScrolling = false;
    let wheelTimeout = null;

    // 缓存DOM元素
    const tocItems = document.querySelectorAll('.toc-item');
    const progressBar = document.getElementById('progressBar');

    /**
     * 幻灯片导航
     * @param {number} index - 目标幻灯片索引
     */
    function goToSlide(index) {
        if (index < 0 || index >= totalSlides) return;

        const slide = document.getElementById(`slide-${index}`);
        if (!slide) return;

        // 临时禁用观察器更新，避免冲突
        if (window.slideObserver) {
            window.slideObserver.disconnect();
        }

        slide.scrollIntoView({ behavior: 'smooth', block: 'start' });
        currentSlide = index;
        updateTOC();
        updateProgress();
        animateSlideContent(index);

        // 重新启用观察器
        setTimeout(() => {
            if (window.slideObserver) {
                document.querySelectorAll('.slide-container').forEach(s => {
                    window.slideObserver.observe(s);
                });
            }
        }, 1000);
    }

    /**
     * 下一张幻灯片
     */
    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1);
        }
    }

    /**
     * 上一张幻灯片
     */
    function prevSlide() {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        }
    }

    /**
     * 更新目录高亮
     * 使用文档片段优化DOM操作
     */
    function updateTOC() {
        tocItems.forEach((item, index) => {
            if (index === currentSlide) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * 更新进度条
     */
    function updateProgress() {
        if (progressBar) {
            const progress = ((currentSlide + 1) / totalSlides) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    /**
     * 幻灯片内容动画
     * @param {number} index - 幻灯片索引
     */
    function animateSlideContent(index) {
        const slide = document.getElementById(`slide-${index}`);
        if (!slide) return;

        const elements = slide.querySelectorAll('.fade-up');

        // 重置动画
        elements.forEach(el => {
            el.classList.remove('visible');
        });

        // 使用 requestAnimationFrame 优化动画性能
        requestAnimationFrame(() => {
            setTimeout(() => {
                elements.forEach((el, i) => {
                    setTimeout(() => {
                        el.classList.add('visible');
                    }, i * 120);
                });
            }, 100);
        });
    }

    /**
     * 键盘导航
     * 使用事件委托优化性能
     */
    function handleKeydown(e) {
        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                prevSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides - 1);
                break;
        }
    }

    /**
     * 滚轮导航（节流）
     * 使用 passive 事件监听器提升滚动性能
     */
    function handleWheel(e) {
        if (isScrolling) return;

        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            if (e.deltaY > 30) {
                nextSlide();
            } else if (e.deltaY < -30) {
                prevSlide();
            }
            isScrolling = true;
            setTimeout(() => {
                isScrolling = false;
            }, 1000);
        }, 50);
    }

    /**
     * 观察器：自动更新当前幻灯片索引
     */
    function setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '-40% 0px -40% 0px', // 更精确地检测视口中心
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.getAttribute('data-index'));
                    if (!isNaN(index) && index !== currentSlide) {
                        currentSlide = index;
                        updateTOC();
                        updateProgress();
                        animateSlideContent(index);
                    }
                }
            });
        }, observerOptions);

        // 保存到全局，以便在手动导航时临时禁用
        window.slideObserver = observer;

        document.querySelectorAll('.slide-container').forEach(slide => {
            observer.observe(slide);
        });
    }

    /**
     * 初始化导航事件
     */
    function setupNavigation() {
        // 键盘导航
        document.addEventListener('keydown', handleKeydown);

        // 滚轮导航（使用 passive 选项）
        document.addEventListener('wheel', handleWheel, { passive: true });

        // 设置观察器
        setupIntersectionObserver();
    }

    /**
     * 加载提示词数据并格式化显示（2.2节）
     */
    function loadPromptFile() {
        const container = document.getElementById('prompt-content-22');
        if (!container) return;

        // 使用prompts-data.js中的数据
        const text = typeof promptData_22 !== 'undefined' ? promptData_22 : '提示词数据未加载';

        // 简单的markdown格式化
        const formattedText = text
            .replace(/^## (.*$)/gim, '<p style="color: var(--accent); margin-bottom: 1rem; margin-top: 1.5rem;"><strong>## $1</strong></p>')
            .replace(/^# (.*$)/gim, '<p style="color: var(--accent); margin-bottom: 1rem; margin-top: 1.5rem; font-size: 1.2rem;"><strong># $1</strong></p>')
            .replace(/^### (.*$)/gim, '<p style="color: var(--accent); margin-bottom: 0.8rem; margin-top: 1rem;"><strong>### $1</strong></p>')
            .replace(/^\* (.*$)/gim, '<p style="margin-left: 1rem; margin-bottom: 0.5rem;">• $1</p>')
            .replace(/^  - (.*$)/gim, '<p style="margin-left: 2rem; margin-bottom: 0.3rem; font-size: 0.9rem;">  - $1</p>')
            .replace(/^(\d+)\. (.*$)/gim, '<p style="margin-left: 1rem; margin-bottom: 0.5rem;">$1. $2</p>')
            .replace(/^\{(.*?)\}/gim, '<p style="margin-bottom: 0.5rem;"><strong>{$1}</strong></p>')
            .replace(/^"([^"]+)":/gim, '<p style="margin-bottom: 0.5rem; margin-left: 1rem;"><strong>"$1":</strong>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p style="margin-bottom: 0.5rem;">')
            .replace(/\n/g, '<br>');

        container.innerHTML = `<div style="line-height: 1.8;">${formattedText}</div>`;
    }

    /**
     * 加载提示词数据并格式化显示（2.3节）
     */
    function loadPromptFile23() {
        const container = document.getElementById('prompt-content-23');
        if (!container) return;

        // 使用prompts-data-yuan.js中的数据
        const text = typeof promptData_23 !== 'undefined' ? promptData_23 : '提示词数据未加载';

        // 简单的markdown格式化
        const formattedText = text
            .replace(/^## (.*$)/gim, '<p style="color: var(--accent); margin-bottom: 1rem; margin-top: 1.5rem;"><strong>## $1</strong></p>')
            .replace(/^# (.*$)/gim, '<p style="color: var(--accent); margin-bottom: 1rem; margin-top: 1.5rem; font-size: 1.2rem;"><strong># $1</strong></p>')
            .replace(/^### (.*$)/gim, '<p style="color: var(--accent); margin-bottom: 0.8rem; margin-top: 1rem;"><strong>### $1</strong></p>')
            .replace(/^\* (.*$)/gim, '<p style="margin-left: 1rem; margin-bottom: 0.5rem;">• $1</p>')
            .replace(/^  - (.*$)/gim, '<p style="margin-left: 2rem; margin-bottom: 0.3rem; font-size: 0.9rem;">  - $1</p>')
            .replace(/^(\d+)\. (.*$)/gim, '<p style="margin-left: 1rem; margin-bottom: 0.5rem;">$1. $2</p>')
            .replace(/^\{(.*?)\}/gim, '<p style="margin-bottom: 0.5rem;"><strong>{$1}</strong></p>')
            .replace(/^"([^"]+)":/gim, '<p style="margin-bottom: 0.5rem; margin-left: 1rem;"><strong>"$1":</strong>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p style="margin-bottom: 0.5rem;">')
            .replace(/\n/g, '<br>');

        container.innerHTML = `<div style="line-height: 1.8;">${formattedText}</div>`;
    }

    /**
     * 复制提示词到剪贴板（2.2节）
     */
    function copyPromptToClipboard() {
        const text = typeof promptData_22 !== 'undefined' ? promptData_22 : '';

        if (!text) {
            alert('提示词内容未加载');
            return;
        }

        // 使用现代API复制到剪贴板
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.getElementById('copy-prompt-btn');
                const originalText = btn.textContent;
                btn.textContent = '已复制！';
                btn.style.backgroundColor = '#22c55e';

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = 'var(--accent)';
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    /**
     * 复制提示词到剪贴板（2.3节）
     */
    function copyPromptToClipboard23() {
        const text = typeof promptData_23 !== 'undefined' ? promptData_23 : '';

        if (!text) {
            alert('提示词内容未加载');
            return;
        }

        // 使用现代API复制到剪贴板
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.getElementById('copy-prompt-btn-23');
                const originalText = btn.textContent;
                btn.textContent = '已复制！';
                btn.style.backgroundColor = '#22c55e';

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = 'var(--accent)';
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
                fallbackCopy23(text);
            });
        } else {
            fallbackCopy23(text);
        }
    }

    /**
     * 备用复制方法（兼容旧浏览器）- 2.2节
     */
    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            const btn = document.getElementById('copy-prompt-btn');
            const originalText = btn.textContent;
            btn.textContent = '已复制！';
            btn.style.backgroundColor = '#22c55e';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = 'var(--accent)';
            }, 2000);
        } catch (err) {
            console.error('复制失败:', err);
            alert('复制失败，请手动选择文本复制');
        }

        document.body.removeChild(textarea);
    }

    /**
     * 备用复制方法（兼容旧浏览器）- 2.3节
     */
    function fallbackCopy23(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            const btn = document.getElementById('copy-prompt-btn-23');
            const originalText = btn.textContent;
            btn.textContent = '已复制！';
            btn.style.backgroundColor = '#22c55e';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = 'var(--accent)';
            }, 2000);
        } catch (err) {
            console.error('复制失败:', err);
            alert('复制失败，请手动选择文本复制');
        }

        document.body.removeChild(textarea);
    }

    /**
     * 初始化
     */
    function init() {
        updateProgress();
        animateSlideContent(0);
        setupNavigation();
        loadPromptFile();
        loadPromptFile23();
    }

    // 导出到全局作用域（供HTML调用）
    window.goToSlide = goToSlide;
    window.nextSlide = nextSlide;
    window.prevSlide = prevSlide;
    window.copyPromptToClipboard = copyPromptToClipboard;
    window.copyPromptToClipboard23 = copyPromptToClipboard23;

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
