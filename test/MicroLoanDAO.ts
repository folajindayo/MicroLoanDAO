import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("MicroLoanDAO", function () {
  async function deployMicroLoanDAOFixture() {
    const [owner, otherAccount, lender] = await hre.ethers.getSigners();

    const MicroLoanDAO = await hre.ethers.getContractFactory("MicroLoanDAO");
    const microLoanDAO = await MicroLoanDAO.deploy();

    return { microLoanDAO, owner, otherAccount, lender };
  }

  describe("Loan Creation", function () {
    it("Should create a loan with correct parameters", async function () {
      const { microLoanDAO, owner } = await loadFixture(deployMicroLoanDAOFixture);

      const amount = hre.ethers.parseEther("1");
      const duration = 30 * 24 * 60 * 60; // 30 days
      const interestRate = 500; // 5%
      const purpose = "Business";

      await expect(microLoanDAO.createLoan(amount, duration, interestRate, purpose))
        .to.emit(microLoanDAO, "LoanCreated")
        .withArgs(1, owner.address, amount, duration, interestRate, purpose);

      const loan = await microLoanDAO.getLoanDetails(1);
      expect(loan.amount).to.equal(amount);
      expect(loan.interestRate).to.equal(interestRate);
      expect(loan.status).to.equal(0); // REQUESTED
    });

    it("Should fail if interest rate is too high", async function () {
        const { microLoanDAO } = await loadFixture(deployMicroLoanDAOFixture);
        await expect(
            microLoanDAO.createLoan(100, 100, 10001, "Fail")
        ).to.be.revertedWith("Interest rate too high");
    });
  });

  describe("Funding", function () {
      it("Should fund a loan and transfer funds to borrower", async function () {
          const { microLoanDAO, owner, lender } = await loadFixture(deployMicroLoanDAOFixture);
          
          const amount = hre.ethers.parseEther("1");
          await microLoanDAO.createLoan(amount, 86400, 500, "Fund me");

          await expect(microLoanDAO.connect(lender).fundLoan(1, { value: amount }))
            .to.emit(microLoanDAO, "LoanFunded")
            .withArgs(1, lender.address, await time.latest() + 1); // Time increases by 1 in test
          
          const loan = await microLoanDAO.getLoanDetails(1);
          expect(loan.status).to.equal(1); // FUNDED
          expect(loan.lender).to.equal(lender.address);
      });
  });

  describe("Repayment", function () {
      it("Should repay loan with interest", async function () {
          const { microLoanDAO, owner, lender } = await loadFixture(deployMicroLoanDAOFixture);
          
          const amount = hre.ethers.parseEther("1");
          const interestRate = 500; // 5%
          const interest = (amount * BigInt(interestRate)) / BigInt(10000);
          const total = amount + interest;

          await microLoanDAO.createLoan(amount, 86400, interestRate, "Repay me");
          await microLoanDAO.connect(lender).fundLoan(1, { value: amount });

          await expect(microLoanDAO.repayLoan(1, { value: total }))
            .to.emit(microLoanDAO, "LoanRepaid");
          
          const loan = await microLoanDAO.getLoanDetails(1);
          expect(loan.status).to.equal(2); // REPAID
      });

      it("Should charge late fee if repaid after duration", async function () {
        const { microLoanDAO, owner, lender } = await loadFixture(deployMicroLoanDAOFixture);
        
        const amount = hre.ethers.parseEther("1");
        const duration = 86400; // 1 day
        const interestRate = 500; // 5%
        
        await microLoanDAO.createLoan(amount, duration, interestRate, "Late");
        await microLoanDAO.connect(lender).fundLoan(1, { value: amount });

        // Fast forward time
        await time.increase(duration + 100);

        const interest = (amount * BigInt(interestRate)) / BigInt(10000);
        const lateFee = (amount * BigInt(500)) / BigInt(10000); // 5%
        const total = amount + interest + lateFee;

        await expect(microLoanDAO.repayLoan(1, { value: total }))
          .to.emit(microLoanDAO, "LoanRepaid");
    });

    it("Should revert if repayment amount is insufficient", async function () {
        const { microLoanDAO, owner, lender } = await loadFixture(deployMicroLoanDAOFixture);
        
        const amount = hre.ethers.parseEther("1");
        await microLoanDAO.createLoan(amount, 86400, 500, "Fail Repay");
        await microLoanDAO.connect(lender).fundLoan(1, { value: amount });

        await expect(
            microLoanDAO.repayLoan(1, { value: amount }) // Missing interest
        ).to.be.revertedWith("Insufficient repayment amount");
    });
  });
});

