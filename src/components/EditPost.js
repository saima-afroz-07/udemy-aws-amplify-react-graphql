import API from '@aws-amplify/api';
import { graphqlOperation } from '@aws-amplify/api-graphql';
import Auth from '@aws-amplify/auth';
import React, { Component } from 'react';
import {updatePost} from '../graphql/mutations'

export default class EditPost extends Component {
    state = {
        show: false,
        id: "",
        postOwnerId: "",
        postOwnerUsername: "",
        postTitle: "",
        postBody: "",
        postData: {
            postTitle: this.props.postTitle,
            postBody: this.props.postBody
        }
    }

    
    handleUpdatePost = async (event) => {
        event.preventDefault();
        const input = {
            id: this.props.id,
            postOwnerId: this.state.postOwnerId,
            postOwnerUsername: this.state.postOwnerUsername,
            postTitle: this.state.postData.postTitle,
            postBody: this.state.postData.postBody
        }
        console.log(input)

        await API.graphql(graphqlOperation(updatePost, {input}));
        this.setState({show: !this.state.show})
    }

    handleModal = () => {
        this.setState({
            show: !this.state.show
        })
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
    handleTitle = event => {
        this.setState({
            postData: {...this.state.postData, postTitle: event.target.value}
        })
    }

    handleBody = event => {
        this.setState({
            postData: {...this.state.postData, postBody: event.target.value}
        })
    }

    componentWillMount = async() => {
        await Auth.currentUserInfo()
        .then(user => {
            console.log(user)
            this.setState({
                postOwnerId: user.attributes.sub,
                postOwnerUsername: user.username
            })
        })
    }

    render() {
        return (
            <>
            {
                this.state.show && (
                    <div>
                        <button onClick={this.handleModal}>X</button>
                        
                        <form onSubmit={(event) => this.handleUpdatePost(event)}>
                            <input type="text" placeholder="Title" name="postTitle" value={this.state.postData.postTitle} onChange={this.handleTitle}/>
                            <input type="text" placeholder="" name="postBody" value={this.state.postData.postBody} onChange={this.handleBody} />
                            <button>Update Post</button>
                        </form>
                    </div>
                )
            }
            <button  onClick={this.handleModal}>Edit</button>
            </>
        )
    }
}
