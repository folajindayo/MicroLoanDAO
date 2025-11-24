/*
  Warnings:

  - Added the required column `interestRate` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractLoanId" INTEGER,
    "borrowerAddress" TEXT NOT NULL,
    "lenderAddress" TEXT,
    "amount" TEXT NOT NULL,
    "interestRate" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fundedAt" DATETIME,
    "repaidAt" DATETIME,
    "creationTx" TEXT,
    "fundingTx" TEXT,
    "repaymentTx" TEXT,
    CONSTRAINT "Loan_borrowerAddress_fkey" FOREIGN KEY ("borrowerAddress") REFERENCES "User" ("address") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Loan_lenderAddress_fkey" FOREIGN KEY ("lenderAddress") REFERENCES "User" ("address") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Loan" ("amount", "borrowerAddress", "contractLoanId", "createdAt", "creationTx", "duration", "fundedAt", "fundingTx", "id", "lenderAddress", "purpose", "repaidAt", "repaymentTx", "status") SELECT "amount", "borrowerAddress", "contractLoanId", "createdAt", "creationTx", "duration", "fundedAt", "fundingTx", "id", "lenderAddress", "purpose", "repaidAt", "repaymentTx", "status" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
