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
  async generateNextCode(
    type: "asset" | "liability" | "equity" | "income" | "expense",
  ): Promise<string> {
    const templates = await AccountTemplate.find({
      type,
      isActive: true,
    })
      .sort({ code: -1 })
      .limit(1)
      .lean();

    if (!templates.length) {
      switch (type) {
        case "asset":
          return "1000";

        case "liability":
          return "2000";

        case "equity":
          return "3000";

        case "income":
          return "4000";

        case "expense":
          return "6000";
      }
    }

    const lastCode = Number(templates[0].code);

    if (Number.isNaN(lastCode)) {
      throw new Error(`Invalid account template code: ${templates[0].code}`);
    }

    return String(lastCode + 10);
  }

  /**
   * Escape special regex characters.
   */
  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

export default new AccountTemplateRepository();
