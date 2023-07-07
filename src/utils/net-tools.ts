import { exec } from 'child_process';

function flushdns() {
    exec('cmd /c ipconfig /flushdns');
}

export default { flushdns };
