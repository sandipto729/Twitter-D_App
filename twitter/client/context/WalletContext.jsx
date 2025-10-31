"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Connect wallet function
  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install MetaMask to use this dApp.");
        return;
      }

      setIsConnecting(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      setAccount(accounts[0]);
      setIsConnecting(false);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setIsConnecting(false);
      alert("Failed to connect wallet. Please try again.");
    }
  }

  // Disconnect wallet function
  function disconnectWallet() {
    setAccount(null);
  }

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return (
    <WalletContext.Provider value={{ account, isConnecting, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
