/**
 * 核心教程移动端滚动功能
 * 仅在移动端（≤768px）启用
 */

(function() {
    'use strict';

    // 检测是否为移动端
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // 如果不是移动端，不执行任何操作
    if (!isMobile()) {
        return;
    }

    // 章节数据（与右侧目录对应）
    const chapters = [
        { index: 0, label: '引言', id: 'slide-0' },
        { index: 1, label: '1.0 认知重启', id: 'slide-1' },
        { index: 2, label: '1.1 核心原理', id: 'slide-2' },
        { index: 3, label: '1.2 真相', id: 'slide-3' },
        { index: 4, label: '1.3 缺陷一', id: 'slide-4' },
        { index: 5, label: '1.4 缺陷二', id: 'slide-5' },
        { index: 6, label: '1.5 缺陷三', id: 'slide-6' },
        { index: 7, label: '2.0 入门教程', id: 'slide-7' },
        { index: 8, label: '2.1 核心法则', id: 'slide-8' },
        { index: 9, label: '2.2 系统提示词', id: 'slide-9' },
        { index: 10, label: '2.3 元提示词', id: 'slide-10' },
        { index: 11, label: '2.4 工具落地', id: 'slide-11' },
        { index: 12, label: '2.5 创作公式', id: 'slide-12' },
        { index: 13, label: '3.0 进阶教程', id: 'slide-13' },
        { index: 14, label: '3.1 知识库检索', id: 'slide-14' },
        { index: 15, label: '3.2 工作流编排', id: 'slide-15' },
        { index: 16, label: '3.3 Skill范式', id: 'slide-16' },
        { index: 17, label: '4.0 创作灵魂', id: 'slide-17' },
        { index: 18, label: '4.1 人的价值', id: 'slide-18' },
        { index: 19, label: '4.2 AI的边界', id: 'slide-19' },
        { index: 20, label: '4.3 协作之道', id: 'slide-20' }
    ];

    // 1. 创建顶部章节导航
    function createChapterNav() {
        const nav = document.createElement('nav');
        nav.className = 'chapter-nav';
        nav.id = 'chapterNav';

        chapters.forEach(chapter => {
            const link = document.createElement('a');
            link.href = `#${chapter.id}`;
            link.className = 'chapter-nav-item';
            link.textContent = chapter.label;
            link.dataset.index = chapter.index;
            nav.appendChild(link);
        });

        // 插入到导航栏后面
        const globalNav = document.querySelector('.global-nav');
        if (globalNav && globalNav.nextSibling) {
            globalNav.parentNode.insertBefore(nav, globalNav.nextSibling);
        } else {
            document.body.insertBefore(nav, document.body.firstChild);
        }
    }

    // 2. 创建阅读进度条
    function createReadingProgress() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'reading-progress';

        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress-bar';
        progressBar.id = 'readingProgressBar';

        progressContainer.appendChild(progressBar);
        document.body.appendChild(progressContainer);
    }

    // 3. 创建返回顶部按钮
    function createBackToTop() {
        const button = document.createElement('button');
        button.className = 'back-to-top';
        button.innerHTML = '<i data-lucide="chevron-up" class="w-5 h-5"></i>';
        button.ariaLabel = '返回顶部';
        button.style.display = 'none';

        button.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        document.body.appendChild(button);
        return button;
    }

    // 4. 为幻灯片添加章节标识
    function addChapterLabels() {
        const mainChapters = chapters.filter(c => c.label.includes('.0'));

        mainChapters.forEach(chapter => {
            const slide = document.getElementById(chapter.id);
            if (slide) {
                slide.dataset.chapter = chapter.label;
            }
        });

        // 为非主要章节设置通用标签
        chapters.forEach(chapter => {
            const slide = document.getElementById(chapter.id);
            if (slide && !slide.dataset.chapter) {
                // 从章节号提取主章节
                const match = chapter.label.match(/^(\d+\.\d+)/);
                if (match) {
                    slide.dataset.chapter = match[1] + ' 章节';
                }
            }
        });
    }

    // 5. 更新阅读进度
    function updateReadingProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / scrollHeight) * 100;

        const progressBar = document.getElementById('readingProgressBar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        // 更新返回顶部按钮显示
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) {
            backToTop.style.display = scrollTop > 500 ? 'block' : 'none';
        }
    }

    // 6. 更新当前章节高亮
    function updateActiveChapter() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const navItems = document.querySelectorAll('.chapter-nav-item');

        let activeIndex = 0;

        chapters.forEach((chapter, index) => {
            const slide = document.getElementById(chapter.id);
            if (slide) {
                const slideTop = slide.offsetTop;
                if (scrollTop >= slideTop - 200) {
                    activeIndex = index;
                }
            }
        });

        navItems.forEach((item, index) => {
            if (index === activeIndex) {
                item.classList.add('active');
                // 确保当前章节可见
                item.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            } else {
                item.classList.remove('active');
            }
        });
    }

    // 7. 平滑滚动到章节
    function scrollToChapter(chapterId) {
        const slide = document.getElementById(chapterId);
        if (slide) {
            // 减去导航栏高度
            const offsetTop = slide.offsetTop - 120;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // 8. 处理章节导航点击
    function handleChapterNavClick(e) {
        e.preventDefault();
        const target = e.target;
        if (target.classList.contains('chapter-nav-item')) {
            const chapterId = target.getAttribute('href').substring(1);
            scrollToChapter(chapterId);
        }
    }

    // 9. 初始化所有功能
    function init() {
        // 只在移动端执行
        if (!isMobile()) {
            return;
        }

        // 创建DOM元素
        createChapterNav();
        createReadingProgress();
        const backToTop = createBackToTop();
        addChapterLabels();

        // 初始化Lucide图标
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // 添加事件监听
        window.addEventListener('scroll', function() {
            updateReadingProgress();
            updateActiveChapter();
        });

        window.addEventListener('resize', function() {
            // 窗口大小改变时检查是否仍为移动端
            if (!isMobile()) {
                // 如果不再是移动端，可以选择移除这些元素
                // 这里保留它们，因为CSS会隐藏它们
            }
        });

        const chapterNav = document.getElementById('chapterNav');
        if (chapterNav) {
            chapterNav.addEventListener('click', handleChapterNavClick);
        }

        // 初始更新一次
        updateReadingProgress();
        updateActiveChapter();

        console.log('移动端滚动模式已启用');
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
