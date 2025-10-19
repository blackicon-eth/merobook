#![allow(clippy::len_without_is_empty)]

use calimero_sdk::app;
use calimero_sdk::borsh::{BorshDeserialize, BorshSerialize};
use calimero_sdk::env;
use calimero_sdk::serde::{Deserialize, Serialize};
use calimero_storage::collections::UnorderedMap;
use thiserror::Error;

#[derive(Debug, BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct User {
    pub id: String,
    pub name: String,
    pub avatar: String,
    pub bio: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub wallet_address: Option<String>,
}

#[derive(Debug, BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct Like {
    pub user_id: String,
    pub user_name: String,
    pub timestamp: u64,
}

#[derive(Debug, BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct Tip {
    pub user_id: String,
    pub user_name: String,
    pub amount_usdc: String, // Stored as string to preserve decimal precision
    pub timestamp: u64,
    pub tx_hash: String,
}

#[derive(Debug, BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct Post {
    pub id: String,
    pub author_id: String,
    pub author_name: String,
    pub author_avatar: String,
    pub content: String,
    pub timestamp: u64,
    pub likes: Vec<Like>,
    pub tips: Vec<Tip>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author_wallet_address: Option<String>,
}

#[app::state(emits = for<'a> Event<'a>)]
#[derive(Debug, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
pub struct SocialNetwork {
    users: UnorderedMap<String, User>,
    posts: UnorderedMap<String, Post>,
    post_counter: u64,
    user_counter: u64,
    // Maps public key to user ID
    public_key_to_user_id: UnorderedMap<String, String>,
    // Followers: key is user_id, value is list of user_ids who follow them
    followers: UnorderedMap<String, Vec<String>>,
    // Following: key is user_id, value is list of user_ids they follow
    following: UnorderedMap<String, Vec<String>>,
}

#[app::event]
pub enum Event<'a> {
    UserCreated {
        id: &'a str,
        name: &'a str,
    },
    UserUpdated {
        id: &'a str,
        name: &'a str,
        bio: &'a str,
    },
    PostCreated {
        id: &'a str,
        author_id: &'a str,
        content: &'a str,
        timestamp: u64,
    },
    PostLiked {
        id: &'a str,
        user_id: &'a str,
        user_name: &'a str,
    },
    PostUnliked {
        id: &'a str,
        user_id: &'a str,
    },
    PostDeleted {
        id: &'a str,
        author_id: &'a str,
    },
    TipSent {
        post_id: &'a str,
        tipper_id: &'a str,
        tipper_name: &'a str,
        amount_usdc: &'a str,
        tx_hash: &'a str,
    },
    UserFollowed {
        follower_id: &'a str,
        followee_id: &'a str,
    },
    UserUnfollowed {
        follower_id: &'a str,
        followee_id: &'a str,
    },
}

