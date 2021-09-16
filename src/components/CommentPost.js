import React, { Component } from 'react'

export default class CommentPost extends Component {

    render() {
        const { content, commentOwnerUsername, createdAt } = this.props.commentData
        return (
            <div>
                <span>{"Comment by: "} { commentOwnerUsername}
                { " on"}
                    <time>
                        {  " "}
                        { new Date(createdAt).toISOString()}
                    </time>
                </span>
                <p> { content }</p>
            </div>
        )
    }
}
