// import { Request, Response } from "express";
// import accountService from "../../services/account/account.service";

// /**
//  * GET /accounts
//  *
//  * Get all accounts belonging to the logged-in shopkeeper.
//  */
// export const getAccounts = async (
//   req: Request,
//   res: Response,
// ): Promise<Response> => {
//   try {
//     const { userId } = req.query;

//     if (!userId || typeof userId !== "string") {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required",
//       });
//     }

//     const accounts = await accountService.getAccounts(userId);

//     return res.status(200).json({
//       success: true,
//       message: "Accounts fetched successfully",
//       data: accounts,
//     });
//   } catch (error: any) {
//     console.error("Get accounts error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to fetch accounts",
//     });
//   }
// };

// /**
//  * GET /accounts/:id
//  *
//  * Get one account belonging to the shopkeeper.
//  */
// export const getAccount = async (
//   req: Request,
//   res: Response,
// ): Promise<Response> => {
//   try {
//     const { userId } = req.query;
//     const { id } = req.params;

//     if (!userId || typeof userId !== "string") {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required",
//       });
//     }

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Account ID is required",
//       });
//     }

//     const account = await accountService.getAccount(userId, id);

//     if (!account) {
//       return res.status(404).json({
//         success: false,
//         message: "Account not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Account fetched successfully",
//       data: account,
//     });
//   } catch (error: any) {
//     console.error("Get account error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to fetch account",
//     });
//   }
// };

// /**
//  * POST /accounts/from-template
//  *
//  * Create a shopkeeper's account from a shared AccountTemplate.
//  *
//  * Example:
//  * {
//  *   "userId": "...",
//  *   "templateId": "..."
//  * }
//  */
// export const createAccountFromTemplate = async (
//   req: Request,
//   res: Response,
// ): Promise<Response> => {
//   try {
//     const { userId, templateId } = req.body;

//     if (!userId || !templateId) {
//       return res.status(400).json({
//         success: false,
//         message: "userId and templateId are required",
//       });
//     }

//     const account = await accountService.createFromTemplate(
//       userId,
//       templateId,
//     );

//     return res.status(201).json({
//       success: true,
//       message: "Account created from template successfully",
//       data: account,
//     });
//   } catch (error: any) {
//     console.error("Create account from template error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to create account",
//     });
//   }
// };

// /**
//  * POST /accounts
//  *
//  * Create a completely custom account.
//  *
//  * This is useful when the shopkeeper needs an account
//  * that does not exist in the common templates.
//  *
//  * Example:
//  * {
//  *   "userId": "...",
//  *   "name": "Advertisement Expense",
//  *   "code": "6200",
//  *   "type": "expense",
//  *   "description": "Advertising and marketing expenses"
//  * }
//  */
// export const createAccount = async (
//   req: Request,
//   res: Response,
// ): Promise<Response> => {
//   try {
//     const {
//       userId,
//       name,
//       code,
//       type,
//       description,
//     } = req.body;

//     if (!userId || !name || !code || !type) {
//       return res.status(400).json({
//         success: false,
//         message: "userId, name, code and type are required",
//       });
//     }

//     const account = await accountService.createAccount(userId, {
//       name,
//       code,
//       type,
//       description,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Custom account created successfully",
//       data: account,
//     });
//   } catch (error: any) {
//     console.error("Create account error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to create account",
//     });
//   }
// };

// /**
//  * PUT /accounts/:id
//  *
//  * Update an existing user account.
//  */
// export const updateAccount = async (
//   req: Request,
//   res: Response,
// ): Promise<Response> => {
//   try {
//     const { userId } = req.body;
//     const { id } = req.params;

//     const {
//       name,
//       description,
//       isActive,
//     } = req.body;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required",
//       });
//     }

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Account ID is required",
//       });
//     }

//     const account = await accountService.updateAccount(
//       userId,
//       id,
//       {
//         name,
//         description,
//         isActive,
//       },
//     );

//     if (!account) {
//       return res.status(404).json({
//         success: false,
//         message: "Account not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Account updated successfully",
//       data: account,
//     });
//   } catch (error: any) {
//     console.error("Update account error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to update account",
//     });
//   }
// };

// /**
//  * DELETE /accounts/:id
//  *
//  * Delete a custom account.
//  *
//  * System accounts created from templates should not be deleted.
//  */
// export const deleteAccount = async (
//   req: Request,
//   res: Response,
// ): Promise<Response> => {
//   try {
//     const { userId } = req.body;
//     const { id } = req.params;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required",
//       });
//     }

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Account ID is required",
//       });
//     }

//     const account = await accountService.deleteAccount(
//       userId,
//       id,
//     );

//     if (!account) {
//       return res.status(404).json({
//         success: false,
//         message: "Account not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Account deleted successfully",
//       data: account,
//     });
//   } catch (error: any) {
//     console.error("Delete account error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to delete account",
//     });
//   }
// };
