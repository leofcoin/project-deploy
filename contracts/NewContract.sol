// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;
import './TestContract.sol';

contract NewContract is TestContract {
  constructor(address owner_) TestContract(owner_) {
  }
}
