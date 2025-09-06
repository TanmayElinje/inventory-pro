import React, { createContext, useState, useContext } from 'react';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

    const openLoginModal = () => {
        setIsSignUpModalOpen(false);
        setIsLoginModalOpen(true);
    };
    const closeLoginModal = () => setIsLoginModalOpen(false);

    const openSignUpModal = () => {
        setIsLoginModalOpen(false);
        setIsSignUpModalOpen(true);
    };
    const closeSignUpModal = () => setIsSignUpModalOpen(false);

    const switchToSignUp = () => {
        closeLoginModal();
        openSignUpModal();
    };
    const switchToLogin = () => {
        closeSignUpModal();
        openLoginModal();
    };

    const value = { 
        isLoginModalOpen, openLoginModal, closeLoginModal,
        isSignUpModalOpen, openSignUpModal, closeSignUpModal,
        switchToSignUp, switchToLogin
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    return useContext(UIContext);
};

