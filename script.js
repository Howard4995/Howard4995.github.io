// DOM 元素
const themeToggle = document.getElementById('themeToggle');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const slideInElements = document.querySelectorAll('.slide-in');
const skillLevels = document.querySelectorAll('.skill-level');
const progressRing = document.querySelector('.progress-ring-circle');
const dynamicText = document.getElementById('dynamic-text');
const sections = document.querySelectorAll('.fullpage-section');
const dots = document.querySelectorAll('.section-dots .dot');
const container = document.querySelector('.fullpage-container');

// 音樂播放器元素
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const songTitle = document.getElementById('songTitle');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const repeatBtn = document.getElementById('repeatBtn');

// 當前屏幕索引
let currentSectionIndex = 0;
let isScrolling = false;
let touchStartY = 0;
let touchEndY = 0;

// 音樂播放器狀態
let isPlaying = false;
let isMuted = false;

// 動態島文字
const dynamicMessages = [
    "現在在線上",
    "正在研究 AI",
    "iOS 開發中",
    "雲服務部署",
    "代碼ing"
];

// 主題設置
function setTheme(isDark) {
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        `;
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
            </svg>
        `;
    }
}

// 檢查系統主題偏好
function checkSystemTheme() {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDarkMode);
}

// 初始檢查主題
checkSystemTheme();

// 主題切換按鈕事件
themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(!isDark);
});

// 移動菜單事件
mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
});

// 移動菜單中的鏈接點擊事件
document.querySelectorAll('.mobile-menu-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// 頁面滾動檢測動畫
function checkSlideIn() {
    slideInElements.forEach(element => {
        // 計算元素頂部距離視窗頂部的距離
        const elementTop = element.getBoundingClientRect().top;
        // 視窗高度
        const windowHeight = window.innerHeight;
        
        // 當元素進入視窗的 85% 時激活動畫
        if (elementTop < windowHeight * 0.85) {
            element.classList.add('active');
        }
    });
}

// 技能條動畫
function animateSkillBars() {
    skillLevels.forEach(level => {
        const width = level.getAttribute('data-width') || level.style.width;
        level.style.width = '0';
        // 使用requestAnimationFrame確保動畫順暢
        requestAnimationFrame(() => {
            setTimeout(() => {
                level.style.width = width;
            }, 100);
        });
    });
}

// 進度環動畫
function animateProgressRing() {
    if (!progressRing) return;
    
    const elementTop = progressRing.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (elementTop < windowHeight * 0.9) {
        // 圓的周長為 2πr，這裡 r=50，所以周長約為 314
        const circumference = 2 * Math.PI * 50;
        // 設置為顯示 75% 的進度
        const offset = circumference - (75 / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;
    }
}

// 更新動態島文字
function updateDynamicIsland() {
    let index = 0;
    setInterval(() => {
        dynamicText.textContent = dynamicMessages[index];
        index = (index + 1) % dynamicMessages.length;
    }, 3000);
}

// View Transitions API 支持
const supportsViewTransition = 'startViewTransition' in document;

// 設置活動區塊 - 修改版以支持 View Transitions API
function setActiveSection(index) {
    if (index < 0 || index >= sections.length) return;
    
    if (supportsViewTransition) {
        document.startViewTransition(() => {
            updateActiveSectionDOM(index);
        });
    } else {
        updateActiveSectionDOM(index);
    }
}

// DOM 更新邏輯
function updateActiveSectionDOM(index) {
    // 移除所有活動狀態
    sections.forEach(section => section.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // 設置當前活動狀態
    sections[index].classList.add('active');
    dots[index].classList.add('active');
    
    // 更新索引
    currentSectionIndex = index;
    
    // 在活動區塊中啟動動畫
    if (index === 2) {  // 技能部分
        setTimeout(animateSkillBars, 700);
    } else if (index === 3) {  // 專案部分
        setTimeout(animateProjectsEntry, 500);
    } else if (index === 4) {  // 學習計劃部分
        setTimeout(animateLearningPlan, 500);
        setTimeout(animateProgressRing, 700);
    }
}

// 專案區域動畫
function animateProjectsEntry() {
    const featuredProject = document.querySelector('.feature-project');
    const projectsGrid = document.querySelector('.projects-grid');
    const learningPlan = document.querySelector('.learning-plan');
    
    if (featuredProject) {
        featuredProject.style.opacity = '0';
        featuredProject.style.transform = 'translateY(30px)';
        setTimeout(() => {
            featuredProject.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            featuredProject.style.opacity = '1';
            featuredProject.style.transform = 'translateY(0)';
        }, 100);
    }
    
    if (projectsGrid) {
        const cards = projectsGrid.querySelectorAll('.project-card');
        cards.forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 300 + i * 150);
        });
    }
    
    if (learningPlan) {
        learningPlan.style.opacity = '0';
        learningPlan.style.transform = 'translateY(30px)';
        setTimeout(() => {
            learningPlan.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            learningPlan.style.opacity = '1';
            learningPlan.style.transform = 'translateY(0)';
        }, 800);
    }
}

