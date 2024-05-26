import fileManagementSystem from './FileManagementSystem.js';

const main = () => {
    const fms = new fileManagementSystem();
    fms.createFolder('lol');
    console.log(fms.displayFileSystem());
    fms.createFolder('lol/bruh');
    fms.createFolder('lol/haha');
    fms.createFolder('lol/haha/something1');
    fms.createFolder('lol/haha/something2');
    console.log(fms.displayFileSystem());
    fms.createFile('lol/haha', 'Fatty.js', 'lol', [1, 2, 3]);
    fms.createFile('lol/haha', 'bruh.js');
    fms.createFile('lol/haha/something2', 'double.js');
    console.log(fms.displayFileSystem());
    fms.deleteFile('lol/haha', 'Fatty.js');
    console.log(fms.displayFileSystem());
    // fms.replaceFile('lol/haha', 'bruh.js', 'newFile.js');
    console.log(fms.displayFileSystem(fms.root, 0, [0, 1]));
    console.log(fms.searchFile('bruh.js'));
    console.log(fms.getDirectory('bruh'));
    let newNode = fms.getDirectoryNode('haha');
    console.log(fms.displayFileSystem(newNode, 0, [0, 1], true));
    console.log(fms.displayFileSystem(newNode, 0, [0, 1]));
    console.log(fms.displayFileSystem(fms.root, 0, [0, 1]));
    fms.moveFile('lol/haha', 'lol/bruh', 'bruh.js');
    console.log(fms.displayFileSystem());
}

main();