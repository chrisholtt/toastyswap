import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import WalletConnect from './WalletConnect';



const Navbar = ({ onConnect, disconnectUser, userObj }) => {


    const toastIcon = require('../images/toasticon.png')



    // useEffect(() => {
    //     if (userObj) {
    //         if (userObj.isConnected == true) {
    //             onConnect(true);
    //         } else {
    //             disconnectUser(false);
    //         }
    //     }
    // }, [userObj])



    return (
        <>
            <div className="nav">
                <div className='nav-icons'>
                    <img src={toastIcon} alt="toast-icon" className='toast-icon' />

                    <li><NavLink to="/" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h1>TOASTAI</h1></NavLink></li>
                    <li><NavLink to="/Swap" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h1>Swap</h1></NavLink></li>
                    <li><NavLink to="/Earn" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h1>Earn</h1></NavLink></li>
                    <li><NavLink to="/Win" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h1>Win</h1></NavLink></li>
                </div>
                <WalletConnect userObj={userObj} onConnect={onConnect} />
            </div>
        </>

    )
}

export default Navbar