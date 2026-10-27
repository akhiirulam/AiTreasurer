import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const apiKey = process.env.GEMINI_API_KEY;

type AccountType = "asset" | "liability" | "equity" | "income" | "expense";

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ai = new GoogleGenAI({
  apiKey,
});

interface ParseTransactionData {
  text: string;
  file?: Express.Multer.File;
}
type ParsedTransaction = {
  type: "income" | "expense" | "purchase" | "sale" | "payment" | "capital";
  amount: number;
  description: string;
  category: string | null;

  customerName: string | null;
  customerPhone: string | null;
  supplierName: string | null;

  transactionDate: string;

  paymentStatus: "paid" | "unpaid" | "partial" | "unknown";
  paidAmount: number;
  outstandingAmount: number;

  debitAccount: string;
  debitAccountType: AccountType;
  debitAccountCategory: string;
  debitAccountSubCategory: string;

  creditAccount: string;
  creditAccountType: AccountType;
  creditAccountCategory: string;
  creditAccountSubCategory: string;
};

interface ParsedTransactionsResponse {
  transactions: ParsedTransaction[];
}

class TransactionParserService {
  async parseTransaction(
    data: ParseTransactionData,
  ): Promise<ParsedTransaction[]> {
    const { text, file } = data;

    const prompt = `
You are an AI bookkeeping assistant for a small business.

Analyze the business transaction message provided by the user.

Transaction:
"${text}"

IMPORTANT:
A single message can contain ONE or MULTIPLE independent financial transactions.

You MUST create a separate transaction object for EACH independent transaction.

NEVER combine multiple independent transactions into one transaction.

Example:

Input:
"Paid ₹3,200 for electricity and ₹1,800 for internet this month."

This contains TWO transactions:

Transaction 1:
- Electricity
- ₹3,200

Transaction 2:
- Internet
- ₹1,800

The total of ₹5,000 must NEVER be stored as a single transaction.

The dashboard or accounting reports may later calculate the total,
but each individual transaction must retain its original amount.

--------------------------------------------------
TRANSACTION INFORMATION
--------------------------------------------------

For EACH transaction identify:

1. type
   - income
   - expense
   - purchase
   - sale
   - payment

2. amount
   - The amount belonging ONLY to this transaction.
   - Do NOT add amounts from other transactions.
   - Must be a number.
   - Do not include currency symbols.

3. description
   - A short and clear description of this transaction.

4. category
   - Identify the most appropriate category.

   Examples:
   - Sales
   - Purchases
   - Rent
   - Electricity
   - Internet
   - Stationery
   - Transportation
   - Salary
   - Office Supplies
   - Raw Materials
   - Food
   - Other

   If the category cannot be determined, return null.

5. customerName
   - Extract the customer/buyer name if mentioned.
   - If not mentioned, return null.
   - Never invent a name.

6. customerPhone
   - Extract the customer's phone/mobile number if mentioned.
   - The phone number must come directly from the user's transaction command.
   - Never invent, guess, infer, or generate a phone number.
   - If a customer is mentioned but the phone number is not provided, return null.
   - Preserve the phone number as provided by the user.   

7. supplierName
   - Extract the supplier/vendor name if mentioned.
   - If not mentioned, return null.
   - Never invent a name.

8. transactionDate
   - Extract the date if explicitly mentioned.
   - If no date is mentioned, use today's date.
   - Format: YYYY-MM-DD.

9. paymentStatus
   - paid
   - unpaid
   - partial
   - unknown

10. paidAmount
   - Amount actually paid for THIS transaction.
   - If fully paid, paidAmount = amount.
   - If unpaid, paidAmount = 0.
   - If partially paid, use the amount already paid.
   - Must be a number.

11. outstandingAmount
   - Amount still owed for THIS transaction.
   - If fully paid, outstandingAmount = 0.
   - If unpaid, outstandingAmount = amount.
   - If partially paid:
     outstandingAmount = amount - paidAmount.
   - Must be a number.

12. debitAccount

   Identify the account that should be debited.

   For EXISTING common accounts, prefer these names:

   - Cash
   - Bank
   - Accounts Receivable
   - Purchases
   - Sales
   - Rent Expense
   - Electricity Expense
   - Internet Expense
   - Salary Expense
   - Stationery Expense
   - Transportation Expense
   - Office Supplies Expense
   - Raw Materials
   - Owner's Capital
   - Owner's Drawings

   If the transaction clearly requires an account that is NOT in this list,
   you MAY create a meaningful accounting account name.

   Examples:
   - Advertisement Expense
   - Insurance Expense
   - Repairs Expense
   - Delivery Expense
   - Software Expense

   Do not use vague names such as "Other Account" when a specific account
   can be identified.

13. debitAccountType

   Return the accounting type of debitAccount.

   Allowed values ONLY:

   - asset
   - liability
   - equity
   - income
   - expense

14. creditAccount

   Identify the account that should be credited.

   For EXISTING common accounts, prefer these names:

   - Cash
   - Bank
   - Accounts Receivable
   - Accounts Payable
   - Sales
   - Purchases
   - Rent Expense
   - Electricity Expense
   - Internet Expense
   - Salary Expense
   - Stationery Expense
   - Transportation Expense
   - Office Supplies Expense
   - Raw Materials
   - Owner's Capital
   - Owner's Drawings

   If the transaction clearly requires an account that is NOT in this list,
   you MAY create a meaningful accounting account name.

15. creditAccountType

   Return the accounting type of creditAccount.

   Allowed values ONLY:

   - asset
   - liability
   - equity
   - income
   - expense

16. debitAccountCategory

    Return the category of debitAccount.

    Allowed values:
    - current_asset
    - non_current_asset
    - current_liability
    - non_current_liability
    - equity
    - operating_income
    - other_income
    - operating_expense
    - other_expense


17. debitAccountSubCategory

    Return the sub-category of debitAccount.

    For cash/bank accounts use:
    - cash_and_bank

    For other accounts choose an appropriate meaningful
    sub-category.

    Examples:

    Cash:
    category = "current_asset"
    subCategory = "cash_and_bank"

    Bank:
    category = "current_asset"
    subCategory = "cash_and_bank"

    Petty Cash:
    category = "current_asset"
    subCategory = "cash_and_bank"

    Accounts Receivable:
    category = "current_asset"
    subCategory = "accounts_receivable"

    Purchases:
    category = "operating_expense"
    subCategory = "purchases"

    Sales:
    category = "operating_income"
    subCategory = "sales"

    Accounts Payable:
    category = "current_liability"
    subCategory = "accounts_payable"

18. creditAccountCategory

    Return the category of creditAccount.

    Use the same allowed category values.

19. creditAccountSubCategory

    Return the sub-category of creditAccount.

    For cash/bank accounts use:
    - cash_and_bank

--------------------------------------------------
ACCOUNTING RULES
--------------------------------------------------

Purchase paid immediately:
- Debit Purchases or appropriate expense account.
- Credit Cash or Bank.

Purchase on credit:
- Debit Purchases or appropriate expense account.
- Credit Accounts Payable.

Sale paid immediately:
- Debit Cash or Bank.
- Credit Sales.

Sale on credit:
- Debit Accounts Receivable.
- Credit Sales.

Expense paid immediately:
- Debit appropriate Expense account.
- Credit Cash or Bank.

Expense unpaid:
- Debit appropriate Expense account.
- Credit Accounts Payable.

Customer payment:
- Debit Cash or Bank.
- Credit Accounts Receivable.

Supplier payment:
- Debit Accounts Payable.
- Credit Cash or Bank.

Partial payment:
- paymentStatus = "partial"
- paidAmount = amount already paid
- outstandingAmount = amount - paidAmount

--------------------------------------------------
MULTIPLE TRANSACTION RULES
--------------------------------------------------

If the message contains multiple independent transactions:

1. Create a separate object for every transaction.
2. Preserve the original amount of each transaction.
3. Never add amounts together.
4. Never merge different categories.
5. Never merge different suppliers.
6. Never merge different customers.
7. Each transaction must have its own accounting information.
8. Each transaction must have its own payment status.
9. Each transaction must have its own paidAmount.
10. Each transaction must have its own outstandingAmount.

For example:

Input:
"Paid ₹3,200 for electricity and ₹1,800 for internet this month."

Correct:

transactions[0].amount = 3200
transactions[0].category = "Electricity"

transactions[1].amount = 1800
transactions[1].category = "Internet"

Incorrect:

transactions[0].amount = 5000

--------------------------------------------------
SUPPLIER NAME RULES
--------------------------------------------------

Return the supplier's actual business/person name ONLY when the
transaction explicitly involves purchasing goods/services from a supplier.

Examples:

"Bought goods from Raj Traders for ₹20,000"
→ supplierName: "Raj Traders"

"Purchased stationery from ABC Office Supplies"
→ supplierName: "ABC Office Supplies"

For expenses where the name refers to:
- an advertising platform
- a utility
- a service/category
- an account
- a payment method
- a product
- a brand/platform

DO NOT treat it as a supplier unless the text clearly indicates
that the entity is the supplier.

Examples:

"Paid ₹5,000 for Instagram advertising from bank"
→ supplierName: null

"Paid Google Ads ₹3,000"
→ supplierName: null

"Paid electricity bill ₹2,000"
→ supplierName: null

"Paid shop rent ₹8,000"
→ supplierName: null

"Bought goods from Raj Traders for ₹20,000"
→ supplierName: "Raj Traders"

--------------------------------------------------
CUSTOMER IDENTIFICATION RULES
--------------------------------------------------

For a transaction involving a customer:

1. Extract the customer's actual name.
2. Extract the customer's phone/mobile number.
3. Both values must come from the user's command.
4. Never invent a customer name.
5. Never invent a customer phone number.
6. Do not treat a payment method as a customer.
7. Do not treat a supplier as a customer.
8. If no customer is involved:
   customerName = null
   customerPhone = null

Examples:

"Arun, 9876543210, paid ₹5,000 through UPI"

→ customerName: "Arun"
→ customerPhone: "9876543210"

"Received ₹10,000 from Raj, 9123456789"

→ customerName: "Raj"
→ customerPhone: "9123456789"

"Sold goods worth ₹20,000 to ABC Stores,
9876543210, on credit"

→ customerName: "ABC Stores"
→ customerPhone: "9876543210"

"Paid ₹5,000 for electricity"

→ customerName: null
→ customerPhone: null

IMPORTANT:

If the transaction explicitly identifies a customer but
does not provide a phone number:

→ customerName: "Arun"
→ customerPhone: null

Do NOT invent a phone number.

--------------------------------------------------
CASH/BANK ACCOUNT CLASSIFICATION
--------------------------------------------------

If an account represents money physically held by
the business or money held in a bank/payment account,
classify it as:

type = "asset"
category = "current_asset"
subCategory = "cash_and_bank"

Examples:

Cash
Bank
Petty Cash
Wallet
Payment Gateway
UPI (if treated as a separate accounting account)

These accounts can appear in the Cash Book.

Do NOT classify the following as cash_and_bank:

Accounts Receivable
Inventory
Purchases
Sales
Advertisement Expense
Electricity Expense
Accounts Payable
Owner's Capital
Owner's Drawings

--------------------------------------------------
IMPORTANT RULES
--------------------------------------------------

- Do not invent customer names.
- Do not invent supplier names.
- Do not invent amounts.
- Do not combine independent transactions.
- Do not calculate a combined amount.
- Do not invent dates.
- If customer is not mentioned, use null.
- If supplier is not mentioned, use null.
- If category cannot be determined, use null.
- If payment status cannot be determined, use "unknown".
- amount must always be a number.
- paidAmount must always be a number.
- outstandingAmount must always be a number.
- Return ONLY valid JSON.
- Do not return Markdown.
- Do not return explanations.
- Do not wrap the JSON in \`\`\`json.

ACCOUNTING CLASSIFICATION RULES

OWNER CAPITAL
----------------
When the owner introduces money into the business:

Example:
"Owner introduced ₹50,000 into business bank account."

Return:

type = "capital"
debitAccount = "Bank"
creditAccount = "Owner's Capital"

IMPORTANT:
Owner capital is NOT income.
Do not use Sales.
Do not use Accounts Payable.

OWNER WITHDRAWAL
----------------
When the owner takes money out of the business:

Example:
"Owner withdrew ₹10,000 from business."

Return:

type = "capital"
debitAccount = "Owner's Drawings"
creditAccount = "Cash"

IMPORTANT:
Owner withdrawal is NOT an expense.

CUSTOMER PAYMENT
----------------
When a customer pays an amount previously owed:

Example:
"Received ₹25,000 from ABC Stores."

Return:

type = "payment"
debitAccount = "Bank"
creditAccount = "Accounts Receivable"

IMPORTANT:
Do not classify this as Sales income.

SUPPLIER PAYMENT
----------------
When the business pays a supplier for an existing payable:

Example:
"Paid ₹20,000 to Raj Traders."

Return:

type = "payment"
debitAccount = "Accounts Payable"
creditAccount = "Bank"

IMPORTANT:
Do not classify this as an expense.

CREDIT SALE
----------------
When goods are sold but the customer has not paid:

Example:
"Sold goods worth ₹25,000 to ABC Stores on credit."

Return:

type = "sale"
debitAccount = "Accounts Receivable"
creditAccount = "Sales"

CASH/BANK SALE
----------------
When goods are sold and payment is received immediately:

Example:
"Sold goods for ₹15,000 and received cash."

Return:

type = "sale"
debitAccount = "Cash"
creditAccount = "Sales"


--------------------------------------------------
RETURN FORMAT
--------------------------------------------------

Return exactly this structure:

{
  "transactions": [
    {
      "type": "expense",
      "amount": 3200,
      "description": "Electricity payment",
      "category": "Electricity",
      "customerName": null,
      "supplierName": null,
      "transactionDate": "YYYY-MM-DD",
      "paymentStatus": "paid",
      "paidAmount": 3200,
      "outstandingAmount": 0,
      "debitAccount": "Electricity Expense",
      "creditAccount": "Cash"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    console.log("Gemini response:", response.text);

    const responseText = response.text;

    if (!responseText) {
      throw new Error("Gemini returned an empty response");
    }

    // Remove markdown ```json ... ``` if Gemini returns it
    const cleanedResponse = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed: ParsedTransactionsResponse = JSON.parse(cleanedResponse);

    if (!parsed.transactions || !Array.isArray(parsed.transactions)) {
      throw new Error("Invalid Gemini response: transactions array missing");
    }

    for (const transaction of parsed.transactions) {
      const validAccountTypes: AccountType[] = [
        "asset",
        "liability",
        "equity",
        "income",
        "expense",
      ];

      if (!transaction.debitAccount) {
        throw new Error("Invalid transaction: debitAccount missing");
      }

      if (!validAccountTypes.includes(transaction.debitAccountType)) {
        throw new Error(
          `Invalid debit account type: ${transaction.debitAccountType}`,
        );
      }

      if (!transaction.creditAccount) {
        throw new Error("Invalid transaction: creditAccount missing");
      }

      if (!validAccountTypes.includes(transaction.creditAccountType)) {
        throw new Error(
          `Invalid credit account type: ${transaction.creditAccountType}`,
        );
      }
      if (!transaction.transactionDate) {
        throw new Error("Invalid transaction: transactionDate missing");
      }
      if (!transaction.debitAccountCategory) {
        throw new Error("Invalid transaction: debitAccountCategory missing");
      }

      if (!transaction.debitAccountSubCategory) {
        throw new Error("Invalid transaction: debitAccountSubCategory missing");
      }

      if (!transaction.creditAccountCategory) {
        throw new Error("Invalid transaction: creditAccountCategory missing");
      }

      if (!transaction.creditAccountSubCategory) {
        throw new Error(
          "Invalid transaction: creditAccountSubCategory missing",
        );
      }
    }

    return parsed.transactions;
  }
}

export default new TransactionParserService();
