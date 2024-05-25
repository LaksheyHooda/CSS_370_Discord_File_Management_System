import fileManagementSystem from './fileManagementSystem/fileManagementSystem.js';

const main = () => {
    const fms = new fileManagementSystem();
    fms.createFolder('lol');
    console.log(fms.displayFileSystem());
    fms.createFolder('lol/bruh');
    fms.createFolder('lol/haha');
    console.log(fms.displayFileSystem());
    fms.createFile('lol/haha', 'Fatty.js', 'lol', [1, 2, 3]);
    fms.createFile('lol/haha', 'bruh.js');
    fms.createFile('lol/haha/ajhsdsaj', 'bruh.js');
    console.log(fms.displayFileSystem());
    fms.deleteFile('lol/haha', 'Fatty.js');
    console.log(fms.displayFileSystem());
    // fms.replaceFile('lol/haha', 'bruh.js', 'newFile.js');
    console.log(fms.displayFileSystem(fms.root, 0, [0, 1]));
    console.log(fms.searchFile('bruh.js'));

}

main();