"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class Files {
    static readFile(path) {
        try {
            const data = fs_1.default.readFileSync(path, 'utf-8');
            return data;
        }
        catch (err) {
            throw new Error(err);
        }
    }
    static writeFile(path, data) {
        const dataToSave = JSON.stringify(data);
        try {
            fs_1.default.writeFileSync(path, dataToSave);
        }
        catch (err) {
            throw new Error(err);
        }
    }
}
exports.default = Files;
