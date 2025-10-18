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
    pub likes: u32,
}

#[app::state(emits = for<'a> Event<'a>)]
#[derive(Debug, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
pub struct SocialNetwork {
    users: UnorderedMap<String, User>,
    posts: UnorderedMap<String, Post>,
    post_counter: u64,
    user_counter: u64,
}

#[app::event]
pub enum Event<'a> {
    UserCreated {
        id: &'a str,
        name: &'a str,
    },
    PostCreated { 
        id: &'a str, 
        author_id: &'a str, 
        content: &'a str,
        timestamp: u64,
    },
    PostLiked { 
        id: &'a str, 
        likes: u32,
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
        }
    }

    pub fn create_user(&mut self, name: String, avatar: String, bio: String) -> app::Result<User> {
        app::log!("Creating user: {:?}", name);

        self.user_counter += 1;
        let id = self.user_counter.to_string();

        let user = User {
            id: id.clone(),
            name: name.clone(),
            avatar,
            bio,
        };

        app::emit!(Event::UserCreated {
            id: &id,
            name: &name,
        });

        self.users.insert(id, user.clone())?;

        Ok(user)
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

    pub fn create_post(&mut self, author_id: String, content: String) -> app::Result<Post> {
        app::log!("Creating post by user: {:?} with content: {:?}", author_id, content);

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
            likes: 0,
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

    pub fn like_post(&mut self, id: String) -> app::Result<Post> {
        app::log!("Liking post with id: {:?}", id);

        let Some(mut post) = self.posts.get(&id)? else {
            app::bail!(Error::PostNotFound(&id));
        };

        post.likes += 1;

        app::emit!(Event::PostLiked {
            id: &id,
            likes: post.likes,
        });

        self.posts.insert(id, post.clone())?;

        Ok(post)
    }

    pub fn get_post_count(&self) -> app::Result<u64> {
        app::log!("Getting total post count");

        Ok(self.post_counter)
    }
}
