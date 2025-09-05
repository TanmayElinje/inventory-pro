// frontend/src/context/UIContext.js

import React, { createContext, useState, useContext } from 'react';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    const value = { isLoginModalOpen, openLoginModal, closeLoginModal };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    return useContext(UIContext);
};