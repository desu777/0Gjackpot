// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GalileoJackpotHistory
 * @dev Contract to store the history of jackpot winners
 */
contract GalileoJackpotHistory is Ownable {
    // Winner data structure
    struct WinnerInfo {
        uint256 roundId;
        address winner;
        uint256 winningTicketId;
        uint256 prizeAmount;
        uint256 timestamp;
    }
    
    // Array of all winners
    WinnerInfo[] public winners;
    
    // Mapping from round ID to winner info index
    mapping(uint256 => uint256) public roundToWinnerIndex;
    
    // Mapping from winner address to their winning rounds
    mapping(address => uint256[]) public winnerRounds;
    
    // Event for new winner record
    event WinnerRecorded(uint256 indexed roundId, address indexed winner, uint256 winningTicketId, uint256 prizeAmount);
    
    // Only main jackpot contract can add winners
    address public jackpotContract;
    
    // Error for unauthorized access
    error UnauthorizedAccess();
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Set the main jackpot contract address
     * @param _jackpotContract Address of the main jackpot contract
     */
    function setJackpotContract(address _jackpotContract) external onlyOwner {
        jackpotContract = _jackpotContract;
    }
    
    /**
     * @dev Record a new winner (can only be called by main jackpot contract)
     * @param roundId Round ID
     * @param winner Winner address
     * @param winningTicketId Winning ticket ID
     * @param prizeAmount Prize amount
     */
    function recordWinner(
        uint256 roundId,
        address winner,
        uint256 winningTicketId,
        uint256 prizeAmount
    ) external {
        // Only main jackpot contract can call this
        if (msg.sender != jackpotContract && msg.sender != owner()) revert UnauthorizedAccess();
        
        // Create winner info
        WinnerInfo memory newWinner = WinnerInfo({
            roundId: roundId,
            winner: winner,
            winningTicketId: winningTicketId,
            prizeAmount: prizeAmount,
            timestamp: block.timestamp
        });
        
        // Add to winners array
        winners.push(newWinner);
        
        // Update mappings
        roundToWinnerIndex[roundId] = winners.length - 1;
        winnerRounds[winner].push(roundId);
        
        // Emit event
        emit WinnerRecorded(roundId, winner, winningTicketId, prizeAmount);
    }
    
    /**
     * @dev Get the total number of recorded winners
     * @return Total winner count
     */
    function getTotalWinners() external view returns (uint256) {
        return winners.length;
    }
    
    /**
     * @dev Get winners with pagination
     * @param offset Starting index
     * @param limit Maximum number of winners to return
     * @return Array of winner info structures
     */
    function getWinners(uint256 offset, uint256 limit) external view returns (WinnerInfo[] memory) {
        uint256 totalWinners = winners.length;
        
        // Validate parameters
        if (offset >= totalWinners) {
            return new WinnerInfo[](0);
        }
        
        // Calculate actual limit
        uint256 actualLimit = (offset + limit > totalWinners) ? (totalWinners - offset) : limit;
        
        // Create result array
        WinnerInfo[] memory result = new WinnerInfo[](actualLimit);
        
        // Fill result array
        for (uint256 i = 0; i < actualLimit; i++) {
            result[i] = winners[totalWinners - 1 - (offset + i)]; // Return from newest to oldest
        }
        
        return result;
    }
    
    /**
     * @dev Get all rounds won by a specific address
     * @param winnerAddress Winner address
     * @return Array of round IDs
     */
    function getWinnerRounds(address winnerAddress) external view returns (uint256[] memory) {
        return winnerRounds[winnerAddress];
    }
    
    /**
     * @dev Check if an address has won any rounds
     * @param winnerAddress Winner address
     * @return True if the address has won any rounds
     */
    function isWinner(address winnerAddress) external view returns (bool) {
        return winnerRounds[winnerAddress].length > 0;
    }
} 