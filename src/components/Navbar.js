import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Button from '@mui/material/Button';




const Navbar = ({ onConnect, disconnectUser, userObj }) => {


    const toastIcon = require('../images/toasticon.png')

    const [isConnected, setisConnected] = useState(false);
    const [showWallet, setShowWallet] = useState(false);

    useEffect(() => {
        if (userObj) {
            if (userObj.isConnected == true) {
                setisConnected(true);
            } else {
                setisConnected(false);
            }
        }
    }, [userObj])

    const handleWalletDisconect = () => {
        setisConnected(false);
        setShowWallet(false);
    }

    const handleWalletCLick = () => {
        setShowWallet(true);
    }


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

                {
                    isConnected ?
                        <button onClick={handleWalletCLick} className="wallet">CONNECTED</button>
                        :
                        <button onClick={() => onConnect()} className="wallet">CONNECT</button>
                }
            </div>

            <div>
                {showWallet ?
                    <div className='wallet-popup' style={{ backgroundColor: "blue" }}>
                        <h3>{userObj.address}</h3>
                        <button onClick={() => handleWalletDisconect()}>close</button>
                    </div>
                    :
                    <div className='wallet-popup' style={{ backgroundColor: "blue" }}>
                        <h3>Connect wallet</h3>
                    </div>
                }
            </div>


        </>

    )
}

export default Navbar