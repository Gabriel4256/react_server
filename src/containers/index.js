import HeaderContainer from './HeaderContainer';
import Login from './Login';
import StreamingView from './StreamingView';
import Register from './Register';
import StreamingPlayerContainer from  './StreamingPlayerContainer';
import SpeedTestContainer from './speedTestContainer';
import StreamingListContainer from './StreamingListContainer'
import MoonlightContainer from './MooonlightContainer';
import asyncRoute from 'lib/asyncRoute';

export {HeaderContainer,Login,  StreamingView, Register, StreamingPlayerContainer, SpeedTestContainer, StreamingListContainer, MoonlightContainer};
export const Login = asyncRoute(() =>import("containers/Login"))																