import React, { Component } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import {connect} from 'react-redux';
import {getStatusRequest} from 'modules/authentication';
import update from 'immutability-helper';

var socket={};

class ChattingContainer extends Component {
    constructor(props){
        super(props);
        this.state={users:[], messages:[], text:'', room:'', currentUser: ""};
        this.init = this.init.bind(this);
        this.onUserJoin = this.onUserJoin.bind(this);
        this.onUserLeft = this.onUserLeft.bind(this);
        this.onReceiveMsg = this.onReceiveMsg.bind(this);
        this.handleMessageSubmit = this.handleMessageSubmit.bind(this);        
        this.getStatus = this.getStatus.bind(this);
    }

    init(data) {
        data.push(this.props.status.get('currentUser'));
        this.setState({
            users: data,
            messages: [],
            text: [],
            room: this.props.room,
            currentUser: this.props.status.get('currentUser')
        });
    }

    connectToIoServer(){
        return Promise.resolve().then(()=>{
            socket = io.connect("http://localhost:4000", {'forceNew': true});
            socket.on('init', this.init);
            socket.on('send:message', this.onReceiveMsg);
            socket.on('user:join', onUserJoin);
            socket.on('user:left', this.onUserLeft);
            return true;
        })
    }

    disconnectToIoServer(){
        return Promise.resolve().then(()=>{
            return socket.disconnect();
        })
    }

    joinRoom(room, userId){
        return Promise.resolve().then(()=>{
            return socket.emit('user:join', {userId, room});
        })
    }

    leaveRoom(userId){
        return Promise.resoleve().then(()=>{
            return socket.emit('user:left', {userId})
        })
    }

    onReceiveMsg(msg) {
        this.setState(update(this.state, {
            messages: {$push : [msg]}    
        }));
    }

    onUserJoin(data) {
        console.log('new user has joined');
        this.setState(update(this.state,{
            users: {$push: [data.userId]},
            messages: {$push: [{user: 'APPLICATION BOT', text: data.userId + " Joined"}]}
        }))
    }

    onUserLeft(data) {
        let index = this.state.users.indexOf(data.userId);
        this.setState(update(this.state,{
            users: {
                $splice: [[index, 1]]
            },
            messages: {
                $push: [{user: 'APPLICATION BOT', text: data.userId + ' Left'}]
            }
        }))
    }

    handleMessageSubmit(msg) {
        onReceiveMsg(msg);
        socket.emit('send:message', { msg: msg, room: this.props.room });
    } 

    getStatus(){
        return this.props.getStatusRequest()
                .then(()=>{
                   if(this.props.status.get('valid')){
                       this.setState(update(this.state, {
                           currentUser: {
                               $set: this.props.status.get('currentUser')
                           }
                       }))
                       return this.state.currentUser;
                   }
                   return Promise.reject(false);
                })
    }

    render() {
        return (
            <div>
                <Chatting room={this.state.get('room')}
                          users={this.state.get('users')}
                          messages={this.state.get('messages')}
                          onMessageSubmit={this.handleMessageSubmit}
                          currentUser={this.props.currentUser}
                          connect={this.connectToIoServer}
                          disconnect={this.disconnectToIoServer}
                          joinRoom={this.joinRoom}
                          leaveRoom={this.leaveRoom}
                          getStatus={this.getStatus}/>                        
            </div>
        );
    }
}

const mapStateToProps = (state)=>{
    return {
        status: state.authentication.get('status')
    }
}

const mapDispatchToProps = (dispatch)=>{
    return {
        getStatusRequest: ()=>{
            return dispatch(getStatusRequest())
        }
    }
}

ChattingContainer.propTypes = {

};

export default connect(mapStateToProps, mapDispatchToProps)(ChattingContainer);