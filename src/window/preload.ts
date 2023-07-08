import { ipcRenderer } from 'electron';
import { config } from '../config/base-config';

window.addEventListener('DOMContentLoaded', () => {
    const setInputValue = (selector: string, node?: string) => {
        const element: HTMLInputElement = document.getElementById(selector) as HTMLInputElement;
        if (element && node) {
            element.value = node;
        }
    };
    setInputValue('host', config.host);
    setInputValue('zerotier-token', config.zerotier.token);
    setInputValue('zerotier-networkId', config.zerotier.networkId);
    setInputValue('zerotier-memberId', config.zerotier.memberId);

    const inputRegExp = new RegExp(/[\da-zA-Z]{6,}/);
    const inputValue = (selector: string): string | undefined => {
        const element: HTMLInputElement = document.getElementById(selector) as HTMLInputElement;
        if (element) {
            element.readOnly = true;
            const value = element.value;
            element.readOnly = false;
            if (value != undefined && inputRegExp.test(value)) {
                return value;
            }
        }
        return undefined;
    };

    const button: HTMLButtonElement = document.getElementById('sync-zerotier') as HTMLButtonElement;
    if (button) {
        button.addEventListener('click', () => {
            const host = inputValue('host');
            const token = inputValue('zerotier-token');
            const networkId = inputValue('zerotier-networkId');
            const memberId = inputValue('zerotier-memberId');
            if (
                inputValue('host') == undefined ||
                inputValue('zerotier-token') == undefined ||
                inputValue('zerotier-networkId') == undefined ||
                inputValue('zerotier-memberId') == undefined
            ) {
                return;
            }
            const button: HTMLButtonElement = document.getElementById('sync-zerotier') as HTMLButtonElement;
            if (button) {
                button.disabled = true;
                button.value = '正在执行中...';
                ipcRenderer.send('sync-zerotier', host, token, networkId, memberId);
            }
        });
        ipcRenderer.on('sync-zerotier', () => {
            const button: HTMLButtonElement = document.getElementById('sync-zerotier') as HTMLButtonElement;
            if (button) {
                button.value = '执行检查并同步';
                button.disabled = false;
            }
        });
    }
});
