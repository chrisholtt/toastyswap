import React from 'react'
import Button from '@mui/material/Button';

const TokenSelect = ({ openSwap, token }) => {
    return (
        <Button variant="outlined" onClick={openSwap}>
            <img src={token.symbol} alt="symbol" width="20" />
            <h2>{token.ticker}</h2>
            <i class="fa-solid fa-caret-down"></i>
        </Button>

    )
}

export default TokenSelect