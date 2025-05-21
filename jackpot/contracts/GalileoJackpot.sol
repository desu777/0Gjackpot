// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

// Import history contract interface
interface IGalileoJackpotHistory {
    function recordWinner(uint256 roundId, address winner, uint256 winningTicketId, uint256 prizeAmount) external;
}

/**
 * @title GalileoJackpot
 * @dev Lottery system on Galileo testnet
 */
contract GalileoJackpot is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Round structure
    struct Round {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 totalPool;
        address winner;
        uint256 winningTicketId;
        bool completed;
    }
    
    // Ticket structure
    struct Ticket {
        uint256 id;
        address owner;
        uint256 roundId;
        uint256 timestamp;
    }
    
    // Minimum deposit
    uint256 public constant MIN_DEPOSIT = 0.01 ether;
    
    // Round duration (2 minutes)
    uint256 public constant ROUND_DURATION = 2 minutes;
    
    // Owner fee percentage (5%)
    uint256 public constant OWNER_FEE_PERCENT = 5;
    
    // Current round ID
    uint256 public currentRoundId = 1;
    
    // Ticket counter
    uint256 public ticketCounter = 0;
    
    // Mapping of rounds
    mapping(uint256 => Round) public rounds;
    
    // Mapping of tickets
    mapping(uint256 => Ticket) public tickets;
    
    // Mapping of tickets in a round
    mapping(uint256 => uint256[]) public roundTickets;
    
    // Mapping of user tickets
    mapping(address => uint256[]) public userTickets;
    
    // Treasury address (optional)
    address public treasury;
    
    // History contract address
    address public historyContract;
    
    // Events
    event TicketPurchased(address indexed buyer, uint256 ticketId, uint256 roundId, uint256 timestamp);
    event RoundStarted(uint256 indexed roundId, uint256 startTime, uint256 endTime);
    event RoundCompleted(uint256 indexed roundId, address winner, uint256 winningTicketId, uint256 prize);
    event OwnerFeeCollected(uint256 indexed roundId, address treasury, uint256 amount);
    event HistoryContractUpdated(address indexed historyContract);
    
    // Custom errors
    error InsufficientDeposit();
    error RoundAlreadyCompleted();
    error RoundNotStarted();
    error RoundNotFinished();
    error NotEnoughTickets();
    error InvalidAddress();
    error TransferFailed();
    error ZeroRange();
    
    constructor() Ownable(msg.sender) {
        // Initialize first round
        rounds[currentRoundId] = Round({
            id: currentRoundId,
            startTime: 0,
            endTime: 0,
            totalPool: 0,
            winner: address(0),
            winningTicketId: 0,
            completed: false
        });
        
        // Set treasury (can be changed later)
        treasury = owner();
    }
    
    /**
     * @dev Set history contract address
     * @param _historyContract Address of the history contract
     */
    function setHistoryContract(address _historyContract) external onlyOwner {
        if (_historyContract == address(0)) revert InvalidAddress();
        historyContract = _historyContract;
        emit HistoryContractUpdated(_historyContract);
    }
    
    /**
     * @dev Buy tickets with native tokens
     */
    function buyTickets() external payable nonReentrant {
        if (msg.value < MIN_DEPOSIT) revert InsufficientDeposit();
        if (rounds[currentRoundId].completed) revert RoundAlreadyCompleted();
        
        // Calculate number of tickets
        uint256 numTickets = msg.value / MIN_DEPOSIT;
        
        // Buy tickets
        for (uint256 i = 0; i < numTickets; i++) {
            // Increment ticket counter
            ticketCounter++;
            
            // Create new ticket
            tickets[ticketCounter] = Ticket({
                id: ticketCounter,
                owner: msg.sender,
                roundId: currentRoundId,
                timestamp: block.timestamp
            });
            
            // Add ticket to round
            roundTickets[currentRoundId].push(ticketCounter);
            
            // Add ticket to user
            userTickets[msg.sender].push(ticketCounter);
            
            emit TicketPurchased(msg.sender, ticketCounter, currentRoundId, block.timestamp);
        }
        
        // Update pool
        rounds[currentRoundId].totalPool += msg.value;
        
        // If there are at least two players and round is not started yet
        if (roundTickets[currentRoundId].length >= 2 && rounds[currentRoundId].startTime == 0) {
            // Start round
            rounds[currentRoundId].startTime = block.timestamp;
            rounds[currentRoundId].endTime = block.timestamp + ROUND_DURATION;
            
            emit RoundStarted(currentRoundId, rounds[currentRoundId].startTime, rounds[currentRoundId].endTime);
        }
    }
    
    /**
     * @dev Complete round and select winner
     */
    function completeRound() external nonReentrant {
        Round storage round = rounds[currentRoundId];
        
        if (round.completed) revert RoundAlreadyCompleted();
        if (round.startTime == 0) revert RoundNotStarted();
        if (block.timestamp < round.endTime) revert RoundNotFinished();
        if (roundTickets[currentRoundId].length < 2) revert NotEnoughTickets();
        
        // Mark round as completed
        round.completed = true;
        
        // Select winning ticket
        uint256 ticketIndex = _pseudoRandomNumber(roundTickets[currentRoundId].length);
        uint256 winningTicketId = roundTickets[currentRoundId][ticketIndex];
        address winner = tickets[winningTicketId].owner;
        
        // Update round data
        round.winner = winner;
        round.winningTicketId = winningTicketId;
        
        // Calculate owner fee (5% of the pool)
        uint256 ownerFee = (round.totalPool * OWNER_FEE_PERCENT) / 100;
        
        // Calculate prize amount (95% of the pool)
        uint256 prizeAmount = round.totalPool - ownerFee;
        
        // Record winner in history contract if available
        if (historyContract != address(0)) {
            IGalileoJackpotHistory(historyContract).recordWinner(
                round.id,
                winner,
                winningTicketId,
                prizeAmount
            );
        }
        
        // Prepare new round
        currentRoundId++;
        rounds[currentRoundId] = Round({
            id: currentRoundId,
            startTime: 0,
            endTime: 0,
            totalPool: 0,
            winner: address(0),
            winningTicketId: 0,
            completed: false
        });
        
        // Send fee to treasury/owner
        (bool feeSuccess, ) = treasury.call{value: ownerFee}("");
        if (!feeSuccess) revert TransferFailed();
        
        // Send prize to winner
        (bool success, ) = winner.call{value: prizeAmount}("");
        if (!success) revert TransferFailed();
        
        emit OwnerFeeCollected(round.id, treasury, ownerFee);
        emit RoundCompleted(round.id, winner, winningTicketId, prizeAmount);
    }
    
    /**
     * @dev Generate pseudo-random number between 0 and max-1
     * @param max Upper bound (exclusive)
     * @return Pseudo-random number
     */
    function _pseudoRandomNumber(uint256 max) internal view returns (uint256) {
        if (max == 0) revert ZeroRange();
        
        // In a production environment, Chainlink VRF is recommended
        // This method is vulnerable to manipulation by miners!
        uint256 randomNumber = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    blockhash(block.number - 1),
                    msg.sender
                )
            )
        );
        
        return randomNumber % max;
    }
    
    /**
     * @dev Get all tickets of a user
     * @param user User address
     * @return List of ticket IDs
     */
    function getUserTickets(address user) external view returns (uint256[] memory) {
        return userTickets[user];
    }
    
    /**
     * @dev Get all tickets in a round
     * @param roundId Round ID
     * @return List of ticket IDs
     */
    function getRoundTickets(uint256 roundId) external view returns (uint256[] memory) {
        return roundTickets[roundId];
    }
    
    /**
     * @dev Get participants and their ticket counts for a specific round
     * @param roundId Round ID
     * @return participants Array of participant addresses
     * @return ticketCounts Array of ticket counts corresponding to participants
     */
    function getRoundParticipantsWithCounts(uint256 roundId) external view returns (address[] memory participants, uint256[] memory ticketCounts) {
        uint256[] memory ticketIds = roundTickets[roundId];
        
        if (ticketIds.length == 0) {
            return (new address[](0), new uint256[](0));
        }
        
        // First pass: count unique addresses
        uint256 maxUniqueAddresses = ticketIds.length;
        address[] memory tempAddresses = new address[](maxUniqueAddresses);
        uint256[] memory tempCounts = new uint256[](maxUniqueAddresses);
        uint256 uniqueCount = 0;
        
        for (uint256 i = 0; i < ticketIds.length; i++) {
            address owner = tickets[ticketIds[i]].owner;
            bool found = false;
            
            // Check if we've already seen this address
            for (uint256 j = 0; j < uniqueCount; j++) {
                if (tempAddresses[j] == owner) {
                    tempCounts[j]++;
                    found = true;
                    break;
                }
            }
            
            // If not found, add it to our arrays
            if (!found) {
                tempAddresses[uniqueCount] = owner;
                tempCounts[uniqueCount] = 1;
                uniqueCount++;
            }
        }
        
        // Create result arrays with exact size
        participants = new address[](uniqueCount);
        ticketCounts = new uint256[](uniqueCount);
        
        // Copy data to properly sized arrays
        for (uint256 i = 0; i < uniqueCount; i++) {
            participants[i] = tempAddresses[i];
            ticketCounts[i] = tempCounts[i];
        }
        
        return (participants, ticketCounts);
    }
    
    /**
     * @dev Get current round information
     * @return id Round ID
     * @return startTime Start time
     * @return endTime End time
     * @return totalPool Total pool
     * @return numTickets Number of tickets
     * @return isActive Whether the round is active
     * @return timeLeft Time left in seconds
     */
    function getCurrentRoundInfo() external view returns (
        uint256 id,
        uint256 startTime,
        uint256 endTime,
        uint256 totalPool,
        uint256 numTickets,
        bool isActive,
        uint256 timeLeft
    ) {
        Round storage round = rounds[currentRoundId];
        
        bool active = round.startTime > 0 && !round.completed;
        uint256 remaining = 0;
        
        if (active && block.timestamp < round.endTime) {
            remaining = round.endTime - block.timestamp;
        }
        
        return (
            round.id,
            round.startTime,
            round.endTime,
            round.totalPool,
            roundTickets[currentRoundId].length,
            active,
            remaining
        );
    }
    
    /**
     * @dev Get round history
     * @param limit Maximum number of rounds to retrieve
     * @return List of completed rounds
     */
    function getRoundHistory(uint256 limit) external view returns (Round[] memory) {
        // Determine number of completed rounds
        uint256 completedRounds = 0;
        for (uint256 i = 1; i < currentRoundId; i++) {
            if (rounds[i].completed) {
                completedRounds++;
            }
        }
        
        // Limit the number of rounds
        uint256 resultLimit = Math.min(limit, completedRounds);
        Round[] memory result = new Round[](resultLimit);
        
        // Get rounds from newest
        uint256 resultIndex = 0;
        for (uint256 i = currentRoundId - 1; i > 0 && resultIndex < resultLimit; i--) {
            if (rounds[i].completed) {
                result[resultIndex] = rounds[i];
                resultIndex++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Set treasury address
     * @param _treasury New treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert InvalidAddress();
        treasury = _treasury;
    }
    
    /**
     * @dev For testing only - function to manually start round
     */
    function startRoundManually() external onlyOwner {
        if (rounds[currentRoundId].startTime != 0) revert RoundAlreadyCompleted();
        if (roundTickets[currentRoundId].length < 2) revert NotEnoughTickets();
        
        rounds[currentRoundId].startTime = block.timestamp;
        rounds[currentRoundId].endTime = block.timestamp + ROUND_DURATION;
        
        emit RoundStarted(currentRoundId, rounds[currentRoundId].startTime, rounds[currentRoundId].endTime);
    }
    
    /**
     * @dev Emergency round completion (owner only)
     */
    function emergencyCompleteRound() external onlyOwner {
        Round storage round = rounds[currentRoundId];
        
        if (round.completed) revert RoundAlreadyCompleted();
        if (round.startTime == 0) revert RoundNotStarted();
        if (roundTickets[currentRoundId].length < 2) revert NotEnoughTickets();
        
        // Mark round as completed
        round.completed = true;
        
        // Select winning ticket
        uint256 ticketIndex = _pseudoRandomNumber(roundTickets[currentRoundId].length);
        uint256 winningTicketId = roundTickets[currentRoundId][ticketIndex];
        address winner = tickets[winningTicketId].owner;
        
        // Update round data
        round.winner = winner;
        round.winningTicketId = winningTicketId;
        
        // Calculate owner fee (5% of the pool)
        uint256 ownerFee = (round.totalPool * OWNER_FEE_PERCENT) / 100;
        
        // Calculate prize amount (95% of the pool)
        uint256 prizeAmount = round.totalPool - ownerFee;
        
        // Record winner in history contract if available
        if (historyContract != address(0)) {
            IGalileoJackpotHistory(historyContract).recordWinner(
                round.id,
                winner,
                winningTicketId,
                prizeAmount
            );
        }
        
        // Prepare new round
        currentRoundId++;
        rounds[currentRoundId] = Round({
            id: currentRoundId,
            startTime: 0,
            endTime: 0,
            totalPool: 0,
            winner: address(0),
            winningTicketId: 0,
            completed: false
        });
        
        // Send fee to treasury/owner
        (bool feeSuccess, ) = treasury.call{value: ownerFee}("");
        if (!feeSuccess) revert TransferFailed();
        
        // Send prize to winner
        (bool success, ) = winner.call{value: prizeAmount}("");
        if (!success) revert TransferFailed();
        
        emit OwnerFeeCollected(round.id, treasury, ownerFee);
        emit RoundCompleted(round.id, winner, winningTicketId, prizeAmount);
    }
}