# Twitter dApp - Decentralized Social Network

A fully decentralized Twitter-like social media platform built on blockchain technology. Share your thoughts permanently on-chain with complete ownership and censorship resistance.

![Twitter dApp](https://img.shields.io/badge/Blockchain-Ethereum-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Solidity](https://img.shields.io/badge/Solidity-Smart%20Contracts-orange)

## 🌟 Features

### Core Functionality
- **🐦 Tweet Management**: Create, edit, and delete tweets stored permanently on the blockchain
- **❤️ Like System**: Like and unlike tweets with real-time updates
- **💬 Comments**: Add comments to tweets and view all comments with user profiles
- **👤 User Profiles**: Create and customize your decentralized profile with name, bio, and profile picture
- **🔍 Tweet Feed**: View all tweets from the community or filter to see only your tweets

### Decentralized Features
- **🔐 True Ownership**: Your tweets are stored on the blockchain - you own your data completely
- **🚫 Censorship Resistant**: No central authority can delete or censor your content
- **🔗 Blockchain Verified**: Every action is recorded on the blockchain for transparency
- **💼 Wallet Integration**: Connect with MetaMask or any Web3 wallet
- **⛽ Gas-Efficient**: Optimized smart contracts for cost-effective transactions

### User Experience
- **🎨 Beautiful Landing Page**: Showcases the advantages of decentralized social media
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **⚡ Real-time Updates**: Instant feedback on likes, comments, and tweets
- **🔄 Smart Caching**: Efficient data loading with intelligent caching mechanisms
- **✨ Smooth Animations**: Polished UI with engaging transitions and effects

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **SCSS Modules** - Scoped styling
- **Ethers.js v6** - Ethereum library for blockchain interactions

### Blockchain
- **Solidity** - Smart contract language
- **Ethereum (Sepolia Testnet)** - Blockchain network
- **MetaMask** - Web3 wallet integration

## 📦 Project Structure

```
twitter/
├── client/                      # Frontend Next.js application
│   ├── app/                     # Next.js App Router
│   │   ├── page.js             # Landing page
│   │   ├── layout.js           # Root layout
│   │   ├── globals.css         # Global styles
│   │   ├── (profile)/          # Profile routes
│   │   │   └── profile/        # User profile page
│   │   └── (Tweet)/            # Tweet routes
│   │       ├── createTweet/    # Create tweet page
│   │       └── UserTweet/      # User's tweets page
│   ├── component/              # Reusable components
│   │   ├── AllTweets/          # All tweets feed component
│   │   ├── header/             # Header with navigation
│   │   └── footer/             # Footer component
│   ├── context/                # React Context
│   │   └── WalletContext.jsx   # Web3 wallet connection state
│   ├── public/                 # Static assets
│   └── package.json            # Dependencies
└── server/                      # Smart contracts
    ├── twitter.sol             # Main Twitter contract
    └── twitter_backup.sol      # Backup/version control
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MetaMask browser extension
- Some Sepolia testnet ETH for gas fees

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sandipto729/Twitter-D_App.git
   cd Twitter-D_App
   ```

2. **Install dependencies**
   ```bash
   cd twitter/client
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the `twitter/client` directory:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Smart Contract Deployment

1. Deploy the `twitter.sol` contract to Sepolia testnet
2. Copy the deployed contract address
3. Add the address to your `.env.local` file as `NEXT_PUBLIC_CONTRACT_ADDRESS`
4. Ensure you have the correct `abi.json` in each component folder

## 🎮 How to Use

### First Time Setup
1. **Connect Wallet**: Click "Connect Wallet" in the header
2. **Switch to Sepolia**: Make sure MetaMask is on Sepolia testnet
3. **Create Profile**: Navigate to Profile and set up your username and bio

### Creating Tweets
1. Click "Create Tweet" from the navigation
2. Write your tweet (max 280 characters)
3. Confirm the transaction in MetaMask
4. Your tweet will appear on the blockchain!

### Interacting with Tweets
- **Like/Unlike**: Click the heart icon
- **Comment**: Click "Comment" button and write your thoughts
- **View Likes**: Click "View Likes" to see who liked the tweet
- **View Comments**: Click "Comments" to read all comments

### Managing Your Tweets
1. Go to "My Tweets" from the navigation
2. **Edit**: Click the edit icon to modify your tweet
3. **Delete**: Click the trash icon to remove your tweet

## 🔑 Smart Contract Functions

### Tweet Management
- `createTweet(string _content)` - Post a new tweet
- `editTweet(uint256 _id, string _newContent)` - Edit your tweet
- `deleteTweet(uint256 _id)` - Delete your tweet
- `getAllTweets()` - Get all tweets on the platform
- `getUserTweets(address _user)` - Get tweets by a specific user

### Like System
- `createLike(uint256 _tweetId)` - Like a tweet
- `deleteLike(uint256 _id)` - Unlike a tweet
- `getLikesOfTweet(uint256 _tweetId)` - Get all likes for a tweet
- `getLikeCount(uint256 _tweetId)` - Get like count for a tweet

### Comment System
- `createComment(string _content, uint256 _tweetId)` - Add a comment
- `getCommentsOfTweet(uint256 _tweetId)` - Get all comments for a tweet

### Profile Management
- `createProfile(string _name, string _bio, string _imageUrl)` - Create/update profile
- `getProfile(address _user)` - Get user profile information

## 🌐 Network Configuration

### Sepolia Testnet
- **Network Name**: Sepolia
- **RPC URL**: `https://sepolia.infura.io/v3/YOUR-PROJECT-ID`
- **Chain ID**: 11155111
- **Currency Symbol**: SepoliaETH
- **Block Explorer**: https://sepolia.etherscan.io/

Get free Sepolia ETH from:
- [Sepolia Faucet 1](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.net/)

## 🎨 Key Features Breakdown

### Landing Page
- Hero section with compelling call-to-action
- Feature cards highlighting decentralization benefits
- Step-by-step guide on how it works
- Instant wallet connection

### All Tweets Feed
- Real-time tweet feed from all users
- Like/unlike functionality with animation
- Comment on tweets
- View who liked each tweet
- User profile avatars and names
- Timestamp formatting (e.g., "3m ago")

### My Tweets
- Personal tweet management dashboard
- Edit and delete your own tweets
- Visual indicators for your tweets
- Profile information display

### Profile Page
- Create and update your profile
- Set display name, bio, and profile picture
- View your profile information

## 🔐 Security & Best Practices

- Smart contracts follow Solidity best practices
- Input validation on both frontend and contract level
- Gas optimization for efficient transactions
- Error handling with user-friendly messages
- Wallet connection state management
- Secure data handling with ethers.js

## 🐛 Troubleshooting

### Common Issues

**Wallet won't connect**
- Ensure MetaMask is installed and unlocked
- Switch to Sepolia testnet
- Refresh the page

**Transaction fails**
- Check you have enough Sepolia ETH for gas
- Ensure you're on the correct network
- Try increasing gas limit manually

**Contract not found**
- Verify `NEXT_PUBLIC_CONTRACT_ADDRESS` is set correctly
- Check you're on Sepolia testnet
- Confirm the contract is deployed

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Sandipto Roy**
- GitHub: [@sandipto729](https://github.com/sandipto729)
- Repository: [Twitter-D_App](https://github.com/sandipto729/Twitter-D_App)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/sandipto729/Twitter-D_App/issues).

## 🌟 Show Your Support

Give a ⭐️ if you like this project!

---

**Built with ❤️ using blockchain technology for a decentralized future.**