import accountRepository from "../../repositories/account/account.repository";

import accountTemplateRepository from "../../repositories/account/accountTemplate.repository";

import { AccountType } from "../../models/account.model";

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
    category?: string,
    subCategory?: string,
  ) {
    const normalizedName = accountName.trim();

    if (!normalizedName) {
      throw new Error("Account name is required");
    }

    // ==========================================
    // 1. FIND GLOBAL TEMPLATE
    // ==========================================

    let template = await accountTemplateRepository.findByName(normalizedName);

    // -----------------------------------------
    // 2. Template MUST exist
    // -----------------------------------------

    if (!template) {
      // AI must provide account type
      if (!accountType) {
        throw new Error(
          `Account template "${normalizedName}" not found and account type was not provided`,
        );
      }

      if (!category || !subCategory) {
        throw new Error(
          `Account classification required to create template: ${normalizedName}`,
        );
      }

      const code =
        await accountTemplateRepository.generateNextCode(accountType);
      // -----------------------------------------
      // 3. CREATE GLOBAL TEMPLATE
      // -----------------------------------------

      template = await accountTemplateRepository.create({
        code,
        name: normalizedName,
        type: accountType,
        category,
        subCategory,
        normalBalance:
          accountType === "asset" || accountType === "expense"
            ? "debit"
            : "credit",
        description: null,
        isSystem: true,
        isActive: true,
      });
    }

    // ==========================================
    // 4. TEMPLATE IS SOURCE OF TRUTH
    // ==========================================

    const resolvedAccountType = template.type;

    // -----------------------------------------
    // 5. Check user's existing account
    // -----------------------------------------
    let account = await accountRepository.findByTemplate(
      userId,
      template._id.toString(),
    );

    if (account) {
      return account;
    }

    // -----------------------------------------
    // 6. Create user's account
    // -----------------------------------------

    account = await accountRepository.create({
      userId,

      templateId: template._id.toString(),

      name: template.name,
      code: template.code,
      type: resolvedAccountType,

      category: template.category,
      subCategory: template.subCategory,
      normalBalance: template.normalBalance,

      description: template.description,

      isSystem: true,
    });

    return account;
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

      category: null,

      subCategory: null,

      normalBalance:
        data.type === "asset" || data.type === "expense" ? "debit" : "credit",

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
}

export default new AccountService();
