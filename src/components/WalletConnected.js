import React, { useEffect, useState } from 'react'

const WalletConnected = ({ handleWalletHover, handleWalletHoverOff }) => {


    return (
        <button onMouseOver={() => handleWalletHover()} onMouseLeave={() => handleWalletHoverOff()}>CONNECTED 🟢</button>
    )

}

export default WalletConnected