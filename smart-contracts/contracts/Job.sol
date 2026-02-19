// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

contract JobEscrow {
    constructor() {}

    enum JobStatus {
        Open,
        InProgress,
        Completed,
        Cancelled
    }

    struct Job {
        address client;
        address worker;
        uint budget;
        JobStatus status;
        uint createdAt;
        uint completedAt;
    }

    uint public jobCount;
    mapping(uint => Job) public jobs;

    event JobCreated(uint indexed jobId, address indexed client, uint budget);
    event JobAccepted(uint indexed jobId, address indexed worker);
    event JobCompleted(uint indexed jobId);
    event PaymentReleased(
        uint indexed jobId,
        address indexed worker,
        uint amount
    );

    function createJob() external payable {
        require(msg.value > 0, "Budget must be greater than 0");
        jobCount++;
        jobs[jobCount] = Job({
            client: msg.sender,
            worker: address(0),
            budget: msg.value,
            status: JobStatus.Open,
            createdAt: block.timestamp,
            completedAt: 0
        });
        emit JobCreated(jobCount, msg.sender, msg.value);
    }

    function hireFreelancer(uint _jobId, address _worker) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Open, "Job is not open");
        require(msg.sender == job.client, "Only client can hire");
        job.worker = _worker;
        job.status = JobStatus.InProgress;
        emit JobAccepted(_jobId, _worker);
    }

    function submitWork(uint _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.InProgress, "Job is not in progress");
        require(msg.sender == job.worker, "Only worker can submit work");
        job.status = JobStatus.Completed;
        job.completedAt = block.timestamp;
        emit JobCompleted(_jobId);
    }

    function releasePayment(uint _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Completed, "Job is not yet completed");
        require(msg.sender == job.client, "Only client can release payment");
        (bool success, ) = payable(job.worker).call{value: job.budget}("");
        require(success);
        emit PaymentReleased(_jobId, job.worker, job.budget);
    }
}
