'use client';
import React from 'react'
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../context/WalletContext";
import abi from "./abi.json";
import styles from "./styles/allTweets.module.scss";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const Page = () => {
    const { account } = useWallet();
    const router = useRouter();
    const [tweets, setTweets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userProfiles, setUserProfiles] = useState({});

    // Debug: Check contract address
    useEffect(() => {
        console.log("Contract Address:", contractAddress);
        if (!contractAddress || contractAddress === 'undefined') {
            console.error("⚠️ CONTRACT ADDRESS NOT SET! Please check .env.local file");
        }
    }, []);

    useEffect(() => {
        findAllTweets();
    }, []);

    const findAllTweets = async () => {
        try {
            setIsLoading(true);
            
            if (!window.ethereum) {
                alert("MetaMask is not installed. Please install MetaMask to use this dApp.");
                setIsLoading(false);
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const twitterContract = new ethers.Contract(contractAddress, abi, provider);

            const allTweets = await twitterContract.getAllTweets();
            console.log("✅ All tweets fetched successfully:", allTweets);
            
            // Convert tweets to readable format
            const formattedTweets = allTweets
                .filter(tweet => !tweet.deleted) // Filter out deleted tweets
                .map(tweet => ({
                    id: tweet.id.toString(),
                    author: tweet.author,
                    content: tweet.content,
                    timestamp: new Date(Number(tweet.timestamp) * 1000),
                    likeCount: tweet.likeCount.toString(),
                    deleted: tweet.deleted
                }));
            
            // Sort by newest first
            formattedTweets.sort((a, b) => b.timestamp - a.timestamp);
            
            setTweets(formattedTweets);
            
            // Fetch author profiles
            await fetchAuthorProfiles(formattedTweets, provider, twitterContract);
            
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching all tweets:", error);
            alert("Failed to fetch tweets. Please try again.");
            setIsLoading(false);
        }
    };

    const fetchAuthorProfiles = async (tweets, provider, contract) => {
        const profiles = {};
        const uniqueAuthors = [...new Set(tweets.map(t => t.author))];
        
        for (const author of uniqueAuthors) {
            try {
                const profileData = await contract.getProfile(author);
                profiles[author] = {
                    name: profileData[1] || `User ${author.slice(0, 6)}`,
                    image: profileData[3]
                };
            } catch (error) {
                // If profile doesn't exist, use default
                profiles[author] = {
                    name: `User ${author.slice(0, 6)}`,
                    image: ""
                };
            }
        }
        
        setUserProfiles(profiles);
    };

    const formatTimestamp = (date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleAuthorClick = (authorAddress) => {
        // Navigate to author's profile or tweet page
        console.log("View author profile:", authorAddress);
        // You can add navigation logic here if needed
    };

    if (!account) {
        return (
            <div className={styles.container}>
                <div className={styles.connectPrompt}>
                    <h2>Connect Your Wallet</h2>
                    <p>Please connect your wallet from the header to view the tweet feed</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.feedContainer}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Tweet Feed</h1>
                    <div className={styles.headerActions}>
                        <button 
                            onClick={() => findAllTweets()} 
                            className={styles.refreshButton}
                            disabled={isLoading}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={isLoading ? styles.spinning : ''}
                            >
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <polyline points="1 20 1 14 7 14"></polyline>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            Refresh
                        </button>
                        <button 
                            onClick={() => router.push('/createTweet')} 
                            className={styles.createButton}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            New Tweet
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Loading tweets from the blockchain...</p>
                    </div>
                ) : tweets.length === 0 ? (
                    <div className={styles.emptyState}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                        </svg>
                        <h3>No tweets yet</h3>
                        <p>Be the first to share your thoughts on the blockchain!</p>
                        <button 
                            onClick={() => router.push('/createTweet')} 
                            className={styles.emptyButton}
                        >
                            Create First Tweet
                        </button>
                    </div>
                ) : (
                    <div className={styles.tweetsGrid}>
                        {tweets.map((tweet) => (
                            <div key={tweet.id} className={styles.tweetCard}>
                                <div className={styles.tweetHeader}>
                                    <div 
                                        className={styles.authorInfo}
                                        onClick={() => handleAuthorClick(tweet.author)}
                                    >
                                        <div className={styles.avatar}>
                                            {userProfiles[tweet.author]?.image ? (
                                                <img 
                                                    src={userProfiles[tweet.author].image} 
                                                    alt={userProfiles[tweet.author].name}
                                                />
                                            ) : (
                                                tweet.author.slice(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <div className={styles.authorDetails}>
                                            <span className={styles.authorName}>
                                                {userProfiles[tweet.author]?.name || 'Loading...'}
                                            </span>
                                            <span className={styles.authorAddress}>
                                                {tweet.author.slice(0, 6)}...{tweet.author.slice(-4)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <span className={styles.timestamp}>
                                        {formatTimestamp(tweet.timestamp)}
                                    </span>
                                </div>

                                <div className={styles.tweetContent}>
                                    <p>{tweet.content}</p>
                                </div>

                                <div className={styles.tweetFooter}>
                                    <div className={styles.likeCount}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill={tweet.author === account ? "#e0245e" : "none"}
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                        <span>{tweet.likeCount}</span>
                                    </div>
                                    
                                    <div className={styles.tweetMeta}>
                                        <span className={styles.tweetId}>ID: {tweet.id}</span>
                                        {tweet.author === account && (
                                            <span className={styles.ownTweet}>Your Tweet</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;
