import { searchForFileInServer } from './searchForFileInServer.js';

class Node {
    constructor(name) {
        this.type = 'folder';
        this.name = name;
        this.files = [];
        this.children = [];
    }
}

class FileObject {
    constructor(name, link, permission = [0], owner) {
        this.type = 'file';
        this.name = name;
        this.link = link;
        this.permissions = [];
        this.owner = '';
    }
}

export default class FileManagementSystem {
    constructor() {
        this.root = new Node('');
    }

// DISPLAYING METHODS
//=====================================================================================
    displayFileSystem(node = this.root, indent = 0, permissions = [0], single = false) {
        let result = '';
        result += '|' + '-'.repeat(indent) + node.name + '\n';

        if (single) {
            for (const child of node.children) {
                result += '|' + '-'.repeat(indent) + child.name + '\n';
            }
            for (const file of node.files) {
                if (file.permissions.some(permission => permissions.includes(permission))) {
                    result += '|' + '-'.repeat(indent + 1) + `[${file.name}](${file.link})` + '\n';
                }
            }
            return result;
        }

        for (const child of node.children) {
            result += this.displayFileSystem(child, indent + 2, permissions);
        }

        for (const file of node.files) {
            if (file.permissions.some(permission => permissions.includes(permission))) {
                result += '|' + '-'.repeat(indent + 1) + `[${file.name}](${file.link})` + '\n';
            }
        }

        return result;
    }

    displayDirectory(node = this.root, path = '', indent = 0, permissions = [0], full = false) {
        let result = '';
        let current = node;

        if (path !== '') {
            const folders = path.split('/');
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
                    return `The path "${path}" does not exist.`;
                }
            }
        }

        result += '|' + '-'.repeat(indent) + current.name + '\n';

        if (full) {
            for (const child of current.children) {
                result += this.displayFileSystem(child, indent + 2, permissions, false);
            }
        } else {
            for (const child of current.children) {
                result += '|' + '-'.repeat(indent + 1) + child.name + '\n';
            }
            for (const file of current.files) {
                if (file.permissions.some(permission => permissions.includes(permission))) {
                    result += '|' + '-'.repeat(indent + 1) + `[${file.name}](${file.link})` + '\n';
                }
            }
        }

        return result;
    }
//=====================================================================================
//


// CREATING METHODS
//=====================================================================================
    createDirectory(path = '', dirName) {
        const paths = path ? path.split('/').filter(Boolean) : [];
        let current = this.root;
    
        // Traverse the given path
        for (const p of paths) {
            let found = false;
            for (const child of current.children) {
                if (child.name === p && child.type === 'folder') {
                    current = child;
                    found = true;
                    break;
                }
            }
            if (!found) {
                throw new Error(`Path "${path}" does not exist.`);
            }
        }
    
        // Check if the directory already exists in the current path
        for (const child of current.children) {
            if (child.name === dirName && child.type === 'folder') {
                throw new Error(`Directory "${dirName}" already exists in path "${path}".`);
            }
        }
    
        // Create the new directory
        const newDirectory = new Node(dirName);
        current.children.push(newDirectory);
    }
    
    insertFiles(path = '', files) {
        const paths = path.split('/').filter(Boolean);
        let current = this.root;

        for (const p of paths) {
            if (!current[p]) {
                current[p] = { type: 'folder', children: {} };
            }
            current = current[p].children;
        }

        files.forEach(file => {
            current[file.name] = { type: 'file', url: file.url };
        });
    }
//=====================================================================================



// UPDATING METHODS
//=====================================================================================
    moveDirectory(oldPath, newPath) {
        const node = this.getDirectoryNode(oldPath);
        if (!node) {
            throw new Error(`Directory "${oldPath}" does not exist.`);
        }
        if (node.type !== 'folder') {
            throw new Error(`Path "${oldPath}" is not a directory.`);
        }

        const parentPath = oldPath.split('/').slice(0, -1).join('/');
        const parent = this.getDirectoryNode(parentPath) || this.root;
        parent.children = parent.children.filter(child => child !== node);

        const newParent = this.getDirectoryNode(newPath) || this.root;
        newParent.children.push(node);
    }
    
    moveFile(oldPath = '', newPath = '', fileName = '', permissions = [0]) {
        if (!fileName) {
            console.log('Please provide a valid file.');
            return;
        }

        const folders = oldPath.split('/');
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
            console.log('File does not exist or you are not permitted to move it.');
            return;
        }

        const newFolders = newPath.split('/');
        let newCurrent = this.root;

        for (let i = 0; i < newFolders.length; i++) {
            let found = false;
            for (const child of newCurrent.children) {
                if (child.name === newFolders[i]) {
                    newCurrent = child;
                    found = true;
                    break;
                }
            }

            if (!found) {
                console.log('Folder does not exist.');
                return;
            }
        }

        const file = current.files.find(file => file.name === fileName);
        newCurrent.files.push(file);
        current.files = current.files.filter(file => file.name !== fileName);
    }
    
    renameDirectory(path, newName) {
        const node = this.getDirectoryNode(path);
        if (!node) {
            throw new Error(`Directory "${path}" does not exist.`);
        }
        if (node.type !== 'folder') {
            throw new Error(`Path "${path}" is not a directory.`);
        }
        node.name = newName;
    }

    replaceFile(path = '', oldFileName = '', newFileName = '', newFileLink = '', permissions = [0]) {
        if (this.deleteFile(path, oldFileName, permissions) === false) {
            console.log('File or path does not exist.');
            return;
        }

        this.createFile(path, newFileName, newFileLink, permissions);
    }
