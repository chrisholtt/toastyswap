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
        address owner;
    }

    mapping(address => Stake) public vault;

    struct Game {
        uint256 game;
        uint256 tvl;
        address winner;
        uint256 startAt;
        uint256 endAt;
        mapping(address => Stake) vault;
        address payable[] players;
        mapping (address => bool) isInGame;
    }

    mapping(uint256 => Game) public games;

    enum GameState{ START, ACTIVE, ENDED }

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
        Stake memory _stake = Stake({
            amount: vault[msg.sender].amount += amount,
            stakedAt: block.timestamp,
            owner: msg.sender
        });
        vault[msg.sender] = _stake;

        // First player starts each game
        if(games[game].players.length == 0) {
        games[game].startAt = block.timestamp;
        games[game].game = game;
        }

        games[game].tvl += amount;
        games[game].vault[address(msg.sender)] = _stake;

        // Push to player array if not exists
        if (!games[game].isInGame[msg.sender]) {
            games[game].players.push(payable(msg.sender));
        }
        games[game].isInGame[msg.sender] = true;

        emit Staked(msg.sender, amount);
        bool success = s_stakingToken.transferFrom(msg.sender, address(this), amount);
        if (!success) {
            revert TransferFailed();
        }

        // If game has been live for 1 hour then pick winner 
        if (block.timestamp - games[game].startAt >= 3600) {
            pickWinner(address(msg.sender));
        }
    }

    function pickWinner(address _sender) internal {
        require(block.timestamp - games[game].startAt >= 3600, "Current game needs to run for 1 hour");
        // Mint toast for payout
        uint256 reward = s_totalSupply * ((((block.timestamp - games[game].startAt) / secondsInAYear) * 1e18 * APY) / 100);
        s_stakingToken.mint(address(this), reward);

        // Get random number
        uint randomNumber = uint(keccak256(abi.encodePacked(_sender, block.timestamp))) % games[game].players.length;
        address winner = games[game].players[randomNumber];
        bool success = s_stakingToken.transfer(winner, reward);
        if (!success) {
            revert TransferFailed();
        }

        games[game].endAt = block.timestamp;
        games[game].winner = winner;
        game++;

    }


    /**
     * @notice Withdraw tokens from this contract
     * @param amount | How much to withdraw
     */
    function withdraw(uint256 amount) external updateReward(msg.sender) nonReentrant {
        s_totalSupply -= amount;
        vault[msg.sender].amount -= amount;

        games[game].tvl -= amount;
        games[game].vault[msg.sender] = vault[msg.sender];
        games[game].isInGame[msg.sender] = false;
        
        // This function moves the desired element to the end the pops it.
        for(uint256 i = 0; i < games[game].players.length; i++) {
            if(games[game].players[i] != msg.sender){
                games[game].players[i] = games[game].players[games[game].players.length - 1];
                games[game].players.pop();
            }
        }

        emit WithdrewStake(msg.sender, amount);
        bool success = s_stakingToken.transfer(msg.sender, amount);
        if (!success) {
            revert TransferFailed();
        }
    }

    /**
     * @notice User claims their tokens
     */

    // function claimReward() external updateReward(msg.sender) nonReentrant {
    //     uint256 reward = vault[msg.sender].rewards;
    //     // Been fucking around with this
    //     reward = reward / 1e18;
    //     //
    //     vault[msg.sender].rewards = 0;
    //     emit RewardsClaimed(msg.sender, reward);
    //     s_stakingToken.mint(address(this), reward);
    //     bool success = s_stakingToken.transfer(msg.sender, reward);
    //     if (!success) {
    //         revert TransferFailed();
    //     }
    // }

    /********************/
    /* Modifiers Functions */
    /********************/
    modifier updateReward(address account) {
        s_lastUpdateTime = block.timestamp;
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

    function getTVL() public view returns(uint256) {
        return s_totalSupply;
    }

    function getGameNumber() public view returns(uint256) {
        return game;
    }

    function getPlayers(uint256 _game) public view returns(address payable[] memory _players) {
        return games[_game].players;
    }

    function getPlayersStakeInGame(uint256 _game, address _player) public view returns(Stake memory players) {
        return games[_game].vault[_player];
    }
}