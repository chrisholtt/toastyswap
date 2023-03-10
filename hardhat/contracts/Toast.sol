// SPDX-License-Identifier: MIT LICENSE

pragma solidity ^0.8.17;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract Toast is ERC20, ERC20Burnable, Ownable {

  using SafeMath for uint256;

  mapping(address => uint256) private _balances;
  mapping(address => bool) public controllers;
  
  uint256 private _totalSupply;
  uint256 private MAXSUP = 0;
  uint256 constant MAXIMUMSUPPLY = 200000000*10*18;



  constructor() ERC20("Toast", "TOAST") { 
    // _mint(msg.sender, 1000000 * 10 * 18);
  }

  function mint(address to, uint256 amount) external {
    require(controllers[msg.sender], "Only controllers can mint");
    require((amount + MAXSUP) <= MAXIMUMSUPPLY, "Maximum supply has been reached");
    _totalSupply = _totalSupply.add(amount);
    MAXSUP = MAXSUP.add(amount);
    _balances[to] = _balances[to].add(amount);
    _mint(to, amount);
  }

  function burnFrom(address account, uint256 amount) public override {
      if (controllers[msg.sender]) {
          _burn(account, amount);
      }
      else {
          super.burnFrom(account, amount);
      }
  }

  function addController(address controller) external onlyOwner {
    controllers[controller] = true;
  }

  function removeController(address controller) external onlyOwner {
    controllers[controller] = false;
  }

  function getTotalSupply() public view returns (uint256) {
    return _totalSupply;
  }

  function getMaxSupply() public pure returns (uint256) {
    return MAXIMUMSUPPLY;
  }
}