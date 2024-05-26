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
        this.owner = '';
    }
}

export default class FileManagementSystem {
    constructor() {
        this.root = new Node('root');
    }

    validatePath(path) {
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

    createFile(path = '', fileName = '', fileLink = '', permissions = [0]) {
        if (!fileName) {
            console.log('Please provide a valid file.');
            return;
        }

        if (path === '') {
            const file = new FileObject(fileName, fileLink);
            file.permissions = permissions;
            this.root.files.push(file);
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

        const file = new FileObject(fileName, fileLink);
        file.permissions = permissions;
        current.files.push(file);
    }

    deleteFolder(path = '', permissions = [0]) {
        const folders = path.split('/');
        let current = this.root;
        let parent = null;
        let folderName = '';

        for (let i = 0; i < folders.length; i++) {
            let found = false;
            for (const child of current.children) {
                if (child.name === folders[i]) {
                    parent = current;
                    current = child;
                    folderName = child.name;
                    found = true;
                    break;
                }
            }

            if (!found) {
                console.log('Folder does not exist.');
                return;
            }
        }

        if (permissions.includes(1)) {
            parent.children = parent.children.filter(child => child.name !== folderName);
        } else {
            console.log('You do not have permission to delete this folder.');
        }
    }

    deleteFile(path = '', fileName = '', permissions = [0]) {
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
        let permitted = false;
        for (const file of current.files) {
            if (file.name === fileName) {
                fileExists = true;
                if (file.permissions.some(permission => permissions.includes(permission))) {
                    if (file.owner === requester || permissions.includes(1)) {
                        permitted = true;
                    }
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

    replaceFile(path = '', oldFileName = '', newFileName = '', newFileLink = '', permissions = [0]) {
        if (this.deleteFile(path, oldFileName, permissions) === false) {
            console.log('File or path does not exist.');
            return;
        }

        this.createFile(path, newFileName, newFileLink, permissions);
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
}
