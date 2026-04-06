const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('close-sidebar');

menuToggle.addEventListener('click', function() {
    sidebar.classList.toggle('active');
});

closeSidebar.addEventListener('click', function() {
    sidebar.classList.remove('active');
});

document.addEventListener('click', function(event) {
    if (!sidebar.contains(event.target) &&
        !menuToggle.contains(event.target) &&
        sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});

const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('main section');

navItems.forEach(item => {
    if (item.id !== 'secret-link') {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            this.classList.add('active');
            const page = this.getAttribute('data-page');

            if (page === 'home') {
                document.querySelector('.intro-section').classList.add('active');
            } else if (page === 'projects') {
                document.querySelector('.projects-section').classList.add('active');
            }

            sidebar.classList.remove('active');
        });
    }
});

const secretLink = document.getElementById('secret-link');
const passwordModal = document.getElementById('password-modal');
const closeModal = document.querySelector('.close-modal');
const submitCode = document.getElementById('submit-code');
const accessCodeInput = document.getElementById('access-code');
const errorMsg = document.getElementById('error-msg');

secretLink.addEventListener('click', function(e) {
    e.preventDefault();
    passwordModal.classList.add('active');
    sidebar.classList.remove('active');
    setTimeout(() => {
        accessCodeInput.focus();
    }, 100);
});

closeModal.addEventListener('click', function() {
    passwordModal.classList.remove('active');
    errorMsg.classList.remove('show');
    accessCodeInput.value = '';
});

passwordModal.addEventListener('click', function(e) {
    if (e.target === passwordModal) {
        passwordModal.classList.remove('active');
        errorMsg.classList.remove('show');
        accessCodeInput.value = '';
    }
});

submitCode.addEventListener('click', async function() {
    const code = accessCodeInput.value.trim();


    if (code === '260328081011') {
        window.location.href = 'game/askQuestion.html';
    } else if(code === '21090223'){
        window.location.href = 'birthday/xhc.html';
    } else {
        errorMsg.classList.add('show');
        accessCodeInput.value = '';
        accessCodeInput.focus();

        setTimeout(() => {
            errorMsg.classList.remove('show');
        }, 3000);
    }
});

accessCodeInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        submitCode.click();
    }
});

// 邮箱按钮点击显示邮箱
const emailIcon = document.querySelector('.social-icon .fa-envelope');
if (emailIcon) {
    const emailButton = emailIcon.parentElement;
    let emailTooltip = null;

    emailButton.addEventListener('click', function(e) {
        e.preventDefault();

        // 移除已存在的提示框
        if (emailTooltip) {
            emailTooltip.remove();
            emailTooltip = null;
            return;
        }

        // 创建邮箱提示框
        emailTooltip = document.createElement('div');
        emailTooltip.className = 'email-tooltip';
        emailTooltip.innerHTML = `
            <span class="email-text">2134868121@qq.com</span>
            <button class="copy-email" title="复制邮箱">
                <i class="fas fa-copy"></i>
            </button>
        `;

        // 定位提示框
        const rect = emailButton.getBoundingClientRect();
        emailTooltip.style.position = 'fixed';
        emailTooltip.style.left = rect.left + (rect.width / 2) - 120 + 'px';
        emailTooltip.style.top = rect.top - 60 + 'px';
        emailTooltip.style.zIndex = '9999';

        document.body.appendChild(emailTooltip);

        // 添加动画
        setTimeout(() => {
            emailTooltip.classList.add('show');
        }, 10);

        // 复制功能
        const copyBtn = emailTooltip.querySelector('.copy-email');
        copyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText('2134868121@qq.com').then(() => {
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                }, 1500);
            });
        });

        // 3秒后自动关闭
        setTimeout(() => {
            if (emailTooltip) {
                emailTooltip.classList.remove('show');
                setTimeout(() => {
                    if (emailTooltip) {
                        emailTooltip.remove();
                        emailTooltip = null;
                    }
                }, 300);
            }
        }, 3000);
    });
}

// 变色效果 - 名字和标语的颜色渐变动画
document.addEventListener('DOMContentLoaded', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';

        /*const nameElement = document.querySelector('.gradientText');
        const taglineElement = document.querySelector('.tagline');
*/
        /*if (nameElement) {
            nameElement.textContent = '无名牌';
        }
        if (taglineElement) {
            taglineElement.textContent = '很高兴认识你！交个朋友吧';
        }*/
    }, 100);
});

// 获取服务器时间
async function getServerTime() {
    try {
        // 方法1: 通过 HTTP 请求头获取服务器时间（推荐）
        const response = await fetch(window.location.href, {
            method: 'HEAD',
            cache: 'no-cache'
        });
        
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
            return new Date(dateHeader);
        }
        
        // 方法2: 如果方法1失败，使用世界时间API
        const apiResponse = await fetch('https://worldtimeapi.org/api/ip');
        const data = await apiResponse.json();
        return new Date(data.datetime);
        
    } catch (error) {
        console.error('获取服务器时间失败:', error);
        // 降级方案：返回本地时间
        return new Date();
    }
}

