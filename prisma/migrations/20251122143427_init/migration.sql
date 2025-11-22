-- CreateTable
CREATE TABLE "User" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "reputationScore" INTEGER NOT NULL DEFAULT 100
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractLoanId" INTEGER,
    "borrowerAddress" TEXT NOT NULL,
    "lenderAddress" TEXT,
    "amount" TEXT NOT NULL,
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
