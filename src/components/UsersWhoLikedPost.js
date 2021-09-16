import React, { Component } from 'react'

export default class UsersWhoLikedPost extends Component {
    

    render() {
        const allUsers = this.props.data;

        return allUsers.map(user => {
            return (
            
                <div key={user}>
                    <span style={{fontStyle:"bold", color:"red"}}>
                        {user}
                    </span>
                </div>
            
            )
            
        })
    }
}
