// SPDX-License-Identifier: MIT
   pragma solidity ^0.8.20; 

// contract Twitter{
//     uint16 public MAX_TWEET_LENGTH = 280;
//     uint16 public MAX_COMMENT_LENGTH=200;

//     // owner
//     address public owner;

//     // owner constructor
//     constructor(){
//         owner=msg.sender;
//     }

//     // modifier to check the owner
//     modifier onlyOwner(){
//         require(msg.sender == owner, "Only owner can call this function");
//         _;
//     }

//     struct Profile {
//         address user;
//         string name;
//         string bio;
//         string image;
//     }

//     struct Tweet {
//         uint256 id;
//         address author;
//         string content;
//         bool deleted;
//         uint256 timestamp;
//     }

//     struct Comment {
//         uint256 id;
//         uint256 tweetId;
//         address commenter;
//         string content;
//         uint256 timestamp;
//         bool deleted;
//     }

//     struct Like {
//         address liker;
//         uint256 tweetId;
//         uint256 timestamp;
//         bool deleted;
//     }


//     //data structure
//     mapping(address=>Profile) public profiles; // address -> profile

//     mapping(uint256=>Tweet) public tweets; // tweet number -> tweet content
//     mapping(address=>uint256[]) public tweetsByUsers; // address -> tweet number

//     mapping(uint256 => Comment) public comments; // comment number -> comment content
//     mapping(uint256 => uint256[]) public commentsByTweet; // tweet number -> comment number

//     mapping(uint256 => Like) public likes; // like number -> like content
//     mapping(uint256 => uint256[]) public likesByTweet; // tweet number -> like number

//     uint256 public nextTweetId=0; // count tweet number
//     uint256 public nextCommentId=0; // count comment number
//     uint256 public nextLikeId=0; // count like number
    


//     // event create 
//     event ProfileCreate(address user, string name, string bio, string image);
//     event ProfileUpdate(address user, string name, string bio, string image);
//     event TweetCreate(uint256 _id, address author, string content, uint256 timestamp);
//     event TweetEdit(uint256 _id, address author, string content, uint256 timestamp);
//     event CommentCreate(uint256 _id, uint256 tweetId, address commenter, string content, uint256 timestamp);
//     event CommentEdit(uint256 _id, uint256 tweetId, address commenter, string content, uint256 timestamp);
//     event LikeCreate(uint256 _id, address liker, uint256 tweetId, uint256 timestamp);
//     event LikeDelete(uint256 _id, address liker, uint256 tweetId, uint256 timestamp);


//     //function

//     // Profile function
//     function createProfile(string memory _name, string memory _bio, string memory _image) public{
//         Profile memory newProfile=Profile(msg.sender, _name, _bio, _image);
//         profiles[msg.sender]=newProfile;
//         emit ProfileCreate(msg.sender, _name, _bio, _image);
//     }

//     function EditProfile(string memory _name, string memory _bio, string memory _image) public{
//         Profile memory newProfile=Profile(msg.sender, _name, _bio, _image);
//         profiles[msg.sender]=newProfile;
//         emit ProfileUpdate(msg.sender, _name, _bio, _image);
//     }

//     function getProfile(address _user) public view returns(Profile memory){
//         return profiles[_user];
//     }

//     // Tweet function

//     function createTweet(string memory _content) public{
//         require(bytes(_content).length<=MAX_TWEET_LENGTH,"Tweet is too long");
//         Tweet memory newTweet=Tweet(nextTweetId, msg.sender, _content, false, block.timestamp);
//         tweets[nextTweetId]=newTweet;
//         tweetsByUsers[msg.sender].push(nextTweetId);
//         nextTweetId++;
//         emit TweetCreate(nextTweetId, msg.sender, _content, block.timestamp); // 1-based index
//     }    