#[derive(Debug, Error, Serialize)]
#[serde(crate = "calimero_sdk::serde")]
#[serde(tag = "kind", content = "data")]
pub enum Error<'a> {
    #[error("post not found: {0}")]
    PostNotFound(&'a str),
    #[error("user not found: {0}")]
    UserNotFound(&'a str),
}

#[app::logic]
impl SocialNetwork {
    #[app::init]
    pub fn init() -> SocialNetwork {
        SocialNetwork {
            users: UnorderedMap::new(),
            posts: UnorderedMap::new(),
            post_counter: 0,
            user_counter: 0,
            public_key_to_user_id: UnorderedMap::new(),
            followers: UnorderedMap::new(),
            following: UnorderedMap::new(),
        }
    }

    pub fn create_user(
        &mut self,
        name: String,
        avatar: String,
        bio: String,
        public_key: String,
        wallet_address: Option<String>,
    ) -> app::Result<User> {
        app::log!(
            "Creating user: {:?} with public_key: {:?}",
            name,
            public_key
        );

        // Check if public key is already linked to a user
        if let Some(_) = self.public_key_to_user_id.get(&public_key)? {
            app::bail!(Error::UserNotFound("Public key already linked to a user"));
        }

        self.user_counter += 1;
        let id = self.user_counter.to_string();

        let user = User {
            id: id.clone(),
            name: name.clone(),
            avatar,
            bio,
            wallet_address,
        };

        app::emit!(Event::UserCreated {
            id: &id,
            name: &name,
        });

        self.users.insert(id.clone(), user.clone())?;
        self.public_key_to_user_id.insert(public_key, id)?;

        Ok(user)
    }

    pub fn get_user_by_public_key(&self, public_key: String) -> app::Result<User> {
        app::log!("Getting user by public_key: {:?}", public_key);

        let Some(user_id) = self.public_key_to_user_id.get(&public_key)? else {
            app::bail!(Error::UserNotFound(&public_key));
        };

        let Some(user) = self.users.get(&user_id)? else {
            app::bail!(Error::UserNotFound(&user_id));
        };

        Ok(user)
    }

    pub fn check_public_key_registered(&self, public_key: String) -> app::Result<bool> {
        app::log!("Checking if public_key is registered: {:?}", public_key);

        let has_user = self.public_key_to_user_id.get(&public_key)?.is_some();

        Ok(has_user)
    }

    pub fn get_user<'a>(&self, id: &'a str) -> app::Result<User> {
        app::log!("Getting user with id: {:?}", id);

        let Some(user) = self.users.get(id)? else {
            app::bail!(Error::UserNotFound(id));
        };

        Ok(user)
    }

    pub fn get_all_users(&self) -> app::Result<Vec<User>> {
        app::log!("Getting all users");

        let users: Vec<User> = self.users.entries()?.map(|(_, user)| user).collect();

        Ok(users)
    }

    pub fn update_user(
        &mut self,
        user_id: String,
        name: String,
        bio: String,
        wallet_address: Option<String>,
    ) -> app::Result<User> {
        app::log!(
            "Updating user {:?} with name: {:?}, bio: {:?}",
            user_id,
            name,
            bio
        );

        let Some(mut user) = self.users.get(&user_id)? else {
            app::bail!(Error::UserNotFound(&user_id));
        };

        user.name = name.clone();
        user.bio = bio.clone();
        user.wallet_address = wallet_address;

        app::emit!(Event::UserUpdated {
            id: &user_id,
            name: &name,
            bio: &bio,
        });

        self.users.insert(user_id.clone(), user.clone())?;

        // Update author_name in all posts by this user
        app::log!("Updating author_name in all posts by user {:?}", user_id);

        // First collect all posts that need updating
        let posts_to_update: Vec<(String, Post)> = self
            .posts
            .entries()?
            .filter(|(_, post)| post.author_id == user_id)
            .collect();

        // Then update them
        for (post_id, mut post) in posts_to_update {
            post.author_name = name.clone();
            self.posts.insert(post_id, post)?;
        }

        Ok(user)
    }

    pub fn create_post(&mut self, author_id: String, content: String) -> app::Result<Post> {
        app::log!(
            "Creating post by user: {:?} with content: {:?}",
            author_id,
            content
        );

        // Get the user to populate post author fields
        let Some(author) = self.users.get(&author_id)? else {
            app::bail!(Error::UserNotFound(&author_id));
        };

        self.post_counter += 1;
        let id = self.post_counter.to_string();
        let timestamp = env::time_now();

        let post = Post {
            id: id.clone(),
            author_id: author_id.clone(),
            author_name: author.name.clone(),
            author_avatar: author.avatar.clone(),
            content: content.clone(),
            timestamp,
            likes: Vec::new(),
            tips: Vec::new(),
            author_wallet_address: author.wallet_address.clone(),
        };

        app::emit!(Event::PostCreated {
            id: &id,
            author_id: &author_id,
            content: &content,
            timestamp,
        });

        self.posts.insert(id, post.clone())?;

        Ok(post)
    }

    pub fn get_all_posts(&self) -> app::Result<Vec<Post>> {
        app::log!("Getting all posts");

        let mut posts: Vec<Post> = self.posts.entries()?.map(|(_, post)| post).collect();

        // Sort by timestamp, newest first
        posts.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

        Ok(posts)
    }

    pub fn get_post<'a>(&self, id: &'a str) -> app::Result<Post> {
        app::log!("Getting post with id: {:?}", id);

        let Some(post) = self.posts.get(id)? else {
            app::bail!(Error::PostNotFound(id));
        };

        Ok(post)
    }

    pub fn delete_post(&mut self, post_id: String, user_id: String) -> app::Result<()> {
        app::log!("User {:?} deleting post {:?}", user_id, post_id);

        let Some(post) = self.posts.get(&post_id)? else {
            app::bail!(Error::PostNotFound(&post_id));
        };

        // Check if the user is the author of the post
        if post.author_id != user_id {
            app::log!(
                "User {:?} is not authorized to delete post {:?}",
                user_id,
                post_id
            );
            app::bail!(Error::UserNotFound("Not authorized to delete this post"));
        }

        app::emit!(Event::PostDeleted {
            id: &post_id,
            author_id: &user_id,
        });

        self.posts.remove(&post_id)?;

        Ok(())
    }

    pub fn like_post(&mut self, post_id: String, user_id: String) -> app::Result<Post> {
        app::log!("User {:?} liking post {:?}", user_id, post_id);

        let Some(mut post) = self.posts.get(&post_id)? else {
            app::bail!(Error::PostNotFound(&post_id));
        };

        // Get the user to populate like info
        let Some(user) = self.users.get(&user_id)? else {
            app::bail!(Error::UserNotFound(&user_id));
        };

        // Check if user already liked this post
        if post.likes.iter().any(|like| like.user_id == user_id) {
            app::log!("User {:?} already liked post {:?}", user_id, post_id);
            return Ok(post);
        }

        let like = Like {
            user_id: user_id.clone(),
            user_name: user.name.clone(),
            timestamp: env::time_now(),
        };

        post.likes.push(like);

        app::emit!(Event::PostLiked {
            id: &post_id,
            user_id: &user_id,
            user_name: &user.name,
        });

        self.posts.insert(post_id, post.clone())?;

        Ok(post)
    }

    pub fn unlike_post(&mut self, post_id: String, user_id: String) -> app::Result<Post> {
        app::log!("User {:?} unliking post {:?}", user_id, post_id);

        let Some(mut post) = self.posts.get(&post_id)? else {
            app::bail!(Error::PostNotFound(&post_id));
        };

        // Remove the user's like
        post.likes.retain(|like| like.user_id != user_id);

        app::emit!(Event::PostUnliked {
            id: &post_id,
            user_id: &user_id,
        });

        self.posts.insert(post_id, post.clone())?;

        Ok(post)
    }

    pub fn check_user_liked_post(&self, post_id: String, user_id: String) -> app::Result<bool> {
        app::log!("Checking if user {:?} liked post {:?}", user_id, post_id);

        let Some(post) = self.posts.get(&post_id)? else {
            app::bail!(Error::PostNotFound(&post_id));
        };

        let has_liked = post.likes.iter().any(|like| like.user_id == user_id);

        Ok(has_liked)
    }

    pub fn record_tip(
        &mut self,
        post_id: String,
        user_id: String,
        amount_usdc: String,
        tx_hash: String,
    ) -> app::Result<Post> {
        app::log!(
            "User {:?} tipping post {:?} with {:?} USDC",
            user_id,
            post_id,
            amount_usdc
        );

        let Some(mut post) = self.posts.get(&post_id)? else {
            app::bail!(Error::PostNotFound(&post_id));
        };

        let Some(user) = self.users.get(&user_id)? else {
            app::bail!(Error::UserNotFound(&user_id));
        };

        let tip = Tip {
            user_id: user_id.clone(),
            user_name: user.name.clone(),
            amount_usdc: amount_usdc.clone(),
            timestamp: env::time_now(),
            tx_hash: tx_hash.clone(),
        };

        post.tips.push(tip);

        app::emit!(Event::TipSent {
            post_id: &post_id,
            tipper_id: &user_id,
            tipper_name: &user.name,
            amount_usdc: &amount_usdc,
            tx_hash: &tx_hash,
        });

        self.posts.insert(post_id, post.clone())?;

        Ok(post)
    }

    pub fn get_post_count(&self) -> app::Result<u64> {
        app::log!("Getting total post count");

        Ok(self.post_counter)
    }

    // Follow a user
    pub fn follow_user(&mut self, follower_id: String, followee_id: String) -> app::Result<()> {
        app::log!("User {:?} following user {:?}", follower_id, followee_id);

        // Validate both users exist
        if self.users.get(&follower_id)?.is_none() {
            app::bail!(Error::UserNotFound(&follower_id));
        }
        if self.users.get(&followee_id)?.is_none() {
            app::bail!(Error::UserNotFound(&followee_id));
        }

        // Can't follow yourself
        if follower_id == followee_id {
            app::bail!(Error::UserNotFound("Cannot follow yourself"));
        }

        // Get or create followers list for followee
        let mut followers_list = self.followers.get(&followee_id)?.unwrap_or_default();

        // Check if already following
        if followers_list.contains(&follower_id) {
            app::bail!(Error::UserNotFound("Already following this user"));
        }

        followers_list.push(follower_id.clone());
        self.followers.insert(followee_id.clone(), followers_list)?;

        // Get or create following list for follower
        let mut following_list = self.following.get(&follower_id)?.unwrap_or_default();
        following_list.push(followee_id.clone());
        self.following.insert(follower_id.clone(), following_list)?;

        app::emit!(Event::UserFollowed {
            follower_id: &follower_id,
            followee_id: &followee_id,
        });

        Ok(())
    }

    // Unfollow a user
    pub fn unfollow_user(&mut self, follower_id: String, followee_id: String) -> app::Result<()> {
        app::log!("User {:?} unfollowing user {:?}", follower_id, followee_id);

        // Remove from followee's followers list
        if let Some(mut followers_list) = self.followers.get(&followee_id)? {
            followers_list.retain(|id| id != &follower_id);
            self.followers.insert(followee_id.clone(), followers_list)?;
        }

        // Remove from follower's following list
        if let Some(mut following_list) = self.following.get(&follower_id)? {
            following_list.retain(|id| id != &followee_id);
            self.following.insert(follower_id.clone(), following_list)?;
        }

        app::emit!(Event::UserUnfollowed {
            follower_id: &follower_id,
            followee_id: &followee_id,
        });

        Ok(())
    }

    // Check if follower_id is following followee_id
    pub fn is_following(&self, follower_id: String, followee_id: String) -> app::Result<bool> {
        app::log!(
            "Checking if user {:?} is following user {:?}",
            follower_id,
            followee_id
        );

        if let Some(following_list) = self.following.get(&follower_id)? {
            Ok(following_list.contains(&followee_id))
        } else {
            Ok(false)
        }
    }

    // Get followers of a user
    pub fn get_followers(&self, user_id: String) -> app::Result<Vec<String>> {
        app::log!("Getting followers for user {:?}", user_id);

        Ok(self.followers.get(&user_id)?.unwrap_or_default())
    }

    // Get users that a user is following
    pub fn get_following(&self, user_id: String) -> app::Result<Vec<String>> {
        app::log!("Getting following for user {:?}", user_id);

        Ok(self.following.get(&user_id)?.unwrap_or_default())
    }

    // Get follower count
    pub fn get_follower_count(&self, user_id: String) -> app::Result<u64> {
        app::log!("Getting follower count for user {:?}", user_id);

        let count = self
            .followers
            .get(&user_id)?
            .map(|list| list.len() as u64)
            .unwrap_or(0);

        Ok(count)
    }

    // Get following count
    pub fn get_following_count(&self, user_id: String) -> app::Result<u64> {
        app::log!("Getting following count for user {:?}", user_id);

        let count = self
            .following
            .get(&user_id)?
            .map(|list| list.len() as u64)
            .unwrap_or(0);

        Ok(count)
    }
}
