import React from 'react'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';

const tokens = [
    { name: 'Ethereum', ticker: 'ETH' },
    { name: 'Polygon', ticker: 'MATIC' },
    { name: 'Arbitrum', ticker: 'ARB' },
    { name: 'Avalanche', ticker: 'AVAX' },
    { name: 'Cardano', ticker: 'ADA' },
    { name: 'Bitcoin', ticker: 'BTC' }
];

const TokenSearch = ({ setToken, closeSwap }) => {

    return (
        <div className='token-search'>
            <h1>Select token</h1>
            <Autocomplete
                id="country-select-demo"
                sx={{ width: 300 }}
                options={tokens}
                autoHighlight
                getOptionLabel={(option) => option.name}
                onChange={(event, newValue) => {
                    setToken(newValue);
                    closeSwap()
                }}
                renderOption={(props, option) => (
                    <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                        <img
                            loading="lazy"
                            width="20"
                            src={`https://coinicons-api.vercel.app/api/icon/${option.ticker.toLowerCase()}`}
                            // src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                            // srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                            alt=""
                        />
                        {option.name} ({option.ticker})
                    </Box>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Choose a country"
                        inputProps={{
                            ...params.inputProps,
                            // autoComplete: 'new-password', // disable autocomplete and autofill

                        }}
                    />
                )}
            />
        </div>
    )
}

export default TokenSearch