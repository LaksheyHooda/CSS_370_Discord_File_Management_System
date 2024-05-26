export const data = {
    name: 'filehelp',
    description: 'Lists all the commands and provides context for understanding how they work and example input values for valid command usage.',
};

export async function execute(interaction) {
    const helpMessage = `
**File Management Commands:**

======== SERVER USER COMMANDS: ========

1. **Display Server Files**:
    - **Command**: \`/displayFiles\`
    - **Description**: List all files in the server
    - **Fields**:
        - **path**: The path to list files from {Optional} {Default is root} [Example: "myfolder/subfolder"]
    - **Permissions Required**: None

2. **Display Directory Files**:
    - **Command**: \`/displayDirectory\`
    - **Description**: List all files in the directory at a specified path
    - **Fields**:
        - **path**: The path to list files from {Optional} {Default is root} [Example: "myfolder/subfolder"]
    - **Permissions Required**: None

3. **Upload Files**:
    - **Command**: \`/uploadfiles\`
    - **Description**: Upload one or more files to a specific directory
    - **Fields**:
        - **file**: The files to attach {Required} [Example: "example1.txt, example2.txt"]
        - **path**: The path where the files should be uploaded {Optional} [Example: "myfolder/subfolder"]
    - **Permissions Required**: None

4. **Remove File**:
    - **Command**: \`/removefile\`
    - **Description**: Delete an existing file
    - **Fields**:
        - **path**: The path to the file to delete {Required} [Example: "myfolder/subfolder"]
        - **filename**: The name of the file to delete {Required} [Example: "myfile.txt"]
    - **Permissions Required**: Owner of the file

7. **Replace File**:
    - **Command**: \`/replacefile\`
    - **Description**: Replace an existing file with a new file
    - **Fields**:
        - **path**: The path to the file to be replaced {Required} [Example: "myfolder/subfolder"]
        - **filename**: The name of the file to replace {Required} [Example: "myfile.txt"]
        - **file**: The new file to replace the old one {Required} [Example: "newfile.txt"]
    - **Permissions Required**: Owner of the file

8. **Duplicate File**:
    - **Command**: \`/duplicatefile\`
    - **Description**: Create a duplicate of an existing file
    - **Fields**:
        - **path**: The path to the file to duplicate {Required} [Example: "myfolder/subfolder"]
        - **filename**: The name of the file to duplicate {Required} [Example: "myfile.txt"]
        - **newpath**: The path for the duplicated file {Optional} [Example: "myfolder/newsubfolder"]
    - **Permissions Required**: None (new file will have the user as owner)

10. **Move File**:
    - **Command**: \`/movefile\`
    - **Description**: Move an existing file to a new location
    - **Fields**:
        - **oldpath**: The current path to the file {Required} [Example: "myfolder/subfolder"]
        - **filename**: The name of the file to move {Required} [Example: "myfile.txt"]
        - **newpath**: The new path for the file {Required} [Example: "newfolder/subfolder"]
    - **Permissions Required**: Owner of the file

======== ADMIN COMMANDS: ========

3. **Remove Directory**:
    - **Command**: \`/removedirectory\`
    - **Description**: Delete an existing folder and all its contents
    - **Fields**:
        - **path**: The path to the folder to delete {Required} [Example: "myfolder/subfolder"]
    - **Permissions Required**: Admin or Moderator

4. **Update Directory**:
    - **Command**: \`/updatedirectory\`
    - **Description**: Update the name of an existing directory
    - **Fields**:
        - **path**: The path to the directory to update {Required} [Example: "myfolder/subfolder"]
        - **newname**: The new name for the directory {Required} [Example: "newname"]
    - **Permissions Required**: Admin or Moderator

5. **Move Directory**:
    - **Command**: \`/movedirectory\`
    - **Description**: Move an existing directory to a new location
    - **Fields**:
        - **oldpath**: The current path to the directory {Required} [Example: "myfolder/subfolder"]
        - **newpath**: The new path for the directory {Required} [Example: "newfolder/subfolder"]
    - **Permissions Required**: Admin or Moderator



11. **Help**:
    - **Command**: \`/filehelp\`
    - **Description**: Lists all the commands and provides context for understanding how they work and example input values for valid command usage.
`;

    await interaction.reply({ content: helpMessage, ephemeral: true });
}