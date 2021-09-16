import React, { Component } from 'react';

import {listPosts} from '../graphql/queries';
import { onCreateComment, onCreateLike, onCreatePost, onDeletePost, onUpdatePost } from '../graphql/subscriptions';
import {API, graphqlOperation} from 'aws-amplify'
import DeletePost from './DeletePost';
import EditPost from './EditPost';
import CreateCommentPost from './CreateCommentPost';
import CommentPost from './CommentPost';
import {FaSadTear, FaThumbsUp} from 'react-icons/fa';
import {Auth} from 'aws-amplify';
import {createLike} from '../graphql/mutations'
import UsersWhoLikedPost from './UsersWhoLikedPost';


export default class DisplayPosts extends Component {
    state = {
        posts: [],
        ownerId: "",
        ownerUsername: "",
        errorMessage: "",
        postLikedBy: [],
        isHovering: false
    }
    componentDidMount = async () => {
        this.getPosts();

        await Auth.currentUserInfo().then(user => {
            this.setState(
                {
                    ownerId: user.attributes.sub,
                    ownerUsername: user.username,
                }
            )
        })


        this.createPostListener = API.graphql(graphqlOperation(onCreatePost)).subscribe({
            next: postData => {
                const newPost = postData.value.data.onCreatePost;
                console.log(newPost);
                const prevPost = this.state.posts.filter(post => post.id !== newPost.id);
                const updatedPosts = [newPost, ...prevPost];
                this.setState({posts: updatedPosts})
            }
        })

        this.deletePostListener = API.graphql(graphqlOperation(onDeletePost)).subscribe({
            next: postData => {
                const deletedPost = postData.value.data.onDeletePost
                const updatedPosts = this.state.posts.filter(post => post.id !== deletedPost.id);
                this.setState({ posts: updatedPosts})
            }
        })

        this.updatedPostListener = API.graphql(graphqlOperation(onUpdatePost)).subscribe({
            next: postData => {
                const {posts} = this.state
                const updatePost = postData.value.data.onUpdatePost;
                const index = posts.findIndex(post => post.id === updatePost.id);
                console.log(posts, updatePost, index);
                const updatePosts = [ ...posts.slice(0, index), updatePost, ...posts.slice(index + 1)]

                this.setState({ posts: updatePosts})
            }
        })

        this.createPostCommentListener = API.graphql(graphqlOperation(onCreateComment)).subscribe({
            next: commentData => {
                const createdComment = commentData.value.data.onCreateComment;
                let posts = [...this.state.posts];

                for(let post of posts){
                    if(createdComment.post.id === post.id){
                        post.comments.items.push(createdComment)
                    }
                }

                this.setState({posts})
            }
        })

        this.createPostLikeListener = API.graphql(graphqlOperation(onCreateLike)).subscribe({
            next: postData => {
                const createdLike = postData.value.data.onCreateLike;
                let posts = [...this.state.posts]
                for(let post of posts){
                    if(createdLike.post.id === post.id){
                        post.likes.items.push(createdLike)
                    }
                }

                this.setState({posts})
            }
        })

        
    }

    componentWillUnmount() {
        this.createPostListener.unsubscribe();
        this.deletePostListener.unsubscribe();
        this.updatedPostListener.unsubscribe();
        this.createPostCommentListener.unsubscribe();
        this.createPostLikeListener.unsubscribe();
    }

    getPosts = async() =>{
        const result = await API.graphql(graphqlOperation(listPosts));
        console.log(result.data.listPosts.items);
        this.setState({posts: result.data.listPosts.items})
    }

    likedPost = (postId) => {
        for(let post of this.state.posts){
            if(post.id === postId){
                if(post.postOwnerId === this.state.ownerId) return true;
                for(let like of post.likes.items){
                    if(like.likeOwnerId === this.state.ownerId){
                        return true;
                    }
                }
                
            }
        }
    }

    handleLike = async postId => {
        // this.setState({isHovering: !this.state.isHovering})
        if(this.likedPost(postId)) {return this.setState({errorMessage: "Cant Like your own post."})} else {
            const input = {
                numberLikes: 1,
                likeOwnerId: this.state.ownerId,
                likeOwnerUsername: this.state.ownerUsername,
                likePostId: postId
            }
            try {
                const result = await API.graphql(graphqlOperation(createLike, {input}));
                console.log("liked : ", result.data)
            } catch (error){
                console.log(error)
            }
        }
    }

    handleMouseHover = async postId => {
        this.setState({isHovering: !this.state.isHovering})
        let innerLikes = this.state.postLikedBy;

        for(let post of this.state.posts){
            if(post.id === postId){
                for(let like of post.likes.items){
                    innerLikes.push(like.likeOwnerUsername)
                }
            }

            this.setState({postLikedBy:innerLikes})
        }
        console.log("post liked by: ", this.state.postLikedBy)
    }

    handleMouseHoverLeave = async () => {
        this.setState({isHovering: !this.state.isHovering})
        this.setState({postLikedBy: []})
    }

    render() {
        const {posts} = this.state;
        let loggedInUser = this.state.ownerId;

        return (
            <div>
                {posts.map(item => {
                    return <div key={item.id}>
                    <h3 >{item.postTitle}</h3>
                    <h5>Written by : {item.postOwnerUsername}</h5>
                    <p>created on: {new Date(item.createdAt).toDateString()}</p>
                    {item.postOwnerId === loggedInUser && <EditPost {...item}/>}{item.postOwnerId === loggedInUser && <DeletePost data={item}/>}
                    <span>
                        <p>{item.postOwnerId === loggedInUser && this.state.errorMessage}</p>
                        <p 
                        // onMouseEnter={ () => this.handleMouseHover(item.id)} 
                        // onMouseLeave={ () => this.handleMouseHoverLeave()} 
                        onClick={() => this.handleLike(item.id)}
                        style={{color: (item.likes.items.length > 0) ? "blue": "grey"}}>
                            <FaThumbsUp /> {item.likes.items.length}
                        </p>
                        {
                            this.state.isHovering && 
                            <div>
                                {this.state.postLikedBy.length === 0 ? " Liked by no one" : "Liked by: "}
                                {this.state.postLikedBy.length === 0 ? <FaSadTear /> : <UsersWhoLikedPost data={this.state.postLikedBy} />}
                            </div>
                        }
                    </span>
                    <CreateCommentPost postId={item.id} />
                    {item.comments.items.length > 0 && <span>Comments : </span>}
                    {
                        item.comments.items.map((comment, index) => <CommentPost key={index} commentData={comment} />)
                    }
                    </div>
                })}
            </div>
        )
    }
}
