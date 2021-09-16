import {API, graphqlOperation} from '@aws-amplify/api';
import Auth from '@aws-amplify/auth';
import React, { Component } from 'react';
import { createPost } from '../graphql/mutations';

export default class CreatePost extends Component {
    state = {
        postOwnerId: "",
        postOwnerUsername: "",
        postTitle: "",
        postBody: ""
    }
    componentDidMount = async () => {
        await Auth.currentUserInfo()
        .then(user => {
            //console.log("Current user => ", user.username, " and Current user id => ", user.attributes.sub);
            this.setState({
                postOwnerId: user.attributes.sub,
                postOwnerUsername: user.username
            })
        })
    }
    handleChangePost = async (event) => this.setState({
        [event.target.name] : event.target.value
    })

    handleAddPost = async(e) => {
        e.preventDefault();
        const input = {
            postOwnerId: this.state.postOwnerId,
            postOwnerUsername: this.state.postOwnerUsername,
            postTitle: this.state.postTitle,
            postBody: this.state.postBody,
            createdAt: new Date().toISOString()
        }

        await API.graphql(graphqlOperation(createPost, {input}));

        this.setState({postTitle: "", postBody: ""});

    }
    render() {
        
        return (
            <form onSubmit={this.handleAddPost}>
                <input type="text" placeholder="Title" name="postTitle" value={this.state.postTitle} onChange={this.handleChangePost} required /><br/>
                <textarea typeof="text" name="postBody" required rows="3" cols="40" placeholder="New Blog Post" value={this.state.postBody} onChange={this.handleChangePost} /><br/>
                <input type="submit" />
            </form>
        )
    }
}