//=====================================================================================



// DELETING METHODS
//=====================================================================================
    async deleteDirectory(path, guild) {
        if (path === '') {
            throw new Error('Cannot delete the root directory.');
        }

        const folderToDelete = this.getDirectoryNode(path);
        if (!folderToDelete) {
            throw new Error(`Folder "${path}" does not exist.`);
        }

        await this._deleteDirectoryRecursively(folderToDelete, path, guild);

        const parentPath = path.split('/').slice(0, -1).join('/');
        const parent = this.getDirectoryNode(parentPath) || this.root;
        parent.children = parent.children.filter(child => child !== folderToDelete);
    }

    async _deleteDirectoryRecursively(folder, path, guild) {
        for (const child of folder.children) {
            if (child.type === 'file') {
                await this.deleteFileAsAdmin(path, child.name, guild);
            } else if (child.type === 'folder') {
                await this._deleteDirectoryRecursively(child, `${path}/${child.name}`, guild);
            }
        }
        folder.children = [];
    }
    
    async deleteFileAsAdmin(path, fileName, guild) {
        if (!fileName) {
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

        const fileExists = current.files.some(file => file.name === fileName);

        if (!fileExists) {
            console.log('File does not exist.');
            return false;
        }

        const messageToDelete = await searchForFileInServer(guild, fileName);
        if (messageToDelete) {
            await messageToDelete.delete();
        }

        current.files = current.files.filter(file => file.name !== fileName);
    }

    async deleteFile(path, fileName, owner, guild) {
        if (!fileName) {
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
        for (const file of current.files) {
            if (file.name === fileName && file.owner === owner) {
                fileExists = true;
                break;
            }
        }

        if (!fileExists) {
            console.log('File does not exist or you are not permitted to delete it.');
            return false;
        }

        const messageToDelete = await searchForFileInServer(guild, fileName);
        if (messageToDelete) {
            await messageToDelete.delete();
        }

        current.files = current.files.filter(file => file.name !== fileName);
    }

    deleteFileByUrl(fileUrl) {
        const queue = [this.root];

        while (queue.length > 0) {
            const current = queue.shift();

            for (const file of current.files) {
                if (file.link === fileUrl) {
                    current.files = current.files.filter(f => f.link !== fileUrl);
                    return;
                }
            }

            for (const child of current.children) {
                queue.push(child);
            }
        }
    }
//=====================================================================================



// SEARCH METHODS
//=====================================================================================
    getDirectory(dirName = '') {
        const queue = [this.root];
        let result = '';

        while (queue.length > 0) {
            const current = queue.shift();

            if (current.name === dirName) {
                result = this.getPath(current, '');
                break;
            }

            for (const child of current.children) {
                queue.push(child);
            }
        }

        return result;
    }

    getDirectoryNode(dirName = '') {
        const queue = [this.root];

        while (queue.length > 0) {
            const current = queue.shift();

            if (current.name === dirName) {
                return current;
            }

            for (const child of current.children) {
                queue.push(child);
            }
        }

        return null;
    }

    getPath(node, fileName) {
        let current = node;
        let path = '';
        while (current.name !== 'root') {
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
//=====================================================================================



// CHECKING METHODS
//=====================================================================================
    isOwner(path, fileName, owner) {
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
                return false;
            }
        }

        for (const file of current.files) {
            if (file.name === fileName && file.owner === owner) {
                return true;
            }
        }

        return false;
    }
    
    ValidatePath(path) {
        if (path === '') return true; // Consider the root valid when path is empty
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
                return false;
            }
        }
        return true;
    }
//=====================================================================================

}