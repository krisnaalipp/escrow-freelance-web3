// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract JobEscrow {
    enum JobStatus {
        Open,
        Accepted,
        Funded,
        Delivered,
        Released,
        Cancelled
    }

    struct Job {
        address client;
        address worker;
        uint256 budget;
        uint256 escrowBalance;
        JobStatus status;
        uint256 createdAt;
        uint256 completedAt;
    }

    IERC20 public immutable usdc;

    uint256 public jobCount;
    mapping(uint256 => Job) public jobs;

    event JobCreated(uint256 indexed jobId, address indexed client, uint256 budget);
    event JobAccepted(uint256 indexed jobId, address indexed worker);
    event EscrowFunded(uint256 indexed jobId, uint256 amount);
    event WorkDelivered(uint256 indexed jobId);
    event PaymentReleased(uint256 indexed jobId, address indexed worker, uint256 amount);
    event JobCancelled(uint256 indexed jobId);

    modifier jobExists(uint256 _jobId) {
        require(_jobId > 0 && _jobId <= jobCount, "Job does not exist");
        _;
    }

    constructor(address _usdc) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
    }

    function createJob(uint256 _budget) external {
        require(_budget > 0, "Budget must be greater than 0");

        jobCount++;
        jobs[jobCount] = Job({
            client: msg.sender,
            worker: address(0),
            budget: _budget,
            escrowBalance: 0,
            status: JobStatus.Open,
            createdAt: block.timestamp,
            completedAt: 0
        });

        emit JobCreated(jobCount, msg.sender, _budget);
    }

    function acceptFreelancer(uint256 _jobId, address _worker) public jobExists(_jobId) {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Open, "Job is not open");
        require(msg.sender == job.client, "Only client can accept");
        require(_worker != address(0), "Invalid worker");

        job.worker = _worker;
        job.status = JobStatus.Accepted;

        emit JobAccepted(_jobId, _worker);
    }

    // Backward-compatible alias for existing frontend naming.
    function hireFreelancer(uint256 _jobId, address _worker) external {
        acceptFreelancer(_jobId, _worker);
    }

    function fundEscrow(uint256 _jobId) external jobExists(_jobId) {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Accepted, "Job is not accepted");
        require(msg.sender == job.client, "Only client can fund");

        bool success = usdc.transferFrom(msg.sender, address(this), job.budget);
        require(success, "USDC transfer failed");

        job.escrowBalance = job.budget;
        job.status = JobStatus.Funded;

        emit EscrowFunded(_jobId, job.budget);
    }

    function submitWork(uint256 _jobId) external jobExists(_jobId) {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Funded, "Escrow not funded");
        require(msg.sender == job.worker, "Only worker can submit work");

        job.status = JobStatus.Delivered;
        job.completedAt = block.timestamp;

        emit WorkDelivered(_jobId);
    }

    function releasePayment(uint256 _jobId) external jobExists(_jobId) {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Delivered, "Work not delivered");
        require(msg.sender == job.client, "Only client can release payment");
        require(job.escrowBalance > 0, "No funds in escrow");

        uint256 amount = job.escrowBalance;
        job.escrowBalance = 0;
        job.status = JobStatus.Released;

        bool success = usdc.transfer(job.worker, amount);
        require(success, "USDC payout failed");

        emit PaymentReleased(_jobId, job.worker, amount);
    }

    function cancelJob(uint256 _jobId) external jobExists(_jobId) {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.client, "Only client can cancel");
        require(
            job.status == JobStatus.Open || job.status == JobStatus.Accepted,
            "Cannot cancel now"
        );

        job.status = JobStatus.Cancelled;
        emit JobCancelled(_jobId);
    }
}
