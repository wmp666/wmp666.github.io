// 菜单切换
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.menu-items').classList.toggle('hidden');
});

// 页面切换
document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.getAttribute('data-page');

        // 隐藏所有页面
        document.querySelectorAll('main section').forEach(section => {
            section.classList.add('hidden');
        });

        // 显示目标页面
        document.querySelector(`.${page}`).classList.remove('hidden');

        // 关闭菜单
        document.querySelector('.menu-items').classList.add('hidden');
    });
});

// ??? 功能
document.getElementById('secret-link').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('password-modal').classList.remove('hidden');
});

// 密码验证
document.getElementById('submit-code').addEventListener('click', function() {
    const code = document.getElementById('access-code').value;
    const errorMsg = document.getElementById('error-msg');

    if (code === '260328081011') {
        window.location.href = 'https://wmp666.github.io/askQuestion';
    } else {
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 3000);
    }
});