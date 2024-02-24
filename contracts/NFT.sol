// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import '@openzeppelin/contracts/access/Ownable.sol';

contract NFT is ERC721URIStorage,ERC721Enumerable, Ownable {
    uint public mintPrice;
    uint private nextTokenId;
    // uint public totalSupply;
    // uint public maxSupply;
    // uint public maxPerWallet;
    bool public isPublicMintEnabled;
    mapping(address => uint) public walletMints;

    constructor(string memory _name, string memory _symbol, uint _mintPrice) payable ERC721(_name, _symbol) Ownable(msg.sender) {
        mintPrice = _mintPrice;
        // totalSupply = 0;
        // maxSupply = _maxSupply;
        // maxPerWallet = 1;
    }

    function setIsPublicMintEnabled(bool _isPublicMintEnabled) external onlyOwner {
        isPublicMintEnabled = _isPublicMintEnabled;
    }

    function withdraw(address _address) external onlyOwner {
        (bool success, ) = payable(_address).call{value: address(this).balance}('');
        require(success, 'Withdraw failed');
    }

    function mint(string calldata _uri) public payable {
        require(isPublicMintEnabled, "Public minting not enabled");
        require(msg.value == mintPrice, "Wrong mint value");
        // require(totalSupply <= maxSupply, "Sold out");
        // require(walletMints[msg.sender] < maxPerWallet, "Exceed max quantity");

        uint newTokenId = nextTokenId++;
        walletMints[msg.sender]++;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _uri);
    }

    // required overrides
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function burn(uint256 tokenId, uint mintAmount) public {
        // Setting an "auth" arguments enables the `_isAuthorized` check which verifies that the token exists
        // (from != 0). Therefore, it is not needed to verify that the return value is not 0 here.
        _update(address(0), tokenId, _msgSender());

        payable(msg.sender).transfer(mintAmount);
    }
}
