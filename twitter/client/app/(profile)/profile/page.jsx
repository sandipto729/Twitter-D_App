'use client';
import React from 'react'
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "../../../context/WalletContext";
import abi from "./abi.json";
import styles from "./styles/profile.module.scss";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const Page = () => {
    const { account } = useWallet();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [image, setImage] = useState("");

    // Debug: Check contract address
    useEffect(() => {
        console.log("Contract Address:", contractAddress);
        if (!contractAddress || contractAddress === 'undefined') {
            console.error("⚠️ CONTRACT ADDRESS NOT SET! Please check .env.local file");
        }
    }, []);

    useEffect(() => {
        if (account) {
            getProfile(account);
        }
    }, [account]);

    const getProfile = async (userAddress) => {
        try {
            setIsLoading(true);

            // Debug logging
            console.log("🔍 Fetching profile for:", userAddress);
            console.log("📝 Contract address:", contractAddress);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            console.log("🌐 Connected to network:", network.name, "Chain ID:", network.chainId.toString());

            const contract = new ethers.Contract(contractAddress, abi, provider);
            const profileData = await contract.getProfile(userAddress);

            console.log("✅ Profile data received:", profileData);

            // Profile struct: [user (address), name, bio, image]
            // Check if profile exists - empty profile returns address but empty strings
            const hasProfile = profileData && profileData[1] && profileData[1].trim() !== "";

            if (hasProfile) {
                setProfile({
                    user: profileData[0],
                    name: profileData[1],
                    bio: profileData[2],
                    image: profileData[3]
                });
                setName(profileData[1]);
                setBio(profileData[2]);
                setImage(profileData[3]);
            } else {
                // Set default values if no profile exists
                setProfile(null);
                setName("");
                setBio("");
                setImage("");
            }
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching profile:", error);
            // If error is "could not decode" it means profile doesn't exist
            if (error.code === "BAD_DATA") {
                console.log("No profile found - user hasn't created one yet");
            }
            setProfile(null);
            setName("");
            setBio("");
            setImage("");
            setIsLoading(false);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);

            // Use createProfile if no profile exists, editProfile if it does
            const tx = profile
                ? await contract.editProfile(name, bio, image)
                : await contract.createProfile(name, bio, image);

            await tx.wait();

            await getProfile(account);
            setIsEditing(false);
            setIsLoading(false);
        } catch (error) {
            console.error("Error updating profile:", error);

            // Check for insufficient funds error
            if (error.code === "INSUFFICIENT_FUNDS") {
                alert("Insufficient funds! You need ETH in your wallet to pay for gas fees.\n\nIf you're on Sepolia testnet, get free test ETH from:\nhttps://sepoliafaucet.com");
            } else {
                alert("Failed to update profile. Please try again.\n\nError: " + error.message);
            }
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        // Reset to current profile data
        if (profile) {
            setName(profile.name);
            setBio(profile.bio);
            setImage(profile.image);
        }
        setIsEditing(false);
    };

    if (!account) {
        return (
            <div className={styles.container}>
                <div className={styles.connectPrompt}>
                    <h2>Connect Your Wallet</h2>
                    <p>Please connect your wallet from the header to view and edit your profile</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <h1 className={styles.title}>My Profile</h1>

                {isLoading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : (
                    <>
                        {!isEditing ? (
                            // Display Mode
                            <div className={styles.displayMode}>
                                <div className={styles.profileImage}>
                                    {profile && profile.image ? (
                                        <img src={profile.image} alt="Profile" />
                                    ) : (
                                        <div className={styles.defaultAvatar}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.info}>
                                    <div className={styles.infoItem}>
                                        <label>Name:</label>
                                        <p>{profile && profile.name ? profile.name : "Anonymous User"}</p>
                                    </div>

                                    <div className={styles.infoItem}>
                                        <label>Bio:</label>
                                        <p>{profile && profile.bio ? profile.bio : "No bio added yet"}</p>
                                    </div>

                                    <div className={styles.infoItem}>
                                        <label>Wallet Address:</label>
                                        <p className={styles.address}>{account}</p>
                                    </div>
                                </div>

                                <button onClick={handleEdit} className={styles.editButton}>
                                    Edit Profile
                                </button>
                            </div>
                        ) : (
                            // Edit Mode
                            <form onSubmit={updateProfile} className={styles.editMode}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="bio">Bio</label>
                                    <textarea
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Tell us about yourself"
                                        rows="4"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="image">Profile Image URL</label>
                                    <input
                                        id="image"
                                        type="url"
                                        value={image}
                                        onChange={(e) => setImage(e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        required
                                    />
                                    {image && (
                                        <div className={styles.imagePreview}>
                                            <img src={image} alt="Preview" />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.buttonGroup}>
                                    <button type="submit" className={styles.saveButton} disabled={isLoading}>
                                        {isLoading ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className={styles.cancelButton}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Page;