// 學習計劃區域動畫
function animateLearningPlan() {
    const comingSoon = document.querySelector('.coming-soon');
    const futureGoals = document.querySelector('.future-goals');
    const goalItems = document.querySelectorAll('.goal-item');
    
    if (comingSoon) {
        comingSoon.style.opacity = '0';
        comingSoon.style.transform = 'translateY(30px)';
        setTimeout(() => {
            comingSoon.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            comingSoon.style.opacity = '1';
            comingSoon.style.transform = 'translateY(0)';
        }, 100);
    }
    
    if (futureGoals) {
        futureGoals.style.opacity = '0';
        futureGoals.style.transform = 'translateY(30px)';
        setTimeout(() => {
            futureGoals.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            futureGoals.style.opacity = '1';
            futureGoals.style.transform = 'translateY(0)';
            
            // 為每個目標項添加延遲動畫
            goalItems.forEach((item, i) => {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 300 + i * 100);
            });
        }, 600);
    }
}

// 檢查 View Transitions API 兼容性並添加適當的類名
function checkViewTransitionsSupport() {
    if (!supportsViewTransition) {
        document.body.classList.add('no-view-transitions');
        console.log('此瀏覽器不支持 View Transitions API，已降級到標準動畫。');
    } else {
        document.body.classList.add('has-view-transitions');
        console.log('已啟用 View Transitions API。');
    }
}

// 裝置偵測功能
function detectDevice() {
    // 檢測是否為移動設備
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    // 根據裝置類型添加類別
    if (isMobile) {
        document.body.classList.add('mobile-device');
        document.body.classList.remove('desktop-device');
        adjustMobileLayout();
    } else {
        document.body.classList.add('desktop-device');
        document.body.classList.remove('mobile-device');
        resetToDesktopLayout();
    }
}

// 調整移動設備佈局
function adjustMobileLayout() {
    // 針對移動設備的特定調整
    const floatingPlayer = document.querySelector('.floating-player');
    if (floatingPlayer) {
        floatingPlayer.classList.add('mobile-optimized');
    }
    
    // 調整特定區塊在移動設備上的行為
    document.querySelectorAll('.fullpage-section').forEach(section => {
        section.classList.add('mobile-section');
    });
    
    // 優化聯繫區塊在移動設備上的顯示
    const contactGrid = document.querySelector('.contact-grid');
    if (contactGrid) {
        contactGrid.classList.add('mobile-contact');
    }
}

// 重置為桌面佈局
function resetToDesktopLayout() {
    // 移除移動設備特定的類別和樣式
    const floatingPlayer = document.querySelector('.floating-player');
    if (floatingPlayer) {
        floatingPlayer.classList.remove('mobile-optimized');
    }
    
    document.querySelectorAll('.fullpage-section').forEach(section => {
        section.classList.remove('mobile-section');
    });
    
    const contactGrid = document.querySelector('.contact-grid');
    if (contactGrid) {
        contactGrid.classList.remove('mobile-contact');
    }
}

// 監聽視窗大小變化，重新檢測裝置
window.addEventListener('resize', debounce(detectDevice, 250));

// 函數防抖，避免頻繁觸發
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// 初始化頁面
function initPage() {
    // 執行裝置偵測
    detectDevice();
    
    // 已有的初始化...
    checkSystemTheme();
    updateDynamicIsland();
    
    // 設置初始活動區塊
    setActiveSection(0);
    
    // 為導航點設置事件
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            scrollToSection(index);
        });
    });
    
    // 設置ios-card的動畫延遲索引
    document.querySelectorAll('.ios-card').forEach((card, index) => {
        card.style.setProperty('--card-index', index);
    });

    // 檢查 View Transitions API 支持
    checkViewTransitionsSupport();
    
    // 初始化專案區域元素
    const projectElements = document.querySelectorAll('.feature-project, .project-card');
    projectElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
    });
    
    // 初始化休閒娛樂區域元素
    const entertainmentGroups = document.querySelectorAll('.entertainment-group');
    entertainmentGroups.forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        setTimeout(() => {
            group.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            group.style.opacity = '1';
            group.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // 初始化學習計劃區域元素
    const learningElements = document.querySelectorAll('.coming-soon, .future-goals');
    learningElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
    });

    // 初始化音樂播放器
    if (audioPlayer) {
        initAudioPlayer();
    }
}

