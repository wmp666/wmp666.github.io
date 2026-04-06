/**
 * 日期检查工具
 * 根据服务器时间判断是否到达目标日期，并显示/隐藏对应内容
 * @param {number} targetMonth - 目标月份 (1-12)
 * @param {number} targetDay - 目标日期 (1-31)
 * @param {boolean} isLunar - 是否为农历（默认false为公历）
 * @param {string} specialContentId - 特殊内容区域的ID
 * @param {string} normalMessageId - 普通消息区域的ID
 * @param {string} dateDisplayId - 日期显示区域的ID
 */
async function checkDate(targetMonth, targetDay, isLunar = false, specialContentId = 'special-content', normalMessageId = 'normal-message', dateDisplayId = 'current-date') {
    try {
        // 方法1: 通过 HTTP 请求头获取服务器时间
        const response = await fetch(window.location.href, {
            method: 'HEAD',
            cache: 'no-cache'
        });
        
        const dateHeader = response.headers.get('date');
        let serverTime;
        
        if (dateHeader) {
            serverTime = new Date(dateHeader);
        } else {
            // 方法2: 使用世界时间API
            const apiResponse = await fetch('https://worldtimeapi.org/api/ip');
            const data = await apiResponse.json();
            serverTime = new Date(data.datetime);
        }
        
        const month = serverTime.getMonth() + 1;
        const day = serverTime.getDate();
        
        let isTargetDate = false;
        let currentDateStr = '';
        
        // 判断是公历还是农历
        if (isLunar && typeof LunarCalendar !== 'undefined') {
            // 农历判断
            const lunarDate = LunarCalendar.getLunarDate(serverTime);
            if (lunarDate) {
                isTargetDate = lunarDate.month === targetMonth && lunarDate.day === targetDay;
                currentDateStr = `农历${lunarDate.monthName}${lunarDate.dayName}`;
            } else {
                console.warn('无法转换农历日期，使用公历判断');
                isTargetDate = month === targetMonth && day === targetDay;
                currentDateStr = `${month}月${day}日`;
            }
        } else {
            // 公历判断
            isTargetDate = month === targetMonth && day === targetDay;
            currentDateStr = `${month}月${day}日`;
        }
        
        // 判断是否是目标日期
        if (isTargetDate) {
            const specialContent = document.getElementById(specialContentId);
            if (specialContent) {
                specialContent.classList.add('show');
            }
            console.log(`✓ 今天是目标日期（${isLunar ? '农历' : '公历'}${targetMonth}月${targetDay}日），显示特殊内容！`);
            return true;
        } else {
            const normalMessage = document.getElementById(normalMessageId);
            if (normalMessage) {
                normalMessage.classList.add('show');
            }
            console.log(`✗ 今天不是目标日期，当前是${currentDateStr}`);
            return false;
        }
        
    } catch (error) {
        console.error('获取日期失败:', error);
        // 降级方案：使用本地时间
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        
        let isTargetDate = false;
        let currentDateStr = '';
        
        // 判断是公历还是农历
        if (isLunar && typeof LunarCalendar !== 'undefined') {
            const lunarDate = LunarCalendar.getLunarDate(now);
            if (lunarDate) {
                isTargetDate = lunarDate.month === targetMonth && lunarDate.day === targetDay;
                currentDateStr = `农历${lunarDate.monthName}${lunarDate.dayName} (本地时间)`;
            } else {
                isTargetDate = month === targetMonth && day === targetDay;
                currentDateStr = `${month}月${day}日 (本地时间)`;
            }
        } else {
            isTargetDate = month === targetMonth && day === targetDay;
            currentDateStr = `${month}月${day}日 (本地时间)`;
        }
        
        if (isTargetDate) {
            const specialContent = document.getElementById(specialContentId);
            if (specialContent) {
                specialContent.classList.add('show');
            }
            return true;
        } else {
            const normalMessage = document.getElementById(normalMessageId);
            if (normalMessage) {
                normalMessage.classList.add('show');
            }
            return false;
        }
    }
}
