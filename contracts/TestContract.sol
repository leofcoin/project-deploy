// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;
import './../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol';
import './TestLibrary.sol';

contract TestContract is ERC20 {
  address internal _owner;
  constructor(address owner_) ERC20('TCT', 'TCT') {
    _owner = owner_;
    TestLibrary.up();
  }
}
