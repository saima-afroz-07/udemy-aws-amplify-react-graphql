import {API, graphqlOperation} from 'aws-amplify'
import Auth from '@aws-amplify/auth'
import React, { Component } from 'react'
import { createComment } from '../graphql/mutations'

export default class CreateCommentPost extends Component {
    state = {
        commentOwnerId : "",
        commentOwnerUsername : "",
        content: ""
    }


    componentWillMount = async() => {
        await Auth.currentUserInfo()
        .then(user => {
            this.setState({
                commentOwnerId: user.attributes.sub,
                commentOwnerUsername: user.username
            })
        })
    }

    handleChangeContent = event => this.setState({content: event.target.value});
    handleAddComment = async event => {
        event.preventDefault();

        const input = {
            commentPostId : this.props.postId,
            commentOwnerId : this.state.commentOwnerId,
            commentOwnerUsername: this.state.commentOwnerUsername,
            content: this.state.content,
            createdAt: new Date().toISOString()
        }

        await API.graphql(graphqlOperation(createComment , {input}));

        this.setState({content: ""})
    } 

    render() {
        return (
            <div>
                <form onSubmit={this.handleAddComment}>
                    <textarea type="text" name="content" required placeholder="Add your comment" value={this.state.content} onChange={this.handleChangeContent} />
                    <input type="submit" value="Add Comment" />
                </form>
            </div>
        )
    }
}
