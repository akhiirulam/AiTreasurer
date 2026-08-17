import mongoose from "mongoose";

import AccountTemplate from "../models/accountTemplate.model";
import { accountTemplates } from "./accountTemplates.seed";
import dotenv from "dotenv";

dotenv.config();

const seedAccountTemplates = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);

    console.log("MongoDB connected");

    for (const template of accountTemplates) {
      await AccountTemplate.updateOne(
        {
          code: template.code,
        },
        {
          $set: template,
        },
        {
          upsert: true,
        },
      );
    }

    console.log(
      `${accountTemplates.length} account templates seeded successfully`,
    );

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error("Failed to seed account templates:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

seedAccountTemplates();
