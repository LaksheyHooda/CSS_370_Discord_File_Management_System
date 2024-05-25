import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
    fileName: String,
    uploadDate: Date,
    tags: [String],
    uploader: String,
    permissions: [String],
    type: { type: String, enum: ['file', 'folder'], default: 'file' },
    path: { type: String, default: '' } // The path where the file/folder is located
});

const File = mongoose.model('File', fileSchema);
export default File;
r