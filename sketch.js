/*
By Okazz
*/
let colors = ['#f71735', '#067bc2', '#FFC247', '#3BD89F', '#81cfe5', '#f654a9', '#2F0A30'];
let ctx;
let centerX, centerY;
let strollers = [];

// 新增：左側選單相關
let menuItems = ['回到首頁', '第一單元作品', '第一單元講義', '測驗系統', '作品筆記', '自我介紹', '淡江大學'];
let menuWidth = 260; // 預設寬度，稍後會根據視窗大小調整
let menuRevealThreshold = 60;
let menuX = -menuWidth;
let menuTargetX = -menuWidth;
let menuPadding = 18;
// 調大項目高度以配合放大文字
let itemHeight = 52;
let hoverIndex = -1;

// 新增：iframe 顯示相關
let iframeEl = null;
let iframeWrapper = null;
let closeBtn = null;
let iframePadding = 12;// iframe 與視窗邊緣的間距

// 新增：子選單相關變數
let subMenuItems = {
    '淡江大學': ['教育科技學系']
};
let subMenuUrls = {
    '教育科技學系': 'https://www.et.tku.edu.tw/'
};
let showSubMenu = false;
let currentSubMenu = '';

function setup() {
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER);
    colorMode(HSB, 360, 100, 100, 100);
    ctx = drawingContext;
    centerX = width / 2;
    centerY = height / 2;
    for (let i = 0; i < 21; i++) {
        let x = random(width);
        let y = random(height); // 修正：之前是 random(width)
        strollers.push(new Wisp(x, y, width * random(0.05, 0.09), colors[i % colors.length]));
    }
    // 初始 menuX 依畫面大小
    menuWidth = min(300, width * 0.28);// 最大不超過 300px
    menuX = -menuWidth;
    menuTargetX = -menuWidth;
}

function draw() {
    background('#fafaff');


    for (let s of strollers) {
        s.run();
    }


    for (let i = 0; i < strollers.length; i++) {
        let c1 = strollers[i];
        for (let j = i + 1; j < strollers.length; j++) {
            let c2 = strollers[j];
            let dx = c2.x - c1.x;
            let dy = c2.y - c1.y;
            let distance = sqrt(dx * dx + dy * dy);
            let minDist = c1.d + c2.d;

            if (distance < minDist && distance > 0) {
                let force = (minDist - distance) * 0.001;
                let nx = dx / distance;
                let ny = dy / distance;
                c1.vx -= force * nx;
                c1.vy -= force * ny;
                c2.vx += force * nx;
                c2.vy += force * ny;
            }
        }
    }


    // -------------------------------
    // 左側選單互動與繪製（在其他元素之上）
    // -------------------------------
    // 判斷是否應該展開選單（滑鼠靠近左側）
    if (mouseX >= 0 && mouseX <= menuRevealThreshold) {
        menuTargetX = 0;
    } else {
        menuTargetX = -menuWidth;
    }
    // 平滑滑入滑出
    menuX += (menuTargetX - menuX) * 0.18;

    // 計算 hover（考慮標題空間）
    if (mouseX >= menuX && mouseX <= menuX + menuWidth) {
        let relativeY = mouseY - (menuPadding + 26);
        let idx = floor(relativeY / itemHeight);
        if (idx >= 0 && idx < menuItems.length && relativeY >= 0) {
            hoverIndex = idx;
        } else {
            hoverIndex = -1;
        }
    } else {
        hoverIndex = -1;
    }

    // 繪製選單背景
    push();
    noStroke();
    fill(0, 0, 10, 90); // 使用 HSB（深色半透明）
    rectMode(CORNER);
    rect(menuX, 0, menuWidth, height);
    // 標題
    fill(0, 0, 95, 100);
    textSize(20); // 放大文字
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    text('6511 教科一A 張又瑄', menuX + menuPadding, menuPadding - 4);

    // 項目（放大文字）
    textSize(28); // 放大文字
    textStyle(NORMAL);
    for (let i = 0; i < menuItems.length; i++) {
        let x = menuX + menuPadding;
        let y = menuPadding + 26 + i * itemHeight;
        
        // 背景高亮
        if (i === hoverIndex) {
            fill(210, 30, 95, 30);
            rect(menuX + 6, y - 8, menuWidth - 12, itemHeight - 10, 6);
            fill('#f71735');
            
            // 當滑鼠靠近淡江大學時，自動顯示子選單
            if (menuItems[i] === '淡江大學') {
                showSubMenu = true;
                currentSubMenu = '淡江大學';
            }
        } else {
            fill(0, 0, 95, 80);
        }
        text(menuItems[i], x, y);
    }
    pop();

    // 如果滑鼠離開選單區域，隱藏子選單
    if (mouseX < menuX || mouseX > menuX + menuWidth || hoverIndex === -1) {
        showSubMenu = false;
        currentSubMenu = '';
    }

    // 繪製子選單（如果需要顯示）
    if (showSubMenu && currentSubMenu === '淡江大學') {
        let parentIndex = menuItems.indexOf('淡江大學');
        let subMenuY = menuPadding + 26 + parentIndex * itemHeight;
        
        push();
        noStroke();
        fill(0, 0, 10, 90);
        rectMode(CORNER);
        rect(menuX + menuWidth, subMenuY, menuWidth, itemHeight, 6);
        
        textSize(28);
        fill(0, 0, 95, 80);
        text('教育科技學系', menuX + menuWidth + menuPadding, subMenuY + itemHeight * 0.65);
        pop();
    }
}

