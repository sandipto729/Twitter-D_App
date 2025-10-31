// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Twitter {
    uint16 public constant MAX_TWEET_LENGTH = 280;
    uint16 public constant MAX_COMMENT_LENGTH = 200;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    struct Profile {
        address user;
        string name;
        string bio;
        string image;
    }

    struct Tweet {
        uint256 id;
        address author;
        string content;
        bool deleted;
        uint256 timestamp;
        uint256 likeCount; // maintain current like count
    }

    struct Comment {
        uint256 id;
        uint256 tweetId;
        address commenter;
        string content;
        uint256 timestamp;
        bool deleted;
    }

    struct Like {
        uint256 id;
        address liker;
        uint256 tweetId;
        uint256 timestamp;
        bool deleted;
    }

    // storage
    mapping(address => Profile) public profiles;
    mapping(uint256 => Tweet) public tweets;
    mapping(address => uint256[]) public tweetsByUsers;

    mapping(uint256 => Comment) public comments;
    mapping(uint256 => uint256[]) public commentsByTweet;

    mapping(uint256 => Like) public likes;
    mapping(uint256 => uint256[]) public likesByTweet;

    // quick lookup to prevent duplicate likes: tweetId => user => liked?
    mapping(uint256 => mapping(address => bool)) public likedByTweet;

    uint256 public nextTweetId;
    uint256 public nextCommentId;
    uint256 public nextLikeId;

    // events
    event ProfileCreate(address indexed user, string name, string bio, string image);
    event ProfileUpdate(address indexed user, string name, string bio, string image);
    event TweetCreate(uint256 indexed id, address indexed author, string content, uint256 timestamp);
    event TweetEdit(uint256 indexed id, address indexed author, string content, uint256 timestamp);
    event TweetDelete(uint256 indexed id, address indexed author, uint256 timestamp);
    event CommentCreate(uint256 indexed id, uint256 indexed tweetId, address indexed commenter, string content, uint256 timestamp);
    event CommentEdit(uint256 indexed id, uint256 indexed tweetId, address indexed commenter, string content, uint256 timestamp);
    event CommentDelete(uint256 indexed id, uint256 indexed tweetId, address indexed commenter, uint256 timestamp);
    event LikeCreate(uint256 indexed id, address indexed liker, uint256 indexed tweetId, uint256 timestamp);
    event LikeDelete(uint256 indexed id, address indexed liker, uint256 indexed tweetId, uint256 timestamp);

    // Profile functions (use calldata to save gas when called externally)
    function createProfile(string calldata _name, string calldata _bio, string calldata _image) external {
        profiles[msg.sender] = Profile(msg.sender, _name, _bio, _image);
        emit ProfileCreate(msg.sender, _name, _bio, _image);
    }

    function editProfile(string calldata _name, string calldata _bio, string calldata _image) external {
        profiles[msg.sender] = Profile(msg.sender, _name, _bio, _image);
        emit ProfileUpdate(msg.sender, _name, _bio, _image);
    }

    function getProfile(address _user) external view returns (Profile memory) {
        return profiles[_user];
    }

    // Tweet functions
    function createTweet(string calldata _content) external {
        require(bytes(_content).length <= MAX_TWEET_LENGTH, "Tweet too long");

        // store using current nextTweetId
        tweets[nextTweetId] = Tweet(nextTweetId, msg.sender, _content, false, block.timestamp, 0);
        tweetsByUsers[msg.sender].push(nextTweetId);

        emit TweetCreate(nextTweetId, msg.sender, _content, block.timestamp);
        nextTweetId++;
    }

    function editTweet(uint256 _id, string calldata _content) external {
        Tweet storage t = tweets[_id];
        require(t.author == msg.sender, "Not author");
        require(!t.deleted, "Deleted tweet");
        require(bytes(_content).length <= MAX_TWEET_LENGTH, "Tweet too long");

        t.content = _content;
        t.timestamp = block.timestamp;

        emit TweetEdit(_id, msg.sender, _content, block.timestamp);
    }

    function deleteTweet(uint256 _id) external {
        Tweet storage t = tweets[_id];
        require(t.author == msg.sender, "Not author");
        require(!t.deleted, "Already deleted");

        t.deleted = true;
        emit TweetDelete(_id, msg.sender, block.timestamp);
    }

    /// @notice Returns all non-deleted tweets (visible feed)
    function getAllTweets() external view returns (Tweet[] memory) {
        // first count non-deleted
        uint256 count = 0;
        for (uint256 i = 0; i < nextTweetId; i++) {
            if (!tweets[i].deleted) count++;
        }

        Tweet[] memory result = new Tweet[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < nextTweetId; i++) {
            if (!tweets[i].deleted) result[j++] = tweets[i];
        }
        return result;
    }

    function getUserTweets(address _user) external view returns (Tweet[] memory) {
        uint256[] memory ids = tweetsByUsers[_user];
        uint256 count = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (!tweets[ids[i]].deleted) count++;
        }

        Tweet[] memory result = new Tweet[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (!tweets[ids[i]].deleted) result[j++] = tweets[ids[i]];
        }
        return result;
    }

    // Comment functions
    function createComment(string calldata _content, uint256 _tweetId) external {
        require(bytes(_content).length <= MAX_COMMENT_LENGTH, "Comment too long");
        require(_tweetId < nextTweetId, "Invalid tweet");
        require(!tweets[_tweetId].deleted, "Tweet deleted");

        comments[nextCommentId] = Comment(nextCommentId, _tweetId, msg.sender, _content, block.timestamp, false);
        commentsByTweet[_tweetId].push(nextCommentId);

        emit CommentCreate(nextCommentId, _tweetId, msg.sender, _content, block.timestamp);
        nextCommentId++;
    }

    function editComment(uint256 _id, string calldata _content) external {
        Comment storage c = comments[_id];
        require(c.commenter == msg.sender, "Not author");
        require(!c.deleted, "Deleted comment");
        require(bytes(_content).length <= MAX_COMMENT_LENGTH, "Too long");

        c.content = _content;
        c.timestamp = block.timestamp;

        emit CommentEdit(_id, c.tweetId, msg.sender, _content, block.timestamp);
    }

    function deleteComment(uint256 _id) external {
        Comment storage c = comments[_id];
        require(c.commenter == msg.sender, "Not author");
        require(!c.deleted, "Already deleted");

        c.deleted = true;
        emit CommentDelete(_id, c.tweetId, msg.sender, block.timestamp);
    }

    function getCommentsOfTweet(uint256 _tweetId) external view returns (Comment[] memory) {
        uint256[] memory ids = commentsByTweet[_tweetId];
        uint256 count = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (!comments[ids[i]].deleted) count++;
        }

        Comment[] memory result = new Comment[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (!comments[ids[i]].deleted) result[j++] = comments[ids[i]];
        }
        return result;
    }

    // Like functions - prevent duplicates and allow toggle/unlike only if liked
    function createLike(uint256 _tweetId) external {
        require(_tweetId < nextTweetId, "Invalid tweet");
        require(!tweets[_tweetId].deleted, "Tweet deleted");
        require(!likedByTweet[_tweetId][msg.sender], "Already liked");

        likes[nextLikeId] = Like(nextLikeId, msg.sender, _tweetId, block.timestamp, false);
        likesByTweet[_tweetId].push(nextLikeId);
        likedByTweet[_tweetId][msg.sender] = true;

        // increment tweet likeCount
        tweets[_tweetId].likeCount++;

        emit LikeCreate(nextLikeId, msg.sender, _tweetId, block.timestamp);
        nextLikeId++;
    }

    function deleteLike(uint256 _id) external {
        Like storage l = likes[_id];
        require(!l.deleted, "Already deleted");
        require(l.liker == msg.sender, "Not author");

        // sanity check: tweet id valid
        require(l.tweetId < nextTweetId, "Invalid tweet");

        l.deleted = true;
        likedByTweet[l.tweetId][msg.sender] = false;

        // decrement likeCount safely
        if (tweets[l.tweetId].likeCount > 0) {
            tweets[l.tweetId].likeCount--;
        }

        emit LikeDelete(_id, msg.sender, l.tweetId, block.timestamp);
    }

    function getLikesOfTweet(uint256 _tweetId) external view returns (Like[] memory) {
        uint256[] memory ids = likesByTweet[_tweetId];
        uint256 count = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (!likes[ids[i]].deleted) count++;
        }

        Like[] memory result = new Like[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (!likes[ids[i]].deleted) result[j++] = likes[ids[i]];
        }
        return result;
    }

    // helper: get like count quickly (no scanning)
    function getLikeCount(uint256 _tweetId) external view returns (uint256) {
        return tweets[_tweetId].likeCount;
    }
}