// 音樂播放器功能 - 增強版
function initAudioPlayer() {
    // 音樂清單 - 使用本地檔案而非線上連結
    const playlist = [
        // 本地音樂檔案
        { title: "???", src: "music.mp3" }
        
        // 如果你有更多音樂，可以繼續添加
        // { title: "歡快音樂", src: "happy.mp3" },
        // { title: "輕鬆音樂", src: "relax.mp3" }
    ];
    
    // 播放器狀態
    let currentSongIndex = 0;
    let isRepeat = false;
    
    // 載入音樂並顯示標題
    function loadSong(index) {
        if (index >= 0 && index < playlist.length) {
            audioPlayer.src = playlist[index].src;
            songTitle.textContent = playlist[index].title;
            currentSongIndex = index;
            
            // 重置進度條
            progressBar.style.width = '0%';
            currentTimeEl.textContent = '00:00';
            
            // 如果先前是播放狀態，則自動播放
            if (isPlaying) {
                audioPlayer.play().catch(error => {
                    console.error("播放失敗:", error);
                });
            }
        }
    }
    
    // 格式化時間為 mm:ss
    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
    
    // 上一首歌
    function prevSong() {
        let prevIndex = currentSongIndex - 1;
        if (prevIndex < 0) prevIndex = playlist.length - 1;
        loadSong(prevIndex);
    }
    
    // 下一首歌
    function nextSong() {
        let nextIndex = (currentSongIndex + 1) % playlist.length;
        loadSong(nextIndex);
    }
    
    // 切換循環模式
    function toggleRepeat() {
        isRepeat = !isRepeat;
        audioPlayer.loop = isRepeat;
        repeatBtn.style.color = isRepeat ? 'var(--accent-green)' : '';
    }
    
    // 載入第一首歌
    loadSong(0);
    
    // 播放/暫停功能
    playPauseBtn.addEventListener('click', togglePlay);
    
    // 靜音功能
    muteBtn.addEventListener('click', toggleMute);
    
    // 音量控制
    volumeSlider.addEventListener('input', updateVolume);
    
    // 進度條控制
    progressContainer.addEventListener('click', setProgress);
    
    // 上一首/下一首按鈕
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    
    // 循環播放按鈕
    repeatBtn.addEventListener('click', toggleRepeat);
    
    // 時間更新
    audioPlayer.addEventListener('timeupdate', () => {
        updateProgress();
        // 更新當前時間顯示
        const currentTime = audioPlayer.currentTime;
        currentTimeEl.textContent = formatTime(currentTime);
    });
    
    // 載入元數據時更新總時長
    audioPlayer.addEventListener('loadedmetadata', () => {
        const duration = audioPlayer.duration;
        durationEl.textContent = formatTime(duration);
    });
    
    // 播放結束
    audioPlayer.addEventListener('ended', () => {
        if (!isRepeat) {
            nextSong();
        }
        // 如果是循環模式，audioPlayer.loop=true 會自動處理循環
    });
    
    // 設定初始音量
    audioPlayer.volume = volumeSlider.value / 100;
    
    // 添加鍵盤控制
    document.addEventListener('keydown', (e) => {
        // 如果焦點在輸入框，不處理鍵盤事件
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.key) {
            case ' ': // 空格鍵播放/暫停
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowRight': // 右箭頭前進5秒
                audioPlayer.currentTime += 5;
                break;
            case 'ArrowLeft': // 左箭頭後退5秒
                audioPlayer.currentTime -= 5;
                break;
        }
    });
}

