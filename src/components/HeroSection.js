import React, { useEffect, useState } from 'react';
import "../App.css"; 


import image1 from '../images/image1.png';
import image2 from '../images/image2.png';
import image3 from '../images/image3.jpg';
import image4 from '../images/image4.jpg';

function HeroSection() {
    const imageFiles = [image1, image2, image3, image4]; 
    const [currentImageIndex, setCurrentImageIndex] = useState(0); 
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageFiles.length);
        }, 5000); 

        return () => clearInterval(intervalId); 
    }, [imageFiles.length]);

    const handleDotClick = (index) => {
        setCurrentImageIndex(index); 
    };

    return (
        <div className="hero">
            <div className="hero-images">
                <img 
                    className="hero-image" 
                    src={imageFiles[currentImageIndex]} 
                    alt={`Hero ${currentImageIndex + 1}`} 
                />
            </div>
            <div className="dots">
                {imageFiles.map((_, index) => (
                    <span 
                        key={index} 
                        className={`dot ${currentImageIndex === index ? 'active' : ''}`} 
                        onClick={() => handleDotClick(index)} 
                    />
                ))}
            </div>
        </div>
    );
}

export default HeroSection;