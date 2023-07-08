import { BrowserWindow, ipcMain } from 'electron';
import { main } from './main';
import { config } from '../config/base-config';

class ProcessMessage {
    private win: BrowserWindow;

    /**
     * 进程通信
     * @param {*} win 创建的窗口
     */
    constructor(win: BrowserWindow) {
        this.win = win;
    }

    init() {
        this.watch();
        this.on();
    }

    // 监听渲染进程事件通信
    watch() {
        // 页面准备好了
        ipcMain.on('page-ready', () => {
            this.sendFocus();
        });
        ipcMain.on('sync-zerotier', async (event, host, token, networkId, memberId) => {
            config.host = host;
            config.zerotier.token = token;
            config.zerotier.networkId = networkId;
            config.zerotier.memberId = memberId;
            await main(this.win.webContents);
        });
        ipcMain.on('sync-zerotier-cmd', async () => {
            await main(this.win.webContents);
        });
    }

    // 监听窗口、app、等模块的事件
    on() {
        // 监听窗口是否聚焦
        this.win.on('focus', () => {
            this.sendFocus(true);
        });
        this.win.on('blur', () => {
            this.sendFocus(false);
        });
    }

    /**
     * 窗口聚焦事件发送
     * @param {*} isActive 是否聚焦
     */
    sendFocus(isActive = false) {
        // 主线程发送事件给窗口
        this.win.webContents.send('win-focus', isActive);
    }
}

export { ProcessMessage };
