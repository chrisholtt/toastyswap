import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import WalletConnect from './WalletConnect';
import WalletConnected from './WalletConnected';
import WalletDropDown from './WalletDropDown';



const Navbar = ({ onConnect, userObj }) => {
    const [showWalletDropDown, setShowWalletDropDown] = useState(false);
    const toastIcon = require('../images/toast.svg').default;

    const handleWalletHover = () => {
        setShowWalletDropDown(true);
        console.log('triggers');
    }

    const handleWalletHoverOff = () => {
        setShowWalletDropDown(false);
    }

    return (
        <>

            <div className="nav">
                <div className='nav-icons'>
                    <img src={toastIcon} alt="toast-icon" className='toast-icon' />

                    <li><NavLink to="/" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h1>TOASTI</h1></NavLink></li>
                    <li><NavLink to="/Swap" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h2>Swap</h2></NavLink></li>
                    <li><NavLink to="/Earn" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h2>Earn</h2></NavLink></li>
                    <li><NavLink to="/Win" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h2>Win</h2></NavLink></li>
                    <li><NavLink to="/Buy" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h2>Buy Crypto</h2></NavLink></li>
                </div>

                {
                    userObj.isConnected ?
                        <WalletConnected handleWalletHover={handleWalletHover} handleWalletHoverOff={handleWalletHoverOff} />
                        :
                        <WalletConnect onConnect={onConnect} />
                }
            </div>
            {

                showWalletDropDown && <WalletDropDown />
            }
        </>
    )
}

export default Navbar