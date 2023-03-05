import React from 'react'

const Banner = ({ heading, subheading }) => {
    return (
        <div className="banner">
            <h1>{heading}</h1>
            <h2>{subheading}</h2>
        </div>
    )
}

export default Banner