import { ethers } from 'ethers';
import "../App.css";
import React from 'react';

const Section = ({ title, items, onCardClick }) => {
    return (
        <div className='cards__section'>
            <h2>{title}</h2>
            <div className='cards'>
                {items.map((item) => (
                    <div 
                        className='card' 
                        key={item.id || item.name} 
                        onClick={() => onCardClick(item)} // Pass the entire item
                    >
                        <div className='card__image'>
                            <img src={item.image} alt={item.name || "Product"} />
                        </div>
                        <div className='card__info'>
                            <h4>{item.name}</h4>
                            <p>{ethers.formatUnits(item.cost.toString(), 'ether')} ETH</p>
                            <button className='add-to-cart'>Purchase</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Section;