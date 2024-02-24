"use client";

import { ethers } from "ethers";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NFT from "./assets/abi/NFT.json";
import nft from "./assets/images/nft.jpg";
import styles from "./page.module.css";

export default function Home() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [burnLoading, setBurnLoading] = useState(false);
  const [connect, setConnect] = useState("");
  const [mintPrice, setMintPrice] = useState(0);
  const [burnPrice, setBurnPrice] = useState(0);
  const [nftBalance, setNftBalance] = useState(0);
  const contractAddress = "0x1E81a1616A875F5F991083E55181322Cc1c7e5f1";

  useEffect(() => {
    setConnect(localStorage.getItem("address"));
  }, []);

  useEffect(() => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    window.ethereum.on("accountsChanged", async () => {
      try {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        localStorage.setItem("address", address);
        setConnect(localStorage.getItem("address"));
      } catch (error) {
        const accounts = await provider.listAccounts();
        if (accounts.length == 0) {
          localStorage.removeItem("address");
          setConnect(false);
          toast("Account not connected!");
          return;
        }
        const errorMessage = error.message.split("(")[0];
        toast(errorMessage);
      }
    });
  }, []);

  useEffect(() => {
    const setContractVal = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, NFT.abi, signer);
        const address = await signer.getAddress();
        setAccount(address);
        setContract(contract);

        if (contract) {
          const cMintPrice = await contract.currentPrice();
          const nftB = await contract.balanceOf(await signer.getAddress(), 0);
          setMintPrice(ethers.formatEther(Number(cMintPrice).toString()));
          setBurnPrice(localStorage.getItem("burnPrice"));
          setNftBalance(Number(nftB));
        }
      } catch (error) {
        const errorMessage = error.message.split("(")[0];
        toast(errorMessage);
      }
    };
    setContractVal();
  }, [connect]);

  const connectWallet = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      if (!connect) {
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
          localStorage.setItem("address", address);

          const contract = new ethers.Contract(
            contractAddress,
            NFT.abi,
            signer
          );
          setContract(contract);
          setConnect(localStorage.getItem("address"));
        }
      }
    } catch (error) {
      const errorMessage = error.message.split("(")[0];
      toast(errorMessage);
    }
  };

  const mintNFT = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);

    const { chainId } = provider.getNetwork();

    if (chainId != 11155111) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: "0xAA36A7",
          },
        ],
      });
    }
    const tokenURI =
      "ipfs://bafkreiebuhhy4e2p23nquu3llaftgvpy6cycpdfpuld7ccmfnksrzt2gom";

    setLoading(true);
    try {
      const prevMintPrice = await contract.currentPrice();
      const options = { value: Number(prevMintPrice).toString() };
      const mint = await contract.mint(0, 1, options);
      await mint.wait();
      const currentMintPrice = await contract.currentPrice();
      setMintPrice(ethers.formatEther(Number(currentMintPrice).toString()));
      setBurnPrice(ethers.formatEther(Number(prevMintPrice).toString()));
      localStorage.setItem(
        "burnPrice",
        ethers.formatEther(Number(prevMintPrice).toString())
      );
      const nftB = await contract.balanceOf(account, 0);
      setNftBalance(Number(nftB));
      toast("Mint Successful");
    } catch (error) {
      const errorMessage = error.message.split("(")[0];
      toast(errorMessage);
    }
    setLoading(false);
  };

  const burnNFT = async () => {
    try {
      setBurnLoading(true);
      const burning = await contract.burnToken(0, 1);
      await burning.wait();
      const currentMintPrice = await contract.currentPrice();
      setMintPrice(ethers.formatEther(Number(currentMintPrice).toString()));
      const totalNFt = await contract["totalSupply(uint256)"](0);
      const totalNFt1 = Number(totalNFt) - 1;
      const afterBurnPrice = (totalNFt1 * totalNFt1) / 4000;
      setBurnPrice(afterBurnPrice);
      if (Number(totalNFt) === 1) {
        setBurnPrice(0.0001);
      }
      localStorage.setItem(
        "burnPrice",
        Number(totalNFt) === 1 ? "0.0001" : afterBurnPrice.toString()
      );
      const nftB = await contract.balanceOf(account, 0);
      setNftBalance(Number(nftB));
      toast("Burn complete");
    } catch (error) {
      const errorMessage = error.message.split("(")[0];
      toast(errorMessage);
    }
    setBurnLoading(false);
  };

  return (
    <>
      <ToastContainer position="top-left" />
      <div>
        <nav className={styles.navbar}>
          <h2 className={styles.heading}>MINFT</h2>
          {connect ? (
            <p className={styles.userAddress}>
              {`${localStorage.getItem("address").slice(0, 7)}...${localStorage
                .getItem("address")
                .slice(-5)}`}
            </p>
          ) : (
            <button className={styles.connectBtn} onClick={connectWallet}>
              Connect
            </button>
          )}
        </nav>
        <div className={styles.mintCon}>
          <div className={styles.box}>
            {connect && (
              <p className={styles.tokensp}>Token(s) Present: {nftBalance}</p>
            )}
            <div className={styles.imageContainer}>
              <Image src={nft} alt="" className={styles.image} />
            </div>
            {connect && (
              <>
                <button
                  className={styles.mintBtn}
                  onClick={mintNFT}
                  disabled={loading || burnLoading}
                >
                  {!loading && `Mint@${mintPrice}eth`}
                  {loading && (
                    <div>
                      Minting <p className={styles.spinner}></p>
                    </div>
                  )}
                </button>
                {!!nftBalance && (
                  <button
                    disabled={burnLoading || loading}
                    className={styles.burnBtn}
                    onClick={burnNFT}
                  >
                    {!burnLoading && `Burn@${burnPrice}eth`}
                    {burnLoading && (
                      <div>
                        Burning <p className={styles.spinner}></p>
                      </div>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
