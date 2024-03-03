const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const folderPath = 'D:/Temp/TCG/Download'; // đường dẫn đến folder chứa các file .rar cần giải nén nhanh
const unrarCommand = 'unrar';

const passwordList = ['password1', 'password2'];

fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error('Error reading folder:', err);
        return;
    }

    const rarFiles = files.filter(file => path.extname(file).toLowerCase() === '.rar');

    rarFiles.forEach(rarFile => {
        const filePath = path.join(folderPath, rarFile);
        const extractPath = folderPath;

        const unrarCommands = passwordList.map(password => `${unrarCommand} x -p"${password}" "${filePath}" "${extractPath}"`);

        unrarCommands.forEach(command => {
            const child = exec(command);
        
            child.stdout.on('data', (data) => {
                console.log(data);
            });
        
            child.stderr.on('data', (data) => {
                console.error(data);
            });
        
            child.on('exit', (code) => {
                if (code === 0) {
                    console.log(`Phá mật khẩu thành công`);
                } else {
                    console.log(`Phá mật khẩu không thành công`);
                }
            });
        });

        let previousProgress = 0;
        const progressInterval = setInterval(() => {
            const progressFilePath = path.join(extractPath, rarFile);
            fs.stat(progressFilePath, (err, stats) => {
                if (err) {
                    console.error(`Error getting file stats for ${rarFile}: ${err}`);
                    clearInterval(progressInterval);
                    return;
                }

                const progressPercent = Math.round((stats.size / fs.statSync(filePath).size) * 100);
                if (progressPercent > previousProgress && progressPercent <= 100) {
                    console.log(`[${rarFile}] => Tiến độ: ${progressPercent}%`);
                    previousProgress = progressPercent;
                }

                if (progressPercent >= 100) {
                    clearInterval(progressInterval);
                }
            });
        }, 1000);
    });
});
