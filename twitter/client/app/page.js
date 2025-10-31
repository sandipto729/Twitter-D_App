"use client";

import React from 'react';
import { useWallet } from '../context/WalletContext';
import AllTweets from '../component/AllTweets/page';
import styles from './page.module.scss';

const Page = () => {
  const { account, connectWallet, isConnecting } = useWallet();

  if (account) {
    return <AllTweets />;
  }

  return (
    <div className={styles.landingPage}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Welcome to the Future of Social Media
          </h1>
          <p className={styles.heroSubtitle}>
            A decentralized Twitter built on blockchain technology
          </p>
          <button 
            onClick={connectWallet} 
            disabled={isConnecting}
            className={styles.ctaButton}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet to Get Started'}
          </button>
        </div>
      </section>

      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Why Choose Twitter dApp?</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3>True Ownership</h3>
            <p>Your tweets are stored on the blockchain. You own your data completely, with no central authority controlling it.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3>Censorship Resistant</h3>
            <p>No one can delete or censor your content. Once posted, your tweets are permanently stored on the blockchain.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3>Transparent & Verifiable</h3>
            <p>Every transaction is recorded on the blockchain, ensuring complete transparency and accountability.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </div>
            <h3>Decentralized Network</h3>
            <p>Built on Ethereum, our platform is distributed across thousands of nodes, ensuring maximum uptime and security.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Community Driven</h3>
            <p>No corporate overlords. The platform is governed by its users through smart contracts.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3>Smart Contract Powered</h3>
            <p>All interactions are executed through secure, audited smart contracts, eliminating intermediaries.</p>
          </div>
        </div>
      </section>

      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Connect Your Wallet</h3>
            <p>Use MetaMask or any Web3 wallet to connect to the platform securely.</p>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Create Your Profile</h3>
            <p>Set up your decentralized identity with a username and profile picture.</p>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Start Tweeting</h3>
            <p>Share your thoughts, and they'll be permanently stored on the blockchain.</p>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <h3>Engage & Connect</h3>
            <p>Like tweets, follow users, and build your decentralized social network.</p>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <h2>Ready to Join the Revolution?</h2>
        <p>Experience true freedom of speech on the blockchain</p>
        <button 
          onClick={connectWallet} 
          disabled={isConnecting}
          className={styles.ctaButtonLarge}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet Now'}
        </button>
      </section>
    </div>
  );
};

export default Page;
