import { app, BrowserWindow, Menu } from 'electron';
import { ProcessMessage } from './window/process-message';
import path from 'path';
import { saveConfig } from './config/base-config';
import { main } from './window/main';

// 创建窗口
function createWindow() {
    Menu.setApplicationMenu(null);
    // 创建窗口
    const win = new BrowserWindow({
        width: 360,
        height: 480,
        resizable: false,
        webPreferences: {
            devTools: false,
            nodeIntegration: true, // 页面直接使用node的能力 用于引入node模块 执行命令
            preload: path.join(__dirname, './window/preload.js'),
        },
    });
    // 加载本地页面
    win.loadFile('./src/window/index.html');
    // win.webContents.openDevTools(); // 打开控制台
    // 主线程和渲染进程通信
    const processMessage: ProcessMessage = new ProcessMessage(win);
    processMessage.init();
}

const isCmdMode = process.argv.includes('--k-cmd-mode');

// app ready 创建窗口
app.whenReady().then(() => {
    if (!isCmdMode) {
        createWindow();
    }
});
app.on('window-all-closed', async () => {
    if (!isCmdMode) {
        saveConfig();
    }
    if (process.platform !== 'darwin') app.quit();
});

(async () => {
    if (isCmdMode) {
        await main();
        if (process.platform !== 'darwin') app.quit();
    }
})();
