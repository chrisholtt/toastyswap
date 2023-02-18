import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'



const Navbar = ({ onConnect, disconnectUser, userObj }) => {


    const toastIcon = require('../images/toasticon.png')

    const [walletPopup, setWalletPopup] = useState(false);

    useEffect(() => {
        if (userObj) {
            if (userObj.isConnected == true) {
                setWalletPopup(true);
            }
        }
    }, [userObj])

    const handleClose = () => {
        setWalletPopup(false);
    }


    return (
        <>
            <div className="nav">
                <div className='nav-icons'>
                    <img src={toastIcon} alt="toast-icon" className='toast-icon' />
                    <h1>TOASTAI</h1>
                </div>
                <div className='nav-icons'>
                    <li><NavLink to="/" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h1>Home</h1></NavLink></li>
                    <li><NavLink to="/pools" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h1>Pools</h1></NavLink></li>
                    <li><NavLink to="/lucky-toast" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h1>Prize pools</h1></NavLink></li>
                    <button onClick={() => onConnect()}>x</button>
                    <button onClick={() => disconnectUser()}>0</button>
                </div>
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                {walletPopup &&
                    <div className='wallet-popup'>
                        <h3>{userObj.address}</h3>
                    </div>}
            </div>


        </>

    )
}

export default Navbar