import { useEffect, useState } from 'react'
import TokenSelect from './TokenSelect';
import Modal from '@mui/material/Modal';
import TokenSearch from './TokenSearch';



const SwapBox = () => {
    const [openTo, setOpenTo] = useState(false);
    const [openFrom, setOpenFrom] = useState(false);

    const [tokenFrom, setTokenFrom] = useState({
        name: 'Ethereum',
        ticker: 'ETH',
        symbol: `https://coinicons-api.vercel.app/api/icon/eth`
    })

    const [tokenTo, setTokenTo] = useState({
        name: 'Bitcoin',
        ticker: 'BTC',
        symbol: `https://coinicons-api.vercel.app/api/icon/btc`
    })

    // When token from changes fetch image 
    useEffect(() => {
        setTokenFrom((prev) => {
            return { ...prev, symbol: `https://coinicons-api.vercel.app/api/icon/${tokenFrom.ticker.toLowerCase()}` }
        })
    }, [tokenFrom.name])
    useEffect(() => {
        setTokenTo((prev) => {
            return { ...prev, symbol: `https://coinicons-api.vercel.app/api/icon/${tokenTo.ticker.toLowerCase()}` }
        })
    }, [tokenTo.name])
    const openSwapFrom = () => {
        setOpenFrom(!openFrom);
    }
    const openSwapTo = () => {
        setOpenTo(!openTo);
    }
    const closeSwapTo = () => {
        setOpenTo(false);
    }
    const closeSwapFrom = () => {
        setOpenFrom(false);
    }

    return (
        <div className='swap-box'>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>Swap</h1>
                    <h1>⚙️</h1>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>00.00</h1>
                    <TokenSelect openSwap={openSwapFrom} token={tokenFrom} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>$0.00</h1>
                    <h1>Balance: 0.0</h1>
                </div>
            </div>
            <br />
            <br />
            <br />
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>00.00</h1>
                    <TokenSelect openSwap={openSwapTo} token={tokenTo} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>$0.00</h1>
                    <h1>Balance: 0.0</h1>
                </div>
            </div>


            <Modal
                open={openFrom}
                onClose={closeSwapFrom}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <TokenSearch setToken={setTokenFrom} closeSwap={closeSwapFrom} />
            </Modal>
            <Modal
                open={openTo}
                onClose={closeSwapTo}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <TokenSearch setToken={setTokenTo} closeSwap={closeSwapTo} />
            </Modal>







        </div>
    )
}

export default SwapBox