// src/components/Carousel.js
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Carousel = ({
    children,
    autoSlide = false,
    autoSlideInterval = 3000,
    showArrows = true,
    showDots = true,
    className = ""
}) => {
    const [curr, setCurr] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const prev = useCallback(() => {
        setCurr((curr) => (curr === 0 ? React.Children.count(children) - 1 : curr - 1));
    }, [children]);

    const next = useCallback(() => {
        setCurr((curr) => (curr === React.Children.count(children) - 1 ? 0 : curr + 1));
    }, [children]);

    useEffect(() => {
        if (!autoSlide) return;
        const slideInterval = setInterval(next, autoSlideInterval);
        return () => clearInterval(slideInterval);
    }, [autoSlide, autoSlideInterval, next]);

    // Touch handlers for mobile swiping
    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStart - touchEnd > 100) {
            // Swiped left
            next();
        } else if (touchStart - touchEnd < -100) {
            // Swiped right
            prev();
        }
    };

    return (
        <div
            className={`relative overflow-hidden rounded-xl ${className}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                className="flex transition-transform ease-out duration-500"
                style={{ transform: `translateX(-${curr * 100}%)` }}
            >
                {children}
            </div>

            {showArrows && React.Children.count(children) > 1 && (
                <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                    <button
                        onClick={prev}
                        className="p-1 rounded-full shadow bg-primary/80 text-white hover:bg-primary focus:outline-none pointer-events-auto z-10 ml-1"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={next}
                        className="p-1 rounded-full shadow bg-primary/80 text-white hover:bg-primary focus:outline-none pointer-events-auto z-10 mr-1"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {showDots && React.Children.count(children) > 1 && (
                <div className="absolute bottom-1 right-0 left-0 z-10 pointer-events-none">
                    <div className="flex items-center justify-center gap-1">
                        {React.Children.map(children, (_, i) => (
                            <div
                                className={`
                  transition-all w-1.5 h-1.5 bg-primary rounded-full pointer-events-auto
                  ${curr === i ? "opacity-100" : "opacity-50"}
                `}
                                onClick={() => setCurr(i)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Carousel;