'use client';
import React from 'react'
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { useWallet } from "../../context/WalletContext";
import abi from "./abi.json";
import styles from "./styles/allTweets.module.scss";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const Page = () => {
    const { account } = useWallet();
    const router = useRouter();
    const [tweets, setTweets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userProfiles, setUserProfiles] = useState({});
    const [likedTweets, setLikedTweets] = useState({});
    const [likingTweet, setLikingTweet] = useState(null);
    const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
    const [likesForTweetId, setLikesForTweetId] = useState(null);
    const [likesDetails, setLikesDetails] = useState([]);
    const [isLoadingLikes, setIsLoadingLikes] = useState(false);
    const [likesCache, setLikesCache] = useState({}); // cache by tweetId
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
    const [commentsForTweetId, setCommentsForTweetId] = useState(null);
    const [commentsDetails, setCommentsDetails] = useState([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [commentsCache, setCommentsCache] = useState({});
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [commentForTweetId, setCommentForTweetId] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [isPostingComment, setIsPostingComment] = useState(false);

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

    useEffect(() => {
        if (account && tweets.length > 0) {
            checkLikedTweets();
        }
    }, [account, tweets.length]);

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

    const openLikesModal = async (tweetId) => {
        try {
            setLikesForTweetId(tweetId);
            setIsLikesModalOpen(true);
            
            // Use cache if available
            if (likesCache[tweetId]) {
                setLikesDetails(likesCache[tweetId]);
                return;
            }

            setIsLoadingLikes(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const twitterContract = new ethers.Contract(contractAddress, abi, provider);

            const likes = await twitterContract.getLikesOfTweet(tweetId);
            // Fetch profiles for each liker in parallel
            const details = await Promise.all(likes
                .filter(like => !like.deleted)
                .map(async (like) => {
                    try {
                        const p = await twitterContract.getProfile(like.liker);
                        return {
                            address: like.liker,
                            name: p[1] || `User ${like.liker.slice(0,6)}`,
                            image: p[3] || "",
                            timestamp: new Date(Number(like.timestamp) * 1000)
                        };
                    } catch (e) {
                        return {
                            address: like.liker,
                            name: `User ${like.liker.slice(0,6)}`,
                            image: "",
                            timestamp: new Date(Number(like.timestamp) * 1000)
                        };
                    }
                })
            );

            // Cache and set state
            setLikesCache(prev => ({ ...prev, [tweetId]: details }));
            setLikesDetails(details);
        } catch (error) {
            console.error("Error loading likes:", error);
            alert("Failed to load likes. Please try again.");
        } finally {
            setIsLoadingLikes(false);
        }
    };

    const closeLikesModal = () => {
        setIsLikesModalOpen(false);
        setLikesForTweetId(null);
        setLikesDetails([]);
        setIsLoadingLikes(false);
    };

    const openCommentsModal = async (tweetId) => {
        try {
            setCommentsForTweetId(tweetId);
            setIsCommentsModalOpen(true);

            if (commentsCache[tweetId]) {
                setCommentsDetails(commentsCache[tweetId]);
                return;
            }

            setIsLoadingComments(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const twitterContract = new ethers.Contract(contractAddress, abi, provider);

            const comments = await twitterContract.getCommentsOfTweet(tweetId);
            const details = await Promise.all(
                comments
                    .filter(c => !c.deleted)
                    .map(async (c) => {
                        try {
                            const p = await twitterContract.getProfile(c.commenter);
                            return {
                                address: c.commenter,
                                name: p[1] || `User ${c.commenter.slice(0,6)}`,
                                image: p[3] || "",
                                content: c.content,
                                timestamp: new Date(Number(c.timestamp) * 1000)
                            };
                        } catch (e) {
                            return {
                                address: c.commenter,
                                name: `User ${c.commenter.slice(0,6)}`,
                                image: "",
                                content: c.content,
                                timestamp: new Date(Number(c.timestamp) * 1000)
                            };
                        }
                    })
            );

            setCommentsCache(prev => ({ ...prev, [tweetId]: details }));
            setCommentsDetails(details);
        } catch (error) {
            console.error("Error loading comments:", error);
            alert("Failed to load comments. Please try again.");
        } finally {
            setIsLoadingComments(false);
        }
    };

    const closeCommentsModal = () => {
        setIsCommentsModalOpen(false);
        setCommentsForTweetId(null);
        setCommentsDetails([]);
        setIsLoadingComments(false);
    };

    const openCommentModal = (tweetId) => {
        setCommentForTweetId(tweetId);
        setCommentText("");
        setIsCommentModalOpen(true);
    };

    const closeCommentModal = () => {
        setIsCommentModalOpen(false);
        setCommentForTweetId(null);
        setCommentText("");
        setIsPostingComment(false);
    };

    const postComment = async () => {
        if (!commentText.trim()) {
            alert("Comment cannot be empty.");
            return;
        }
        try {
            setIsPostingComment(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const twitterContract = new ethers.Contract(contractAddress, abi, signer);
            const tx = await twitterContract.createComment(commentText.trim(), commentForTweetId);
            await tx.wait();
            // Optionally refresh tweets (not required for comments count)
            closeCommentModal();
        } catch (error) {
            console.error("Error posting comment:", error);
            if (error.code === "INSUFFICIENT_FUNDS") {
                alert("Insufficient funds! You need ETH to pay for gas fees.");
            } else if (error.message?.includes("Comment too long")) {
                alert("Your comment exceeds the maximum length.");
            } else if (error.message?.includes("Invalid tweet")) {
                alert("Invalid tweet reference.");
            } else if (error.message?.includes("Tweet deleted")) {
                alert("This tweet was deleted and cannot be commented on.");
            } else {
                alert("Failed to post comment. Please try again.\n\nError: " + error.message);
            }
            setIsPostingComment(false);
        }
    };

    const checkLikedTweets = async () => {
        try {
            if (!window.ethereum) return;

            const provider = new ethers.BrowserProvider(window.ethereum);
            const twitterContract = new ethers.Contract(contractAddress, abi, provider);

            const likedStatus = {};
            for (const tweet of tweets) {
                try {
                    const likes = await twitterContract.getLikesOfTweet(tweet.id);
                    const userLiked = likes.some(like => 
                        like.liker.toLowerCase() === account.toLowerCase() && !like.deleted
                    );
                    likedStatus[tweet.id] = userLiked;
                } catch (error) {
                    console.error(`Error checking likes for tweet ${tweet.id}:`, error);
                    likedStatus[tweet.id] = false;
                }
            }
            setLikedTweets(likedStatus);
        } catch (error) {
            console.error("Error checking liked tweets:", error);
        }
    };

    const handleLike = async (tweetId) => {
        try {
            setLikingTweet(tweetId);
            
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const twitterContract = new ethers.Contract(contractAddress, abi, signer);

            const isLiked = likedTweets[tweetId];

            if (isLiked) {
                // Unlike: find the like ID and delete it
                const likes = await twitterContract.getLikesOfTweet(tweetId);
                const userLike = likes.find(like => 
                    like.liker.toLowerCase() === account.toLowerCase() && !like.deleted
                );
                
                if (userLike) {
                    const tx = await twitterContract.deleteLike(userLike.id);
                    await tx.wait();
                    console.log("✅ Tweet unliked successfully");
                }
            } else {
                // Like the tweet
                const tx = await twitterContract.createLike(tweetId);
                await tx.wait();
                console.log("✅ Tweet liked successfully");
            }

            // Refresh tweets and liked status
            await findAllTweets();
            setLikingTweet(null);
        } catch (error) {
            console.error("Error toggling like:", error);
            
            if (error.code === "INSUFFICIENT_FUNDS") {
                alert("Insufficient funds! You need ETH to pay for gas fees.");
            } else if (error.message.includes("Already liked")) {
                alert("You have already liked this tweet!");
            } else {
                alert("Failed to update like. Please try again.\n\nError: " + error.message);
            }
            
            setLikingTweet(null);
        }
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
                                    <div className={styles.footerLeft}>
                                        <button
                                            className={`${styles.likeButton} ${likedTweets[tweet.id] ? styles.liked : ''}`}
                                            onClick={() => handleLike(tweet.id)}
                                            disabled={likingTweet === tweet.id}
                                        >
                                            {likingTweet === tweet.id ? (
                                                <span className={styles.smallSpinner}></span>
                                            ) : (
                                                <>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill={likedTweets[tweet.id] ? "#e0245e" : "none"}
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                                    </svg>
                                                    <span>{tweet.likeCount}</span>
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            className={styles.viewLikesButton}
                                            onClick={() => openLikesModal(tweet.id)}
                                        >
                                            View Likes
                                        </button>
                                    </div>
                                    <div className={styles.footerCenter}>
                                        <button 
                                            className={styles.commentButton}
                                            onClick={() => openCommentModal(tweet.id)}
                                        >
                                            Comment
                                        </button>
                                    </div>
                                    <div className={styles.footerRight}>
                                        <button 
                                            className={styles.viewCommentsButton}
                                            onClick={() => openCommentsModal(tweet.id)}
                                        >
                                            Comments
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {isLikesModalOpen && (
                <div className={styles.modalOverlay} onClick={closeLikesModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Liked by</h2>
                            <button onClick={closeLikesModal} className={styles.closeButton} aria-label="Close likes modal">
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
                            {isLoadingLikes ? (
                                <div className={styles.loadingLikes}>
                                    <div className={styles.spinner}></div>
                                    <p>Loading likes...</p>
                                </div>
                            ) : likesDetails.length === 0 ? (
                                <div className={styles.emptyLikes}>
                                    <p>No likes yet for this tweet.</p>
                                </div>
                            ) : (
                                <ul className={styles.likesList}>
                                    {likesDetails.map((user) => (
                                        <li key={`${likesForTweetId}-${user.address}`} className={styles.likeItem}>
                                            <div className={styles.likerAvatar}>
                                                {user.image ? (
                                                    <img src={user.image} alt={user.name} />
                                                ) : (
                                                    user.address.slice(0,2).toUpperCase()
                                                )}
                                            </div>
                                            <div className={styles.likerInfo}>
                                                <div className={styles.likerTopRow}>
                                                    <span className={styles.likerName}>{user.name}</span>
                                                    <span className={styles.likerTime}>{formatTimestamp(user.timestamp)}</span>
                                                </div>
                                                <span className={styles.likerAddress}>{user.address.slice(0,6)}...{user.address.slice(-4)}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {isCommentsModalOpen && (
                <div className={styles.modalOverlay} onClick={closeCommentsModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Comments</h2>
                            <button onClick={closeCommentsModal} className={styles.closeButton} aria-label="Close comments modal">
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
                            {isLoadingComments ? (
                                <div className={styles.loadingLikes}>
                                    <div className={styles.spinner}></div>
                                    <p>Loading comments...</p>
                                </div>
                            ) : commentsDetails.length === 0 ? (
                                <div className={styles.emptyLikes}>
                                    <p>No comments yet for this tweet.</p>
                                </div>
                            ) : (
                                <ul className={styles.commentsList}>
                                    {commentsDetails.map((c, idx) => (
                                        <li key={`${commentsForTweetId}-${c.address}-${idx}`} className={styles.commentItem}>
                                            <div className={styles.commentAvatar}>
                                                {c.image ? (
                                                    <img src={c.image} alt={c.name} />
                                                ) : (
                                                    c.address.slice(0,2).toUpperCase()
                                                )}
                                            </div>
                                            <div className={styles.commentInfo}>
                                                <div className={styles.commentTopRow}>
                                                    <span className={styles.commentName}>{c.name}</span>
                                                    <span className={styles.commentTime}>{formatTimestamp(c.timestamp)}</span>
                                                </div>
                                                <span className={styles.commentAddress}>{c.address.slice(0,6)}...{c.address.slice(-4)}</span>
                                                <p className={styles.commentText}>{c.content}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {isCommentModalOpen && (
                <div className={styles.modalOverlay} onClick={closeCommentModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Add a comment</h2>
                            <button onClick={closeCommentModal} className={styles.closeButton} aria-label="Close comment modal">
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
                                className={styles.commentTextarea}
                                placeholder="Write your comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                disabled={isPostingComment}
                            />
                            <div className={styles.commentActions}>
                                <button className={styles.cancelButton} onClick={closeCommentModal} disabled={isPostingComment}>Cancel</button>
                                <button className={styles.postButton} onClick={postComment} disabled={isPostingComment || !commentText.trim()}>
                                    {isPostingComment ? (
                                        <>
                                            <span className={styles.smallSpinner}></span>
                                            Posting...
                                        </>
                                    ) : (
                                        'Post Comment'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page;
