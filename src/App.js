import './App.css';
import Web3 from 'web3'
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';
import PrizePoolPage from './pages/PrizePoolPage';
import LuckyToastPage from './pages/LuckyToastPage';
import SwapPage from './pages/SwapPage';


function App() {

  const toastIcon = require('./images/toasticon.png');
  const [web3, setWeb3] = useState();

  const [userObj, setUserObj] = useState({
    isConnected: false,
    address: "",
    balance: 0.00
  });

  const onConnect = async () => {
    // Trying to connect to web3 provider
    try {
      const currentProvider = window.web3.currentProvider;
      if (currentProvider) {
        await currentProvider.request({ method: 'eth_requestAccounts' })
        const web3 = new Web3(currentProvider);
        setWeb3(web3);
        // Getting user address
        const userAccount = await web3.eth.getAccounts();
        const account = userAccount[0];
        // Getting native balance
        let balance = await web3.eth.getBalance(account);
        const balanceInEther = web3.utils.fromWei(balance, 'ether')
        handleBalanceUpdate(Number(balanceInEther).toFixed(2));
        handleUserSignIn(account);
        connectUser(true);
        // Create local instance of contracts
      }
    } catch (err) {
      console.log(err);
      console.log("Failed to connect to web3 provider, try installing MetaMask");
    }
  }

  const connectUser = () => {
    setUserObj((prev) => {
      return { ...prev, isConnected: true }
    })
  }

  const disconnectUser = () => {
    setUserObj((prev) => {
      return { ...prev, isConnected: false }
    })
  }

  const handleUserSignIn = (address) => {
    setUserObj((prev) => {
      return { ...prev, address: address }
    })
  }

  const handleBalanceUpdate = (balance) => {
    setUserObj((prev) => {
      return { ...prev, balance: balance }
    })
  }



  return (
    <body>

      <section>
        <Navbar onConnect={onConnect} userObj={userObj} disconnectUser={disconnectUser} />
      </section>

      <section>
        <Routes>
          <Route path="/Swap" element={<SwapPage />} />
          <Route path="/Earn" element={<PrizePoolPage />} />
          <Route path="/Win" element={<LuckyToastPage />} />
        </Routes>



      </section>







    </body>
  );
}

export default App;
