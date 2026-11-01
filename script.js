/**
 * wmp666 个人主页 - 全站公共脚本
 * 供 index.html 与 page/* 复用；整体 null-safe，任何元素缺失都不会抛错。
 */
(function () {
    'use strict';

    var EMAIL = '2134868121@qq.com';

    /** 访问码 -> 目标页（原样保留，不要改动路由） */
    var ACCESS_ROUTES = {
        '260328081011': 'game/askQuestion.html',
        '21090223': 'birthday/xhc.html',
        '25081011': 'birthday/lcl.html',
        '15090129': 'birthday/yht.html',
        '24090624': 'birthday/xtq.html'
    };

    /* ------------------------------------------------------------------ */
    /* 小工具                                                              */
    /* ------------------------------------------------------------------ */

    function byId(id) {
        return document.getElementById(id) || null;
    }

    function qs(selector, root) {
        try {
            return (root || document).querySelector(selector) || null;
        } catch (e) {
            return null;
        }
    }

    function qsa(selector, root) {
        try {
            return Array.prototype.slice.call((root || document).querySelectorAll(selector));
        } catch (e) {
            return [];
        }
    }

    function hasLayui() {
        return typeof window.layui !== 'undefined'
            && window.layui
            && typeof window.layui.use === 'function';
    }

    /**
     * layui 存在时才执行 cb(layer)；返回是否真的执行了。
     * 页面没引入 layui.js 时静默跳过，不抛错。
     */
    function withLayer(callback) {
        if (!hasLayui()) return false;
        try {
            window.layui.use(['layer'], function () {
                var layer = window.layui.layer;
                if (layer && typeof callback === 'function') {
                    try {
                        callback(layer);
                    } catch (e) {
                        console.warn('[site] layer 回调异常：', e);
                    }
                }
            });
        } catch (e) {
            console.warn('[site] layui 加载失败：', e);
            return false;
        }
        return true;
    }

    /** 轻提示：优先 layer.msg，退化到 console，绝不抛错 */
    function notify(text) {
        var handled = withLayer(function (layer) {
            layer.msg(text);
        });
        if (!handled) console.log('[site]', text);
    }

    /* ------------------------------------------------------------------ */
    /* 顶部导航（手机端下拉面板）                                            */
    /* ------------------------------------------------------------------ */

    function closeNav() {
        var header = qs('.site-header');
        var toggle = byId('nav-toggle');
        if (header) header.classList.remove('nav-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    function initNavbar() {
        var header = qs('.site-header');
        if (!header) return;

        var toggle = byId('nav-toggle');
        if (toggle) {
            toggle.addEventListener('click', function (event) {
                event.stopPropagation();
                var open = header.classList.toggle('nav-open');
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }

        qsa('.site-nav-main a').forEach(function (link) {
            link.addEventListener('click', function () {
                closeNav();
            });
        });

        document.addEventListener('click', function (event) {
            if (!header.classList.contains('nav-open')) return;
            if (header.contains(event.target)) return;
            closeNav();
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeNav();
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) closeNav();
        });
    }

    /* ------------------------------------------------------------------ */
    /* 邮箱复制                                                            */
    /* ------------------------------------------------------------------ */

    function copyByTextarea(text) {
        var helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', 'readonly');
        helper.style.position = 'fixed';
        helper.style.top = '-1000px';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        var copied = false;
        try {
            helper.select();
            copied = document.execCommand('copy');
        } catch (e) {
            copied = false;
        }
        document.body.removeChild(helper);
        return copied;
    }

    function copyEmail() {
        var done = function () {
            notify('已复制邮箱：' + EMAIL);
        };
        var fallback = function () {
            if (copyByTextarea(EMAIL)) {
                done();
            } else {
                notify('复制失败，请手动复制：' + EMAIL);
            }
        };

        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            try {
                navigator.clipboard.writeText(EMAIL).then(done, fallback);
                return;
            } catch (e) {
                fallback();
                return;
            }
        }
        fallback();
    }

    /* ------------------------------------------------------------------ */
    /* 访问验证弹层                                                        */
    /* ------------------------------------------------------------------ */

    var ACCESS_LAYER_HTML = [
        '<div class="site-access">',
        '  <p class="site-access-tip">请输入访问码以继续</p>',
        '  <div class="layui-form-item">',
        '    <input type="password" id="access-code" class="layui-input"',
        '           placeholder="输入访问码" autocomplete="off">',
        '  </div>',
        '  <p class="site-access-error" id="access-error">访问码错误，请重试</p>',
        '  <div class="site-access-actions">',
        '    <button type="button" class="layui-btn layui-btn-normal" id="submit-code">确定</button>',
        '  </div>',
        '</div>'
    ].join('\n');

    function openAccessLayer() {
        return withLayer(function (layer) {
            var width = Math.min(420, Math.floor((window.innerWidth || 1024) * 0.9));
            layer.open({
                type: 1,
                title: '访问验证',
                area: [width + 'px', '280px'],
                shadeClose: true,
                content: ACCESS_LAYER_HTML,
                success: function (layero) {
                    var input = layero.find('#access-code')[0] || byId('access-code');
                    var error = qs('.site-access-error', layero[0]);
                    var submit = layero.find('#submit-code')[0] || byId('submit-code');
                    var hideTimer = null;

                    function showError() {
                        if (!error) return;
                        error.classList.add('show');
                        if (hideTimer) clearTimeout(hideTimer);
                        hideTimer = setTimeout(function () {
                            error.classList.remove('show');
                        }, 3000);
                    }

                    function trySubmit() {
                        var code = input ? String(input.value || '').trim() : '';
                        var route = Object.prototype.hasOwnProperty.call(ACCESS_ROUTES, code)
                            ? ACCESS_ROUTES[code]
                            : null;
                        if (route) {
                            window.location.href = route;
                            return;
                        }
                        if (input) input.value = '';
                        showError();
                        if (input) input.focus();
                    }

                    if (submit) submit.addEventListener('click', trySubmit);
                    if (input) {
                        input.addEventListener('keydown', function (event) {
                            if (event.key === 'Enter' || event.keyCode === 13) {
                                event.preventDefault();
                                trySubmit();
                            }
                        });
                        setTimeout(function () {
                            input.focus();
                        }, 50);
                    }
                }
            });
        });
    }

    function initHeaderActions() {
        var secretLink = byId('secret-link');
        if (secretLink) {
            secretLink.addEventListener('click', function (event) {
                event.preventDefault();
                closeNav();
                openAccessLayer();
            });
        }

        var emailBtn = byId('email-btn');
        if (emailBtn) {
            emailBtn.addEventListener('click', function (event) {
                event.preventDefault();
                copyEmail();
            });
        }
    }

    /* ------------------------------------------------------------------ */
    /* 生日彩蛋                                                            */
    /* ------------------------------------------------------------------ */

    function isAuthorBir() {
        var nameEl = byId('name');
        var introEl = byId('introduction');
        var check = window.checkDate;

        if (typeof check !== 'function') {
            if (introEl) introEl.textContent = '很高兴认识你！交个朋友吧';
            return Promise.resolve(false);
        }

        var pending;
        try {
            pending = Promise.resolve(check(9, 17, true));
        } catch (e) {
            pending = Promise.resolve(false);
        }

        return pending.then(function (isBirthday) {
            if (isBirthday) {
                if (nameEl) {
                    nameEl.innerHTML = '<i class="layui-icon layui-icon-gift"></i><br>祝自己生日快乐！';
                }
                if (introEl) introEl.textContent = '今天是我生日能祝福一下我吗';
            } else if (introEl) {
                introEl.textContent = '很高兴认识你！交个朋友吧';
            }
            return !!isBirthday;
        }, function () {
            if (introEl) introEl.textContent = '很高兴认识你！交个朋友吧';
            return false;
        });
    }

    /* ------------------------------------------------------------------ */
    /* URL 参数兼容                                                        */
    /* ------------------------------------------------------------------ */

    function currentMatches(target) {
        var path = String(window.location.pathname || '').toLowerCase().replace(/\/+$/, '');
        var want = String(target || '').toLowerCase();
        if (!want) return false;
        if (want === 'index.html') {
            return path === '' || /(^|\/)index\.html$/.test(path);
        }
        return path.length >= want.length && path.slice(-want.length) === want;
    }

    function cleanQuery() {
        try {
            if (window.history && typeof window.history.replaceState === 'function') {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (e) {
            /* 忽略：部分环境禁止 replaceState */
        }
    }

    function handlePageNavigation() {
        var params;
        try {
            params = new URLSearchParams(window.location.search);
        } catch (e) {
            return;
        }
        var page = params.get('page');
        if (!page) return;

        var targets = { home: 'index.html', projects: 'page/projects.html' };
        var target = Object.prototype.hasOwnProperty.call(targets, page) ? targets[page] : null;

        if (page === 'secret') {
            cleanQuery();
            var secretLink = byId('secret-link');
            if (secretLink) secretLink.click();
            return;
        }

        if (target && !currentMatches(target)) {
            window.location.replace(target);
            return;
        }

        cleanQuery();
    }

    /* ------------------------------------------------------------------ */
    /* 启动                                                                */
    /* ------------------------------------------------------------------ */

    function fadeIn() {
        var body = document.body;
        if (!body) return;
        body.style.opacity = '0';
        body.style.transition = 'opacity 0.4s ease';
        var reveal = function () {
            body.style.opacity = '1';
        };
        if (typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(function () {
                window.requestAnimationFrame(reveal);
            });
        } else {
            setTimeout(reveal, 50);
        }
    }

    function start() {
        fadeIn();
        initNavbar();
        initHeaderActions();
        isAuthorBir();
        handlePageNavigation();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    // 供 HTML 内联调用 / 旧页面调用
    window.isAuthorBir = isAuthorBir;
    window.handlePageNavigation = handlePageNavigation;
})();
