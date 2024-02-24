// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract SuperCarERC1155 is ERC1155, Ownable, ERC1155Burnable, ERC1155Supply {
    uint256 maxSupply;
    uint256 public currentPrice;

    constructor(string memory _uri, uint256 _maxSupply)
        ERC1155(_uri)
        Ownable(msg.sender)
    {
        maxSupply = _maxSupply;
        currentPrice = 100000000000000;
    }

    function setMintPrice(uint256 _id) private {
        uint256 amount = totalSupply(_id);
        if(amount==0){
            currentPrice = 100000000000000;
            return;
        }
        currentPrice = (1000000000000000000 * amount * amount) / 4000;
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(uint256 id, uint256 mintAmount) public payable {
        require(msg.value == currentPrice * mintAmount, "Wrong amount");
        require(
            totalSupply(id) + mintAmount <= maxSupply,
            "Amount exceed total supply"
        );
        _mint(msg.sender, id, mintAmount, "");
        setMintPrice(id);
    }

    function burnToken(uint256 id, uint256 value) public {
        burn(msg.sender, id, value);
        setMintPrice(id);
        payable(msg.sender).transfer(currentPrice);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
}
