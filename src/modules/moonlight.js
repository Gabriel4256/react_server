import { Map, List, fromJS } from 'immutable';
import { createAction, handleActions } from 'redux-actions';
import axios from 'axios';

const GET_STATUS = "MOONLIGHT/GET_STATUS";
const GET_STATUS_LOADING = "MOONLIGHT/GET_STATUS_LOADING";
const GET_STATUS_SUCCESS = "MOONLIGHT/GET_STATUS_SUCCESS";
const GET_STATUS_FAILURE = "MOONLIGHT/GET_STATUS_FAILURE";
const GET_HOSTS = "MOONLIGHT/GET_HOSTS";
const GET_HOSTS_LOADING = "MOONLIGHT/GET_HOSTS_LOADING"
const GET_HOSTS_SUCCESS = "MOONLIGHT/GET_HOSTS_SUCCESS"
const GET_HOSTS_FAILURE = "MOONLIGHT/GET_HOSTS_FAILURE"
const GET_APPS = "MOONLIGHT/GET_APPS";
const GET_APPS_LOADING = "MOONLIGHT/GET_APPS_LOADING"
const GET_APPS_SUCCESS = "MOONLIGHT/GET_APPS_SUCCESS"
const GET_APPS_FAILURE = "MOONLIGHT/GET_APPS_FAILURE"
const ADD_HOST = "MOONLIGHT/ADD_HOST";
const ADD_HOST_LOADING= "MOONLIGHT/ADD_HOST_LOADING"
const ADD_HOST_SUCCESS = "MOONLIGHT/ADD_HOST_SUCCESS"
const ADD_HOST_FAILURE = "MOONLIGHT/ADD_HOST_FAILURE"
const START_GAME = "MOONLIGHT/START_GAME";
const START_GAME_LOADING = "MOONLIGHT/START_GAME_LOADING"
const START_GAME_SUCCESS = "MOONLIGHT/START_GAME_SUCCESS"
const START_GAME_FAILURE = "MOONLIGHT/START_GAME_FAILURE"

const initialState = Map({
    status:'INIT',
    hostList: Map({
        status: 'INIT',
        data: List([])
    }),
    appList: Map({
        status: 'INIT',
        data: List([])
    }),
    startGame: Map({
        status: 'INIT',
        currentGame: 'INIT'
    }),
    newHost: Map({
        status: 'INIT',
        pairingNum: '' //it's not used for now
    })
})

function getStatusApiRequest(userId){
    return axios.post('/api/moonlight/getStatus', {userId})
        .then(res=>{
            if(res.data.error){
                return Promise.reject(res.data.error);
            }
            return Promise.resolve(res.data)
        })
}

function getHostsApiRequest(userId){
    return axios.post('/api/moonlight/gethosts', {userId})
        .then((res)=>{
            if(res.data.error){
                return Promise.reject(res.data.error);
            }
            else{
                return Promise.resolve(res.data);
            }
        })
        .catch((err)=>{
            return Promise.reject(err);
        })
}

function getAppsApiRequest(userId, hostId){
    return axios.post('/api/moonlight/getapps', {userId, hostId})
        .then(res=>{
            if (res.data.error) {
                return Promise.reject(res.data.error);
            }
            return Promise.resolve(res.data);
        })
        .catch(err=>{
            return Promise.reject();
        })
}

function addHostApiRequest(userId, hostIp, pairingNum){
    return axios.post('/api/moonlight/addhost', {userId, hostIpaddress: hostIp, pairingNum})
        .then(res=>{
            if (res.data.error) {
                return Promise.reject(res.data.error);
            }

            return Promise.resolve(JSON.parse(res.data));
        })
        .catch(err=>{
            return Promise.resolve(err);
        })
}

function startGameApiRequest(userId, hostId, appId, option){
    return axios.post('/api/moonlight/startgame', {userId, hostId, appId, option})
        .then(res=>{
            if (res.data.error) {
                return Promise.reject(res.data.error);
            }
            return Promise.resolve(appId);
        })
        .catch(err=>{
            return Promise.reject(err);
        })
}

export const getStatusRequest = (userId)=>({
    type:GET_STATUS,
    payload: getStatusApiRequest(userId)
})

export const getHostsRequest = (userId)=>({
    type: GET_HOSTS,
    payload: getHostsApiRequest(userId)
})

export const getAppsRequest = (userId, hostId)=>({
    type: GET_APPS,
    payload: getAppsApiRequest(userId, hostId)
})

export const addHostRequest = (userId, hostIp, pairingNum)=>({
    type: ADD_HOST,
    payload: addHostApiRequest(userId, hostIp, pairingNum)
})

export const startGameRequest = (userId, hostId, appID, option)=>({
    type: START_GAME,
    payload: startGameApiRequest(userId, hostId, appId, option)
})

export default handleActions({
    [GET_STATUS_LOADING]: (state, action)=>{
        return state.set('status', 'WAITING')
    },

    [GET_STATUS_SUCCESS]: (state, action)=>{
        return state.set('status', 'ONLINE')
    },

    [GET_STATUS_FAILURE]: (state, action)=>{
        return state.set('status', 'OFFLINE')
    },

    [GET_HOSTS_LOADING]: (state, action)=>{
        return state.setIn(['hostList', 'status'], 'WAITING');        
    },

    [GET_HOSTS_SUCCESS]: (state, action)=>{
        return state.set('hostList', Map({status: 'GET_SUCCESS', data: fromJS(action.payload.list)}))
    },

    [GET_HOSTS_FAILURE]: (state, action)=>{
        return state.set('hostList', Map({status: 'GET_FAILURE', data: fromJS(action.payload)}))
    },

    [GET_APPS_LOADING]: (state, action)=>{
        return state.setIn(['appList, status'], 'WAITING');
    },

    [GET_APPS_SUCCESS]: (state, action)=>{
        return state.set('appList', Map({status: 'SUCCESS', data: fromJS(action.payload.appList)}))
    },

    [GET_APPS_FAILURE]: (state, action)=>{
        return state.setIn(['appList', 'status'], 'FAILURE');
    },

    [ADD_HOST_LOADING]: (state, action)=>{    ////////?////////
        return state.setIn(['hostList', 'status'],'ADD_WAITING')
                .setIn(['newHost', 'pairingNum'], action.payload);
    },

    [ADD_HOST_SUCCESS]: (state, action)=>{
        const hostListData = state.getIn(['hostList','data'])
        return state.set('hostList', Map({status: 'ADD_SUCCESS',data: hostListData.push(fromJS(action.payload))}))
    },

    [ADD_HOST_FAILURE]: (state, action)=>{
        return state.setIn(['hostList', 'status'], 'ADD_FAILURE');
    },

    [START_GAME_LOADING]: (state, action)=>{
        return state.setIn(['startGame', 'status'], 'WAITING');
    },

    [START_GAME_SUCCESS]: (state, action)=>{
        return state.set('startGame', Map({status: 'SUCCESS', currentGame: action.payload}));
    },

    [START_GAME_FAILURE]: (state, action)=>{
        return state.setIn(['startGame', 'status'], 'FAILURE');
    }
}, initialState);