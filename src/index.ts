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

if (process.argv.includes('--k-cmd-mode')) {
    main();
} else {
    // app ready 创建窗口
    app.whenReady().then(() => {
        createWindow();
        app.on('activate', () => {
            // 在 macOS 系统内, 如果没有已开启的应用窗口
            // 点击托盘图标时通常会重新创建一个新窗口
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    });

    app.on('window-all-closed', async () => {
        saveConfig();
        if (process.platform !== 'darwin') app.quit();
    });
}
