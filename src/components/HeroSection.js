import React, { useEffect, useState } from 'react';
import "../App.css"; // Assuming you have some CSS styles defined in App.css

// Import images
import image1 from '../images/image1.png';
import image2 from '../images/image2.png';
import image3 from '../images/image3.jpg';
import image4 from '../images/image4.jpg';

function HeroSection() {
    const imageFiles = [image1, image2, image3, image4]; // List of image imports
    const [currentImage, setCurrentImage] = useState(imageFiles[0]); // State for the current image

    useEffect(() => {
        const changeImage = () => {
            setCurrentImage((prevImage) => {
                const currentIndex = imageFiles.indexOf(prevImage);
                const nextIndex = (currentIndex + 1) % imageFiles.length;
                return imageFiles[nextIndex];
            });
        };

        const intervalId = setInterval(changeImage, 5000); // Change image every 5 seconds
        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, [imageFiles]);

    return (
        <div className="hero">
            <img className="hero-image" src={currentImage} alt="Hero" />
        </div>
    );
}

export default HeroSection;