function aetherLink(x1, y1, d1, x2, y2, d2, dst) {
    let r = dst / 2;
    let r1 = d1 / 2;
    let r2 = d2 / 2;
    let R1 = r1 + r;
    let R2 = r2 + r;
    let dx = x2 - x1;
    let dy = y2 - y1;
    let d = sqrt(dx * dx + dy * dy);
    if (d > R1 + R2) {
        return;
    }
    let dirX = dx / d;
    let dirY = dy / d;
    let a = (R1 * R1 - R2 * R2 + d * d) / (2 * d);
    let underRoot = R1 * R1 - a * a;
    if (underRoot < 0) return;
    let h = sqrt(underRoot);
    let midX = x1 + dirX * a;
    let midY = y1 + dirY * a;
    let perpX = -dirY * h;
    let perpY = dirX * h;
    let cx1 = midX + perpX;
    let cy1 = midY + perpY;
    let cx2 = midX - perpX;
    let cy2 = midY - perpY;

    if (dist(cx1, cy1, cx2, cy2) < r * 2) {
        return;
    }

    let ang1 = atan2(y1 - cy1, x1 - cx1);
    let ang2 = atan2(y2 - cy1, x2 - cx1);
    let ang3 = atan2(y2 - cy2, x2 - cx2);
    let ang4 = atan2(y1 - cy2, x1 - cx2);

    if (ang2 < ang1) {
        ang2 += TAU;
    }

    beginShape();
    for (let i = ang1; i < ang2; i += TAU / 180) {
        vertex(cx1 + r * cos(i), cy1 + r * sin(i));
    }

    if (ang4 < ang3) {
        ang4 += TAU;
    }
    for (let i = ang3; i < ang4; i += TAU / 180) {
        vertex(cx2 + r * cos(i), cy2 + r * sin(i));
    }
    endShape(CLOSE);
}

class Wisp {
    constructor(x, y, d, c) {
        this.x = x;
        this.y = y;
        this.d = d;
        this.vx = random(-1, 1) * width * 0.001;
        this.vy = random(-1, 1) * width * 0.001;
        this.ang = 0;
        this.rnd = random(10000);
        this.circles = [];
        this.timer = 0;
        this.color = c;
        this.angle = 0;
        this.pp = createVector(this.x, this.y);
    }

    show() {
        noStroke();
        fill(this.color);
        for (let c of this.circles) {
            c.run();
        }
        for (let i = 0; i < this.circles.length; i++) {
            let c = this.circles[i];
            if (c.isDead) {
                this.circles.splice(0, 1);
            }
            aetherLink(this.x, this.y, this.d, c.x, c.y, c.d, this.d * 0.2);
            for (let j = 0; j < this.circles.length; j++) {
            }
        }



        push();
        translate(this.x, this.y);
        rotate(this.angle);
        circle(0, 0, this.d);

        translate(this.d * 0.15, 0);
        rotate(-this.angle);
        fill('#ffffff');
        ellipse(-this.d * 0.22, -this.d * 0.02, this.d * 0.125, this.d * 0.15);
        ellipse(this.d * 0.22, -this.d * 0.02, this.d * 0.125, this.d * 0.15);
        ellipse(0, this.d * 0.05, this.d * 0.07, this.d * 0.09);
        
        pop();
    }

    update() {


        this.x += this.vx;
        this.y += this.vy;

        let r = this.d / 2
        if (this.x <= r || width - r <= this.x) {
            this.vx *= -1;
        }
        if (this.y <= r || height - r <= this.y) {
            this.vy *= -1;
        }

        this.x = constrain(this.x, r, width - r);
        this.y = constrain(this.y, r, height - r);


        if ((this.timer % 30) == 0) {
            this.circles.push(new Circle(this.x, this.y, this.d))
        }

        this.timer++;

        this.angle = atan2(this.y - this.pp.y, this.x - this.pp.x);
        this.pp = createVector(this.x, this.y);
    }

    run() {
        this.show();
        this.update();
    }
}


class Circle {
    constructor(x, y, d) {
        this.x = x;
        this.y = y;
        this.d = d;
        this.decrease = width * 0.0015;
        this.isDead = false;
        this.vx = random(-1, 1) * width * 0.0008;
        this.vy = random(-1, 1) * width * 0.0008;
    }

