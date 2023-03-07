import React, { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import WalletConnect from './WalletConnect';
import WalletConnected from './WalletConnected';
import WalletDropDown from './WalletDropDown';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

const Navbar = ({ onConnect, userObj }) => {
    const [showWalletDropDown, setShowWalletDropDown] = useState(false);
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    // const toastIcon = require('../images/toast.svg').default;

    const options = ['Create a merge commit', 'Squash and merge', 'Rebase and merge'];
    const [selectedIndex, setSelectedIndex] = React.useState(1);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        } else {
            setOpen(false);
        }
    }

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        setOpen(false);
    };

    const handleConnect = () => {
        if (!userObj.isConnected) {
            onConnect();
        } else {
            console.log('signing out')
        }
    }

    return (
        <>
            <div className="nav">
                <div className='nav-icons'>
                    {/* <img src={toastIcon} alt="toast-icon" className='toast-icon' /> */}

                    <li><NavLink to="/" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h1>TOASTI</h1></NavLink></li>
                    <li><NavLink to="/Swap" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h2>Swap</h2></NavLink></li>
                    <li><NavLink to="/Earn" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h2>Earn</h2></NavLink></li>
                    <li><NavLink to="/Win" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h2>Win</h2></NavLink></li>
                    <li><NavLink to="/Buy" className="navlink" style={{ textDecoration: 'none', display: "flex", alignItems: "center", color: "#000000" }}><h2>Buy Crypto</h2></NavLink></li>
                </div>

                <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                    <Button onClick={handleConnect}>{userObj.isConnected ? 'Connected' : 'Connect'}</Button>
                    <Button
                        size="small"
                        aria-controls={open ? 'split-button-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-label="select merge strategy"
                        aria-haspopup="menu"
                        onClick={handleToggle}
                    >
                        <i class="fa-solid fa-caret-down"></i>
                    </Button>
                </ButtonGroup>
                <Popper
                    sx={{
                        zIndex: 1,
                    }}
                    open={open}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    transition
                    disablePortal
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin:
                                    placement === 'bottom' ? 'center top' : 'center bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList id="split-button-menu" autoFocusItem>
                                        {options.map((option, index) => (
                                            <MenuItem
                                                key={option}
                                                disabled={index === 2}
                                                selected={index === selectedIndex}
                                                onClick={(event) => handleMenuItemClick(event, index)}
                                            >
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>

            </div>

        </>
    )
}

export default Navbar