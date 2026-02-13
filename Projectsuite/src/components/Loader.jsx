import React from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo_crop.png';

const Loader = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full">
            <div className="relative w-20 h-20 md:w-24 md:h-24">
                {/* Outer rotating ring */}
                <motion.span
                    className="absolute inset-0 border-4 border-transparent border-t-blue-600 border-r-purple-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner pulsing logo */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <img
                        src={logo}
                        alt="Loading..."
                        className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-md"
                    />
                </motion.div>
            </div>

            <motion.h3
                className="mt-6 md:mt-8 text-lg md:text-xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
                Loading Projects...
            </motion.h3>
        </div>
    );
};

export default Loader;
