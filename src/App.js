// src/App.js
import React from 'react';
import Charts from './components/Charts';
import styled, { createGlobalStyle } from 'styled-components';
import './App.css';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #0d0d0d;
    color: #d0d0d0;
    font-family: Arial, Helvetica, sans-serif;
    margin: 0;
    padding: 0;
  }
`;

const AppContainer = styled.div`
  text-align: center;
`;


const TopMenu = styled.div`
  padding: 8px;
  text-align: left;
  background-color: #102030;
  margin: 0;
  position: fixed;
  top: 0;
  width: 100%;
  height: 46px;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4); 
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <TopMenu>
          <h3 style={{margin: '3px'}}>Welcome to HEL</h3>
          <p style={{margin: '3px', fontSize: '11pt'}}>Event Statistics</p>
        </TopMenu>

        <Charts />
          <div style={{ 
            display: 'flex', 
            gap: '16px',
            margin: '20px 0',
            justifyContent: 'center'

          }}>
            <img 
              src="/wth-banner.jpg" 
              alt="Banner" 
              style={{ 
                width: '44%', 
                maxWidth: '500px', 
                height: 'auto',
                borderRadius: '8px'
              }} 
            />
            <img 
              src="/wth-summer.jpg" 
              alt="Summer Banner" 
              style={{ 
                width: '44%', 
                maxWidth: '500px', 
                height: 'auto',
                borderRadius: '8px'
              }} 
            />
          </div>
          <br />   
      </AppContainer>
    </>
  );
}

export default App;
