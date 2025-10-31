'use client';
import React from 'react'
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../context/WalletContext";
import abi from "./abi.json";
import styles from "./styles/userTweet.module.scss";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const Page = () => {
    const { account } = useWallet();
    const router = useRouter();
    const [tweets, setTweets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [editingTweet, setEditingTweet] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const MAX_TWEET_LENGTH = 280;

    // Debug: Check contract address
    useEffect(() => {
        console.log("Contract Address:", contractAddress);
        if (!contractAddress || contractAddress === 'undefined') {
            console.error("⚠️ CONTRACT ADDRESS NOT SET! Please check .env.local file");
        }
    }, []);

    useEffect(() => {
        if (account) {
            findUserTweets();
            fetchUserProfile();
        }
    }, [account]);

    const findUserTweets = async () => {
        try {
            setIsLoading(true);
            
            if (!window.ethereum) {
                alert("MetaMask is not installed. Please install MetaMask to use this dApp.");
                setIsLoading(false);
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const twitterContract = new ethers.Contract(contractAddress, abi, provider);

            const userTweets = await twitterContract.getUserTweets(account);
            console.log("✅ User tweets fetched successfully:", userTweets);
            
            // Convert tweets to readable format
            const formattedTweets = userTweets.map(tweet => ({
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
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching user tweets:", error);
            alert("Failed to fetch user tweets. Please try again.");
            setIsLoading(false);
        }
    };

    const fetchUserProfile = async () => {
        try {
            if (!window.ethereum) return;

            const provider = new ethers.BrowserProvider(window.ethereum);
            const twitterContract = new ethers.Contract(contractAddress, abi, provider);

            const profileData = await twitterContract.getProfile(account);
            setUserProfile({
                name: profileData[1] || `User ${account.slice(0, 6)}`,
                bio: profileData[2],
                image: profileData[3]
            });
            console.log("✅ User profile fetched:", profileData);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            // Set default profile if error
            setUserProfile({
                name: `User ${account.slice(0, 6)}`,
                bio: "",
                image: ""
            });
        }
    };

    const deleteTweet = async (tweetId) => {
        if (!confirm("Are you sure you want to delete this tweet?")) {
            return;
        }

        try {
            setIsDeleting(tweetId);
            
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const twitterContract = new ethers.Contract(contractAddress, abi, signer);

            const tx = await twitterContract.deleteTweet(tweetId);
            await tx.wait();
            
            console.log("✅ Tweet deleted successfully");
            alert("Tweet deleted successfully! 🗑️");
            
            // Refresh tweets
            await findUserTweets();
            setIsDeleting(null);
        } catch (error) {
            console.error("Error deleting tweet:", error);
            
            if (error.code === "INSUFFICIENT_FUNDS") {
                alert("Insufficient funds! You need ETH to pay for gas fees.");
            } else {
                alert("Failed to delete tweet. Please try again.\n\nError: " + error.message);
            }
            
            setIsDeleting(null);
        }
    };

    const openEditModal = (tweet) => {
        setEditingTweet(tweet);
        setEditContent(tweet.content);
    };

    const closeEditModal = () => {
        setEditingTweet(null);
        setEditContent("");
        setIsEditing(false);
    };

    const handleEditChange = (e) => {
        const value = e.target.value;
        if (value.length <= MAX_TWEET_LENGTH) {
            setEditContent(value);
        }
    };

    const saveEditedTweet = async () => {
        if (!editContent.trim()) {
            alert("Tweet content cannot be empty!");
            return;
        }

        try {
            setIsEditing(true);
            
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const twitterContract = new ethers.Contract(contractAddress, abi, signer);

            console.log("Editing tweet ID:", editingTweet.id, "with content:", editContent);
            const tx = await twitterContract.editTweet(editingTweet.id, editContent);
            
            console.log("Transaction sent, waiting for confirmation...");
            await tx.wait();
            
            console.log("✅ Tweet edited successfully");
            alert("Tweet updated successfully! ✏️");
            
            // Refresh tweets and close modal
            await findUserTweets();
            closeEditModal();
        } catch (error) {
            console.error("Error editing tweet:", error);
            
            if (error.code === "INSUFFICIENT_FUNDS") {
                alert("Insufficient funds! You need ETH to pay for gas fees.");
            } else if (error.message.includes("Not author")) {
                alert("You are not the author of this tweet!");
            } else if (error.message.includes("Deleted tweet")) {
                alert("This tweet has been deleted and cannot be edited.");
            } else {
                alert("Failed to edit tweet. Please try again.\n\nError: " + error.message);
            }
            
            setIsEditing(false);
        }
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

    if (!account) {
        return (
            <div className={styles.container}>
                <div className={styles.connectPrompt}>
                    <h2>Connect Your Wallet</h2>
                    <p>Please connect your wallet from the header to view your tweets</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.feedContainer}>
                <div className={styles.header}>
                    <h1 className={styles.title}>My Tweets</h1>
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

                {isLoading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Loading your tweets...</p>
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
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <h3>No tweets yet</h3>
                        <p>Start sharing your thoughts on the blockchain!</p>
                        <button 
                            onClick={() => router.push('/createTweet')} 
                            className={styles.emptyButton}
                        >
                            Create Your First Tweet
                        </button>
                    </div>
                ) : (
                    <div className={styles.tweetsGrid}>
                        {tweets.map((tweet) => (
                            <div key={tweet.id} className={styles.tweetCard}>
                                <div className={styles.tweetHeader}>
                                    <div className={styles.authorInfo}>
                                        <div className={styles.avatar}>
                                            {userProfile?.image ? (
                                                <img 
                                                    src={userProfile.image} 
                                                    alt={userProfile.name}
                                                />
                                            ) : (
                                                account.slice(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <div className={styles.authorDetails}>
                                            <span className={styles.authorName}>
                                                {userProfile?.name || 'Loading...'}
                                            </span>
                                            <span className={styles.authorAddress}>
                                                {account.slice(0, 6)}...{account.slice(-4)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.headerRight}>
                                        <span className={styles.timestamp}>
                                            {formatTimestamp(tweet.timestamp)}
                                        </span>
                                        <div className={styles.actionButtons}>
                                            <button
                                                onClick={() => openEditModal(tweet)}
                                                className={styles.editButton}
                                                title="Edit tweet"
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
                                                >
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => deleteTweet(tweet.id)}
                                                className={styles.deleteButton}
                                                disabled={isDeleting === tweet.id}
                                                title="Delete tweet"
                                            >
                                                {isDeleting === tweet.id ? (
                                                    <span className={styles.smallSpinner}></span>
                                                ) : (
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
                                                    >
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
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
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                        <span>{tweet.likeCount}</span>
                                    </div>
                                    
                                    <span className={styles.tweetId}>ID: {tweet.id}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingTweet && (
                <div className={styles.modalOverlay} onClick={closeEditModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Edit Tweet</h2>
                            <button onClick={closeEditModal} className={styles.closeButton}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        
                        <div className={styles.modalBody}>
                            <textarea
                                value={editContent}
                                onChange={handleEditChange}
                                placeholder="Edit your tweet..."
                                className={styles.editTextarea}
                                disabled={isEditing}
                            />
                            <div className={styles.characterCount}>
                                <span className={editContent.length > MAX_TWEET_LENGTH ? styles.exceeded : ''}>
                                    {editContent.length} / {MAX_TWEET_LENGTH}
                                </span>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button 
                                onClick={closeEditModal} 
                                className={styles.cancelButton}
                                disabled={isEditing}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={saveEditedTweet} 
                                className={styles.saveButton}
                                disabled={isEditing || !editContent.trim() || editContent.length > MAX_TWEET_LENGTH}
                            >
                                {isEditing ? (
                                    <>
                                        <span className={styles.smallSpinner}></span>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page;
