# 移动端滚动布局说明

## 设计理念

**PC端（>768px）**：保持原有的幻灯片翻页体验
**移动端（≤768px）**：转换为长页面滚动，更适合移动设备阅读

## 核心改变

### 从幻灯片到长页面

| 特性 | PC端幻灯片 | 移动端滚动 |
|-----|-----------|-----------|
| 布局 | 固定高度容器 | 长页面滚动 |
| 导航 | 右侧浮动目录 | 顶部横向滚动导航 |
| 切换 | 左右翻页按钮 | 点击章节跳转 |
| 进度 | 幻灯片页码 | 阅读进度条 |
| 空间利用 | 受限于视口高度 | 完整展示所有内容 |

## 文件结构

```
assets/
├── css/
│   ├── mobile-scroll.css     # 移动端滚动样式（新增）
│   ├── mobile.css            # 通用移动端样式
│   └── slides.css            # PC端幻灯片样式（保持不变）
└── js/
    └── mobile-scroll.js      # 移动端滚动功能（新增）
```

## 核心功能

### 1. 顶部章节导航栏

```javascript
// 自动生成21个章节导航
<div class="chapter-nav">
    <a href="#slide-0" class="chapter-nav-item">引言</a>
    <a href="#slide-1" class="chapter-nav-item">1.0 认知重启</a>
    <a href="#slide-2" class="chapter-nav-item">1.1 核心原理</a>
    ...
</div>
```

**特点**：
- 固定在导航栏下方（top: 70px）
- 横向滚动，支持触摸滑动
- 当前阅读章节自动高亮
- 点击跳转到对应章节
- 自动滚动到当前可见位置

### 2. 阅读进度条

```html
<div class="reading-progress">
    <div class="reading-progress-bar" style="width: 45%"></div>
</div>
```

**特点**：
- 固定在顶部（top: 70px）
- 实时反映阅读进度
- 平滑过渡动画
- 2px细线条，不占用空间

### 3. 返回顶部按钮

```html
<button class="back-to-top">
    <i data-lucide="chevron-up"></i>
</button>
```

**特点**：
- 固定在右下角
- 滚动超过500px后显示
- 圆形按钮（44×44px）
- 平滑滚动到顶部
- 符合触摸标准

### 4. 章节标识

每个章节顶部自动添加标识：

```html
<section class="slide-container" data-chapter="1.0 认知重启">
    <div class="slide-content">
        <!-- 内容 -->
    </div>
</section>
```

**样式**：
- 小号大写字母
- 金色（accent color）
- 位于章节顶部
- 与内容有间距

### 5. 幻灯片转换规则

**CSS媒体查询**实现自动切换：

```css
/* PC端：默认幻灯片布局 */
.slide-container {
    position: absolute;
    height: 100vh;
    /* ... */
}

/* 移动端：长页面滚动 */
@media (max-width: 768px) {
    .slide-container {
        position: relative !important;
        height: auto !important;
        margin-bottom: 3rem !important;
        border-bottom: 1px solid rgba(0,0,0,0.08) !important;
    }
}
```

## 字体规范

### 移动端字体大小

| 元素 | 字体大小 | 行高 | 用途 |
|-----|---------|------|------|
| h1 | 1.5rem | 1.4 | 章节标题 |
| h2 | 1.25rem | 1.4 | 小节标题 |
| h3 | 1.1rem | 1.4 | 子标题 |
| p | 0.95rem | 1.7 | 正文 |
| blockquote | 0.9rem | 1.6 | 引用 |
| tag | 0.8rem | - | 标签 |

### 设计原则

1. **缩小差异**：从3:1缩小到1.6:1
2. **统一基准**：以0.95rem为基准单位
3. **可读性优先**：行高≥1.4，确保可读
4. **层级清晰**：标题通过字重区分，不过分依赖大小

## 布局优化

### 间距系统

```css
/* 章节间距 */
.slide-container {
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid rgba(0,0,0,0.08);
}

/* 内容间距 */
.slide-content {
    padding: 2rem 1.5rem;
}

/* 段落间距 */
p {
    margin-bottom: 1rem;
}
```

### 响应式断点

```css
/* 小屏手机 */
@media (max-width: 480px) {
    .slide-content {
        padding: 1.5rem 1rem;
    }
    h1 { font-size: 1.3rem; }
}

/* 横屏模式 */
@media (max-width: 768px) and (orientation: landscape) {
    .slide-content {
        padding: 1.5rem;
    }
}
```

## 性能优化

### 1. 条件加载

```javascript
// 只在移动端执行
if (window.innerWidth <= 768) {
    initMobileScroll();
}
```

