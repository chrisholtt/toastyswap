import React from 'react'
import { liquidityPools } from '../pools/liquidityPools'
import Pool from './Pool'

const Pools = () => {

    const PoolNodes = () => {
        let nodes = [];
        liquidityPools.forEach((pool, i) => {
            let color;
            if (i % 2) {
                color = '#20293a';
            } else {
                color = '#111729';
            }
            nodes.push(
                <Pool name={pool.name} tvl={pool.TVL} apr={pool.APR} color={color} />
            )
        })
        return nodes;
    }


    return (
        <div className='pools'>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2>Name</h2>
                <h2>TVL</h2>
                <h2>APR</h2>
            </div>

            <PoolNodes />


        </div>
    )
}

export default Pools