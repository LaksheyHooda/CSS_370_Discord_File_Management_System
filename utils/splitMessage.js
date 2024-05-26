export function splitMessage(message, maxLength = 2000) {
    const parts = [];
    while (message.length > maxLength) {
        let part = message.substring(0, maxLength);
        const lastNewline = part.lastIndexOf('\n');
        if (lastNewline > -1) {
            part = part.substring(0, lastNewline + 1);
        }
        parts.push(part);
        message = message.substring(part.length);
    }
    parts.push(message);
    return parts;
}
