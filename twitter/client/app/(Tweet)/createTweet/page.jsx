'use client';
import React from 'react'
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../context/WalletContext";
import abi from "./abi.json";
import styles from "./styles/createTweet.module.scss";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const MAX_TWEET_LENGTH = 280;

const Page = () => {
    const { account } = useWallet();
    const router = useRouter();
    const [tweetContent, setTweetContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [charCount, setCharCount] = useState(0);

    // Debug: Check contract address
    useEffect(() => {
        console.log("Contract Address:", contractAddress);
        if (!contractAddress || contractAddress === 'undefined') {
            console.error("⚠️ CONTRACT ADDRESS NOT SET! Please check .env.local file");
        }
    }, []);

    const handleContentChange = (e) => {
        const content = e.target.value;
        if (content.length <= MAX_TWEET_LENGTH) {
            setTweetContent(content);
            setCharCount(content.length);
        }
    };

    const tweetPost = async (e) => {
        e.preventDefault();
        
        if (!tweetContent.trim()) {
            alert("Tweet content cannot be empty!");
            return;
        }

        try {
            setIsPosting(true);
            
            if (!window.ethereum) {
                alert("MetaMask is not installed. Please install MetaMask to use this dApp.");
                setIsPosting(false);
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const twitterContract = new ethers.Contract(contractAddress, abi, signer);

            const tx = await twitterContract.createTweet(tweetContent);
            await tx.wait();
            
            console.log("✅ Tweet posted successfully:", tx);
            alert("Tweet posted successfully! 🎉");
            
            // Clear form and redirect
            setTweetContent("");
            setCharCount(0);
            setIsPosting(false);
            
            // Optionally redirect to home/feed page
            // router.push("/");
            
        } catch (error) {
            console.error("Error posting tweet:", error);
            
            if (error.code === "INSUFFICIENT_FUNDS") {
                alert("Insufficient funds! You need ETH to pay for gas fees.\n\nGet free Sepolia test ETH from:\nhttps://sepoliafaucet.com");
            } else if (error.message.includes("Tweet too long")) {
                alert("Tweet is too long! Maximum 280 characters.");
            } else {
                alert("Failed to post tweet. Please try again.\n\nError: " + error.message);
            }
            
            setIsPosting(false);
        }
    };
    
    if (!account) {
        return (
            <div className={styles.container}>
                <div className={styles.connectPrompt}>
                    <h2>Connect Your Wallet</h2>
                    <p>Please connect your wallet from the header to create tweets</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.tweetCard}>
                <h1 className={styles.title}>Create Tweet</h1>
                
                <form onSubmit={tweetPost} className={styles.tweetForm}>
                    <div className={styles.formGroup}>
                        <textarea
                            value={tweetContent}
                            onChange={handleContentChange}
                            placeholder="What's happening?"
                            className={styles.tweetInput}
                            rows="6"
                            disabled={isPosting}
                            autoFocus
                        />
                        
                        <div className={styles.tweetFooter}>
                            <div className={styles.charCounter}>
                                <span className={charCount > MAX_TWEET_LENGTH * 0.9 ? styles.warning : ''}>
                                    {charCount} / {MAX_TWEET_LENGTH}
                                </span>
                            </div>
                            
                            <button 
                                type="submit" 
                                className={styles.tweetButton}
                                disabled={isPosting || !tweetContent.trim() || charCount > MAX_TWEET_LENGTH}
                            >
                                {isPosting ? (
                                    <>
                                        <span className={styles.spinner}></span>
                                        Posting...
                                    </>
                                ) : (
                                    'Tweet'
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                <div className={styles.infoBox}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <p>Your tweet will be stored permanently on the blockchain. Gas fees apply.</p>
                </div>
            </div>
        </div>
    );
};

export default Page;
