/**
 * 通用脚本 - 全站共享
 * 应用 Vercel React 最佳实践
 */

(function() {
    'use strict';

    /**
     * 初始化Lucide图标
     */
    function initIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * 平滑滚动到锚点
     * 使用事件委托优化性能
     */
    function setupSmoothScroll() {
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (href === '#' || href === '#!') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    /**
     * 懒加载图片
     * 使用 Intersection Observer API
     */
    function setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    /**
     * 添加页面可见性检测
     * 用于优化性能和用户体验
     */
    function setupVisibilityDetection() {
        if ('hidden' in document) {
            document.addEventListener('visibilitychange', function() {
                if (document.hidden) {
                    // 页面隐藏时暂停非关键操作
                    console.log('Page hidden');
                } else {
                    // 页面可见时恢复
                    console.log('Page visible');
                }
            });
        }
    }

    /**
     * 初始化
     */
    function init() {
        initIcons();
        setupSmoothScroll();
        setupLazyLoading();
        setupVisibilityDetection();
    }

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
