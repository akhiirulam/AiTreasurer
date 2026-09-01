import mongoose from "mongoose";

import supplierRepository from "../../repositories/supplier/Supplier.repositories";
import supplierLedgerRepository from "../../repositories/supplier/supplierLedger.repository";

class SupplierLedgerService {
  // =====================================================
  // GET SUPPLIER LEDGER
  // =====================================================

  async getSupplierLedger(
    userId: string,
    supplierId: string,
    from?: Date,
    to?: Date,
  ) {
    // ===================================================
    // 1. VALIDATE USER ID
    // ===================================================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // ===================================================
    // 2. VALIDATE SUPPLIER ID
    // ===================================================

    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      throw new Error("Invalid supplier ID");
    }

    // ===================================================
    // 3. VALIDATE DATE RANGE
    // ===================================================

    if (from && to && from > to) {
      throw new Error("From date cannot be later than to date");
    }

    // ===================================================
    // 4. GET SUPPLIER
    // ===================================================

    const supplier = await supplierRepository.findById(supplierId);

    if (!supplier) {
      throw new Error("Supplier not found");
    }

    // ===================================================
    // 5. OWNERSHIP CHECK
    // ===================================================

    if (supplier.userId.toString() !== userId) {
      throw new Error("Supplier does not belong to this user");
    }

    // ===================================================
    // 6. GET SUPPLIER TRANSACTIONS
    // ===================================================

    const transactions =
      await supplierLedgerRepository.findSupplierTransactions(
        userId,
        supplierId,
        from,
        to,
      );

    // ===================================================
    // 7. CALCULATE TOTALS
    // ===================================================

    let totalPurchases = 0;

    let totalPayments = 0;

    let outstandingBalance = 0;

    // ===================================================
    // 8. CREATE LEDGER ENTRIES
    // ===================================================

    const entries = transactions.map((transaction) => {
      let debit = 0;
      let credit = 0;

      // -------------------------------------------------
      // CREDIT PURCHASE
      // -------------------------------------------------
      //
      // Example:
      //
      // Bought goods ₹5,000 on credit
      //
      // Dr Purchase        ₹5,000
      // Cr Payable         ₹5,000
      //
      // Supplier owes = +₹5,000
      //

      if (
        transaction.type === "purchase" &&
        transaction.paymentStatus !== "paid"
      ) {
        credit = transaction.amount;

        totalPurchases += transaction.amount;

        outstandingBalance += transaction.amount;
      }

      // -------------------------------------------------
      // PAYMENT TO SUPPLIER
      // -------------------------------------------------
      //
      // Example:
      //
      // Paid Raj Traders ₹2,000
      //
      // Dr Accounts Payable    ₹2,000
      // Cr Cash                ₹2,000
      //
      // Supplier outstanding decreases.
      //

      if (transaction.type === "payment") {
        debit = transaction.amount;

        totalPayments += transaction.amount;

        outstandingBalance -= transaction.amount;
      }

      // -------------------------------------------------
      // PAID PURCHASE
      // -------------------------------------------------
      //
      // A purchase paid immediately does not create
      // an outstanding payable.
      //

      if (
        transaction.type === "purchase" &&
        transaction.paymentStatus === "paid"
      ) {
        totalPurchases += transaction.amount;
      }

      return {
        transactionId: transaction._id.toString(),

        date: transaction.transactionDate,

        description: transaction.description,

        type: transaction.type,

        debit,

        credit,

        balance: outstandingBalance,
      };
    });

    // ===================================================
    // 9. PREVENT NEGATIVE OUTSTANDING
    // ===================================================
    //
    // Normally this should not happen, but if a payment
    // is greater than recorded purchases, we don't want
    // to show a negative payable as an outstanding amount.
    //
    // We will later support supplier advances separately.
    //

    const finalOutstandingBalance = Math.max(outstandingBalance, 0);

    // ===================================================
    // 10. RETURN SUPPLIER LEDGER
    // ===================================================

    return {
      supplier: {
        id: supplier._id.toString(),

        name: supplier.name,

        phone: supplier.phone,

        email: supplier.email,

        address: supplier.address,

        isActive: supplier.isActive,
      },

      totalPurchases,

      totalPayments,

      outstandingBalance: finalOutstandingBalance,

      entries,
    };
  }
}

export default new SupplierLedgerService();
