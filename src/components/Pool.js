import React from 'react'

const Pool = ({ name, tvl, apr, color }) => {
    return (
        <div className='pool' style={{ background: color }}>
            <h2>{name}</h2>
            <h2>{tvl}</h2>
            <h2>{apr}</h2>
        </div>
    )
}

export default Pool