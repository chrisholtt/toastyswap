import React, { useEffect, useState } from 'react'

const WalletConnect = ({ onConnect }) => {


    return (
        <button onClick={() => { onConnect() }}>CONNECT</button>
    )

}

export default WalletConnect