// 播放/暫停切換
function togglePlay() {
    if (isPlaying) {
        audioPlayer.pause();
        playPauseBtn.classList.remove('is-playing');
    } else {
        audioPlayer.play()
            .catch(error => {
                console.error("播放失敗:", error);
                alert("無法播放音樂，請確保音樂檔案存在且格式支持。");
            });
        playPauseBtn.classList.add('is-playing');
        
        // 播放時添加動畫效果
        playPauseBtn.animate([
            { transform: 'scale(0.9)' },
            { transform: 'scale(1.1)' },
            { transform: 'scale(1)' }
        ], {
            duration: 400,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        });
    }
    isPlaying = !isPlaying;
}

// 靜音切換 - 增強視覺反饋
function toggleMute() {
    audioPlayer.muted = !audioPlayer.muted;
    isMuted = audioPlayer.muted;
    
    muteBtn.innerHTML = isMuted ? 
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>` :
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>`;
    
    // 添加動畫效果
    muteBtn.animate([
        { transform: 'scale(0.9)' },
        { transform: 'scale(1.1)' },
        { transform: 'scale(1)' }
    ], {
        duration: 300,
        easing: 'ease-out'
    });
    
    // 更新音量滑塊樣式
    volumeSlider.style.opacity = isMuted ? '0.5' : '1';
}

// 音量更新
function updateVolume() {
    audioPlayer.volume = volumeSlider.value / 100;
    if (audioPlayer.muted && audioPlayer.volume > 0) {
        toggleMute(); // 如果調整了音量且之前是靜音，則解除靜音
    }
}

// 進度條更新
function updateProgress() {
    const duration = audioPlayer.duration;
    if (duration) {
        const currentTime = audioPlayer.currentTime;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
    }
}

// 通過點擊設置進度
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    
    if (duration) {
        audioPlayer.currentTime = (clickX / width) * duration;
        
        // 添加點擊反饋動畫
        const ripple = document.createElement('span');
        ripple.classList.add('progress-ripple');
        ripple.style.left = `${clickX}px`;
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 500);
    }
}

// 滾動到指定區塊
function scrollToSection(index) {
    if (isScrolling || index === currentSectionIndex) return;
    isScrolling = true;
    
    setActiveSection(index);
    
    // 滾動結束後解除鎖定
    setTimeout(() => {
        isScrolling = false;
    }, 1000);
}

// 鼠標滾輪事件
function handleWheel(e) {
    if (isScrolling) return;
    
    // 判斷滾動方向
    const direction = e.deltaY > 0 ? 1 : -1;
    const nextIndex = currentSectionIndex + direction;
    
    if (nextIndex >= 0 && nextIndex < sections.length) {
        e.preventDefault();
        scrollToSection(nextIndex);
    }
}

// 觸摸事件 - 開始
function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
}

// 觸摸事件 - 結束
function handleTouchEnd(e) {
    if (isScrolling) return;
    
    touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    
    // 判斷滑動方向和距離
    if (Math.abs(diff) > 50) {
        const direction = diff > 0 ? 1 : -1;
        const nextIndex = currentSectionIndex + direction;
        
        if (nextIndex >= 0 && nextIndex < sections.length) {
            scrollToSection(nextIndex);
        }
    }
}

// 鍵盤事件
function handleKeyDown(e) {
    if (isScrolling) return;
    
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const nextIndex = currentSectionIndex + 1;
        if (nextIndex < sections.length) {
            scrollToSection(nextIndex);
        }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const nextIndex = currentSectionIndex - 1;
        if (nextIndex >= 0) {
            scrollToSection(nextIndex);
        }
    }
}

// 頁面加載時執行的函數
window.addEventListener('load', () => {
    // 執行裝置偵測
    detectDevice();
    
    setTimeout(() => {
        checkSlideIn();
        animateSkillBars();
        animateProgressRing();
    }, 300);
    
    updateDynamicIsland();
});

// 頁面滾動時執行的函數
window.addEventListener('scroll', () => {
    checkSlideIn();
    animateSkillBars();
    animateProgressRing();
});

// 平滑滾動到錨點
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        // 對於特殊錨點，找到對應的section索引
        const targetSection = document.querySelector(targetId);
        if (targetSection && targetSection.classList.contains('fullpage-section')) {
            const index = Array.from(sections).indexOf(targetSection);
            if (index !== -1) {
                scrollToSection(index);
            }
        } else {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// 添加事件監聽
window.addEventListener('wheel', handleWheel, { passive: false });
window.addEventListener('touchstart', handleTouchStart, { passive: true });
window.addEventListener('touchend', handleTouchEnd, { passive: true });
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('load', initPage);
