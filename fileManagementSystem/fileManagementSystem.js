import fs from 'fs';

/**
 * A class representing a file system node.
 * Name: Name of the folder (starts with root)
 * Files: List of files in the folder - a bunch of links to the files
 * Children: List of children folders - other nodes
 */
class Node {
    constructor(name) {
        this.name = name;
        this.files = [];
        this.children = [];
    }
}

class FileObject {
    constructor(name, link) {
        this.name = name;
        this.link = link;
        this.permissions = [];
    }
}

export default class FileManagementSystem {
    constructor() {
        this.root = new Node('');
    }

    /**
     * Create a folder in the file system. 
     * If the folder already exists, do nothing. Default path is root.
     * @param {string} path - The path to the folder to be created.
     */
    createFolder(path = '') {
        const folders = path.split('/');
        let current = this.root;

        for (let i = 0; i < folders.length; i++) {
            let found = false;
            for (const child of current.children) {
                if (child.name === folders[i]) {
                    current = child;
                    found = true;
                    break;
                }
            }

            if (!found) {
                const newFolder = new Node(folders[i]);
                current.children.push(newFolder);
                current = newFolder;
            }
        }
    }

    /**
     * Create a file in the file system. 
     * If the file already exists, do nothing. Default path is root.
     * @param {string} path - The path to the file to be created.
     */
    createFile(path = '', fileName = '', fileLink = '', permissions = [0]) {
        if (fileName === '') {
            console.log('Please provide a valid file.');
            return;
        }

        const folders = path.split('/');
        let current = this.root;

        for (let i = 0; i < folders.length; i++) {
            let found = false;
            for (const child of current.children) {
                if (child.name === folders[i]) {
                    current = child;
                    found = true;
                    break;
                }
            }

            if (!found) {
                console.log('Folder does not exist.');
                return;
            }
        }

        if (!current.files.includes(fileLink)) {
            const file = new FileObject(fileName, fileLink);
            file.permissions = permissions;
            current.files.push(file);
        }
    }

    /**
     * Delete a folder in the file system. 
     * If the folder does not exist, do nothing. Default path is root.
     * deletes all files in that folder.
     * @param {string} path - The path to the folder to be deleted.
     */
    deleteFolder(path = '') {
        const folders = path.split('/');
        let current = this.root;

        for (let i = 0; i < folders.length; i++) {
            let found = false;
            for (const child of current.children) {
                if (child.name === folders[i]) {
                    current = child;
                    found = true;
                    break;
                }
            }

            if (!found) {
                return;
            }
        }

        current.files = [];
    }

    /** 
     * Delete a file in the file system.
     * If the file does not exist or path does not exist
     * print to consonle saying file does not exist. Default path is root.
     * @param {string} path - The path to the file to be deleted.
     * @param {string} fileName - The file to be deleted.
     */
    deleteFile(path = '', fileName = '', permissions = [0]) {
        if (fileName === '') {
            console.log('Please provide a valid file.');
            return false;
        }

        const folders = path.split('/');
        let current = this.root;

        for (let i = 0; i < folders.length; i++) {
            let found = false;
            for (const child of current.children) {
                if (child.name === folders[i]) {
                    current = child;
                    found = true;
                    break;
                }
            }

            if (!found) {
                console.log('Folder does not exist.');
                return false;
            }
        }

        let fileExists = false;
        let permitted = false;
        for (const file of current.files) {
            if (file.name === fileName) {
                fileExists = true;
                if (file.permissions.some(permission => permissions.includes(permission))) {
                    permitted = true;
                }
                break;
            }
        }
        if (!fileExists || !permitted) {
            console.log('File does not exist or you are not permitted to delete it.');
            return false;
        }

        current.files = current.files.filter(file => file.name !== fileName);
    }

    /**
     * replace an existing file with a new file. Default path is root.
     * @param {string} path - The path to the file to be replaced.
     * @param {string} oldFile - The file to be replaced.
     */
    replaceFile(path = '', oldFileName = '', newFileName = '', newFileLink = '', permissions = [0]) {

        if (this.deleteFile(path, oldFile) === false) {
            console.log('File or path does not exist.');
            return;
        }

        this.createFile(path, newFileName, newFileLink, permissions);
    }

    /**
     * Search for a file in the entire file system.
     * @param {string} file - The file to search for.
     * @returns {string} - The entire path of the file from the root.
     */
    searchFile(file = '') {
        const queue = [this.root];
        let result = '';

        while (queue.length > 0) {
            const current = queue.shift();

            for (const fileObject of current.files) {
                if (fileObject.name === file) {
                    result = this.getPath(current, fileObject.name);
                    break;
                }
            }

            for (const child of current.children) {
                queue.push(child);
            }
        }

        return result;
    }

    getPath(node, fileName) {
        let current = node;
        let path = '';
        while (current.name !== '') {
            path = '/' + current.name + path;
            current = this.getParent(current);
        }

        return path + '/' + fileName;
    }

    getParent(node) {
        const queue = [this.root];

        while (queue.length > 0) {
            const current = queue.shift();

            for (const child of current.children) {
                if (child === node) {
                    return current;
                }

                queue.push(child);
            }
        }

        return null;
    }


    /**
      * Display the file system in ascii format.
      * Displays all folder and files currently in the file system.
      * @param {Node} node - The node to start the display from.
    */
    displayFileSystem(node = this.root, indent = 0, permissions = [0]) {
        let result = '';
        result += '|' + '-'.repeat(indent) + node.name + '\n';

        for (const child of node.children) {
            result += this.displayFileSystem(child, indent + 2, permissions);
        }

        for (const file of node.files) {
            if (file.permissions.some(permission => permissions.includes(permission))) {
                result += '|' + '-'.repeat(indent + 1) + file.name + '\n';
            }
        }

        return result;
    }
}