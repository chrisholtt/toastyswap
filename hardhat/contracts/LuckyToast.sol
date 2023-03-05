// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Toast.sol";

error TransferFailed();
error NeedsMoreThanZero();

// Call this contract toaster maybe?
contract LuckyToast is ReentrancyGuard {
    Toast public s_stakingToken;
    uint256 public s_lastUpdateTime;
    uint256 public constant secondsInAYear = 86400 * 365;
    uint256 public APY = 35;
    uint256 public game = 1;

    struct Stake {
        uint256 amount;
        uint256 stakedAt;
        uint256 rewards;
        address owner;
    }

    mapping(address => Stake) public vault;

    struct Game {
        uint256 game;
        uint256 tvl;
        address winner;
        uint256 startAt;
        uint256 endAt;
        Stake[] players;
    }

    mapping(uint256 => Game) public games;

    uint256 private s_totalSupply;

    event Staked(address indexed user, uint256 indexed amount);
    event WithdrewStake(address indexed user, uint256 indexed amount);
    event RewardsClaimed(address indexed user, uint256 indexed amount);

    constructor(Toast stakingToken) {
        s_stakingToken = stakingToken;
    }

    /**
     * @notice How much reward a user has earned
     */
    function earned(address account) public view returns (uint256) {
        return vault[account].amount * ((((block.timestamp - vault[account].stakedAt) / secondsInAYear) * 1e18 * APY) / 100);            
    }

    /**
     * @notice Deposit tokens into this contract
     * @param amount | How much to stake
     */
    function stake(uint256 amount)
        external
        updateReward(msg.sender)
        nonReentrant
        moreThanZero(amount)
    {
        s_totalSupply += amount;

        // Create instance of users stake
        vault[msg.sender] = Stake({
            amount: vault[msg.sender].amount += amount,
            stakedAt: block.timestamp,
            rewards: vault[msg.sender].rewards,
            owner: msg.sender
        });


        // Enter them into the game
        games[game] = Game({
            game: game,
            tvl: games[game].tvl += amount,
            winner: address(0x0),
            startAt: block.timestamp, // this needs fixed
            endAt: block.timestamp,
            players: games[game] += 1


        });





        emit Staked(msg.sender, amount);
        bool success = s_stakingToken.transferFrom(msg.sender, address(this), amount);
        if (!success) {
            revert TransferFailed();
        }
    }

    /**
     * @notice Withdraw tokens from this contract
     * @param amount | How much to withdraw
     */
    function withdraw(uint256 amount) external updateReward(msg.sender) nonReentrant {
        s_totalSupply -= amount;
        vault[msg.sender].amount -= amount;
        emit WithdrewStake(msg.sender, amount);
        bool success = s_stakingToken.transfer(msg.sender, amount);
        if (!success) {
            revert TransferFailed();
        }
    }

    /**
     * @notice User claims their tokens
     */
    function claimReward() external updateReward(msg.sender) nonReentrant {
        uint256 reward = vault[msg.sender].rewards;
        // Been fucking around with this
        reward = reward / 1e18;
        //
        vault[msg.sender].rewards = 0;
        emit RewardsClaimed(msg.sender, reward);
        s_stakingToken.mint(address(this), reward);
        bool success = s_stakingToken.transfer(msg.sender, reward);
        if (!success) {
            revert TransferFailed();
        }
    }

    /********************/
    /* Modifiers Functions */
    /********************/
    modifier updateReward(address account) {
        s_lastUpdateTime = block.timestamp;
        vault[account].rewards = earned(account);
        _;
    }

    modifier moreThanZero(uint256 amount) {
        if (amount == 0) {
            revert NeedsMoreThanZero();
        }
        _;
    }

    /********************/
    /* Getter Functions */
    /********************/
    // Ideally, we'd have getter functions for all our s_ variables we want exposed, and set them all to private.
    // But, for the purpose of this demo, we've left them public for simplicity.

    function getStaked(address account) public view returns (uint256) {
        return vault[account].amount;
    }
}