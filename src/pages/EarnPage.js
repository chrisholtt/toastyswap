import React from 'react'
import Banner from '../components/Banner';
import Pools from '../components/Pools';



const EarnPage = () => {
    const gridViewButton = require('../images/gridview.svg').default
    const lineViewButton = require('../images/lineview.svg').default

    return (
        <>
            <Banner heading={'Earn'} subheading={'Provide liquidity and earn fees'} />
            <div style={{ display: 'flex' }}>
                <img src={gridViewButton} alt="" />
                <img src={lineViewButton} alt="" />
                <button>New Posistion +</button>
            </div>
            <Pools />
        </>
    )
}

export default EarnPage