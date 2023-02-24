import React, { useEffect, useState } from 'react'

const WalletConnect = ({ userObj, onConnect }) => {

    useEffect(() => {

    }, [userObj])

    return (
        <button onClick={() => { onConnect() }}>CONNECTED</button>
    )

}

export default WalletConnect