// src/App.js
import React from 'react';
import Charts from './components/Charts';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #121212;
    color: white;
    font-family: Arial, Helvetica, sans-serif;
    margin: 0;
    padding: 0;
  }
`;

const AppContainer = styled.div`
  padding: 20px;
  text-align: center;
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <h2>Welcome to HEL • Event Statistics</h2>
        <Charts />
      </AppContainer>
    </>
  );
}

export default App;
