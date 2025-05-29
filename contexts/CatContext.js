import React, { createContext, useState, useContext } from 'react';

const CatContext = createContext();

export const CatProvider = ({ children }) => {
  const [currentCatId, setCurrentCatId] = useState(null);
  const [currentPet, setCurrentPet] = useState(null);
  const [userToken, setUserToken] = useState(null);

  return (
    <CatContext.Provider value={{ 
      currentCatId, 
      setCurrentCatId,
      currentPet,
      setCurrentPet,
      userToken,
      setUserToken
    }}>
      {children}
    </CatContext.Provider>
  );
};

export const useCat = () => useContext(CatContext);