### 2. 节流滚动事件

```javascript
let ticking = false;
window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
            updateProgress();
            updateActiveChapter();
            ticking = false;
        });
        ticking = true;
    }
});
```

### 3. 禁用不必要的动画

```css
/* 移动端禁用复杂动画 */
.fade-up, .delay-100, .delay-200, .delay-300 {
    animation: none !important;
    transition: none !important;
}
```

## 用户体验

### 滚动体验

1. **平滑滚动**：所有跳转使用 `behavior: 'smooth'`
2. **进度追踪**：顶部进度条实时更新
3. **章节导航**：自动高亮当前阅读章节
4. **快速返回**：一键返回顶部

### 触摸优化

1. **触摸目标**：所有可点击元素≥44×44px
2. **横向滚动**：章节导航支持触摸滑动
3. **防误触**：按钮有适当间距
4. **反馈及时**：点击有视觉反馈

### 可访问性

1. **语义化标签**：使用 `<nav>`, `<section>`, `<button>`
2. **ARIA标签**：按钮添加 `aria-label`
3. **键盘导航**：支持Tab键导航
4. **屏幕阅读器**：正确的DOM结构

## 测试检查清单

### 功能测试

- [ ] 章节导航正确显示
- [ ] 点击章节可以跳转
- [ ] 阅读进度条实时更新
- [ ] 返回顶部按钮正常工作
- [ ] 当前章节自动高亮

### 响应式测试

- [ ] iPhone SE (375×667)
- [ ] iPhone 12 (390×844)
- [ ] iPad (768×1024)
- [ ] 横屏模式
- [ ] 竖屏模式

### 性能测试

- [ ] 滚动流畅（60fps）
- [ ] 无内存泄漏
- [ ] 快速加载
- [ ] 动画不卡顿

### 兼容性测试

- [ ] iOS Safari
- [ ] Chrome Android
- [ ] Firefox Mobile
- [ ] 微信内置浏览器

## 使用方法

### 本地测试

```bash
# 启动本地服务器
cd finance_aigc_guides
python -m http.server 8000

# 访问
# 1. 桌面浏览器：http://localhost:8000
# 2. 开发者工具 → 设备模拟 (Ctrl+Shift+M)
# 3. 选择移动设备查看效果
```

### 调试移动端

在桌面浏览器中模拟移动端：

```javascript
// 在控制台执行
document.body.style.maxWidth = '375px';
document.body.style.margin = '0 auto';
```

### 切换模式

自动根据屏幕宽度切换：
- **≤768px**：移动端滚动模式
- **>768px**：PC端幻灯片模式

## 常见问题

### Q: 为什么不直接做成响应式？

A: 幻灯片和滚动是两种完全不同的交互模式。幻灯片适合演讲、演示，滚动适合阅读、学习。移动端主要是阅读场景，所以用滚动更合适。

### Q: 桌面端可以也用滚动吗？

A: 可以，但不是当前设计目标。桌面端保留幻灯片是为了完整的演示体验。如果需要，可以在CSS中移除媒体查询限制。

### Q: 章节导航可以放在侧边吗？

A: 不建议。移动端屏幕宽度有限，侧边导航会挤压内容空间。顶部横向滚动是更符合移动端习惯的设计。

### Q: 如何添加新章节？

A: 在 `mobile-scroll.js` 的 `chapters` 数组中添加：

```javascript
const chapters = [
    // ...
    { index: 21, label: '新章节', id: 'slide-21' }
];
```

## 技术细节

### 断点选择

```css
/* 768px是平板和手机的分界线 */
@media (max-width: 768px) {
    /* 移动端样式 */
}
```

**为什么是768px？**
- iPad竖屏宽度：768px
- 常用的响应式断点
- Bootstrap等框架的标准

### 固定定位层级

```css
.global-nav          { z-index: 100; }  /* 顶部导航 */
.chapter-nav         { z-index: 90; }   /* 章节导航 */
.reading-progress    { z-index: 100; }  /* 进度条 */
.back-to-top         { z-index: 95; }   /* 返回顶部 */
```

### 滚动监听优化

```javascript
// 使用Intersection Observer API（可选）
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // 更新当前章节
        }
    });
}, {
    threshold: 0.5
});
```

## 未来改进方向

1. **虚拟滚动**：章节内容过多时使用虚拟滚动
2. **懒加载**：非可视章节延迟加载图片
3. **手势导航**：左右滑动切换章节
4. **书签功能**：记录阅读位置
5. **夜间模式**：支持深色主题
6. **字体大小**：用户可调节字体大小

---

**版本**：v1.0
**更新时间**：2026-02-10
**维护者**：cyh
