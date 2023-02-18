import React from 'react'
import '../App.css';
import '../images/prize-card.png'


const PrizePool = () => {
    const prizebg = require("../images/prize-card.png")
    const avaxIcon = require("../images/avax-icon.png")
    return (
        <div className="prize-pool-card-wrapper">
            <div style={{ position: "absolute", display: 'flex' }}>
                <div>
                    <h1>PRIZE POOL</h1>
                    <button>deposit</button>
                </div>
                <img src={avaxIcon} style={{ width: '40px', height: '40px' }} alt="" />
            </div>
            <img src={prizebg} alt="avax-icon" />
        </div>
    )
}

export default PrizePool