    show() {
        circle(this.x, this.y, this.d);
    }

    update() {
        this.d -= this.decrease;
        if (this.d < 0) {
            this.isDead = true;
        }
        this.d = constrain(this.d, 0, width);
        this.x += this.vx;
        this.y += this.vy;
    }

    run() {
        this.show();
        this.update();
    }
}

// 修改：點擊選單項目處理（開啟內嵌 iframe）
// 注意：因為新增了「回到首頁」為 index 0，原本前三項向後移一位
function mousePressed() {
    if (mouseX >= menuX && mouseX <= menuX + menuWidth) {
        let relativeY = mouseY - (menuPadding + 26);
        let idx = floor(relativeY / itemHeight);
        if (idx >= 0 && idx < menuItems.length) {
            // 回到首頁：關閉所有 iframe
            if (idx === 0) {
                closeIframe();
                return;
            }
            // 原先的前三項（現在是 1,2,3）改為在 iframe 中開啟
            if (idx === 1) {
                openIframe('https://jovie6818-byte.github.io/20251014-414736511/');
            } else if (idx === 2) {
                openIframe('https://hackmd.io/@d71AYvUoQBuzbz__xVYdrw/r1ergYuknee');
            } else if (idx === 3) {
                openIframe('https://jovie6818-byte.github.io/1028-6511/');
            } else if (idx === 4) { // 作品筆記
                openIframe('https://hackmd.io/@d71AYvUoQBuzbz__xVYdrw/rkfvs1PJWg');
            } else if (idx === 6) { // 淡江大學
                // 顯示子選單
                showSubMenu = !showSubMenu;
                currentSubMenu = '淡江大學';
            } else {
                print('選單點擊：' + menuItems[idx]);
            }
        }
    }
}

// 新增：打開 iframe（會建立一個 wrapper 與關閉按鈕）
function openIframe(url) {
    closeIframe(); // 若已有先關閉
    // wrapper 放在 body 上，位置靠右，避開選單區域
    iframeWrapper = createDiv();
    iframeWrapper.style('position', 'absolute');
    iframeWrapper.style('left', (menuWidth + iframePadding) + 'px');
    iframeWrapper.style('top', iframePadding + 'px');
    iframeWrapper.style('width', max(200, windowWidth - menuWidth - iframePadding * 2) + 'px');
    iframeWrapper.style('height', max(200, windowHeight - iframePadding * 2) + 'px');
    iframeWrapper.style('background', '#ffffff');
    iframeWrapper.style('box-shadow', '0 4px 18px rgba(0,0,0,0.25)');
    iframeWrapper.style('z-index', '9999');
    iframeWrapper.style('overflow', 'hidden');
    // iframe 本體
    iframeEl = createElement('iframe');
    iframeEl.attribute('src', url);
    iframeEl.attribute('frameborder', '0');
    iframeEl.style('border', '0');
    iframeEl.style('width', '100%');
    iframeEl.style('height', '100%');
    iframeEl.parent(iframeWrapper);

    // 關閉按鈕
    closeBtn = createButton('×');
    closeBtn.parent(iframeWrapper);
    closeBtn.style('position', 'absolute');
    closeBtn.style('right', '6px');
    closeBtn.style('top', '6px');
    closeBtn.style('padding', '6px 10px');
    closeBtn.style('font-size', '18px');
    closeBtn.style('line-height', '18px');
    closeBtn.style('background', 'rgba(0,0,0,0.6)');
    closeBtn.style('color', '#fff');
    closeBtn.style('border', 'none');
    closeBtn.style('border-radius', '4px');
    closeBtn.style('cursor', 'pointer');
    closeBtn.style('z-index', '10000');
    closeBtn.mousePressed(closeIframe);
}

// 新增：關閉並移除 iframe
function closeIframe() {
    if (iframeEl) {
        iframeEl.remove();
        iframeEl = null;
    }
    if (closeBtn) {
        closeBtn.remove();
        closeBtn = null;
    }
    if (iframeWrapper) {
        iframeWrapper.remove();
        iframeWrapper = null;
    }
}

// 可選：在視窗大小改變時也更新 menuWidth 與 iframe 大小（若該 function 已存在，請合併）
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    centerX = width / 2;
    centerY = height / 2;
    menuWidth = min(300, width * 0.28);
    if (menuTargetX < 0) {
        menuX = -menuWidth;
        menuTargetX = -menuWidth;
    } else {
        menuTargetX = 0;
    }
    // 調整 iframe 大小與位置（若存在）
    if (iframeWrapper) {
        iframeWrapper.style('left', (menuWidth + iframePadding) + 'px');
        iframeWrapper.style('width', max(200, windowWidth - menuWidth - iframePadding * 2) + 'px');
        iframeWrapper.style('height', max(200, windowHeight - iframePadding * 2) + 'px');
    }
}