//     function EditTweet(uint256 _id, string memory _content) public{
//         require(tweets[_id].author==msg.sender, "You are not the author of this tweet");
//         require(bytes(_content).length<=MAX_TWEET_LENGTH,"Tweet is too long");
//         Tweet memory newTweet=Tweet(_id, msg.sender, _content, false, block.timestamp);
//         tweets[_id]=newTweet;
//         emit TweetEdit(_id, msg.sender, _content, block.timestamp); // 1-based index
//     }

//     function deleteTweet(uint256 _id) public{
//         tweets[_id].deleted=true;
//     }

//     function getAllTweet() public view returns(Tweet[] memory){
//         Tweet[] memory result = new Tweet[](nextTweetId);
//         for(uint256 i=0;i< nextTweetId;i++){
//             result[i]=tweets[i];
//         }
//         return result;
//     }

//     function getUserTweet(address _user) public view returns(Tweet[] memory){
//         uint256[] memory tweets_idx=tweetsByUsers[_user];
//         Tweet[] memory result= new Tweet[tweets_idx.length];
//         uint256 l=0;
//         for(int i=0;i<tweets_idx.length;i++){
//             if(tweets[tweets_idx[i]].deleted==false)result[l++]=tweets[tweets_idx[i]];
//         }
//         return result;
//     }

//     // Comment function

//     function createComment(string memory _content, uint256 _tweetId) public{
//         require(bytes(_content).length<=MAX_COMMENT_LENGTH,"Comment is too long");
//         Comment memory newComment=Comment(nextCommentId, _tweetId, msg.sender, _content, block.timestamp, false);
//         comments[nextCommentId]=newComment;
//         commentsByTweet[_tweetId].push(nextCommentId);
//         nextCommentId++;
//         emit CommentCreate(nextCommentId, _tweetId, msg.sender, _content, block.timestamp); // 1-based index
//     }

//     function EditComment(uint256 _id, string memory _content) public{
//         require(comments[_id].commenter==msg.sender, "You are not the author of this comment");
//         require(bytes(_content).length<=MAX_COMMENT_LENGTH,"Comment is too long");
//         Comment memory newComment=Comment(_id, comments[_id].tweetId, msg.sender, _content, block.timestamp, false);
//         comments[_id]=newComment;
//         emit CommentEdit(_id, comments[_id].tweetId, msg.sender, _content, block.timestamp); // 1-based index
//     }

//     function deleteComment(uint256 _id) public{
//         comments[_id].deleted=true;
//     }

//     function getCommentOfTweet(uint256 _tweetId) public view returns(Comment[] memory){
//         uint256[] comment_idx=commentsByTweet[_tweetId];
//         Comment[] memory result= new Comment[comment_idx.length];
//         uint256 l=0;
//         for(int i=0;i<comment_idx.length;i++){
//             if(comments[comment_idx[i]].deleted==false)result[l++]=comments[comment_idx[i]];
//         }
//         return result;
//     }

//     // Like function

//     function createLike(uint256 _tweetId) public{
//         Like memory newLike=Like(msg.sender, _tweetId, block.timestamp, false);
//         likes[nextLikeId]=newLike;
//         likesByTweet[_tweetId].push(nextLikeId);
//         nextLikeId++;
//         emit LikeCreate(nextLikeId, msg.sender, _tweetId, block.timestamp); // 1-based index
//     }

//     function DeleteLike(uint256 _id) public{
//         likes[_id].deleted=true;
//         emit LikeDelete(_id, msg.sender, likes[_id].tweetId, block.timestamp); // 1-based index
//     }

//     function getLikeOfTweet(uint256 _tweetId) public view returns(Like[] memory){
//         uint256[] memory like_idx=likesByTweet[_tweetId];
//         Like[] memory result= new Like[like_idx.length];
//         uint256 l=0;
//         for(int i=0;i<like_idx.length;i++){
//             if(likes[like_idx[i]].deleted==false)result[l++]=likes[like_idx[i]];
//         }
//         return result;
//     }

// }



