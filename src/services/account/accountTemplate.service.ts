import accountTemplateRepository from "../../repositories/account/accountTemplate.repository";
import {
  IAccountTemplate,
  IAccountTemplateInput,
  AccountTemplateType,
} from "../../models/accountTemplate.model";

class AccountTemplateService {
  private readonly validTypes: AccountTemplateType[] = [
    "asset",
    "liability",
    "equity",
    "income",
    "expense",
  ];

  async createTemplate(data: IAccountTemplateInput): Promise<IAccountTemplate> {
    if (!data.name) {
      throw new Error("Template name is required");
    }

    if (!data.code) {
      throw new Error("Template code is required");
    }

    const existingCode = await accountTemplateRepository.existsByCode(
      data.code,
    );

    if (existingCode) {
      throw new Error(`Template with code ${data.code} already exists`);
    }

    const existingName = await accountTemplateRepository.existsByName(
      data.name,
    );

    if (existingName) {
      throw new Error(`Template with name "${data.name}" already exists`);
    }

    return await accountTemplateRepository.create(data);
  }

  async createTemplates(
    data: IAccountTemplateInput[],
  ): Promise<IAccountTemplate[]> {
    return await accountTemplateRepository.createMany(data);
  }

  async getTemplate(id: string): Promise<IAccountTemplate> {
    const template = await accountTemplateRepository.findById(id);

    if (!template) {
      throw new Error("Account template not found");
    }

    return template;
  }

  async getAllTemplates(): Promise<IAccountTemplate[]> {
    return await accountTemplateRepository.findAll();
  }

  async getTemplatesByType(type: string): Promise<IAccountTemplate[]> {
    if (!this.validTypes.includes(type as AccountTemplateType)) {
      throw new Error(`Invalid account template type: ${type}`);
    }

    return await accountTemplateRepository.findByType(
      type as AccountTemplateType,
    );
  }

  async getTemplatesByCategory(category: string): Promise<IAccountTemplate[]> {
    return await accountTemplateRepository.findByCategory(category);
  }

  async updateTemplate(
    id: string,
    data: Partial<IAccountTemplateInput>,
  ): Promise<IAccountTemplate> {
    const template = await accountTemplateRepository.update(id, data);

    if (!template) {
      throw new Error("Account template not found");
    }

    return template;
  }

  async deleteTemplate(id: string): Promise<IAccountTemplate> {
    const template = await accountTemplateRepository.delete(id);

    if (!template) {
      throw new Error("Account template not found");
    }

    return template;
  }

  async findTemplateByName(name: string): Promise<IAccountTemplate> {
    const template = await accountTemplateRepository.findByName(name);

    if (!template) {
      throw new Error(`Account template "${name}" not found`);
    }

    return template;
  }
}

export default new AccountTemplateService();
