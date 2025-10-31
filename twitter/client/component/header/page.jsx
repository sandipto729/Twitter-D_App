"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../context/WalletContext";
import styles from "./styles/header.module.scss";

export default function Header() {
  const { account, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  // Toggle dropdown
  function toggleDropdown() {
    setShowDropdown(!showDropdown);
  }

  // Handle disconnect
  function handleDisconnect() {
    disconnectWallet();
    setShowDropdown(false);
  }

  // Navigate to profile
  function goToProfile() {
    setShowDropdown(false);
    router.push("/profile");
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (showDropdown && !event.target.closest(`.${styles.accountInfo}`)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h1>Twitter dApp</h1>
          <p className={styles.subtitle}>Decentralized Social Network</p>
        </div>

        <div className={styles.walletSection}>
          {!account ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className={styles.connectButton}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <div className={styles.connectedWallet}>
              <div
                className={styles.accountInfo}
                onClick={toggleDropdown}
              >
                <span className={styles.address}>
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <svg
                  className={`${styles.chevron} ${showDropdown ? styles.chevronUp : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                {showDropdown && (
                  <div className={styles.dropdown}>
                    <button onClick={goToProfile} className={styles.dropdownItem}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Profile
                    </button>
                    <button onClick={handleDisconnect} className={styles.dropdownItem}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
