// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MicroLoanDAO {
    enum LoanStatus { REQUESTED, FUNDED, REPAID, DEFAULTED }

    struct Loan {
        uint256 id;
        address borrower;
        address lender;
        uint256 amount;
        uint256 interestRate; // Basis points: 100 = 1%
        string purpose;
        uint256 duration; // in seconds
        uint256 requestedAt;
        uint256 fundedAt;
        uint256 repaidAt;
        LoanStatus status;
    }

    uint256 public loanCount;
    mapping(uint256 => Loan) public loans;

    event LoanCreated(uint256 indexed id, address indexed borrower, uint256 amount, uint256 duration, uint256 interestRate, string purpose);
    event LoanFunded(uint256 indexed id, address indexed lender, uint256 fundedAt);
    event LoanRepaid(uint256 indexed id, uint256 repaidAt, uint256 totalRepayment);

    function createLoan(uint256 _amount, uint256 _duration, uint256 _interestRate, string memory _purpose) external {
        require(_amount > 0, "Amount must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(_interestRate <= 10000, "Interest rate too high"); // Max 100%

        loanCount++;
        loans[loanCount] = Loan({
            id: loanCount,
            borrower: msg.sender,
            lender: address(0),
            amount: _amount,
            interestRate: _interestRate,
            purpose: _purpose,
            duration: _duration,
            requestedAt: block.timestamp,
            fundedAt: 0,
            repaidAt: 0,
            status: LoanStatus.REQUESTED
        });

        emit LoanCreated(loanCount, msg.sender, _amount, _duration, _interestRate, _purpose);
    }

    function fundLoan(uint256 _id) external payable {
        Loan storage loan = loans[_id];
        require(loan.status == LoanStatus.REQUESTED, "Loan is not in requested status");
        require(msg.value == loan.amount, "Incorrect funding amount");
        require(msg.sender != loan.borrower, "Borrower cannot fund their own loan");

        loan.lender = msg.sender;
        loan.status = LoanStatus.FUNDED;
        loan.fundedAt = block.timestamp;

        (bool success, ) = loan.borrower.call{value: msg.value}("");
        require(success, "Transfer to borrower failed");

        emit LoanFunded(_id, msg.sender, block.timestamp);
    }

    function repayLoan(uint256 _id) external payable {
        Loan storage loan = loans[_id];
        require(loan.status == LoanStatus.FUNDED, "Loan is not active");
        require(msg.sender == loan.borrower, "Only borrower can repay");

        uint256 interest = (loan.amount * loan.interestRate) / 10000;
        uint256 totalRepayment = loan.amount + interest;

        require(msg.value >= totalRepayment, "Insufficient repayment amount");

        loan.status = LoanStatus.REPAID;
        loan.repaidAt = block.timestamp;

        (bool success, ) = loan.lender.call{value: msg.value}("");
        require(success, "Transfer to lender failed");

        emit LoanRepaid(_id, block.timestamp, msg.value);
    }

    function getLoanDetails(uint256 _id) external view returns (Loan memory) {
        return loans[_id];
    }
}
