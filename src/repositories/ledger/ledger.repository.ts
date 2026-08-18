import mongoose from "mongoose";

import JournalEntryLine from "../../models/journalEntryLine.model";

class LedgerRepository {
  /**
   * Get journal lines for one account.
   *
   * The JournalEntryLine does not contain userId,
   * so user/date filtering is performed through
   * the populated JournalEntry.
   */
  async findByAccountId(
    userId: mongoose.Types.ObjectId,
    accountId: mongoose.Types.ObjectId,
    from?: Date,
    to?: Date,
  ) {
    const journalEntryFilter: any = {
      userId,
    };

    if (from || to) {
      journalEntryFilter.entryDate = {};

      if (from) {
        journalEntryFilter.entryDate.$gte = from;
      }

      if (to) {
        journalEntryFilter.entryDate.$lte = to;
      }
    }

    const journalEntries = await mongoose
      .model("JournalEntry")
      .find(journalEntryFilter)
      .select("_id entryDate description transactionId")
      .sort({
        entryDate: 1,
        _id: 1,
      });

    const journalEntryIds = journalEntries.map((entry) => entry._id);

    return await JournalEntryLine.find({
      accountId,

      journalEntryId: {
        $in: journalEntryIds,
      },
    }).populate({
      path: "journalEntryId",
      select: "entryDate description transactionId",
    });
  }
}

export default new LedgerRepository();
