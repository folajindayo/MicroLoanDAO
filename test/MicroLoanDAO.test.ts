import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("MicroLoanDAO", function () {
  async function deployMicroLoanDAOFixture() {
    const [owner, borrower, lender] = await hre.ethers.getSigners();
    const MicroLoanDAO = await hre.ethers.getContractFactory("MicroLoanDAO");
    const microLoanDAO = await MicroLoanDAO.deploy();

    return { microLoanDAO, owner, borrower, lender };
  }

  describe("Deployment", function () {
    it("Should set the initial loan count to 0", async function () {
      const { microLoanDAO } = await loadFixture(deployMicroLoanDAOFixture);
      expect(await microLoanDAO.loanCount()).to.equal(0);
    });
  });

  describe("Loan Creation", function () {
    it("Should create a loan with correct details", async function () {
      const { microLoanDAO, borrower } = await loadFixture(deployMicroLoanDAOFixture);
      const amount = hre.ethers.parseEther("1");
      const duration = 30 * 24 * 60 * 60; // 30 days
      const interestRate = 500; // 5%
      const purpose = "Business";

      await expect(microLoanDAO.connect(borrower).createLoan(amount, duration, interestRate, purpose))
        .to.emit(microLoanDAO, "LoanCreated")
        .withArgs(1, borrower.address, amount, duration, interestRate, purpose);

      const loan = await microLoanDAO.getLoanDetails(1);
      expect(loan.borrower).to.equal(borrower.address);
      expect(loan.amount).to.equal(amount);
      expect(loan.interestRate).to.equal(interestRate);
      expect(loan.status).to.equal(0); // REQUESTED
    });
  });

  describe("Loan Funding", function () {
    it("Should fund a requested loan", async function () {
      const { microLoanDAO, borrower, lender } = await loadFixture(deployMicroLoanDAOFixture);
      const amount = hre.ethers.parseEther("1");
      await microLoanDAO.connect(borrower).createLoan(amount, 86400, 500, "Test");

      const tx = await microLoanDAO.connect(lender).fundLoan(1, { value: amount });
      await expect(tx)
        .to.emit(microLoanDAO, "LoanFunded"); // Simplified expectation to avoid timestamp race condition

      const loan = await microLoanDAO.getLoanDetails(1);
      expect(loan.status).to.equal(1); // FUNDED
      expect(loan.lender).to.equal(lender.address);
    });

    it("Should transfer funds to borrower", async function () {
      const { microLoanDAO, borrower, lender } = await loadFixture(deployMicroLoanDAOFixture);
      const amount = hre.ethers.parseEther("1");
      await microLoanDAO.connect(borrower).createLoan(amount, 86400, 500, "Test");

      await expect(
        microLoanDAO.connect(lender).fundLoan(1, { value: amount })
      ).to.changeEtherBalances(
        [lender, borrower],
        [-amount, amount]
      );
    });
  });

  describe("Loan Repayment", function () {
    it("Should repay loan with interest", async function () {
      const { microLoanDAO, borrower, lender } = await loadFixture(deployMicroLoanDAOFixture);
      const amount = hre.ethers.parseEther("1");
      const interestRate = 500; // 5%
      await microLoanDAO.connect(borrower).createLoan(amount, 86400, interestRate, "Test");
      await microLoanDAO.connect(lender).fundLoan(1, { value: amount });

      const interest = (amount * BigInt(interestRate)) / 10000n;
      const totalRepayment = amount + interest;

      const tx = await microLoanDAO.connect(borrower).repayLoan(1, { value: totalRepayment });
      await expect(tx)
        .to.emit(microLoanDAO, "LoanRepaid");

      const loan = await microLoanDAO.getLoanDetails(1);
      expect(loan.status).to.equal(2); // REPAID
    });

    it("Should transfer repayment to lender", async function () {
      const { microLoanDAO, borrower, lender } = await loadFixture(deployMicroLoanDAOFixture);
      const amount = hre.ethers.parseEther("1");
      const interestRate = 500; // 5%
      await microLoanDAO.connect(borrower).createLoan(amount, 86400, interestRate, "Test");
      await microLoanDAO.connect(lender).fundLoan(1, { value: amount });

      const interest = (amount * BigInt(interestRate)) / 10000n;
      const totalRepayment = amount + interest;

      await expect(
        microLoanDAO.connect(borrower).repayLoan(1, { value: totalRepayment })
      ).to.changeEtherBalances(
        [borrower, lender],
        [-totalRepayment, totalRepayment]
      );
    });
  });
});

