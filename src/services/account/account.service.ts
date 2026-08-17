import accountRepository from "../../repositories/account/account.repository";

import accountTemplateRepository from "../../repositories/account/accountTemplate.repository";

import { AccountType } from "../../models/account.model";

import { AccountTemplateType } from "../../models/accountTemplate.model";

class AccountService {
  /**
   * Get or create a user-specific account
   * based on a GLOBAL account template.
   *
   * Flow:
   *
   * Account name
   *      ↓
   * Global AccountTemplate
   *      ↓
   * User Account
   */
  async getOrCreateAccount(
    userId: string,
    accountName: string,
    accountType?: AccountType,
  ) {
    const normalizedName = accountName.trim();

    if (!normalizedName) {
      throw new Error("Account name is required");
    }

    // -----------------------------------------
    // 1. Find GLOBAL account template
    // -----------------------------------------

    const template = await accountTemplateRepository.findByName(normalizedName);

    console.log("Account name:", normalizedName);
    console.log("Account template:", template);

    // -----------------------------------------
    // 2. Template MUST exist
    // -----------------------------------------

    if (!template) {
      throw new Error(`Account template "${normalizedName}" not found`);
    }

    // -----------------------------------------
    // 3. Template is the source of truth
    // -----------------------------------------

    const resolvedAccountType = template.type;

    console.log("Resolved account type:", resolvedAccountType);

    // -----------------------------------------
    // 4. Check user's existing account
    // -----------------------------------------

    let account = await accountRepository.findByName(userId, template.name);

    if (account) {
      return account;
    }
    // -----------------------------------------
    // 5. Create user's account
    // -----------------------------------------

    account = await accountRepository.create({
      userId,

      templateId: template._id.toString(),

      name: template.name,
      code: template.code,
      type: resolvedAccountType,
      description: template.description,

      isSystem: true,
    });

    return account;
  }
  /**
   * Used during transaction processing when
   * Gemini discovers an account that doesn't
   * exist in the global templates.
   *
   * It creates the GLOBAL template first,
   * then creates the user's account.
   */

  private getTemplateMetadata(type: AccountType) {
    switch (type) {
      case "asset":
        return {
          category: "Asset",
          subCategory: "Current Asset",
          normalBalance: "debit",
        };

      case "liability":
        return {
          category: "Liability",
          subCategory: "Current Liability",
          normalBalance: "credit",
        };

      case "equity":
        return {
          category: "Equity",
          subCategory: "Owner's Equity",
          normalBalance: "credit",
        };

      case "income":
        return {
          category: "Income",
          subCategory: "Operating Income",
          normalBalance: "credit",
        };

      case "expense":
        return {
          category: "Expense",
          subCategory: "Operating Expense",
          normalBalance: "debit",
        };

      default:
        throw new Error(`Unsupported account type: ${type}`);
    }
  }

  async getOrCreateFromTemplate(userId: string, templateName: string) {
    return await this.getOrCreateAccount(userId, templateName);
  }

  /**
   * Create a custom user account manually.
   *
   * This account is NOT linked to a template.
   */
  async createAccount(
    userId: string,
    data: {
      name: string;
      type: AccountType;
      description?: string | null;
    },
  ) {
    const existing = await accountRepository.findByName(userId, data.name);

    if (existing) {
      return existing;
    }

    const maxCode = await accountRepository.findMaxCodeByType(
      userId,
      data.type,
    );

    const nextCode = String(maxCode + 10);

    return await accountRepository.create({
      userId,

      templateId: null,

      name: data.name,

      code: nextCode,

      type: data.type,

      description: data.description ?? null,

      isSystem: false,
    });
  }

  async findByName(userId: string, name: string) {
    return await accountRepository.findByName(userId, name);
  }

  async getAccounts(userId: string) {
    return await accountRepository.findAllByUser(userId);
  }

  async getAccount(userId: string, accountId: string) {
    return await accountRepository.findById(userId, accountId);
  }

  async updateAccount(
    userId: string,
    accountId: string,
    data: {
      name?: string;
      description?: string | null;
      isActive?: boolean;
    },
  ) {
    return await accountRepository.update(userId, accountId, data);
  }

  async deleteAccount(userId: string, accountId: string) {
    const account = await accountRepository.findById(userId, accountId);

    if (!account) {
      throw new Error("Account not found");
    }

    if (account.isSystem) {
      throw new Error("System accounts cannot be deleted");
    }

    return await accountRepository.delete(userId, accountId);
  }

  /**
   * Generate information required to create
   * a new GLOBAL account template.
   */
  private buildTemplateData(name: string, type: AccountType) {
    const baseCode = this.getTemplateBaseCode(type);

    const normalBalance = this.getNormalBalance(type);

    return {
      name,

      code: `${baseCode}${Date.now().toString().slice(-3)}`,

      type: type as AccountTemplateType,

      description: `${name} account`,

      category: type,

      subCategory: this.getSubCategory(type),

      normalBalance,

      isActive: true,
    };
  }

  private getTemplateBaseCode(type: AccountType): number {
    switch (type) {
      case "asset":
        return 1000;

      case "liability":
        return 2000;

      case "equity":
        return 3000;

      case "income":
        return 4000;

      case "expense":
        return 6000;

      default:
        return 9000;
    }
  }

  private getNormalBalance(type: AccountType): "debit" | "credit" {
    switch (type) {
      case "asset":
      case "expense":
        return "debit";

      case "liability":
      case "equity":
      case "income":
        return "credit";
    }
  }

  private getSubCategory(type: AccountType): string {
    switch (type) {
      case "asset":
        return "Current Asset";

      case "liability":
        return "Current Liability";

      case "equity":
        return "Owner Equity";

      case "income":
        return "Operating Income";

      case "expense":
        return "Operating Expense";
    }
  }
}

export default new AccountService();
