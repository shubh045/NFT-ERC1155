"use client";

import { BaseContract, ethers } from "ethers";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NFT from "./assets/abi/NFT.json";
import nft from "./assets/images/nft.jpg";
import styles from "./page.module.css";
import { SuperCarERC1155__factory, SuperCarERC1155 } from "../typechain-types";

export default function Home(): JSX.Element {
  const [account, setAccount] = useState<string>("");
  const [contract, setContract] = useState<SuperCarERC1155 | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [burnLoading, setBurnLoading] = useState<boolean>(false);
  const [connect, setConnect] = useState<string>("");
  const [mintPrice, setMintPrice] = useState<number>(0);
  const [burnPrice, setBurnPrice] = useState<number>(0);
  const [nftBalance, setNftBalance] = useState<number>(0);
  const contractAddress: string = "0x80f7f95Ef489C181656C6c9999402c59Fd1e4E46";

  useEffect(() => {
    setConnect(localStorage.getItem("address"));
  }, []);

  useEffect(() => {
    window.ethereum.on("accountsChanged", async () => {
      const provider: ethers.BrowserProvider = new ethers.BrowserProvider(
        window.ethereum
      );
      try {
        const signer: ethers.JsonRpcSigner = await provider.getSigner();
        const address: string = await signer.getAddress();
        setAccount(address);
        localStorage.setItem("address", address);
        setConnect(localStorage.getItem("address"));
      } catch (error) {
        const accounts = await provider.listAccounts();
        if (accounts.length == 0) {
          localStorage.removeItem("address");
          setConnect("");
          toast("Account not connected!");
          return;
        }
        const error1 = error as Error;
        const errorMessage: string = error1.message.split("(")[0];
        toast(errorMessage);
      }
    });
  }, []);

  useEffect(() => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const setContractVal = async () => {
      try {
        const signer: ethers.JsonRpcSigner = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          NFT.abi,
          signer
        )as BaseContract as SuperCarERC1155;;
        const address: string = await signer.getAddress();
        const NFTContract = SuperCarERC1155__factory.connect(
          contractAddress,
          provider
        );

        setAccount(address);
        setContract(contract);

        if (contract) {
          const cMintPrice: number = Number(await contract.currentPrice());
          const nftB: number = Number(
            await contract.balanceOf(await signer.getAddress(), 0)
          );
          setMintPrice(Number(ethers.formatEther(cMintPrice.toString())));
          setBurnPrice(Number(localStorage.getItem("burnPrice")));
          setNftBalance(nftB);
        }
      } catch (error) {
        const accounts: ethers.JsonRpcSigner[] = await provider.listAccounts();
        if (accounts.length == 0) {
          localStorage.removeItem("address");
          setConnect("");
          // toast("Account not connected!");
          return;
        }
        const error1 = error as Error;
        const errorMessage: string = error1.message.split("(")[0];
        toast(errorMessage);
      }
    };
    provider && setContractVal();
  }, [connect]);

  const connectWallet = async (): Promise<void> => {
    try {
      const provider: ethers.BrowserProvider = new ethers.BrowserProvider(
        window.ethereum
      );
      if (!connect) {
        const accounts: Promise<string[]> = await provider.send(
          "eth_requestAccounts",
          []
        );
        if (accounts) {
          const signer: ethers.JsonRpcSigner = await provider.getSigner();
          const address: string = await signer.getAddress();
          setAccount(address);
          localStorage.setItem("address", address);

          const contract = new ethers.Contract(
            contractAddress,
            NFT.abi,
            signer
          ) as BaseContract as SuperCarERC1155;
          const NFTContract = SuperCarERC1155__factory.connect(
            contractAddress,
            provider,
          );
          setContract(contract);
          setConnect(localStorage.getItem("address"));
        }
      }
    } catch (error) {
      const error1 = error as Error;
      const errorMessage: string = error1.message.split("(")[0];
      toast(errorMessage);
    }
  };

  const mintNFT = async (): Promise<void> => {
    const provider: ethers.BrowserProvider = new ethers.BrowserProvider(
      window.ethereum
    );

    const { chainId } = await provider.getNetwork();

    if (Number(chainId) != 11155111) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: "0xAA36A7",
          },
        ],
      });
    }
    // const tokenURI:string =
    //   "ipfs://bafkreiebuhhy4e2p23nquu3llaftgvpy6cycpdfpuld7ccmfnksrzt2gom";

    setLoading(true);
    try {
      const prevMintPrice: number = Number(await contract.currentPrice());
      const options = { value: prevMintPrice.toString() };
      const mint: ethers.ContractTransactionResponse = await contract.mint(
        0,
        1,
        options
      );
      await mint.wait();
      const currentMintPrice: number = Number(await contract.currentPrice());
      setMintPrice(Number(ethers.formatEther(currentMintPrice.toString())));
      setBurnPrice(Number(ethers.formatEther(prevMintPrice).toString()));
      localStorage.setItem(
        "burnPrice",
        ethers.formatEther(prevMintPrice.toString())
      );
      const nftB: number = Number(await contract.balanceOf(account, 0));
      setNftBalance(nftB);
      toast("Mint Successful");
    } catch (error) {
      const error1 = error as Error;
      const errorMessage: string = error1.message.split("(")[0];
      toast(errorMessage);
    }
    setLoading(false);
  };

  const burnNFT = async (): Promise<void> => {
    try {
      setBurnLoading(true);
      const burning = await contract.burnToken(0, 1);
      await burning.wait();
      const currentMintPrice: number = Number(await contract.currentPrice());
      setMintPrice(Number(ethers.formatEther(currentMintPrice).toString()));
      const totalNFt: number = Number(
        await contract["totalSupply(uint256)"](0)
      );
      const totalNFt1: number = totalNFt - 1;
      const afterBurnPrice: number = (totalNFt1 * totalNFt1) / 4000;
      setBurnPrice(afterBurnPrice);
      if (totalNFt === 1) {
        setBurnPrice(0.0001);
      }
      localStorage.setItem(
        "burnPrice",
        totalNFt === 1 ? "0.0001" : afterBurnPrice.toString()
      );
      const nftB: number = Number(await contract.balanceOf(account, 0));
      setNftBalance(nftB);
      toast("Burn complete");
    } catch (error ) {
      const error1 = error as Error;
      const errorMessage: string = error1.message.split("(")[0];
      toast(errorMessage);
    }
    setBurnLoading(false);
  };

  return (
    <>
      <ToastContainer position="top-left" />
      <div>
        <nav className={styles.navbar}>
          <h2 className={styles.heading}>MINFT1155</h2>
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
            <div
              className={connect ? styles.imageContainer : styles.imagecont1}
            >
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
