import React from 'react'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';

const tokens = [
    { label: 'Ethereum', ticker: 'ETH' },
    { label: 'Polygon', ticker: 'MATIC' },
    { label: 'Arbitrum', ticker: 'ARB' }
];

const SwapBox = () => {
    return (
        <div className='swap-box'>
            <Autocomplete
                id="country-select-demo"
                sx={{ width: 300 }}
                options={tokens}
                autoHighlight
                getOptionLabel={(option) => option.label}
                renderOption={(props, option) => (
                    <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                        <img
                            loading="lazy"
                            width="20"
                            // src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                            // srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                            alt=""
                        />
                        {option.label} ({option.ticker})
                    </Box>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Choose a country"
                        inputProps={{
                            ...params.inputProps,
                            autoComplete: 'new-password', // disable autocomplete and autofill
                        }}
                    />
                )}
            />
        </div>
    )
}

export default SwapBox