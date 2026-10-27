"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebTransaction = void 0;
const webTransaction_service_1 = __importDefault(require("../../services/transacation/webTransaction.service"));
const createWebTransaction = async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.userId;
        (console.log(text), userId);
        // Validate transaction text
        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Transaction text is required",
            });
        }
        // Validate user
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }
        // Optional attachment
        const file = req.file;
        const transaction = await webTransaction_service_1.default.createTransaction({
            userId,
            text: text.trim(),
            file,
        });
        console.log(transaction);
        return res.status(201).json({
            success: true,
            message: "Transaction created successfully",
            data: transaction,
        });
    }
    catch (error) {
        console.error("Create transaction error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create transaction",
        });
    }
};
exports.createWebTransaction = createWebTransaction;
