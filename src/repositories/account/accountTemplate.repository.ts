import AccountTemplate, {
  IAccountTemplate,
  IAccountTemplateInput,
  AccountTemplateType,
} from "../../models/accountTemplate.model";

class AccountTemplateRepository {
  /**
   * Create one global account template.
   *
   * Templates are shared by all shopkeepers.
   */
  async create(data: IAccountTemplateInput): Promise<IAccountTemplate> {
    const template = await AccountTemplate.create({
      name: data.name.trim(),
      code: data.code,
      type: data.type,

      category: data.category,
      subCategory: data.subCategory,
      normalBalance: data.normalBalance,

      description: data.description ?? null,
      isActive: data.isActive ?? true,
    });

    return template.toObject();
  }

  /**
   * Create multiple global account templates.
   */
  async createMany(data: IAccountTemplateInput[]): Promise<IAccountTemplate[]> {
    const templates = await AccountTemplate.insertMany(data);

    return templates.map((template) => template.toObject());
  }

  /**
   * Find a global template by ID.
   */
  async findById(id: string): Promise<IAccountTemplate | null> {
    return await AccountTemplate.findById(id).lean<IAccountTemplate>();
  }

  /**
   * Find a global template by code.
   */
  async findByCode(code: string): Promise<IAccountTemplate | null> {
    return await AccountTemplate.findOne({
      code: code.trim(),
      isActive: true,
    }).lean<IAccountTemplate>();
  }

  /**
   * Find a global template by name.
   *
   * Case-insensitive exact match.
   */
  async findByName(name: string): Promise<IAccountTemplate | null> {
    const normalizedName = name.trim();

    const result = await AccountTemplate.findOne({
      name: {
        $regex: `^${this.escapeRegex(normalizedName)}$`,
        $options: "i",
      },
      isActive: true,
    }).lean<IAccountTemplate>();
    console.log("result", result);

    return result;
  }

  /**
   * Get all active global templates.
   */
  async findAll(): Promise<IAccountTemplate[]> {
    return await AccountTemplate.find({
      isActive: true,
    })
      .sort({ code: 1 })
      .lean<IAccountTemplate[]>();
  }

  /**
   * Get templates by account type.
   */
  async findByType(type: AccountTemplateType): Promise<IAccountTemplate[]> {
    return await AccountTemplate.find({
      type,
      isActive: true,
    })
      .sort({ code: 1 })
      .lean<IAccountTemplate[]>();
  }

  /**
   * Get templates by category.
   */
  async findByCategory(category: string): Promise<IAccountTemplate[]> {
    return await AccountTemplate.find({
      category: category.trim(),
      isActive: true,
    })
      .sort({ code: 1 })
      .lean<IAccountTemplate[]>();
  }

  /**
   * Update a global template.
   */
  async update(
    id: string,
    data: Partial<IAccountTemplateInput>,
  ): Promise<IAccountTemplate | null> {
    const updateData = {
      ...data,
      ...(data.name ? { name: data.name.trim() } : {}),
    };

    return await AccountTemplate.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean<IAccountTemplate>();
  }

  /**
   * Soft delete a template.
   *
   * We don't actually remove the template because
   * existing user accounts may reference it.
   */
  async delete(id: string): Promise<IAccountTemplate | null> {
    return await AccountTemplate.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean<IAccountTemplate>();
  }

  /**
   * Check whether a template code already exists.
   */
  async existsByCode(code: string): Promise<boolean> {
    const template = await AccountTemplate.exists({
      code: code.trim(),
      isActive: true,
    });

    return !!template;
  }

  /**
   * Check whether a template name already exists.
   */
  async existsByName(name: string): Promise<boolean> {
    const normalizedName = name.trim();

    const template = await AccountTemplate.exists({
      name: {
        $regex: `^${this.escapeRegex(normalizedName)}$`,
        $options: "i",
      },
      isActive: true,
    });

    return !!template;
  }

  /**
   * Generate the next global template code.
   */
  async generateNextCode(type: AccountTemplateType): Promise<string> {
    const prefixMap: Record<AccountTemplateType, string> = {
      asset: "AST",
      liability: "LIA",
      equity: "EQT",
      income: "INC",
      expense: "EXP",
    };

    const prefix = prefixMap[type];

    const templates = await AccountTemplate.find({
      type,
      isActive: true,
      code: {
        $regex: `^${prefix}-\\d+$`,
      },
    })
      .sort({ code: -1 })
      .limit(1)
      .lean();

    // No existing template for this type
    if (!templates.length) {
      return `${prefix}-001`;
    }

    const lastCode = templates[0].code;

    const match = lastCode.match(new RegExp(`^${prefix}-(\\d+)$`));

    if (!match) {
      throw new Error(`Invalid account template code: ${lastCode}`);
    }

    const nextNumber = Number(match[1]) + 1;

    return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
  }

  /**
   * Escape special regex characters.
   */
  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  async createFromAccountName(name: string, type: AccountTemplateType) {
    const normalizedName = name.trim();

    const existing = await this.findByName(normalizedName);

    if (existing) {
      return existing;
    }

    const code = await this.generateNextCode(type);

    const normalBalance: "debit" | "credit" =
      type === "asset" || type === "expense" ? "debit" : "credit";

    const category = this.getDefaultCategory(type);

    const subCategory = this.getDefaultSubCategory(type);

    return await this.create({
      code,
      name: normalizedName,
      type,
      category,
      subCategory,
      normalBalance,
      description: `${normalizedName} account`,
      isSystem: true,
      isActive: true,
    });
  }

  private getDefaultCategory(type: AccountTemplateType): string {
    switch (type) {
      case "asset":
        return "current_asset";

      case "liability":
        return "current_liability";

      case "equity":
        return "owner_equity";

      case "income":
        return "operating_income";

      case "expense":
        return "operating_expense";
    }
  }

  private getDefaultSubCategory(type: AccountTemplateType): string {
    switch (type) {
      case "asset":
        return "other_assets";

      case "liability":
        return "other_liabilities";

      case "equity":
        return "other_equity";

      case "income":
        return "other";

      case "expense":
        return "miscellaneous";
    }
  }
}

export default new AccountTemplateRepository();
